/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       17 Apr 2014     Ubaid
 *
 */


/**
 * WOPO_Suitelet_Constants used in API
 */
var Wopo_Suitelet_Constants = {
    ApiVersion: "1.0",
    Method: {
        GetAllItems: "getAllItems",
        GetItemsOfBOM: "getItemsOfBOM",
        GetInvoices: "getInvoices"
    },
    RequestParameter: {
        Method: "method"
    },
    Status: {
        Ok: "OK",
        Error: "ERROR"
    },
    ErrorMessage: {
        UnexpectedError: "Some unexpected error has occurred"
    },
    Messages: {
        Title: "Review Items to Order"
    },
    SavedSearch: {
      SearchAllBOMs: "customsearch361",
       SearchAllActiveItems: "customsearch363",
       SearchInvoices: "customsearch_pod_invoice_tracking_search"
    },
    Files: {
        HtmlTemplateMain: 328982,
        ClientScriptId: "customscript_wopo_utility_cs"
    }
};


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function main(request, response) {
    try {

        //Handle POST requests separately
        if (request.getMethod() == 'POST') {
            var resp = handlePostRequest(request, response);
            response.write(resp);
            return true;
        }

        var form = nlapiCreateForm(Wopo_Suitelet_Constants.Messages.Title, false);
        form.setScript(Wopo_Suitelet_Constants.Files.ClientScriptId);
        form.addButton('custpage_btn_submit', 'Submit', 'btnSubmit_Click();');
        form.addButton('custpage_btn_cancel', 'Reset', 'btnCancel_Click();');
        form.addButton('custpage_btn_mark_all', 'Mark All', 'btnMarkAll_Click();');
        form.addButton('custpage_btn_unmark_all', 'Unmark All', 'btnUnmarkAll_Click();');


        var myformfields = form.addFieldGroup('myformfields', 'Form Fields');

        addWarehouseDropdown('custpage_sf_warehouse', form, 'myformfields');

        var txtDocumentsInQueue = form.addField('custpage_txt_order_end_received_by_date', 'text', 'Order End Date', null, 'myformfields');
        txtDocumentsInQueue.setDefaultValue('');

        addVendorDropdown(form, 'myformfields');

        var mysearchfields = form.addFieldGroup('mysearchfields', 'Search Fields');

        addTypeDropdown(form, 'mysearchfields');

        addCustomerDropdown(form, 'mysearchfields');

        addWarehouseDropdown('custpage_msf_warehouse', form, 'mysearchfields');

        addLeagueDropdown(form, 'mysearchfields');

        addTeamDropdown(form, 'mysearchfields');

        addProductTypeDropdown(form, 'mysearchfields');

        addCustomDropdown(form, 'mysearchfields');

        addDiscontinuedDropdown(form, 'mysearchfields');

        addOvercommittedDropdown(form, 'mysearchfields');

        //Now, add our Jtable.
        addCustomHtml(form);

        //add a dummy html, so that TD is created
        form.addField("custpage_page_template_br1", "inlinehtml").setDefaultValue("");

        response.writePage(form);
    }
    catch (e) {
        response.write(e.name + ", " + e.message);
        nlapiLogExecution("ERROR", e.name, e.message);
    }
}

/**
 * Adds warehouse dropdown
 * @param form {nlobjForm} Input Form to use
 */
function addWarehouseDropdown(id, form, group) {
    var select = form.addField(id, 'select', 'Warehouse', null, group);
    select.addSelectOption('', '');

    var records = nlapiSearchRecord('location', null,
        null, new nlobjSearchColumn('name', null, null));

    for (var i in records) {
        var record = records[i];
        select.addSelectOption(record.getId(), record.getValue('name'));
    }
}

function addCustomDropdown(form, group) {
    var select = form.addField('custitem_custom', 'select', 'Custom', null, group);
    select.addSelectOption('F', 'No');
    select.addSelectOption('-1', 'All', true);
    select.addSelectOption('T', 'Yes');
}

function addDiscontinuedDropdown(form, group) {
    var select = form.addField('custitem_discontinued', 'select', 'Discontinued', null, group);
    select.addSelectOption('F', 'No', true);
    select.addSelectOption('-1', 'All');
    select.addSelectOption('T', 'Yes');
}

function addOvercommittedDropdown(form, group) {
    var select = form.addField('custitem_overcommitted', 'select', 'Overcommitted', null, group);
    select.addSelectOption('F', 'No');
    select.addSelectOption('-1', 'All', true);
    select.addSelectOption('T', 'Yes');
}

/**
 * Adds status dropdown
 * @param form {nlobjForm} Input Form to use
 */
function addTypeDropdown(form, group) {
    var select = form.addField('custpage_sf_type', 'select', 'WO/PO', null, group);
    select.addSelectOption('0', 'Work Order', true);
    select.addSelectOption('1', 'Purchase Order');
}

/**
 * Adds customer dropdown
 * @param form {nlobjForm} Input Form to use
 */
function addCustomerDropdown(form, group) {
    form.addField('custpage_sf_customer', 'select', 'Customer', 'customer', group);
}

/**
 * Adds product dropdown
 * @param form {nlobjForm} Input Form to use
 */
