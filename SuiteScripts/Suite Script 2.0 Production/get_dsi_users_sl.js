/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
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
    	
    	
    	var DSIUserSearch = search.load({
	         id: 'customsearch4793',
	    });
   	
	   	var userData = [];
	   	
	   	DSIUserSearch.run().each(function(result) {		  
			  
		  var user_id = result.getValue({
             name: 'internalid',
             });
		  
		  var user_name = result.getValue({
             name: 'name',           	 
         });
		
		  
		  userData.push({name: user_name, id:user_id}); 
		  return true; 
		  
	  	  });
   	
   	   var dsi_users = JSON.stringify(userData); 
   	   
   	  context.response.write(dsi_users);
    	

    }

    return {
        onRequest: onRequest
    };
    
});
