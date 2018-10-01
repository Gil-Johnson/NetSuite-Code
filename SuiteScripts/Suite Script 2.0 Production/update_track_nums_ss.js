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
	                 id: 'customsearch4613'
	             }).run().each(function(result) {
	            	 
	            	 var trackingNumsString = "";
	            	 
	            	 var invoiceId = result.getValue({
	                     name: 'internalid',
	                     });
	            	 
	            	 var orderTrackingNums = result.getValue({
	                     name: 'trackingnumbers',
	                     join : 'createdfrom'	 
	                 });	            	 
	            	 
	            	 var trackingRefNums = result.getValue({
	                     name: 'custbody_trackingreference'	                    	 
	                 });
	            	 
	            	 
	            	 if(!orderTrackingNums){	            		 
	            		 trackingNumsString = trackingRefNums.replace(/<BR>/g, " ");
	            	 }else{
	            		 trackingNumsString = orderTrackingNums.replace(/<BR>/g, " ");
	            	 }
	            	 
	            	
	          	 log.debug('invoiceId', invoiceId);
	           	 log.debug('trackingNumsString',  trackingNumsString);
		         
	           	 if(trackingNumsString){
	           		 
	           	 
		               record.submitFields({
		                    type: record.Type.INVOICE,
		                    id: invoiceId,
		                    values: {
		                    	trackingnumbers: trackingNumsString
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });	
		               
	           	 }
	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to tracking numbers on invoices';
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
