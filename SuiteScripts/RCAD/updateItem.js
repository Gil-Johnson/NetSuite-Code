/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       19 Jul 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function updateItem(request, response){
	try {
		var method = request.getMethod();
		if (method == 'POST') {
			nlapiLogExecution('debug', 'Update Item');
			
			var json = request.getBody();
			var dataObj = JSON.parse(json);
			
			var itemIdv = dataObj.id;
			
			var statusIdv = dataObj.statusId;
			var reqById =dataObj.reqById;
			
			var type = dataObj.type;
			var nt = "";
			  
			if(type == "Assembly/Bill of Materials"){
				nt = "assemblyitem";
			}else if(type == "Inventory Item"){
				nt = "inventoryitem";	
			}else if(type == "Kit/Package"){
				nt = "kititem";
			}
				
			var itemRecord = nlapiLoadRecord(nt, itemIdv);
			
			if(statusIdv == ''){
				itemRecord.setFieldValue('custitem_actreqby', reqById);	
				
			}else if(reqById == ''){
				
				itemRecord.setFieldValue('custitem_status', statusIdv);
			}else{
				itemRecord.setFieldValue('custitem_status', statusIdv);
				itemRecord.setFieldValue('custitem_actreqby', reqById);
				
			}
			
			
			
			
			nlapiSubmitRecord(itemRecord);
			nlapiLogExecution('debug', 'custom time record updated', itemRecord);
			
			
					
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
