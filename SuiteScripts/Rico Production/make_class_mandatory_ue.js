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
	
	
	if(currcontext.getExecutionContext() == 'userinterface' && (type == 'view')){
	
	 
	
      try{

		 var sublistobj = nlapiGetSubList('item');
		 var classfield = sublistobj.getField('class');
		 classfield.setMandatory(true);
      }catch(e){
        
      }
		 
	}		 
	 
	 
 
}
