/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 September 2014     Ubaid Baig
 *
 */

var WotpUtilityApiConstants = WotpUtilityApiConstants || {};

WotpUtilityApiConstants = {
    Response: {
        ApiVersion: "1.04",
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
 * Fetches data based on parameter
 * @param request
 * @returns {{records: Array, savedSearchSwap: Array}}
 */
function fetchDataOld(request) {
    var context = nlapiGetContext();
    var loc = request.getParameter("location");
    var customer = request.getParameter("customer");
    var queueItems = request.getParameter("queueItems");
    var status = request.getParameter("status");

    var fromDate = request.getParameter("fromDate");
    var toDate = request.getParameter("toDate");

    var data = {};

    data.Rows = [];
    data.Columns = [];
    data.Title = "Google Charts API";
    data.Width = 400;
    data.Height = 500;


    data.Rows = [
        ['Mushrooms', 3],
        ['Onions', 1],
        ['Olives', 1],
        ['Zucchini', 1],
        ['Pepperoni', 2]
    ];

    data.Columns.push({type: 'string', value: 'Topping'});
    data.Columns.push({type: 'number', value: 'Slices'});

    return data;
}

function fetchData(request) {
    var context = nlapiGetContext();
    var loc = request.getParameter("location");
    var customer = request.getParameter("customer");
    var queueItems = request.getParameter("queueItems");
    var status = request.getParameter("status");

    var fromDate = request.getParameter("fromDate");
    var toDate = request.getParameter("toDate");

    var data = {};

    data.Rows = [];
    data.Columns = [];
    data.Title = "Google Charts API";
    data.Width = 400;
    data.Height = 500;


    data.Rows = [];

    var searchResult = nlapiSearchRecord(null, WotpUtilityCommon.SavedSearches.MainProductSearch, null, null);
    var colTypes = {};
    colTypes[0] = 'string';
    colTypes[1] = 'number';

    if (!!searchResult) {
        var cols = searchResult[0].getAllColumns();
        for (var i = 0; i < cols.length; i++) {
            var column = cols[i];
            data.Columns.push({type: colTypes[i], value: column.name});
        }

        for (var j = 0; j < 5; j++) {
            var result = searchResult[j];

            var colArray = [];
            for (var c = 0; c < cols.length; c++) {
                var colObject = cols[c];
                if (c === 0) {
                    colArray.push(result.getValue(colObject.name));
                } else {
                    colArray.push(Math.abs(result.getValue(colObject.name)));
                }

            }
            data.Rows.push(colArray);
        }
    }

    return data;
}

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suite_api(request, response) {
    var outResponse = {};
    try {

        outResponse.Result = WotpUtilityApiConstants.Response.Result.Ok;
        outResponse.Version = WotpUtilityApiConstants.Response.ApiVersion;
        var method = request.getParameter("method");

        if (method === 'fetchData') {
            var fetchDataResult = fetchData(request);

            outResponse.Data = fetchDataResult;
        }

    }
    catch (e) {
        outResponse.Result = WotpUtilityApiConstants.Response.Result.Error;
        outResponse.Message = e.name + ", " + e.message;
    }

    response.write(JSON.stringify(outResponse));
}
