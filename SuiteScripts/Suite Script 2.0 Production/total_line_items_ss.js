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
	                 id: 'customsearch3915'
	             }).run().each(function(result) {	
	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid',
	                     summary: search.Summary.GROUP	 
	                 });
	            	 
	            	 var itemCount = result.getValue({
	                     name: 'line',
	                     summary: search.Summary.COUNT	 
	                 });
	            	 
	            	 if(!itemCount){
	            		 return;
	            	 }
	            	
	          	 log.debug('order Id', orderId);
	           	 log.debug(' itemCount',  itemCount);
		            	                
		               record.submitFields({
		                    type: record.Type.SALES_ORDER,
		                    id: orderId,
		                    values: {
		                    	custbody_total_open_lines: parseInt(itemCount)
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });		
	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to item count on orders';
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
