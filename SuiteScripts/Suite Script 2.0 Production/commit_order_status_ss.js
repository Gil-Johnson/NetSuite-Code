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
        	   
        	   var scriptId = runtime.getCurrentScript().deploymentId;
        	   var searchId = '';
        	   var commitStatus = 0;
        	   
        	   if(scriptId === 'customdeploy_commit_fully'){        		   
        		   searchId = 'customsearch3913';
            	   commitStatus = 1;        		   
        	   }
        	   else if(scriptId === 'customdeploy_partially_commit'){        		  
        		   searchId = 'customsearch3914';
            	   commitStatus = 2;	       		   
        	   } else  {
        		   searchId = 'customsearch6104';
            	   commitStatus = 3;	
        		   
        	   }      	           	   
        	      
             log.debug('scriptId', scriptId);
          	 log.debug('commitStatus', commitStatus);
          	 log.debug('searchId', searchId);
          	 
	             search.load({
	                 id: searchId
	             }).run().each(function(result) {	
	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid',
	                     summary: search.Summary.GROUP	 
	                 });
	            	 
	            
	            	 log.debug('order Id', orderId);
	            	 
		           	                
		               record.submitFields({
		                    type: record.Type.SALES_ORDER,
		                    id: orderId,
		                    values: {
		                    	custbody_commit_status: parseInt(commitStatus)
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });		
	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to update commited status on orders';
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
