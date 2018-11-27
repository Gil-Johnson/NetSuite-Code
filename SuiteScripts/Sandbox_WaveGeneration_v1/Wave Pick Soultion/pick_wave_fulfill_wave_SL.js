/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record',  'N/search'],

function(record, search) {
   
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
	    	 var orders = context.request.parameters.orders;   	 
	    	 
	    	 log.debug('orders', orders);		 
	    	 
	    	 var ordersToFulfill = JSON.parse(orders);
	    		    	 
	    	 ordersToFulfill.forEach(function (order){  	    			    
	        
	    	 
	    	     var fulfillmentRecord = record.transform({
					    fromType: record.Type.SALES_ORDER,
					    fromId: order.orderid,
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
	            	    
	            		  //loop though line items and uncheck items to fulfill		        			
	        			var itemValue = fulfillmentRecord.getSublistValue({
	        			    sublistId: 'item',
	        			    fieldId: 'item',
	        			    line: i
	        			});
	        			
	        			        			 
	        			if(parseInt(itemValue) == parseInt(order.item)){	
	        			
	        				log.debug("order item compare", order.item + "  / compare to " + itemValue);
                          	
                          	fulfillmentRecord.setSublistValue({
  		        			    sublistId: 'item',
  		        			    fieldId: 'quantity',
  		        			    line: i,
  		        			    value: parseInt(order.qtyAvl)
  		        			}); 
                          	
                             	fulfillmentRecord.setSublistValue({
  		        			    sublistId: 'item',
  		        			    fieldId: 'binnumbers',
  		        			    line: i,
  		        			    value: order.bin
  		        			});
                          	
	        			} else {	
	        				
	        				log.debug('item dont macth',  order.item + "  / compare to " + itemValue);
		        			
		        			fulfillmentRecord.setSublistValue({
		        			    sublistId: 'item',
		        			    fieldId: 'itemreceive',
		        			    line: i,
		        			    value: false
		        			});	      			
		        			
		        				        			
		        			}       			
	        				        			
 			
 			 } // end looping though items on fulfillments  
				 	
					try{
       				  var fulfillmentid = fulfillmentRecord.save();
       				  }catch(e){
       					  
       					  log.error('error on save of fulfillment', JSON.stringify(e));
       				  }
       				  
       				  log.debug('fulfillmentid', fulfillmentid);
				  
				  
	    	 
	    	  });    	
    	 	 
	    	
	    	
		 }catch(e){
			 
			 var error = log.error("error", JSON.stringify(e));
			
		 }
	 		         
	                  
	       context.response.write('test');
	    		 
		 	 		
		 }else{
			 
		 }

    }

    return {
        onRequest: onRequest
    };
    
});
