/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Sep 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function imgRN(request, response){

	try {
		nlapiLogExecution('debug', 'Web App RCAD Suitelet');
		//Sandbox 
		//var itemSearch = nlapiSearchRecord('customrecord_imagerequest', '5045');

		//Production
		var itemSearch = nlapiSearchRecord('customrecord_imagerequest', '5089');
		
		if (itemSearch && itemSearch.length != 0) {
			var searchArray = new Array();
			var counter = 0;
			for (var z = 0; z < itemSearch.length; z ++) {
				searchArray[z] = new Array();
				var result = itemSearch[z];
				var searchCols = result.getAllColumns();
				
				var counter = counter+1;
				for (var i = 0; i < searchCols.length; i++){
					var colValue0 = result.getValue(searchCols[0]);
				}
				
				

				searchArray[z].push({
					COUNT: colValue0
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
