/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 July 2014     Sameer
 *
 *SL2
 *  Record Type Control - distinct sourced from [TBL-SS.RecordType]
 *  Saved Search Control - sourced from [TBL-SS.SavedSearch] filter by [Record Type Control] at CL3 level
 *  Custom jquery Sublist – customized & populated at CL3 level
 *  Hidden field to hold the selected record internalids
 *  User can select any number of shown records in any page and then click Submit
 *
 *
 */

function loadHtmlFiles(htmlDependencies) {

    //multiselect.css is pasted directly on code
    htmlDependencies = "<link rel='stylesheet' type='text/css' href='" + nlapiLoadFile(WotpUtilityCommon.getFileUrl() + "jquery_table/jquery.multiselect.css").getURL() + "' />";

    htmlDependencies += '<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/smoothness/jquery-ui.css" />';
    htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js'></script>";
    htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js'></script>";
    /* multiselect.script*/
    htmlDependencies += WotpUtilityCommon.Strings.ScriptStart + nlapiLoadFile(WotpUtilityCommon.getFileUrl() + "jquery_table/jquery.multiselect.min.js").getURL() + WotpUtilityCommon.Strings.ScriptEnd;
    /*xdr.js to create cors ajax call on IE*/
    htmlDependencies += WotpUtilityCommon.Strings.ScriptStart + nlapiLoadFile(WotpUtilityCommon.getFileUrl() + "jquery_table/xdr.js").getURL() + WotpUtilityCommon.Strings.ScriptEnd;

    /* jquery.jtable.min.js */
    htmlDependencies += WotpUtilityCommon.Strings.ScriptStart + nlapiLoadFile(WotpUtilityCommon.getFileUrl() + "jquery_table/jquery.jtable.min.js").getURL() + WotpUtilityCommon.Strings.ScriptEnd;

    //jquery.jtable.clientbinding.js
    htmlDependencies += WotpUtilityCommon.Strings.ScriptStart + nlapiLoadFile(WotpUtilityCommon.getFileUrl() + "jquery_table/jquery.jtable.clientbinding.js").getURL() + WotpUtilityCommon.Strings.ScriptEnd;
    return htmlDependencies;
}

/**
 * Gets All Operations
 */
function getOperations() {
    var col = [];
    col[0] = new nlobjSearchColumn('name');
    col[1] = new nlobjSearchColumn('internalId');
    var operationSearchResult = nlapiSearchRecord(WotpUtilityCommon.CustomLists.Operations, null, null, col);
    var html = "<option value=''>- None -</option>";
    for ( var i = 0; operationSearchResult !== null && i < operationSearchResult.length; i++ ) {
        var res = operationSearchResult[i];
        var listValue = (res.getValue('name'));
        var listId = (res.getValue('internalId'));
        html += '<option value="' + listId + '">' + listValue + '</option>';
    }

    return html;
}

/**
 * Get request method
 * @param request
 * @param response
 * @param notice
 */
function getMethod(request, response, notice) {
    try {

        var form, // NetSuite Form
          html, // inline html type field to display custom html
          htmlDependencies = '', // all html dependencies (jtable, jquery etc.)
          indexPageValue, // external html page
          operationsHtml = '',
          suiteletUrl;

        form = nlapiCreateForm('Work Order Tracking Project');
        //    form.addField('printed_picking_ticket', 'select', 'Printed Picking Ticket').setLayoutType('startrow');
        var printedTicketField = form.addField('printpickingticket', 'select', 'Printed Picking Ticket').setLayoutType('normal','startcol');
        printedTicketField.addSelectOption('', '');
        printedTicketField.addSelectOption('T', 'Yes');
        printedTicketField.addSelectOption('F', 'No');
        var productTypeField = form.addField('producttype', 'select', 'Product Type');
        var columns = new Array();
        columns[0] = new nlobjSearchColumn('custbody_woproducttype', null, 'group');
        // Execute the search. You must specify the internal ID of the record type.
        var searchresults = nlapiSearchRecord('transaction', 'customsearch_product_type_list', null, columns);
        productTypeField.addSelectOption("", "");
        // Loop through all search results. When the results are returned, use methods
        // on the nlobjSearchResult object to get values for specific fields.
        for (var x = 0; searchresults != null && x < searchresults.length; x++) {
            var searchresult = searchresults[x];
            var productTypeId = searchresult.getValue('custbody_woproducttype', null, 'group');
            var product_display = searchresult.getText('custbody_woproducttype', null, 'group');
            productTypeField.addSelectOption(productTypeId, product_display);
        }
        form.addField('department', 'select', 'Department', "department");
        form.addButton("apply_filter", "Apply Filter", "applyFiltersOnSearch()");
        form.setScript(WotpUtilityCommon.ClientScripts.SuiteletClientScript.Id); // Constants.Netsuite.Scripts.ClientScriptId
        html = form.addField('inlinehtml', 'inlinehtml', '');
        form.addField('recordtype', 'text', '').setDisplayType('hidden');
        form.addField('values', 'longtext', '').setDisplayType('hidden');
        form.addField('internal_ids', 'text', '').setDisplayType('hidden');
        suiteletUrl = form.addField('suitelet_url', 'longtext', '');
        suiteletUrl.setDisplayType('hidden');

        nlapiLogExecution('DEBUG', 'value of 1', '');
        htmlDependencies = loadHtmlFiles(htmlDependencies);

        var data = nlapiLoadFile(WotpUtilityCommon.getFileUrl() + "wotp_utility_html.html");

        nlapiLogExecution('DEBUG', 'value of 2', '');
        /* index.html */
        indexPageValue = data.getValue();

        nlapiLogExecution('DEBUG', 'value of 3', '');
        operationsHtml = getOperations();

        nlapiLogExecution('DEBUG', 'value of 3', operationsHtml );
        indexPageValue = indexPageValue.replace('#OPERATIONS#', operationsHtml);
        html.setDefaultValue(notice + htmlDependencies + indexPageValue);

        response.writePage(form);
    } catch (e) {
        nlapiLogExecution('DEBUG', 'value of e', e.toString());
        throw e;
    }
}

/**
 * Suitelet main function
 * @param request
 * @param response
 */
function main(request, response) {
    try {
        var record,
          internalids, //internal ids json
          arr = [], // json conversion to array list stored in this array
          internal_id, // for loop variable
          ids, // comma separated text
          type, // record type
          data = {}, // data to be upsert in dao
          notice, // success notice.
          fil_name, // filter name for switch case get by filter
          fil_value, // filter value for switch case get by filter
          fil, //nlobjfilter for switch case get by filter
          ret_value; // ajax call result value
        if (request.getMethod() === 'GET') {
            notice = "";
        } else if (request.getMethod() === 'POST') {
            notice = "";
        }
        getMethod(request, response, notice);
    } catch (e) {
        //Show error for now
        response.write("Error: " + e.name + ", " + e.message);
    }
}