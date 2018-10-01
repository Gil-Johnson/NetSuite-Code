/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       03 Sep 2014     mzohaib
 *
 */

//Move these constants to your common file (if any)
var Constant = {
    Config: {
        //false if you want to disable the logging
        EnableLogging: true
    },
    LogLevel: {
        Debug: "DEBUG",
        Error: "ERROR"
    },
    Response: {
        ApiVersion: "1.0",
        Status: {
            Ok: "OK",
            Error: "ERROR"
        },
        ErrorMessages: {
            InvalidRequest: "There seems to be some error on your request, please try again.",
            UnexpectedError: "We've encountered an unexpected error, please try again later.",
            TroubleLoadingRecords: "We are having trouble loading records, please try again later."
        }
    },
    Exception: {
        MethodNotFound: {
            name: "MethodNotFound",
            message: "The method you have specified is not found."
        }
    }
};

//Move these helping methods to your common file (if any)
var Helper = {
    /**
     * Logs the message
     * @param title => log title
     * @param detail => log detail
     * @param logLevel => log level
     */
    Log: function log(title, detail, logLevel) {
        if (!!Constant.Config.EnableLogging) {
            nlapiLogExecution(logLevel || Constant.LogLevel.Debug, title, detail || "");
        }
    },

    /**
     * Request object (nlobjRequest)
     */
    ObjRequest: null,

    /**
     * Get the parameter from nlobjRequest
     * @param name  => name of parameter to get
     * @returns {Value of @param name | null}
     */
    GetParameter: function (name) {
        return this.ObjRequest.getParameter(name) || null;
    }
};

// Returns a filter for any parameter 'id' from the list
function createFilter(id, list) {
    var returnarr = [];
    for (var keye in list) {
        returnarr[returnarr.length] = ([id, 'is', list[keye]]);

        returnarr[returnarr.length] = 'or';
    }
    returnarr.splice(returnarr.length - 1, 1);
    return returnarr;
}

/**
 *
 * @returns {{status: string, apiVersion: string, message: string}}
 */
function getMinimumQuantityForItems() {
    Helper.Log("loginRequest called");

    var items = Helper.GetParameter('items');
    items = JSON.parse(items);

    //Helper.Log("Items", items);
    /*
     jQuery.ajax({
     url: "/app/site/hosting/scriptlet.nl?script=101&deploy=1",
     type: "POST",
     data: {method: "getMinimumQuantityForItems", items: JSON.stringify(["BS76001"])}
     }).done(function(data) {
     console.log(data);
     data = JSON.parse(data);
     console.log(data);
     console.log(data.message);
     });
     */



    /*function fnsuccesscallback (data) {
        console.log(data);
    }

    jQuery.ajax({
        url: "/app/site/hosting/scriptlet.nl?script=101&deploy=1",
        type: "POST",
        data: {method: "getMinimumQuantityForItems", items: JSON.stringify(["BS76001"])},

        crossDomain: true,
        dataType: "jsonp",
        jsonpCallback: 'fnsuccesscallback'
    });*/
        /*.done(function(data) {
            console.log(data);
            data = JSON.parse(data);
            console.log(data);
            console.log(data.message);
        });*/




    var resultingArray = [];
    var itemid, minQty;

    try {
        var itemRecords = nlapiSearchRecord("assemblyitem", null,
            createFilter("itemid", items),
            [new nlobjSearchColumn("itemid"), new nlobjSearchColumn("minimumquantity")]);

        if (itemRecords) {
            for (var itemNum = 0, l = itemRecords.length; itemNum < l; itemNum++) {
                itemid = itemRecords[itemNum].getValue("itemid");
                minQty = itemRecords[itemNum].getValue("minimumquantity");

                resultingArray.push({"Item": itemid, "MinimumQuantity": minQty});
            }
        }

        return {
            status: Constant.Response.Status.Ok,
            apiVersion: Constant.Response.ApiVersion,
            message: JSON.stringify(resultingArray)
        };
    } catch (e) {
        Helper.log(e.name, e.message, Constant.LogLevel.Error);

        return {
            status: Constant.Response.Status.Error,
            apiVersion: Constant.Response.ApiVersion,
            message: Constant.Response.ErrorMessages.UnexpectedError
        };
    }
}

/**
 * POST requests handler
 * @param request => request object
 */
function handlePostRequest() {
    var method = Helper.GetParameter('method');
    Helper.Log("Inside handlePostRequest", "Method = " + method);
    //Default response (error) of POST request
    var response = {
        status: Constant.Response.Status.Error,
        apiVersion: Constant.Response.ApiVersion,
        message: Constant.Response.ErrorMessages.InvalidRequest
    };

    try {
        if (!!method) {
            if (typeof this[method] === "function") {
                return this[method]();	//To keep the method calls generic the request object is passed as it is
                //Any method can take their required parameter from it
            }

            //Throw method not found exception
            throw Constant.Exception.MethodNotFound;
        }
    } catch (exception) {
        //In case of exception send a generic error message to user
        response.message = Constant.Response.ErrorMessages.UnexpectedError;
        //And log the actual message using Netsuite's internal execution logging
        Helper.Log(exception.name, exception.message, Constant.LogLevel.Error);
    }

    return response;
}

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function updateTotalOnCart_sl_api(request, response) {
    try {
        if (request.getMethod() === 'GET') {

            //Keep request object for future use
            Helper.ObjRequest = request;

            //hand over the request to the POST handler
            response.write(JSON.stringify(handlePostRequest()));
            return;
        }

        //Write the response other than POST, could be an HTML page
        //response.write("<h1>This is a sample GET Response</h1>");

    }
    catch (exception) {
        Helper.Log(exception.name, exception.message, Constant.LogLevel.Error);
    }
}
