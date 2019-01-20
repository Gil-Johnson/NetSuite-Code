/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Mar 2017     betos
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request){
	
	var currcontext = nlapiGetContext();
	
	
	if(currcontext.getExecutionContext() == 'userinterface' && (type == 'view')){
		
		
		var soId = nlapiGetRecordId();
		var soStatus = nlapiGetFieldValue('orderstatus');
		
		
		
		if(soStatus != 'H'){
		
		var url = nlapiResolveURL('SUITELET','customscript_closed_order_reasons','customdeploy_closed_order_reasons', null) + '&soId='+parseInt(soId);//+ '&itemType='+itemType;
		script = "window.open('"+url+"', '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=500,width=600,height=400')";
		
		form.addButton('custpage_custombuttonitm', 'Close Order', script );
		}
		
	}
	
 
}
