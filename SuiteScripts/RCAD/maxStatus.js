/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Aug 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function maxStatus(request, response){

	try {
		nlapiLogExecution('debug', 'Web App Testing Suitelet');
		var userid = request.getParameter('userid');
		
		var filters = new Array();
		filters.push(new nlobjSearchFilter('custrecord_user_id', null, 'is', userid));
		//Sandbox 
		//var statusSearch = nlapiSearchRecord('customrecord_filter_record', '5041', filters);

		//Production
		var statusSearch = nlapiSearchRecord('customrecord_filter_record', '5091', filters);
		
		
		if (statusSearch && statusSearch.length != 0) {
			var searchArray = new Array();
			var counter = 0;
			 
			for (var z = 0; z < statusSearch.length; z ++) {
				var uno = '';
				 var dos = '';
				 var tres = '';
				searchArray[z] = new Array();
				var result = statusSearch[z];
				var searchCols = result.getAllColumns();
				
				var counter = counter+1;
				for (var i = 0; i < searchCols.length; i++){
					var colValue = result.getValue(searchCols[i]);
					var colValue0 = result.getValue(searchCols[0]);
					var colValue1 = result.getValue(searchCols[1]);
					var colValue2 = result.getValue(searchCols[2]);
					
					uno = result.getValue(searchCols[0]);
					dos = result.getValue(searchCols[1]);
					tres = result.getValue(searchCols[2]);
					
					
					
				}
				
				if (uno != '') {  
					searchArray[z].push({InternalId: colValue0, UserId: colValue1, Status: colValue2});
					break;}
				}
				
			}
		
		
		var json = JSON.stringify(searchArray);
		
		nlapiLogExecution('debug', 'about to send JSON string');
		
		response.write(json);
		
	}
	catch (e) {
		logError(e);
	}
}

function logError(e){
	var errorMessage = '';
	
	if (e instanceof nlobjError){
		nlapiLogExecution('ERROR', e.getCode() , e.getDetails());
		errorMessage = e.getCode() + ': ' + e.getDetails();
	}
	else{
		nlapiLogExecution('ERROR',  'Unspecified', e.toString());
		errorMessage = e.toString();
	}
	
	return errorMessage;
}
