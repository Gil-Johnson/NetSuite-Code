/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record',  'N/search', 'N/email', 'N/runtime'],

function(record, search, email, runtime) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
	 if (context.request.method === 'GET'){	
		 
		//put error handling for no values===============================

		 try{
	    	
	    	//retrive parameters 
			 var waveid = context.request.parameters.waveid; 
			
			 log.debug('waveid', waveid);	
	

			 //run search for all orders with a certain wave 
			var itemsToFulfill = search.load({
				id: 'customsearch5123',
			});

			itemsToFulfill.filters.push( search.createFilter({
				join: 'binnumber',
				name: 'custrecord_current_wave',
				operator: search.Operator.IS,
				values: waveid
			})); 

			var searchResult = itemsToFulfill.run().getRange({
                start: 0,
                end: 10
                });

			if(searchResult.length > 0){

				context.response.write('<h2> Items are still found in the pack bins.  Please move the inventory before closing the wave. </h2>');

			}else{

 				// If no results returned
				// Search all bins for wave number in current wave field and erase value from current wave field. custrecord_current_wave
				// Mark wave complete field on wave T - custrecord_wave_complete 


			}
			

			log.debug('results', JSON.stringify(searchResult.length));


		 }catch(e){
			 
			 var error = log.error("error", JSON.stringify(e));
			
		 }
	 		         
	                  
	      // context.response.write('<script> window.history.back() </script>');
	    		 
		 	 		
		 }

    }

    return {
        onRequest: onRequest
    };
    
});