/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record',  'N/search', , '/SuiteScripts - Globals/lodash', 'N/email'],

function(record, search, lodash, email) {
   
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
			var response1 = "created a fulfillment";
	    	
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

				log.audit('kitIds', JSON.stringify(groupedKits));
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
		   
					 // log.debug('key', key);
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

						//take the lowest number if it's lower then the needed qty and build the bin string
						canFulfill.sort();

						var setQty = parseInt(qtyNeeded);
						if(parseInt(canFulfill[0]) < parseInt(qtyNeeded)){
							setQty = parseInt(canFulfill[0]);
						}
						
						log.debug('parent Kit', key);
						log.debug('canFulfill', canFulfill[0]);
						log.debug('trying to fulfill', setQty);

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

								log.debug('member item', item.item);
								log.debug('mem qty Needed', qtyToFulfill);

						    if(qtyToFulfill >= 0){ //prevent overfulfillment
								
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

										if(qtyUnfulfilled <= 0){ // whenever picked from multiple bins qty fullfilled is wrong
											qtyToFulfill  = 0;
											return ;
										}else{
											
											qtyToFulfill =  Math.abs(qtyUnfulfilled);
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
					  
					  log.audit('item to full', 'Item: '+ arrayItem.item + ' bin str: ' + arrayItem.binString + ' qty fulfilled : ' + Math.abs(arrayItem.qtyFulfilled)); 
										 
						var lineNumber = fulfillmentRecord.findSublistLineWithValue({
							sublistId: 'item',
							fieldId: 'orderline',
							value: arrayItem.orderline
						 }); 
						  
						 // log.debug('line num', lineNumber);
						  
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

		
					var fulfillmentid = fulfillmentRecord.save({
						enableSourcing: true,
						ignoreMandatoryFields: true
					});;


				  }catch(e){

					 soItems.forEach(function(v){ 
						 
						delete v.orderid; 
						delete v.parentId; 
						delete v.memberQty; 
						delete v.bins; 
						delete v.parentQtyCom; 
						delete v.binString; 
					
					});
						  
					 
					  log.error(JSON.stringify(e.name), JSON.stringify(soItems));
					  log.error('error on save fulfillment', JSON.stringify(e));
					  response1 = JSON.stringify(e.message);
					
				  }
					log.debug('fulfillmentid', fulfillmentid);
					response1 ='test';

				}// nothing to fulfill
				else{
					log.debug('nothing can be fulfilled');
					response1 = '<h2> Not enough quantity to fulfill </h2>';
				}

			  });
	    	 	 
	    	 
		
	    	
		 }catch(e){
			 
			 var error = log.error("error", JSON.stringify(e));
			
		 }
	 		         
	                  
	       context.response.write(response1);
	    		 
		 	 		
		 }else{
			 
		 }

    }

    return {
        onRequest: onRequest
    };
    
});
