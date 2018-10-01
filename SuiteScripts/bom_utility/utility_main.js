/**
 * Module Description
 * A quick way to remove or swap certain item from an assembly BOM, while preserving the other items on the BOM
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Mar 2014     hakhtar
 *
 */

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
		
		//Create new form
		var form = nlapiCreateForm("Change BOM Utility", false);
		form.setScript("customscript_bom_utility_cs");
		
		//Load template page 
		var templatePage = nlapiLoadFile(258808);
		form.addField("custpage_page_template", "inlinehtml").setDefaultValue(templatePage.getValue());
		
		//Write form on page
		response.writePage(form);
	}
	catch(e) {
		response.write(e.name + ", "+ e.message);
		nlapiLogExecution("ERROR", e.name, e.message);
	}
}

/**
 * Constants used in API
 */
var ApiConstants = {
    ApiVersion: "1.0",
    Method: {
        GetAllItems: "getAllItems",
        GetItemsOfBOM: "getItemsOfBOM"
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
        SearchAllBOMs: "customsearch_search_all_bom",
        SearchAllActiveItems: "customsearch_all_active_items"
    }
};

/**
 * Handler for POST requests
 * @param request
 * @param response
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
        else if(method == ApiConstants.Method.GetAllItems) {
            outResponse["OptionsForSelectItem"] = "[]";

            //Fetch records for swap list
            var savedSearchSwap = [];
            lastId = 0; //reset the lastId to zero
            do {
                lastRecord = nlapiSearchRecord(null, ApiConstants.SavedSearch.SearchAllActiveItems, new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId));
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
	}
	catch(e) {
		outResponse["Status"] = ApiConstants.Status.Error;
        outResponse["DebugMessage"] = e.message;
        outResponse["FriendlyMessage"] = ApiConstants.ErrorMessage.UnexpectedError;
	}
	
	return JSON.stringify(outResponse);
}