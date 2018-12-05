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
 
      var inlinehtml = form.addField('custpage_inlinehtml_fld', 'inlinehtml', 'inlinehtml', null, null);
      nlapiSetFieldValue('custpage_inlinehtml_fld', '<script> jQuery( document ).ready(function() { jQuery("#custpage_fulfillwave").on("click", function() { jQuery(this).prop("disabled", true);}); }); </script>', null, null);

        if (status != 3) {

            nlapiLogExecution('DEBUG', 'test', 'poId: ' + recid);
            var strURL = nlapiResolveURL('SUITELET', 'customscript_wave_fulfillments', 'customdeploy_wave_fulfillments') + '&waveid=' + recid;
            var scriptbutton = 'document.location.href=' + String.fromCharCode(39) + strURL + String.fromCharCode(39)  ;
            form.addButton('custpage_fulfillwave', 'Fulfill Wave', scriptbutton);

        }

        var strURL = nlapiResolveURL('SUITELET', 'customscript_search_wave_complete', 'customdeploy_search_wave_complete') + '&waveid=' + recid;
        var scriptbutton = 'document.location.href=' + String.fromCharCode(39) + strURL + String.fromCharCode(39);
        form.addButton('custpage_release_bins', 'Release Bins', scriptbutton);
  

    }

}