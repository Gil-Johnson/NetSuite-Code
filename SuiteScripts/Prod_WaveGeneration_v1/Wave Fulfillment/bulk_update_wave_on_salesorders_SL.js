/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Oct 2017     betos
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function updateSOs(request, response){
	
	 var orders = request.getParameter('orders');
	 var orderFilters = orders.split(",");
	 var wave_rec_id = request.getParameter('waveid');
	 
	 nlapiLogExecution('DEBUG', 'LogValues', orderFilters.toString());	 
	 nlapiLogExecution('DEBUG', 'LogValues', wave_rec_id);
	 	
	 var context1 = nlapiGetContext();

	   for ( var x = 0; x < orderFilters.length; x++ ) {

	      nlapiSubmitField('salesorder', orderFilters[x], ['custbody_current_wave', 'custbody_cleared_wave'] , [wave_rec_id, wave_rec_id]);
	      
	      }

	    
	    nlapiLogExecution('DEBUG', 'remaining usage', context1.getRemainingUsage());

}
