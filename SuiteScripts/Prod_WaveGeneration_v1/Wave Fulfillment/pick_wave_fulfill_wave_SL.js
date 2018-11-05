/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record',  'N/search', 'N/email', 'N/runtime', '/SuiteScripts - Globals/lodash'],

function(record, search, email, runtime, lodash) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
	 if (context.request.method === 'GET'){	
		 
		//put error handling for no values===============================

		 try{
	    	
	    	//retrive parameters 
			 var waveid = context.request.parameters.waveid; 
			 var orderid = context.request.parameters.id; 
			 var itemsToFullArray = []; 
			 var ordersToFullfillArray = [];
			 var index = 0;

			// log.debug('waveid', waveid);	
			// log.debug('orderid ', orderid);

			 if(!waveid && !orderid){
				 context.response.write('error please contact your NetSuite admin');
				 return;
			 }

			 //run search for all orders with a certain wave 
			var itemsToFulfill = search.load({
				id: 'customsearch_fulfill_wave_orders',
			});

			itemsToFulfill.filters.push( search.createFilter({
				name: 'custrecord_current_wave',
				join: 'binnumber',
				operator: search.Operator.IS,
				values: waveid
			})); 


			itemsToFulfill.run().each(function(result) {
	    	   	 
				var id = result.id;

				var binnumber = result.getValue({
					name: 'binnumber'
				});
				var binonhandavail = result.getValue({
					name: 'binonhandavail'
				});
		
				itemsToFullArray.push({item: id, binnumber: binnumber,binonhandavail:binonhandavail , index:index});
				index++;
				
				return true;
			
		   });


			//log.debug('itemsToFullArray', JSON.stringify(itemsToFullArray));


			//run search to pull all orders with wave
			var ordersToFullfill = search.load({
				id: 'customsearch5111',
			});

				ordersToFullfill.filters.push( search.createFilter({
					join: 'transaction',
					name: 'custbody_current_wave',
					operator: search.Operator.IS,
					values: waveid
				})); 

				if(orderid){
					//log.debug('orderid filter', orderid);
					ordersToFullfill.filters.push( search.createFilter({
						join: 'transaction',
						name: 'internalid',
						operator: search.Operator.IS,
						values: orderid
					})); 
				}

		//algo to check if parent is kit if so is next kit member stop adding parent when the next item is not kit parent 
			var isKit = false;
			var parentVal = "";
			var parentTxt = "";
			var parentLine = "";
			var parentQty = null;
			var excludeMembers = false;


			ordersToFullfill.run().each(function(result) {
	    	   	 
				var id = result.id;
				
				var itemType = result.getValue({
					name: 'type'
				});

				var orderid = result.getValue({
					join: 'transaction',
					name: 'internalid'
				});

				var qty = result.getValue({
					join: 'transaction',
					name: 'quantity'
				});

				var qtyCommitted = result.getValue({
					join: 'transaction',
					name: 'quantitycommitted'
				});

				var qtyPicked = result.getValue({
					join: 'transaction',
					name: 'quantitypicked'
				});

				var iskitmember = result.getValue({
					name: 'formulatext'
				});

				var qtyOpen = (qtyCommitted - qtyPicked);
				if(qtyOpen <= 0 && iskitmember != 'kitmbr'){		    	   
					excludeMembers = true;	    	   
				}

				if(qtyOpen > 0 && iskitmember != 'kitmbr'){
					excludeMembers = false;	    	   
				}

				if(!qtyPicked){
					qtyPicked = 0;
				}
				
				var qtyNeeded = Math.abs(qtyCommitted) - Math.abs(qtyPicked);

				var itemData = checkBins(itemsToFullArray, id, qtyNeeded);

				var itemObj = {
					item: id, 
					orderid: orderid, 
					qtyCommitted:qtyNeeded, 
					binString: itemData.binString, 
					parentId: "", 
					parentQtyCom: 0, 
					memberQty: 0, 
					qtyFulfilled: itemData.qtyFulfilled,
					bins: itemData.bins
				};
			  
				if(iskitmember != 'kitmbr'){	//if item is not a kit member 	      	
					parentVal =  null;
					parentTxt = null;
					parentLine = null;
				}
				
				if(itemType == 'Kit'){	// if item is kit set parent up    	 
				   parentVal = id;
				   parentQty = qty;
				}
				
				if(iskitmember == 'kitmbr' && parentVal != null){ 		    	  
					
				 // want to push parent to kit
					itemObj['parentId'] = parentVal;
					itemObj['memberQty'] = qty/parentQty;
					itemObj['parentQtyCom'] = parentQty;
				
				 }     
				
				
				if((iskitmember == 'kitmbr' && parentVal == null)|| excludeMembers == true || itemType == "Kit"){
					
					//log.debug('debug', 'dont add assembly members');
					
				}else{

					if(itemData.binString){
					  ordersToFullfillArray.push(itemObj);
					}

				}

				return true;
			
		   });

		 //  log.debug('ordersToFullfillArray', JSON.stringify(ordersToFullfillArray));

			//consolidate item fulfillments based on sales order
			var grouped = _.groupBy(ordersToFullfillArray, function(IF) {
			return IF.orderid;
			});
	
			log.debug('grouped array', JSON.stringify(grouped));

		//	log.debug('itemsToFullArray after remove qty', JSON.stringify(itemsToFullArray));

			// need to determine how many kits we can fulfill

			//loop though grouped array and create fulfillments
			Object.keys(grouped).forEach(function(key, index) {

				//kits need to be fulfilled differently
				var kitItems = _.filter(grouped[key], function(o) { return o.parentId; });	
				var soItems = _.filter(grouped[key], function(o) { return !o.parentId; });	

				var groupedKits = _.groupBy(kitItems, function(IF) {
					return IF.parentId;
					});

				log.debug('kitIds', JSON.stringify(groupedKits));

				log.debug('soItems', JSON.stringify(soItems));

		
				//create fulfillment record
				var fulfillmentRecord = record.transform({
					   fromType: record.Type.SALES_ORDER,
					   fromId: parseInt(key),
					   toType: record.Type.ITEM_FULFILLMENT,
					   isDynamic: false,
				   });
				 
				 fulfillmentRecord.setValue({
					   fieldId: 'shipstatus',
					   value: 'A',
					   ignoreFieldChange: true
				   });
				 
				 var numLines = fulfillmentRecord.getLineCount({
					   sublistId: 'item'
				   });	 
				 
				 for (var i = 0; i <= numLines-1; i++) {
					 
					   fulfillmentRecord.setSublistValue({
						   sublistId: 'item',
						   fieldId: 'itemreceive',
						   line: i,
						   value: false
					   });	
					 
				 }
				 		   
				//  log.debug('key', key);
			  //	log.debug('index', index);	
			  
			   //set parent kit build bin string then put back in items
			   if(kitItems){
					Object.keys(groupedKits).forEach(function(key, index) {
		   
					  log.debug('key', key);
					  var canFulfill = [];
						// parent is key
						// find the qty tryign to be fullfilled 
						var kitLineNumber = fulfillmentRecord.findSublistLineWithValue({
							sublistId: 'item',
							fieldId: 'item',
							value: key
						 }); 

						 var qtyNeeded = fulfillmentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: parseInt(kitLineNumber),
						});

							log.debug('kitLineNumber', kitLineNumber);
							log.debug('qtyNeeded', qtyNeeded);

						//and then how much can I fulfill
						// qtyfuliiled divied by member qty for each member take the lowest number thats how many you can fulfill
						_.forEach(groupedKits[key], function(item) {
							canFulfill.push(Math.abs(item.qtyFulfilled) / Math.abs(item.memberQty));
						});

						//take the lowest number and build the bin string
						canFulfill.sort();
						var setQty = canFulfill[0];

						log.debug('canFulfill[0]', canFulfill[0]);

						//set kit parent qty
						fulfillmentRecord.setSublistValue({
							sublistId: 'item',
							fieldId: 'itemreceive',
							line: parseInt(kitLineNumber),
							value: true
						});	
						 
						 fulfillmentRecord.setSublistValue({
							sublistId: 'item',
							fieldId: 'quantity',
							line: parseInt(kitLineNumber),
							value: Math.abs(setQty)
						});

						_.forEach(groupedKits[key], function(item) {	
							//loop through bin array
							// how much of each member do I need? setQty times memberQty
						
							var memNeeded =  Math.abs(setQty) *  Math.abs(item.memberQty);
							var qtyUnfulfilled = 0;
							var qtyToFulfill = memNeeded;
							var qtyFulfilled = 0;
							var binString = "";
							
							_.forEach(item.bins, function(bin) {

								log.debug('item', item.item);
								log.debug('memNeeded', memNeeded);

								if(memNeeded > 0){
								
										var avilableQty = bin.qty;

										qtyUnfulfilled = Math.abs(qtyToFulfill) - Math.abs(avilableQty);
									
										if(qtyUnfulfilled <= 0){
											qtyFulfilled = Math.abs(qtyToFulfill);
										}else{
										qtyFulfilled = Math.abs(qtyToFulfill) - Math.abs(qtyUnfulfilled);
										}

											if(binString){
												binString =  bin.bin + '(' + Math.abs(qtyFulfilled) + ')' + ',' + binString;
											}else{
												binString =  bin.bin + '(' + Math.abs(qtyFulfilled) + ')' ;
										}
						
										if(qtyUnfulfilled <= 0){
											memNeeded = 0;
										}else{
										//	itemData.qtyFulfilled =  itemData.qtyFulfilled + Math.abs(qtyFulfilled);
											qtyToFulfill =  Math.abs(qtyFulfilled);
										}

									}
		
								   
	
							});

							//push to soitem array
							item.binString = binString;
							soItems.push(item);
							
						});

						
					});
			   }

				  
				  _.forEach(soItems, function(arrayItem) {
					  
					  log.debug('item', arrayItem.item); 
					  log.debug('bin', arrayItem.binString); 
					  log.debug('qty', Math.abs(arrayItem.qtyCommitted)); 
						  
												 
						var lineNumber = fulfillmentRecord.findSublistLineWithValue({
							sublistId: 'item',
							fieldId: 'item',
							value: arrayItem.item
						 }); 
						  
						  log.debug('line num', lineNumber);
						  
					  fulfillmentRecord.setSublistValue({
						   sublistId: 'item',
						   fieldId: 'itemreceive',
						   line: parseInt(lineNumber),
						   value: true
					   });	
						
						fulfillmentRecord.setSublistValue({
						   sublistId: 'item',
						   fieldId: 'quantity',
						   line: parseInt(lineNumber),
						   value: Math.abs(arrayItem.qtyFulfilled)
					   }); 
					   
						fulfillmentRecord.setSublistValue({
						   sublistId: 'item',
						   fieldId: 'binnumbers',
						   line: parseInt(lineNumber),
						   value: arrayItem.binString
					   });   				    
					   
				  });
				  try{	
					var fulfillmentid = fulfillmentRecord.save();
				  }catch(e){
					  
					  log.debug('error saving fulfillment', JSON.stringify(e));
				  }
					log.debug('fulfillmentid', fulfillmentid);

			  });
	
		 }catch(e){
			 
			 var error = log.error("error", JSON.stringify(e));
			
		 }
	 		         
	                  
	       context.response.write('<script> window.history.back() </script>');
	    		 
		 	 		
		 }else{
			 
		 }

		 function checkBins(itemsToFullArray, id, qtyNeeded){

			var itemData = {};
			itemData.qtyFulfilled = 0;
			itemData.binString = "";
			itemData.bins = [];
			var qtyUnfulfilled = 0;
			var qtyToFulfill = qtyNeeded;
			var qtyFulfilled = 0;
		
			//find all bin objects and pull them out    ||   pulls an array of objects
			var itemBins = _.filter(itemsToFullArray, function(o) { return o.item === id && o.binonhandavail > 0;});
			if(!itemBins){
				return;
			}
			itemBins = _.sortBy(itemBins, ['binonhandavail']);

			//loop through item bins
			itemBins.forEach(function (item) {

				//log.debug('qtyToFulfill in loop', qtyToFulfill);
				//log.debug('item.binnumber ', item.binnumber);
				//check if bin can fulfill all quantity 
				var avilableQty = item.binonhandavail;

				qtyUnfulfilled = Math.abs(qtyToFulfill) - Math.abs(avilableQty);
			
				if(qtyUnfulfilled <= 0){
					qtyFulfilled = Math.abs(qtyToFulfill);
				}else{
				qtyFulfilled = Math.abs(qtyToFulfill) - Math.abs(qtyUnfulfilled);
				}

				itemsToFullArray[item.index].binonhandavail = Math.abs(itemsToFullArray[item.index].binonhandavail) - Math.abs(qtyFulfilled);	
				itemData.bins.push({bin: item.binnumber, qty:  Math.abs(qtyFulfilled)});		

				if(itemData.binString){
					itemData.binString =  item.binnumber + '(' + Math.abs(qtyFulfilled) + ')' + ',' + itemData.binString;
				}else{
					itemData.binString =  item.binnumber + '(' + Math.abs(qtyFulfilled) + ')' ;
				}

				if(qtyUnfulfilled < 0){
					itemData.qtyFulfilled = Math.abs(qtyToFulfill);
					return ;
				}else{

					itemData.qtyFulfilled =  itemData.qtyFulfilled + Math.abs(qtyFulfilled);
					qtyToFulfill =  Math.abs(qtyFulfilled);
				}

			});

			return itemData;
			
		 }

    }

    return {
        onRequest: onRequest
    };
    
});
