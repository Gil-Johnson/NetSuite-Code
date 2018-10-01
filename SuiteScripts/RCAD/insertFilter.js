/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Jul 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function insertFilter(request, response){
	try {
		var method = request.getMethod();
		if (method == 'POST') {
			nlapiLogExecution('debug', 'create filter record suitelet triggered');
			
			var json = request.getBody();
			var dataObj = JSON.parse(json);
			var filterRecordId = dataObj.filterrecid;
			
			var filter = dataObj.filter;
			var empId = dataObj.employee;
			var dateV = dataObj.date;
			
			if (!filterRecordId) { // no custom record id, create new
				var name = dataObj.name;
				var filterRecord = nlapiCreateRecord('customrecord_filter_record');
				
				filterRecord.setFieldValue('name', name);
				filterRecord.setFieldValue('custrecord_filter_status', filter);
				filterRecord.setFieldValue('custrecord_user_id', empId);
				filterRecord.setFieldValue('custrecord_date', dateV);
				
				filterRecordId = nlapiSubmitRecord(filterRecord);
				nlapiLogExecution('debug', 'custom filter record submitted', filterRecordId);
				response.write(filterRecordId);
			}
			
		}
	}
	catch (e) {
		logError("Error: "+e);
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
