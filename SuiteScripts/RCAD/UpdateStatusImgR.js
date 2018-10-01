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
function updateImgRq(request, response){
	try {
		var method = request.getMethod();
		if (method == 'POST') {
			nlapiLogExecution('debug', 'Update Item');

			var json = request.getBody();
			var dataObj = JSON.parse(json);
			
			
			var recordid = dataObj.recordid;
			var isinactive = dataObj.isinactive;
			
			var imgRRecord = nlapiLoadRecord('customrecord_imagerequest', recordid);
			
			imgRRecord.setFieldValue('isinactive', isinactive);
			
			nlapiSubmitRecord(imgRRecord);
			nlapiLogExecution('debug', 'custom time record updated', imgRRecord);
			
			
					
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
