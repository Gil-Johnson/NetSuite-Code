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
function imgRequestList(request, response){
	try {
		
		var itemSearch = nlapiSearchRecord('customrecord_imagerequest', '80');
		if (itemSearch && itemSearch.length != 0) {
			var searchArray = new Array();
			var counter = 0;
			for (var z = 0; z < itemSearch.length; z ++) {
				searchArray[z] = new Array();
				var result = itemSearch[z];
				var searchCols = result.getAllColumns();
				
				var counter = counter+1;
				for (var i = 0; i < searchCols.length; i++){
					var colValue = result.getValue(searchCols[i]);
					var colValue0 = result.getValue(searchCols[0]);
					var colValue1 = result.getValue(searchCols[1]);
					var colValue2 = result.getText(searchCols[2]);
					var colValue3 = result.getValue(searchCols[3]);
					var colValue4 = result.getText(searchCols[4]);
					var colValue5 = result.getValue(searchCols[5]);
					
				}
				searchArray[z].push({
					DATE_NEEDED: colValue1,
					REQUESTED_BY: colValue2,
					IMG_REQ: colValue3,
					REQUIRED_BY: colValue4,
					DATE_CREATED: colValue5,
					Action: "<a id=\"'" + colValue0 + "'\" class=\"btn btn-info updateImgR\">Sent</a>"
					//ID: colValue0,
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
