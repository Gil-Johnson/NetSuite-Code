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

		log.debug('in SL' , 'in SL');

		try{
	
		var userid = context.request.parameters.user; 
		//var orderid = context.request.parameters.id; 
		var isMarked = 'F';

		var waveSearch = search.load({
            id: 'customsearch_wave_progress_checker',
         });
		 
		 waveSearch.filters.push(search.createFilter({
            name: 'owner',
            operator: 'ANYOF',
            values: userid
        }));	
		   
		waveSearch.run().each(function(result) {
			
		var name = result.getValue({
			name: 'name',
			});

			log.debug('name' , name);
			  
		  var ordersMarked = result.getValue({
             name: 'custrecord_orders_marked',
           });
		  
		   log.debug('orders markred' , ordersMarked);

		   if(ordersMarked == true){

			isMarked = 'T';
		   }
		 
		   
		
	
		  return false; 
		  
			});
			

	
		context.response.write(isMarked);

	}catch(e){

		log.debug("ERROR", JSON.stringify(e));
	}

    }

    return {
        onRequest: onRequest
    };
    
});
