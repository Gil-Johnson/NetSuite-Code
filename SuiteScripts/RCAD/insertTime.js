/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       16 Jun 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function insertTime(request, response){
	try {
		var method = request.getMethod();
		if (method == 'POST') {
			nlapiLogExecution('debug', 'create time record suitelet triggered');
			
			var json = request.getBody();
			var dataObj = JSON.parse(json);
			
			var timeRecordId = dataObj.timerecid;
			
			var empId = dataObj.employee;
			var startTime = dataObj.starttime;
			var endTime = dataObj.endtime;
			
			if (!timeRecordId) { // no custom record id, create new
				var name = dataObj.name;
				var timeItem = dataObj.timeitem;
				var prodType = dataObj.prodtype;
			    
			    var timeRecord = nlapiCreateRecord('customrecord_time_record');
				
				timeRecord.setFieldValue('name', name);
				timeRecord.setFieldValue('custrecord_time_user', empId);
				timeRecord.setFieldValue('custrecord_start_time', startTime);
				timeRecord.setFieldValue('custrecord_end_time', endTime);
				timeRecord.setFieldValue('custrecord_time_item', timeItem);
				timeRecord.setFieldValue('custrecord_time_product_type', prodType);
				
				
				timeRecordId = nlapiSubmitRecord(timeRecord);
				nlapiLogExecution('debug', 'custom time record submitted', timeRecordId);
				
				response.write(timeRecordId);
			}
			else { //we have a custom record id, load it and adjust values
				var timeRecord = nlapiLoadRecord('customrecord_time_record', timeRecordId);
				
				timeRecord.setFieldValue('custrecord_end_time', endTime);
				
				nlapiSubmitRecord(timeRecord);
				nlapiLogExecution('debug', 'custom time record updated', timeRecordId);
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
