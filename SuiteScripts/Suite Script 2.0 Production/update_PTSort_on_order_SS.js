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
	                 id: 'customsearch5245'
	             }).run().each(function(result) {
	            	 
	            	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid',
	                     });
	            	 
	            	 var item = result.getText({
	                     name: 'item',
	                  	 
	                 });	            	 
	            	 
	            		         
	                     		 
	           	 
		               record.submitFields({
		                    type: record.Type.SALES_ORDER,
		                    id: orderId,
		                    values: {
		                    	custbody_ptsortidentifier: item
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });	
		               
	           	 
	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	           
	        	 log.error(JSON.stringify(e));
	         }
	         
	     }

    return {
        execute: execute
    };
    
});
