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
        form.setScript('customscript_client_wave_fulfillment');
       
       
      //  nlapiLogExecution('DEBUG', 'test', 'poId: ' + poId);
 
     // var inlinehtml = form.addField('custpage_inlinehtml_fld', 'inlinehtml', 'inlinehtml', null, null);
     // nlapiSetFieldValue('custpage_inlinehtml_fld', '<script> $.noConflict(); jQuery( document ).ready(function() { jQuery("#custpage_fulfillwave").on("click", function() { jQuery(this).prop("disabled", true);}); }); </script>', null, null);

        if (status != 3) {

            nlapiLogExecution('DEBUG', 'test', 'poId: ' + recid);
            var strURL = nlapiResolveURL('SUITELET', 'customscript_pick_wave_api_sl', 'customdeploy_pick_wave_api_sl') + '&waveid=' + recid;
            var scriptbutton = 'document.location.href=' + String.fromCharCode(39) + strURL + String.fromCharCode(39)  ;
            form.addButton('custpage_fulfillwave', 'Fulfill Wave', scriptbutton);

        }

        var strURL = nlapiResolveURL('SUITELET', 'customscript_search_wave_complete', 'customdeploy_search_wave_complete') + '&waveid=' + recid;
        var scriptbutton = 'document.location.href=' + String.fromCharCode(39) + strURL + String.fromCharCode(39);
        form.addButton('custpage_release_bins', 'Release Bins', scriptbutton);

if(user == 17834){
        var printurl = nlapiResolveURL('SUITELET', 'customscript_print_pick_task_pdf', 'customdeploy_print_pick_task_pdf') + '&waveid=' + recid;
        var	script = "window.open('"+printurl+"', '_blank', 'toolbar=yes,scrollbars=yes,resizable=yes,top=300,left=400,width=1200,height=700')";
      //  var scriptbutton = 'document.location.href=' + String.fromCharCode(39) + strURL + String.fromCharCode(39);
        form.addButton('custpage_print_wave_tasks', 'Print Pick Task', script);
}
  

    }

}