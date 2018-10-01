/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Oct 2016     betos
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
	
	 if(currcontext.getExecutionContext() == 'userinterface'
			&& (type == 'view')){
	
	
	var itemId = nlapiGetRecordId();	
	var itemType = nlapiGetRecordType();
		
		//nlapiGetFieldText('itemid');
	
	
	nlapiLogExecution('DEBUG', 'value', itemId);
	 
	  
	  var subcompoent = nlapiGetFieldValue('custitem_subcomponentof');
	  var substitute = nlapiGetFieldValue('custitem_substitute');
	  
	  var script = null;
	  
	  var url = nlapiResolveURL('SUITELET','customscript_item_roll_up_sl','customdeploy_item_roll_up_sl', null) + '&itemId='+parseInt(itemId)+ '&itemType='+itemType;   
	  
	  if(!subcompoent && !substitute){
		  
	//  script = 'window.open("/app/site/hosting/scriptlet.nl?script=392&deploy=1&itemId="'+itemId+', "", "width=400,height=400")';
		script = "window.open('"+url+"', '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=300,left=400,width=1200,height=700')";
	  }
	  else{
		//  script = "window.open('"+url+"', '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=1000,height=700')";
	   script = "alert('You cannot roll up an item that has already been rolled up or is a subcomponent of another item')";  
	   }
	  
	
	  form.addButton('custpage_custombuttonitm', 'Item Roll Up', script );
	
	 
	 }
 
}
