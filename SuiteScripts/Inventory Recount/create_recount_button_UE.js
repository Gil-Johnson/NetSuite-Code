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
	
	
	var recId = nlapiGetRecordId();	
	var recType = nlapiGetRecordType();
		
    //nlapiGetFieldText('itemid');
	var AssignedTo = null;
	var isComplete = false;
	
	
	nlapiLogExecution('DEBUG', 'rectype', recType);
	
	if(recType == 'inventoryadjustment'){
		
	var associatedTask = nlapiGetFieldValue('custbody_inv_count_task');
	
	nlapiLogExecution('DEBUG', 'associatedTask', associatedTask);
	
	if(associatedTask){
		
		nlapiLogExecution('DEBUG', 'associatedTask2', associatedTask);
		
		isComplete = 'T';
		AssignedTo = nlapiLookupField('customrecord_inv_count_task', associatedTask, 'custrecord_inv_count_task_assigned_to', true);
		recId = parseInt(associatedTask);
	}
		
		
	}else if (recType == 'customrecord_inv_count_task' && nlapiGetFieldValue('custrecord_inv_count_task_type') != 2){
		
		  isComplete = nlapiGetFieldValue('custrecord_inv_count_task_complete');
		  AssignedTo = nlapiGetFieldText('custrecord_inv_count_task_assigned_to');
		
	}else if (recType == 'customrecord_inv_count_task' && nlapiGetFieldValue('custrecord_inv_count_task_type') == 2 && nlapiGetFieldValue('custrecord_inv_count_task_complete') == 'T' && !nlapiGetFieldValue('custrecord_inv_count_adjustment')){
		
		var func = "var recload = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId()); recload.setFieldValue('custrecord_pr_adjustment', 'T'); nlapiSubmitRecord(recload); location.reload();";
		
		form.addButton('custpage_custombutton', 'Process Adjustment', func);
		
	}else{
		
		// do nothing
		
	}
	 
	  

	  
	  if (isComplete == 'T'){
	 	  
	   var url = nlapiResolveURL('SUITELET','customscript_create_recount_record','customdeploy_create_recount_record', null) + '&recId='+parseInt(recId)+ '&AssignedTo='+AssignedTo + '&recType='+recType;   
	  
		  
		//  script = 'window.open("/app/site/hosting/scriptlet.nl?script=392&deploy=1&itemId="'+itemId+', "", "width=400,height=400")';
		var	script = "window.open('"+url+"', '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=300,left=400,width=1200,height=700')";
	
	    
	
	    form.addButton('custpage_custombuttonitm', 'Create Recount', script);
	
	 
	   }
	  
	 }
 
}
