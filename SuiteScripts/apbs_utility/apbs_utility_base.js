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


/*
Global variables to reschedule script based on time limit.
* */
var startTime;
var minutesAfterReschedule = 50;

/**
 * Get request method
 * @param request
 * @param response
 * @param notice
 */
function getMethod(request, response, notice) {
    try {

        var form, // NetSuite Form
          html; // inline html type field to display custom html

        form = nlapiCreateForm('Assign Primary Bin Scheduled Script');
        html = form.addField('inlinehtml', 'inlinehtml', '');

        scheduled();

        response.writePage(form);
    } catch (e) {
        nlapiLogExecution('DEBUG', 'value of e', e.toString());
        throw e;
    }
}


/**
 * Gets record from DAO
 * @returns {*}
 */
function getRecords() {

    //HACK: TODO: Need to remove this hard coded id
    var filter = null;
    var records = nlapiSearchRecord(null, APBSUtilityCommon.SavedSearches.PrimaryBins, filter, null);

    return records;
}


/**
 * Reschedules only there is any need
 * @param context Context Object
 * @returns {boolean} true if rescheduling was necessary and done, false otherwise
 */
function rescheduleIfNeeded(context) {

    var usageRemaining = context.getRemainingUsage();

    try {

        if (usageRemaining < 4500) {
            rescheduleScript(context);
            return true;
        }

        var endTime = (new Date()).getTime();

        var minutes = Math.round(((endTime - startTime) / (1000 * 60)) * 100) / 100;
        nlapiLogExecution('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + startTime);
        // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

        if (minutes > minutesAfterReschedule) {
            rescheduleScript(context);
            return true;
        }

    }
    catch (e) {
        nlapiLogExecution('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining);
    }
    return false;
}

/**
 * sends records to Salesforce using its API
 */
function processRecords(records) {
    var context = nlapiGetContext();

    customLogger('DEBUG', 'inside processRecords', 'processRecords');

    //HACK: Need to remove this
    var count = records.length;

    nlapiLogExecution('DEBUG', 'value of count', count);

    for (var i = 0; i < count; i++) {

        var shouldRun = runOrNot();

        if (shouldRun === false) {
            return false;
        }

        var currentRecord = records[i];
        var primaryBin = currentRecord.getValue('custitem_primarybin');

        markRecords(currentRecord, primaryBin);

        var hasScheduled = false; //rescheduleIfNeeded(context);
        if (hasScheduled === true) {
            break;
        }
    }
}

/**
 * Marks record as completed
 */
function markRecords(currentRecord, primaryBin) {

    try {
        nlapiLogExecution('DEBUG', 'value in markRecords = ', currentRecord.getValue(currentRecord.getAllColumns()[5]) + '#' + currentRecord.getText(currentRecord.getAllColumns()[5]) + '#'  + primaryBin);

        var substituteInternalType = APBSUtilityCommon.getItemInternalType(currentRecord.getValue(currentRecord.getAllColumns()[6]));
        nlapiLogExecution('DEBUG', 'substitute_internal_type', substituteInternalType);

        //set the item status value
        nlapiSubmitField(substituteInternalType, currentRecord.getText(currentRecord.getAllColumns()[5]), 'custitem_primarybin', primaryBin);
    } catch (e) {
        customLogger('ERROR', 'Error during markRecords', e.toString());
    }
}




/**
 * Custom Logging method
 * @param data1
 * @param data2
 * @param data3
 */
function customLogger(data1, data2, data3) {
    if (!window.console) {
        nlapiLogExecution(data1, data2, data3);
    } else {
        console.log(data1 + ' ' + data2 + ' ' + data3);
    }
}

/**
 * Call this method to reschedule current schedule script
 * @param ctx nlobjContext Object
 */
function rescheduleScript(ctx) {
    var status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), []);
    customLogger('DEBUG', 'Item Image Sync: Rescheduling..', 'status =' + status);
}

/**
 * Description of method runOrNot
 * @param parameter
 */
function runOrNot() {
    try {
        var ctx = nlapiGetContext();

        var shouldRun = ctx.getSetting('SCRIPT', 'custscript_apbs_utility_sch_state');

        nlapiLogExecution('DEBUG', 'value of runOrNot', shouldRun);
        if (shouldRun == 0) {
            nlapiLogExecution('DEBUG', 'value of Stopping due to external value', '');
            return false;
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main runOrNot', e.toString());
    }

    return true;
}

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Object}
 */
function scheduled(type) {
    try {
        customLogger('DEBUG', 'Assign Primary Bin Starting', '');
        var ctx = nlapiGetContext();

        var shouldRun = runOrNot();

        if (shouldRun === false) {
            return false;
        }

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
