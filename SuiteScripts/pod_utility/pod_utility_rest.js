/**
 * REST API for email merge
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 April 2014     Ubaid
 *
 */

/**
 * API Version
 */
var version = "1.0",
currentRequestMethod = {};

/**
 * Constants
 */
var Constants = {};
Constants = {
	HttpMethod: {
		GET : "GET",
		POST : "POST"
	},
	Response: {
		Code: {
			Success: "Success",
			Warning: "Warning",
			Error: "Error",
			Unknown: "Unknown"
		},
		ErrorMessage: {
			
		}
	},
    FileCabinetInfo: {
        PdfFolderId: 283282 // 3588 on Sandbox
    }
};

/**
 * Sample request: https://rest.netsuite.com/app/site/hosting/restlet.nl?script=229&deploy=1&api_method=REST_CustomerResults&folderId=2
 * @param {Object} dataIn Parameter object (GET parameters)
 * @returns {Object} Output object
 */
function httpGet(dataIn) {
	currentRequestMethod = Constants.HttpMethod.GET;
	return processRequest(dataIn);
}


/**
 * Sample request: https://rest.netsuite.com/app/site/hosting/restlet.nl?script=229&deploy=1&api_method=REST_CustomerResults&folderId=2
 * @param {Object} dataIn Parameter object (POST parameters)
 * @returns {Object} Output object
 */
function httpPost(dataIn) {
	currentRequestMethod = Constants.HttpMethod.POST;
	return processRequest(dataIn);
}

function processRequest(dataIn) {
	var response = {};
	try {
		if (!!dataIn && !!dataIn["api_method"]) {
			if(typeof this[dataIn["api_method"]] == "function")
				response = this[dataIn["api_method"]](dataIn);	//To keep the method calls generic the dataIn object is passed as it is
																//Any method can take their required parameter from it
			else {
				//No relevant function found
				response = {
					code: Constants.Response.Code.Error,
					error_message: "Unknown api_method called"
				};
			}
		}
		else {
			//api_method not defined
			response = {
				code: Constants.Response.Code.Error,
				error_message: "api_method not defined"
			};
		}
	} catch (e) {
		response =  {
			"code" : Constants.Response.Code.Error,
			"error_message" : e.message
		};
	}
	
	return {
		"api_version" : version,
		"code" : !!response["code"] ? response["code"] : Constants.Response.Code.Unknown,
		"error_message" : response["error_message"],
		"response" : response["response"]
	};
}

/**
 * Fetch customers in folder
 * Method: GET
 * @param {Object} dataIn folderId
 * @returns {Object} Customers data
 */
function printRecord(dataIn) {
	var response = {};
	var errorMessage = "";
	var code = "";
	
	//Throw error if this is not GET request
	if(currentRequestMethod != Constants.HttpMethod.GET)
		throw ({name: "Invalid Request", message: "This endpoint only accept GET request"});
	
	//Check if we got required parameters
	if(!!dataIn && !dataIn["internalid"])
		throw ({name: "Missing required parameters", message: "Required Parameters are missing"});

	try {
        var recordInternalId = dataIn["internalid"];

        nlapiLogExecution("ERROR", "internalid", recordInternalId);

        var file = nlapiPrintRecord('TRANSACTION', recordInternalId, 'PDF', null);

        nlapiLogExecution("ERROR", "got file", file);
        file.setIsOnline(true);

        file.setFolder(Constants.FileCabinetInfo.PdfFolderId);
        nlapiLogExecution("ERROR", "submitting file", '');
        var id = nlapiSubmitFile(file);

        nlapiLogExecution("ERROR", "submitted", '');
        file = nlapiLoadFile(id);

        nlapiLogExecution("ERROR", "file loaded", '');
        nlapiLogExecution("ERROR", "set online done, url = ", file.getURL());

        response["url"] = file.getURL();
	}
	catch(e) {
		//Some error occurred
		code = Constants.Response.Code.Error;
		errorMessage = "An unexpected error has occured";
		nlapiLogExecution("ERROR", e.name, e.message);
	}
	
	//Return the final object
	return {
		"code" : code,
		"error_message" : errorMessage,
		"response": response
	};
}

function isNullOrEmpty(str) {
	return str == null || str == undefined || typeof (str) == 'undefined' || str == 'null' || str == 'undefined' || (str + '').trim().length == 0;
}