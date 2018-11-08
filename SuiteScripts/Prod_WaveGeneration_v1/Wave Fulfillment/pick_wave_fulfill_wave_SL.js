/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record',  'N/search', , '/SuiteScripts - Globals/lodash'],

function(record, search, lodash) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
	 if (context.request.method === 'POST'){	
		 
		//put error handling for no values===============================
		 
		 try{

			log.debug('in suitelet', 'calling suitelet');
	    	
	    	//retrive parameters 
			 var orders = context.request.parameters.orders; 
			 var ordersToFulfill = JSON.parse(orders); 
			 
			 log.debug('orders', JSON.stringify(orders));

			//need to loop through an rray of objects
			//Object.keys(ordersToFulfill).forEach(function(key, index) {
		   ordersToFulfill.forEach(function (arrayItem) {

				//kits need to be fulfilled differently
				var kitItems = _.filter(arrayItem.value, function(o) { return o.parentId; });	
				var soItems = _.filter(arrayItem.value, function(o) { return !o.parentId; });	

				var groupedKits = _.groupBy(kitItems, function(IF) {
					return IF.parentId;
					});

				log.debug('kitIds', JSON.stringify(groupedKits));
				log.debug('soItems', JSON.stringify(soItems));
	
				//create fulfillment record
				var fulfillmentRecord = record.transform({
					   fromType: record.Type.SALES_ORDER,
					   fromId: parseInt(arrayItem.key),
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
						var setQty = parseInt(canFulfill[0]);

						log.debug('canFulfill[0]', canFulfill[0]);

					//need to be able to fulfill at least 1 kit	
					if(setQty >= 1){
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
					}//if set qty is > 1
						
					});
			   }

			   log.debug('soItems', JSON.stringify(soItems));

				if(soItems.length > 0){  
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
					response ='test';

				}// nothing to fulfill
				else{
					log.debug('nothing can be fulfilled');
					response = '<h2> Not enough quantity to fulfill </h2>';
				}

			  });
	    	 	 
	    	 
		
	    	
		 }catch(e){
			 
			 var error = log.error("error", JSON.stringify(e));
			
		 }
	 		         
	                  
	       context.response.write(response);
	    		 
		 	 		
		 }else{
			 
		 }

    }

    return {
        onRequest: onRequest
    };
    
});
