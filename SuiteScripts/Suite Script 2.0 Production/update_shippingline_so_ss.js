/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime'],
/**
 * @param {record} record
 * @param {search} search
 * @param {email} email
 * @param {runtime} runtime
 */
function(record, search, email, runtime) {
   
	 function execute(context) {
		 
	//	 log.debug('entering script');
		 
         if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand'); 
           try {        	   
        //	   log.debug('entering search');
        	        	   
	             search.load({
	                 id: 'customsearch3407'
	             }).run().each(function(result) {	
	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid'	                   
	                 });
	            	 
	            	 var itemId = result.getValue({
	                     name: 'item'	                   
	                 });
	            	            	 
	            	 var newLineShipDate= result.getValue({
	                     name: 'custbody_sortingshipdate'	                   
	                 });           	 
	            	 
	            	 
	         //   	 log.debug('loading record');
	            	 var orderRecord = record.load({
						    type: record.Type.SALES_ORDER,
						    id: parseInt(orderId),
						    isDynamic: false,
						});    
	            	 
	            	 
	            	 var numLines = orderRecord.getLineCount({
	            		    sublistId: 'item'
	            		});
	            	 
	            	 for (var i = 1; i < numLines.length; i++){          	 
	            	 
	            	             	 
//	            	 var lineid = orderRecord.findSublistLineWithValue({
//	            		    sublistId: 'item',
//	            		    fieldId: 'item',
//	            		    value: itemId
//	            		});
	            	 
	            	 if(newLineShipDate){
	            		 log.debug('adding shipdate');
	            		 orderRecord.setSublistValue({
							    sublistId: 'item',
							    fieldId: 'shipdate',
							    line: parseInt(i),
							    value: newLineShipDate
							});      		 
	            		 
	            	   }
	            	 
	            	 }
					   				   
				 
					 log.debug('saving record values', 'orderid' + orderId + ' item ' + itemId + ' line' + lineid + '  newLineShipDate:' + newLineShipDate);  
					   
					   
					 orderRecord.save();	
					 
					 return;	
	          
		             
	                 return true;
	             });          
	           
	            
	             
	         } catch (e) {
	             var subject = 'Error: Unable to update line shipping date on orders';
	             var authorId = -5;
	             var recipientEmail = 'gjohnson@ricoinc.com';
	             email.send({
	                 author: authorId,
	                 recipients: recipientEmail,
	                 subject: subject,
	                 body: 'Error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
	             });
	         }
	         
	     }

    return {
        execute: execute
    };
    
});
