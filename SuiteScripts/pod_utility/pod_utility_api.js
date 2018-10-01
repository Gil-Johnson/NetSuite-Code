/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       17 April 2014     Ubaid Baig
 *
 */

var POD_API_Constants = POD_API_Constants || {};

POD_API_Constants = {
    Netsuite: {
        SavedSearch: {
            WebImageDownloadUtility: "customsearch368",
            CustomLeagueSearch: "customsearch355",
            CustomTeamSearch: "customsearch359",
            SearchInvoices: "customsearch_pod_invoice_tracking_search"
        },
        ItemField: {
            internalId: "internalid",
            Customer: "entity",
            Location: "location",
            Status: "status",
            TranId: "number"
        }
    },
    Tracking: {
        Url: 'https://onlinetools.ups.com/webservices/Track'
    },
    Response: {
        api_version: "1.04",
        Result: {
            Ok: "OK",
            Error: "ERROR"
        }
    }
};

/**
 *
 * @param arrItem
 * @returns {Array}
 */
function createFilter(arrItem) {

    var filter = [];
    for ( key in arrItem) {
        filter [filter.length] = (['number','equalto',arrItem[key]]);
        filter [filter.length] = 'or';
    }
    filter.splice(filter.length-1,1);
    return filter ;

}

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suite_api(request, response) {
    var outResponse = {};
    try {

        outResponse["Result"] = POD_API_Constants.Response.Result.Ok;
        outResponse["Version"] = POD_API_Constants.Response.api_version;
        var method = request.getParameter("method");

        if (method == 'searchInvoices') {
            var context = nlapiGetContext();
            var loc = request.getParameter("location");
            var customer = request.getParameter("customer");
            var queueItems = request.getParameter("queueItems");
            var status = request.getParameter("status");

            var fromDate = request.getParameter("fromDate");
            var toDate = request.getParameter("toDate");

            var invoicesNumbers = request.getParameter("invoices");

            nlapiLogExecution('DEBUG', 'invoiceNumbers = ' + invoicesNumbers);

            var filtersValues = {
                location: !!loc && loc != 'null' ?  loc : null,
                customer: !!customer && customer != 'null' ? customer  : null,
                status: !!status && status  != 'null' ? status  : null,

                fromDate: !!fromDate && fromDate != 'null' ? fromDate : null,
                toDate: !!toDate && toDate != 'null' ? toDate : null,

                invoiceNumbers: !!invoicesNumbers && invoicesNumbers != 'null' ? JSON.parse(decodeURIComponent(invoicesNumbers)) : null
            };
            var filters = [];

            var filterExpression = [];
//                [
//                    [ 'trandate', 'onOrAfter', 'daysAgo90' ],
//                    'and',
//                    [ 'projectedamount', 'between', 1000, 100000 ],
//                    'and',
//                    [ 'customer.salesrep', 'anyOf', -5 ]
//                ];

            if (!!filtersValues.location){
                filterExpression.push([POD_API_Constants.Netsuite.ItemField.Location, 'is', filtersValues.location]);
                //filters.push(new nlobjSearchFilter(POD_API_Constants.Netsuite.ItemField.Location, null, 'is', filtersValues.location));
            }


            if (!!filtersValues.customer) {

                if (filterExpression.length > 0) {
                    filterExpression.push('and');
                }
                filterExpression.push([POD_API_Constants.Netsuite.ItemField.Customer, 'is', filtersValues.customer]);

//                filters.push(new nlobjSearchFilter(POD_API_Constants.Netsuite.ItemField.Customer, null, 'is', filtersValues.customer));
            }

            if (!!filtersValues.status) {

                switch(filtersValues.status){
                    case "0":

                        nlapiLogExecution('DEBUG', 'case 0');

                        if (filterExpression.length > 0) {
                            filterExpression.push('and');
                        }
                        filterExpression.push([POD_API_Constants.Netsuite.ItemField.Status, 'is', 'CustInvc:A']);
                        //filters.push(new nlobjSearchFilter(POD_API_Constants.Netsuite.ItemField.Status, null, 'is', 'CustInvc:A'));
                        break;

                    case "1":

                        nlapiLogExecution('DEBUG', 'case 1');

                        if (filterExpression.length > 0) {
                            filterExpression.push('and');
                        }
                        filterExpression.push([POD_API_Constants.Netsuite.ItemField.Status, 'is', 'CustInvc:B']);
                        //filters.push(new nlobjSearchFilter(POD_API_Constants.Netsuite.ItemField.Status, null, 'is', 'CustInvc:B'));
                        break;
                }

            }

            //if both are supplied
            if (!!filtersValues.fromDate && !!filtersValues.toDate) {
                if (filterExpression.length > 0) {
                    filterExpression.push('and');
                }
                filterExpression.push(['duedate', 'within', [filtersValues.fromDate, filtersValues.toDate]]);

                //filters.push(new nlobjSearchFilter('duedate', null, 'within', [filtersValues.fromDate, filtersValues.toDate]));
                //filters.push(new nlobjSearchFilter('duedate', null, 'onorbefore', filtersValues.toDate));
            }
            else {

                if (!!filtersValues.fromDate) {
                    if (filterExpression.length > 0) {
                        filterExpression.push('and');
                    }
                    filterExpression.push(['duedate', 'onorafter', filtersValues.fromDate]);

                    //filters.push(new nlobjSearchFilter('duedate', null, 'onorafter', filtersValues.fromDate));
                }

                if (!!filtersValues.toDate) {
                    if (filterExpression.length > 0) {
                        filterExpression.push('and');
                    }
                    filterExpression.push(['duedate', 'onorbefore', filtersValues.toDate]);
//                    filters.push(new nlobjSearchFilter('duedate', null, 'onorbefore', filtersValues.toDate));
                }
            }

            if(!!filtersValues.invoiceNumbers){
                nlapiLogExecution('DEBUG', 'filtersValues.invoiceNumbers = ' + filtersValues.invoiceNumbers);
                if (filterExpression.length > 0) {
                    filterExpression.push('and');
                }

                var invoice_Filter = createFilter(filtersValues.invoiceNumbers);
                nlapiLogExecution('DEBUG', 'invoice_Filter = ' + invoice_Filter);
                filterExpression.push(invoice_Filter);


                //filters.push(new nlobjSearchFilter(POD_API_Constants.Netsuite.ItemField.TranId, null, 'anyof', filtersValues.invoiceNumbers));
            }

            var columns = new Array();
            columns[0] = new nlobjSearchColumn('trandate');
            columns[1] = new nlobjSearchColumn('duedate');
            columns[2] = new nlobjSearchColumn('tranid');
            columns[3] = new nlobjSearchColumn('total');
            columns[4] = new nlobjSearchColumn('location');
            columns[5] = new nlobjSearchColumn('trackingnumbers');



            var lastId = 0;
            var records = [];
            var internalIdFilterIndex = filterExpression.length;// filters.length;

            //Fetch records for swap list
            var savedSearchSwap = [];

            var internalIdFilterAdded = false;
            //endorsed by ZAS

            //set this here for getting more than 1000 record
            do {

                //set the last filter to this.
                var lastRecord = nlapiSearchRecord(null, POD_API_Constants.Netsuite.SavedSearch.SearchInvoices, filterExpression, columns);
                if (lastRecord != null) {
                    lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record
                    savedSearchSwap = savedSearchSwap.concat(lastRecord);
                }
                if (internalIdFilterAdded == false){
                    filterExpression[internalIdFilterIndex] = 'and';
                    internalIdFilterIndex = filterExpression.length;
                    internalIdFilterAdded = true;
                }
                filterExpression[internalIdFilterIndex] = ['internalidnumber', 'greaterthan', lastId] ;// new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId);
            }
            while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

            if (!!savedSearchSwap) {
                var version = null;
                savedSearchSwap.forEach(function (searchRecord) {
                    if(!!searchRecord.getValue('trandate') && searchRecord.getValue('trandate').indexOf("/") > 0)
                        version = "1" + searchRecord.getValue('trandate').split("/")[2];

                    records.push({
                        "internalid": searchRecord.getId(),
                        "trandate": searchRecord.getValue('trandate'),
                        "duedate": searchRecord.getValue('duedate'),
                        "tranid": searchRecord.getValue('tranid'),
                        "account": searchRecord.getText('account'),
                        "total": searchRecord.getValue('total'),
                        "location": searchRecord.getText("location"),
                        "locationId": searchRecord.getValue("location"),
                        "version": version,
                        "trackingnumbers" : searchRecord.getValue('trackingnumbers')
                    });
                });
            }

//            //Sort array by trandate
//            records.sort(function (a, b) {
//                var obj1 = a.trandate;
//                var obj2 = b.trandate;
//                return (obj1 < obj2) ? -1 : (obj1 > obj2) ? 1 : 0;
//            });

            outResponse["TotalRecordCount"] = !!savedSearchSwap ? savedSearchSwap.length : 0;
            outResponse["Records"] = records;
        }
        else if (method == 'printItems') {
            var context = nlapiGetContext();
            var params = request.getAllParameters();

            var inputData = JSON.parse(request.getBody());
            nlapiLogExecution('DEBUG', 'body : '+ inputData);

            //TODO: need to process inputData here.

            var soapHeader = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://www.ups.com/XMLSchema/XOLTWS/UPSS/v1.0" xmlns:v2="http://www.ups.com/XMLSchema/XOLTWS/Track/v2.0" xmlns:v11="http://www.ups.com/XMLSchema/XOLTWS/Common/v1.0">' +
                '<soapenv:Header>' +
                '<v1:UPSSecurity>' +
                '<v1:UsernameToken>' +
                '<v1:Username>RICOTEAM1</v1:Username>' +
                '<v1:Password>SCREWUP1</v1:Password>' +
                '</v1:UsernameToken>' +
                '<v1:ServiceAccessToken>' +
                '<v1:AccessLicenseNumber>6CD029995615A626</v1:AccessLicenseNumber>' +
                '</v1:ServiceAccessToken>' +
                '</v1:UPSSecurity>' +
                '</soapenv:Header>';

            var soapBody =
                '<soapenv:Body>' +
                '<v2:TrackRequest>' +
                '<v11:Request>' +
                '<v11:RequestOption>15</v11:RequestOption>' +
                '</v11:Request>' +
                '<v2:InquiryNumber>1Z6130210321244672</v2:InquiryNumber>' +
                '</v2:TrackRequest>' +
                '</soapenv:Body>' +
                '</soapenv:Envelope>';

            var finalRequest = soapHeader + soapBody;

            nlapiLogExecution('DEBUG', 'making req to' + POD_API_Constants.Tracking.Url);
            var trackingResponse = nlapiRequestURL(POD_API_Constants.Tracking.Url,  finalRequest, null, 'POST');

            nlapiLogExecution('DEBUG', 'getting body');
            var body = trackingResponse.getBody();

            var bodyLength = body.length;
            nlapiLogExecution('DEBUG', 'response from web service:' , body);
            nlapiLogExecution('DEBUG', 'body length ', bodyLength);

            var bodyXml = nlapiStringToXML(body);


            outResponse["param"] = params;
        }
        else if (method == 'printRecord') {
            var context = nlapiGetContext();

            var recordInternalId = request.getParameter("internalid");

            var file = nlapiPrintRecord('TRANSACTION', recordInternalId, 'PDF', null);
            file.setIsOnline(true);

            response.setContentType(file.getType());
            response.write(file.getValue());
            return;
        }
    }
    catch (e) {
        outResponse["Result"] = POD_API_Constants.Response.Result.Error;
        outResponse["Message"] = e.name + ", " + e.message;
    }

    response.write(JSON.stringify(outResponse));
}
