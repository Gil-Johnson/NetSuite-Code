/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       14 July 2014     Ubaid Baig
 *
 *
 * Dependencies
 * - fc_query_engine.js
 * - fc_query_generator.js
 * - fc_sf_result_format.js
 *
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 July 2014     Ubaid
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



/**
 * Suitelet main function
 * @param request
 * @param response
 */
function main(request, response) {
    try {
        var notice = '';

        getMethod(request, response, notice);
    } catch (e) {
        //Show error for now
        response.write("Error: " + e.name + ", " + e.message);
    }
}