function addProductTypeDropdown(form, group) {
    form.addField('custpage_sf_producttype', 'select', 'Product Type', 'customrecord_producttypes', group);
}

function addTeamDropdown(form, group) {
    form.addField('custpage_sf_team', 'select', 'Team 1', 'customrecord4', group);
}

function addLeagueDropdown(form, group) {
    form.addField('custpage_sf_league', 'select', 'League 1', 'customrecord5', group);
}

/**
 * Adds vendor dropdown
 * @param form {nlobjForm} Input Form to use
 */
function addVendorDropdown(form, group) {
    form.addField('custpage_sf_vendor', 'select', 'Vendor', 'vendor', group);
}

/**
 * Adds custom Html in the form, if any
 * @param form The form that is being used in the SuiteLet.
 */
function addCustomHtml(form) {
    var templatePage = nlapiLoadFile(Wopo_Suitelet_Constants.Files.HtmlTemplateMain);
    form.addField("custpage_page_template", "inlinehtml").setDefaultValue(templatePage.getValue());
}

/**
 * Handler for POST requests
 * @param req
 * @param resp
 */
function handlePostRequest(req, resp) {
    var outResponse = {
        Version: Wopo_Suitelet_Constants.ApiVersion,
        Status: 'OK'//Wopo_Suitelet_Constants.TransactionType.Ok
    };
    try {
        var context = nlapiGetContext();
        var method = request.getParameter(Wopo_Suitelet_Constants.RequestParameter.Method);
        if (method == Wopo_Suitelet_Constants.Method.GetItemsOfBOM) {
            outResponse["OptionsForSelectItem"] = "[]";

            //Fetch records for items list
            var savedSearch = [];
            var lastId = 0;
            do {
                lastRecord = nlapiSearchRecord(null, Wopo_Suitelet_Constants.SavedSearch.SearchAllBOMs, new nlobjSearchFilter('internalidnumber', 'memberitem', 'greaterthan', lastId));
                if (lastRecord != null) {
                    lastId = lastRecord[lastRecord.length - 1].getValue('internalid', 'memberitem', 'GROUP'); //get internalID of last record
                    savedSearch = savedSearch.concat(lastRecord);
                }
            }
            while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

            //Make a list of items for items list
            var optionsForSelectItem = [];
            savedSearch.forEach(function (srchRecord) {
                optionsForSelectItem[optionsForSelectItem.length] = {
                    Value: srchRecord.getValue('internalid', 'memberitem', 'GROUP'),
                    Text: srchRecord.getValue('memberitem', null, 'group')
                };
            });
            outResponse["OptionsForSelectItem"] = JSON.stringify(optionsForSelectItem);
        }
        else if (method == Wopo_Suitelet_Constants.Method.GetInvoices) {
            outResponse["OptionsForSelectItem"] = "[]";

            //Fetch records for swap list
            var savedSearchSwap = [];
            lastId = 0; //reset the lastId to zero
            do {
                lastRecord = nlapiSearchRecord(null, Wopo_Suitelet_Constants.SavedSearch.SearchInvoices,
                    new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId));
                if (lastRecord != null) {
                    lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record
                    savedSearchSwap = savedSearchSwap.concat(lastRecord);
                }
            }
            while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

            //Make a list of items for swap list
            var optionsForSelectSwapItem = [];
            savedSearchSwap.forEach(function (srchRecord) {
                optionsForSelectSwapItem[optionsForSelectSwapItem.length] = {
                    Value: srchRecord.getId(),
                    Text: srchRecord.getValue('itemid')
                };
            });
            outResponse["OptionsForSelectItem"] = JSON.stringify(optionsForSelectSwapItem);
        }
        else if (method == Wopo_Suitelet_Constants.Method.GetItemsOfBOM) {
            outResponse["OptionsForSelectItem"] = "[]";

            //Fetch records for items list
            var savedSearch = [];
            var lastId = 0;
            do {
                lastRecord = nlapiSearchRecord(null, Wopo_Suitelet_Constants.SavedSearch.SearchAllBOMs, new nlobjSearchFilter('internalidnumber', 'memberitem', 'greaterthan', lastId));
                if (lastRecord != null) {
                    lastId = lastRecord[lastRecord.length - 1].getValue('internalid', 'memberitem', 'GROUP'); //get internalID of last record
                    savedSearch = savedSearch.concat(lastRecord);
                }
            }
            while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

            //Make a list of items for items list
            var optionsForSelectItem = [];
            savedSearch.forEach(function (srchRecord) {
                optionsForSelectItem[optionsForSelectItem.length] = {
                    Value: srchRecord.getValue('internalid', 'memberitem', 'GROUP'),
                    Text: srchRecord.getValue('memberitem', null, 'group')
                };
            });
            outResponse["OptionsForSelectItem"] = JSON.stringify(optionsForSelectItem);
        }
    }
    catch (e) {
        outResponse["TransactionType"] = Wopo_Suitelet_Constants.TransactionType.Error;
        outResponse["DebugMessage"] = e.message;
        outResponse["FriendlyMessage"] = Wopo_Suitelet_Constants.ErrorMessage.UnexpectedError;
    }

    return JSON.stringify(outResponse);
}