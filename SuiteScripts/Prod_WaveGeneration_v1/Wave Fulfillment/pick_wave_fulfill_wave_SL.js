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

			 log.debug('waveid', waveid);	
			 log.debug('orderid ', orderid);

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


			log.debug('itemsToFullArray', JSON.stringify(itemsToFullArray));


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
					log.debug('orderid filter', orderid);
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
				
				var newQty = Math.abs(qtyCommitted) - Math.abs(qtyPicked);

				var bintouse = _.find(itemsToFullArray, function(o) { return o.item === id && o.binonhandavail >= Math.abs(newQty); });

				log.debug('bintouse', bintouse);

				if(bintouse){

					itemsToFullArray[bintouse.index].binonhandavail = Math.abs(itemsToFullArray[bintouse.index].binonhandavail) - Math.abs(newQty);
					
					var binString =  bintouse.binnumber + '(' + Math.abs(newQty) + ')' ;

					log.debug('binString ', binString );
			
					var itemObj = {item: id, orderid: orderid, qtyCommitted :newQty, binString:binString, parentId: "", memberQty: 0};

				}


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
					
				 }     
				
				
				if((iskitmember == 'kitmbr' && parentVal == null)|| excludeMembers == true || itemType == "Kit"){
					
					log.debug('debug', 'dont add assembly members');
					
				}else{

					ordersToFullfillArray.push(itemObj);

				}

				return true;
			
		   });

		   log.debug('ordersToFullfillArray', JSON.stringify(ordersToFullfillArray));

			//consolidate item fulfillments based on sales order
			var grouped = _.groupBy(ordersToFullfillArray, function(IF) {
			return IF.orderid;
			});
	
			log.debug('grouped array', JSON.stringify(grouped));

			log.debug('itemsToFullArray after remove qty', JSON.stringify(itemsToFullArray));

			// need to determine how many kits we can fulfill

			//loop though grouped array and create fulfillments
			Object.keys(grouped).forEach(function(key, index) {

				var kitIds = grouped[key].map(function (item) {
					return item.parentId;
				  });
	
				log.debug('kitIds', JSON.stringify(kitIds));
		
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

					//pull all kit parents and skip
					 
					   fulfillmentRecord.setSublistValue({
						   sublistId: 'item',
						   fieldId: 'itemreceive',
						   line: i,
						   value: false
					   });	
					 
				 }
				 		   
				  log.debug('key', key);
			  //	log.debug('index', index);	
			  
			   //recieve kits
			   if(kitIds){
					for (var i in kitIds) {
						var lineNumber = fulfillmentRecord.findSublistLineWithValue({
							sublistId: 'item',
							fieldId: 'item',
							value: kitIds[i]
						 }); 

						 fulfillmentRecord.setSublistValue({
							sublistId: 'item',
							fieldId: 'itemreceive',
							line: parseInt(lineNumber),
							value: true
						});

					}
		     	}

				  
				  _.forEach(grouped[key], function(arrayItem) {
					  
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
						   value: Math.abs(arrayItem.qtyCommitted)
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

    }

    return {
        onRequest: onRequest
    };
    
});
