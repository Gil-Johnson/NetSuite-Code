/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       17 Apr 2014     Ubaid
 *
 */


/**
 * POD_CS_Constants used in API
 */
var ApiConstants = {
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
    SavedSearch: {
        SearchAllBOMs: "customsearch361",
        SearchAllActiveItems: "customsearch363",
        SearchInvoices: "customsearch_pod_invoice_tracking_search"
    },
    Files:{
        HtmlTemplateMain: 286192 //6369 // 6369 DEV, 286192 , PROD
    }
};

/**
 * Adds warehouse dropdown
 * @param form {nlobjForm} Input Form to use
 */
 function addWarehouseDropdown(form) {
    var select = form.addField('custpage_sf_warehouse', 'select', 'Warehouse');
    select.addSelectOption('','');

    var columns = new Array();
    columns[0] = new nlobjSearchColumn('name', null, null);

    var records = nlapiSearchRecord('location', null,null,columns);

    for (var i in records) {
        var record = records[i];
        select.addSelectOption(record.getId(), record.getValue('name'));
    }
    //select.addSelectOption('e','Edgar');
}

/**
 * Adds status dropdown
 * @param form {nlobjForm} Input Form to use
 */
function addStatusDropdown(form) {
    var select = form.addField('custpage_sf_invoice_status', 'select', 'Status');
    select.addSelectOption('-1','');
    select.addSelectOption('0','Open');
    select.addSelectOption('1','Paid In Full');

    //select.addSelectOption('e','Edgar');
}

/**
 * Adds customer dropdown
 * @param form {nlobjForm} Input Form to use
 */
function addCustomerDropdown(form) {
    var select = form.addField('custpage_sf_customer', 'select', 'Name', 'customer');

    //select.addSelectOption('e','Edgar');
}

/**
 * Adds custom Html in the form, if any
 * @param form The form that is being used in the SuiteLet.
 */
function addCustomHtml(form) {
    var templatePage = nlapiLoadFile(ApiConstants.Files.HtmlTemplateMain);

    form.addField("custpage_page_template", "inlinehtml").setDefaultValue(templatePage.getValue());
}

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function main(request, response){
	try {

        //Handle POST requests separately
		if (request.getMethod() == 'POST') {
			var resp = handlePostRequest(request, response);
			response.write(resp);
            return true;
		}
		
		var form = nlapiCreateForm("Generate Proof of Delivery", false);
		form.setScript("customscript_pod_utility_cs");

        form.addButton('custpage_btn_print', 'Print', 'btnPrint_Click();');
        form.addButton('custpage_btn_cancel', 'Reset', 'btnCancel_Click();');

        form.addButton('custpage_btn_mark_all', 'Mark All', 'btnMarkAll_Click();');
        form.addButton('custpage_btn_unmark_all', 'Unmark All', 'btnUnmarkAll_Click();');

        addWarehouseDropdown(form);

        addCustomerDropdown(form);

        addStatusDropdown(form);

        var txtDocumentsInQueue = form.addField('custpage_dummy_1', 'text' , '');

        var txtInvoices = form.addField('custpage_txt_invoices', 'longtext' , 'Invoice #');
        txtInvoices.setDefaultValue('');

        var txtDocumentsInQueue = form.addField('custpage_txt_from_date', 'text' , 'From Date');
        txtDocumentsInQueue.setDefaultValue('');

        var txtDocumentsInQueue = form.addField('custpage_txt_to_date', 'text' , 'To Date');
        txtDocumentsInQueue.setDefaultValue('');



        //
        //Now, add our Jtable.
        addCustomHtml(form);

        //add a dummy html, so that TD is created
        form.addField("custpage_page_template_br1", "inlinehtml").setDefaultValue("");


        //do not add this field here.
//        var txtDocumentsInQueue = form.addField('custpage_txt_documents_in_queue', 'text' , 'Documents in Queue');
//        txtDocumentsInQueue.setDefaultValue('0');


        response.writePage(form);
	}
	catch(e) {
		response.write(e.name + ", "+ e.message);
		nlapiLogExecution("ERROR", e.name, e.message);
	}
}

/**
 * Handler for POST requests
 * @param req
 * @param resp
 */
function handlePostRequest(req, resp) {
    var outResponse = {
        Version: ApiConstants.ApiVersion,
        Status: ApiConstants.Status.Ok
    };
	try {
        var context = nlapiGetContext();
		var method = request.getParameter(ApiConstants.RequestParameter.Method);
		if(method == ApiConstants.Method.GetItemsOfBOM) {
            outResponse["OptionsForSelectItem"] = "[]";

            //Fetch records for items list
            var savedSearch = [];
            var lastId = 0;
            do {
                lastRecord = nlapiSearchRecord(null, ApiConstants.SavedSearch.SearchAllBOMs, new nlobjSearchFilter('internalidnumber', 'memberitem', 'greaterthan', lastId));
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
        else if(method == ApiConstants.Method.GetInvoices) {
            outResponse["OptionsForSelectItem"] = "[]";

            //Fetch records for swap list
            var savedSearchSwap = [];
            lastId = 0; //reset the lastId to zero
            do {
                lastRecord = nlapiSearchRecord(null, ApiConstants.SavedSearch.SearchInvoices,
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
        else if(method == ApiConstants.Method.GetItemsOfBOM) {
            outResponse["OptionsForSelectItem"] = "[]";

            //Fetch records for items list
            var savedSearch = [];
            var lastId = 0;
            do {
                lastRecord = nlapiSearchRecord(null, ApiConstants.SavedSearch.SearchAllBOMs, new nlobjSearchFilter('internalidnumber', 'memberitem', 'greaterthan', lastId));
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
	catch(e) {
		outResponse["Status"] = ApiConstants.Status.Error;
        outResponse["DebugMessage"] = e.message;
        outResponse["FriendlyMessage"] = ApiConstants.ErrorMessage.UnexpectedError;
	}
	
	return JSON.stringify(outResponse);
}