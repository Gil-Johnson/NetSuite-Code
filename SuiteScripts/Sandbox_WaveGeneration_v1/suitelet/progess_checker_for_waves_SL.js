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
function checkWaveProgess(request, response){
	
	 var lastOrder = request.getParameter("lastorder");
	 nlapiLogExecution('DEBUG', "lastOrder", lastOrder);
	 
	 var isComplete = false;
	 
	 
	    var filters = new Array();
	    filters[0] = new nlobjSearchFilter('internalid', null, 'is', lastOrder);
	       
	    var waveRecords = nlapiSearchRecord( 'customrecord_wave', 'customsearch3886', filters, null);  	      
	   
	//    nlapiLogExecution('DEBUG', "results", waveRecords.length);
	    
	    if(waveRecords){
	    	isComplete = true;
	    	nlapiLogExecution('DEBUG', "results", waveRecords.length);
	    }
		
		 
		 
		response.write(isComplete);  
	
}
