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
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
    try {
        customLogger('DEBUG', 'Assign Primary Bin Starting', '');
        var ctx = nlapiGetContext();
        var records = getRecords();

        startTime = (new Date()).getTime();

        if (records !== null && records.length > 0) {
            processRecords(records); //markRecords is called from within
        } else {
            customLogger('DEBUG', 'Assign Primary Bin No records found to process', '');
        }

        customLogger('DEBUG', 'Assign Primary Bin Ends', '');
    }
    catch (e) {
        customLogger('ERROR', 'Error during Assign Primary Bin Script working', e.toString());
    }
}
