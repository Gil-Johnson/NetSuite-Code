/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       14 Jun 2016     gjohnson
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType 
 * 
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function clientPageInit(type){
	
	var user = nlapiGetUser();
	
	
	if (user == 16469 || user == 17834){
	
//	var testparam = nlapiGetContext().getSetting('SCRIPT', 'custscript_addrlabel');
	
	var store = getURLParameter('param1');
	var address = getURLParameter('param2');
	
	nlapiSetFieldValue('custrecord_associated_store', store);
	nlapiSetFieldValue('notetype', 11);
	nlapiSetFieldValue('direction', 2);
	nlapiSetFieldValue('title', 'Note for:' + store);
	
	
	

	}
	
	  // if fieldA is either NULL or equal to "valueA"
	
 //     nlapiSetFieldText('fieldA', nlapiGetFieldText('valueB'));
	   
	
	
	
   
}

function getURLParameter(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
	}