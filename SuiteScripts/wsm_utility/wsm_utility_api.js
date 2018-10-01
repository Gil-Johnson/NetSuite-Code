/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 September 2014     Ubaid Baig
 *
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suite_api(request, response) {
    var outResponse = {};
    try {

        outResponse = processRequest(request, response);
    }
    catch (e) {
        outResponse.Result = WsmUtilityApiConstants.Response.Result.Error;
        outResponse.Message = e.name + ", " + e.message;
    }

    response.setContentType('JSON');
    response.write(JSON.stringify(outResponse));
}