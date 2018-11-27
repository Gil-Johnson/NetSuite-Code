/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Mar 2018     gilbertojohnson
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
function userEventBeforeLoad(type, form, request) {

    var currcontext = nlapiGetContext();
    var currentRole = nlapiGetRole();

    if (currcontext.getExecutionContext() == 'userinterface' && (type == 'view')) {

        var recid = nlapiGetRecordId();
        var type = nlapiGetRecordType();
        var user = nlapiGetUser();
        var role = nlapiGetRole();
        var status = nlapiGetFieldValue('custrecord_wave_fulfillment_status');
       
       
      //  nlapiLogExecution('DEBUG', 'test', 'poId: ' + poId);
 
        // var inlinehtml = form.addField('custpage_printkanban_fld', 'inlinehtml', 'inlinehtml', null, null);
        // nlapiSetFieldValue('custpage_printkanban_fld', '<script> jQuery( document ).ready(function() { jQuery("#custpage_printkanban").on("click", function() { jQuery(this).prop("disabled", true);}); }); </script>', null, null);


        var strURL = nlapiResolveURL('SUITELET', 'customscript_print_wave_api', 'customdeploy_print_wave_api') + '&waveid=' + recid + '&printtype=kanban';
        var scriptbutton = 'document.location.href=' + String.fromCharCode(39) + strURL + String.fromCharCode(39);
        form.addButton('custpage_printkanban', 'Print Wave Kanban', scriptbutton);
  

    }

}