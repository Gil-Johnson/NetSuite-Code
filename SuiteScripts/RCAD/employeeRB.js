/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jul 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function getEmployeeRB(request, response){
	try {
		nlapiLogExecution('debug', 'Web App RCAD Suitelet');
		//Sandbox 
		//var itemSearch = nlapiSearchRecord('employee', '5033');
		
		//Production
		var itemSearch = nlapiSearchRecord('employee', '5086');
		
		if (itemSearch && itemSearch.length != 0) {
			var searchArray = new Array();
			var counter = 0;
			for (var z = 0; z < itemSearch.length; z ++) {
				searchArray[z] = new Array();
				var result = itemSearch[z];
				var searchCols = result.getAllColumns();
				
				var counter = counter+1;
				for (var i = 0; i < searchCols.length; i++){
					//var colValue = result.getValue(searchCols[i]);
					
					var colValue0 = result.getValue(searchCols[0]);
					var colValue1 = result.getValue(searchCols[1]);
					
					
				}
				
				

				searchArray[z].push({
					ID: colValue0,
					NAME: colValue1 
					});
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