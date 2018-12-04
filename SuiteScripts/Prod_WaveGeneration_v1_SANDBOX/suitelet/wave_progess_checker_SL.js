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
	       
	    var waveRecords = nlapiSearchRecord( 'transaction', 'customsearch5209', filters, null);  	      
	   
	   // nlapiLogExecution('DEBUG', "results", waveRecords.length);
	    
	    if(waveRecords != null){
	    	isComplete = true;
	    	nlapiLogExecution('DEBUG', "results", waveRecords.length);
	    }
		
		 
		 
	  //  var html =  '<html><body><h1>Hello World</h1></body></html>';
	    response.write( isComplete ); 
	 //   response.setHeader('Custom-Header-Demo', 'Demo');
}