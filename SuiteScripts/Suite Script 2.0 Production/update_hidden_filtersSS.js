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
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
	 function execute(context) {
         if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand'); 
           try {        	   
        	    
        	        	   
	             search.load({
	                 id: 'customsearch4514'
	             }).run().each(function(result) {	
	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid'	                   
	                 });
	            	 
	            	 var itemId = result.getValue({
	                     name: 'item'	                   
	                 });
	            	            	 
	            	 var inactiveFilter = result.getValue({
	                     name: 'isinactive'	,
	                     join: 'item'
	                 });
	            	 
	            	 var  discontinuedFilter = result.getValue({
	                     name: 'custitem_discontinued',
	                     join: 'item'
	                 });
	            	 
	      
	            	 var orderRecord = record.load({
						    type: record.Type.SALES_ORDER,
						    id: parseInt(orderId),
						    isDynamic: false,
						});    
	            	 
	            	 
	            	 var lineid = orderRecord.findSublistLineWithValue({
	            		    sublistId: 'item',
	            		    fieldId: 'item',
	            		    value: itemId
	            		});
	            	 
	            	 if(discontinuedFilter === true){
	            		
	            		 orderRecord.setSublistValue({
							    sublistId: 'item',
							    fieldId: 'custcol_hidden_discontinued_filter',
							    line: parseInt(lineid),
							    value: true
							});      		 
	            		 
	            	   }
	            	 
	            	 if(inactiveFilter === true){
		            		
	            		 orderRecord.setSublistValue({
							    sublistId: 'item',
							    fieldId: 'custcol_hidden_inactive_filter',
							    line: parseInt(lineid),
							    value: true
							});      		 
	            		 
	            	   }
					   					   
				 
					 log.debug('vlaues', 'orderid' + orderId + ' item ' + itemId + ' line' + lineid +  ' filter inact  ' + inactiveFilter + ' filters dis  ' + discontinuedFilter);  
					   
					   
					 orderRecord.save();	            	 
	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable hidden item filters';
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
