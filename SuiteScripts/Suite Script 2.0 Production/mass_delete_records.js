/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(context) {   
    	
    	   	
    	  search.load({
              id: 'customsearch4176'
          }).run().each(function(result) {
        	  
        	  log.debug('results', result.length);
	             	            	
	             	record.delete({
	             	    type:  record.Type.BIN, 
	             	    id: result.id,
	             	});	             	
	             	
	             	return true;	             	
          });
    	  
    	  

    }

    return {
        execute: execute
    };
    
});
