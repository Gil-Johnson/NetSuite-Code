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
        	   
        	   var scriptObj = runtime.getCurrentScript();
        	   log.debug("Script parameter of custscript1: " + scriptObj.getParameter({name: 'custscript_ship_method'}));
        	   
        //	   log.debug('entering search');
        	        	   
	             search.load({
	                 id: 'customsearch5177'
	             }).run().each(function(result) {	
	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid'	                   
	                 });
	            	 
	            	 
	            	  record.submitFields({
	                      type: record.Type.ITEM_FULFILLMENT,
	                      id: parseInt(orderId),
	                      values: {
	                    	  shipmethod: 4
	                    	  
	                      },
	                      options: {
	                          enableSourcing: false,
	                          ignoreMandatoryFields : true
	                      }
	                  });
	            
					// 4
	          
		             
	                 return true;
	             });          
	           
	            
	             
	         } catch (e) {
	             var subject = 'Error: Unable to update ship voia on fulfillments';
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
