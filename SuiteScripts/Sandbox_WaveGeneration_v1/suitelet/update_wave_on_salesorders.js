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
	 var processtoken = request.getParameter("processtoken");
	 
//	 nlapiLogExecution('DEBUG', 'LogValues', orderFilters.toString());	 
	 nlapiLogExecution('DEBUG', 'LogValues', wave_rec_id);
	 
	 var suiteletURL = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=391&deploy=1&compid=3500213&h=3230d0681b508ace5454';
	 suiteletURL += '&waveid=' + wave_rec_id;
	 suiteletURL += '&processtoken=' + processtoken;
	
	 var context1 = nlapiGetContext();

	   for ( var x = 0; x < orderFilters.length; x++ ) {
	      nlapiSubmitField('salesorder', orderFilters[x], ['custbody_current_wave', 'custbody_cleared_wave'] , [wave_rec_id, wave_rec_id]);
	      
	      
	      if(context1.getRemainingUsage() < 100){     	     	  
	    	  
	    	  nlapiLogExecution('DEBUG', 'orders waved', orderFilters[x]);
	    	  suiteletURL += '&orders=' + _.drop(orderFilters, x).toString();
	    	  nlapiRequestURL(suiteletURL);	
	    	  break;    	  
	    	  
	        } 
	      
	      
	      
	      }

	   if(context1.getRemainingUsage() > 100){
		    nlapiSubmitField('customrecord_wave', wave_rec_id, 'custrecord_progress_token', processtoken);
		   }
	    nlapiLogExecution('DEBUG', 'remaining usage', context1.getRemainingUsage());

}
