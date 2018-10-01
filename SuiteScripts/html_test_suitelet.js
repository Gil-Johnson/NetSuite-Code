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
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function main(request, response){
	try {

        var templatePage = '<!DOCTYPE html><html><head><meta http-equiv="X-UA-Compatible" content="IE=edge" /><title>Mass Create Work Order</title>    <style>*, html, body { height: 100%; width:100%; margin:0; padding:0; } html, body { overflow: hidden; }</style></head><body> <iframe style="border: 0; width: 100%; height: 100%" src="https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=85&deploy=1"></iframe></body></html>';

        response.write(templatePage );
	}
	catch(e) {
		response.write(e.name + ", "+ e.message);
		nlapiLogExecution("ERROR", e.name, e.message);
	}
}
