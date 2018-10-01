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
	                 id: 'customsearch4329'
	             }).run().each(function(result) {	
	            	 
	            	 var itemId = result.id;          
	            	 
	            		            	 
	            	 var displayname = result.getValue({	            		 
	                     name: 'displayname',		                
	                 });
	            	 
	            	 var description = result.getValue({	            		 
	                     name: 'description',		                
	                 });	 	 
	            	 
	         
	            	
	            	 try {   	
	            		 
		               record.submitFields({
		                    type: record.Type.SHIP_ITEM,
		                    id: parseInt(itemId),
		                    values: {
		                    	displayname: description
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });	
	            	 }
	            	 catch(e){
	            		 
	            	log.error('error', JSON.stringify(e));
	            		 
	            	 }	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to update preferred bin on Item';
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
