/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       08 Apr 2014     ubaig
 *
 * Committed to SVN.
 */


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function msoUserEventBeforeLoad(type, form, request) {
    var newId = nlapiGetRecordId();
    var newType = nlapiGetRecordType();

    var itemSubList = form.getSubList('item');

    //region From "Hide Department Column Field" userevent
    /*
    This is the code snippet we moved from "Hide Department Column Field" user event to here and now
    "Hide Department Column Field" UE has been disabled.
    */
    //itemSubList.getField('department').setDisplayType('hidden');
    var departmentField = itemSubList.getField('department');
    if(!!departmentField) {
        departmentField.setDisplayType('hidden');
    }

    // if execution context is 'user interface' then hide this field,
    // otherwise, this field value was not setting from csv import due to this hidden field code snippet
    if(nlapiGetContext().getExecutionContext() == 'userinterface') {
        //itemSubList.getField('commitinventory').setDisplayType('hidden');
        var commitinventoryField = itemSubList.getField('commitinventory');
        if(!!commitinventoryField) {
            commitinventoryField.setDisplayType('hidden');
        }
    }
    //endregion

    if (itemSubList) {
        itemSubList.addButton('custpage_add_multiple', 'Custom Add Multiple', 'customAddButtonClick();');
    }

    //nlapiLogExecution('DEBUG', '(Before Load Script) type:' + type + ', RecordType: ' + newType + ', Id:' + newId);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function msoUserEventBeforeSubmit(type) {
    /*
    This script below was only logging values, so commented as suggested by Netsuite Advisory for Sales orders
    user events performance increase. (Section 5.1.7., concern 1)
    */

    /*
    try{
        var loc1 = nlapiGetLineItemValue('item', 'location', 1);
        var loc2 = nlapiGetLineItemValue('item', 'location', 2);

        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location1', 'loc1=' + loc1);
        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location2', 'loc2=' + loc2);

        var soNewRecord = nlapiGetNewRecord();
        var soOldRecord = nlapiGetOldRecord();

        if(soNewRecord==null){
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soNewRecord', 'soNewRecord is null');
        }
        else{
            var loc1_new = soNewRecord.getLineItemValue('item', 'location', 1);
            var loc2_new = soNewRecord.getLineItemValue('item', 'location', 2);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_new', 'loc1_new=' + loc1_new);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_new', 'loc2_new=' + loc2_new);
        }

        if(soOldRecord==null){
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soOldRecord', 'soOldRecord is null');
        }
        else{
            var loc1_old = soOldRecord.getLineItemValue('item', 'location', 1);
            var loc2_old = soOldRecord.getLineItemValue('item', 'location', 2);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_old', 'loc1_old=' + loc1_old);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_old', 'loc2_old=' + loc2_old);
        }
    }
    catch(ex){
        nlapiLogExecution('ERROR', 'error in location logging', ex.message);
    }

    var newId = nlapiGetRecordId();
    var newType = nlapiGetRecordType();
    nlapiLogExecution('DEBUG', '(Before Submit Script) type:' + type + ', RecordType: ' + newType + ', Id:' + newId);
    */
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function msoUserEventAfterSubmit(type) {



    /*
     This script below was only logging values, so commented as suggested by Netsuite Advisory for Sales orders
     user events performance increase. (Section 5.1.7., concern 1)
     */

    /*
    try{
        var loc1 = nlapiGetLineItemValue('item', 'location', 1);
        var loc2 = nlapiGetLineItemValue('item', 'location', 2);

        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location1', 'loc1=' + loc1);
        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location2', 'loc2=' + loc2);

        var soNewRecord = nlapiGetNewRecord();
        var soOldRecord = nlapiGetOldRecord();

        if(soNewRecord==null){
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soNewRecord', 'soNewRecord is null');
        }
        else{
            var loc1_new = soNewRecord.getLineItemValue('item', 'location', 1);
            var loc2_new = soNewRecord.getLineItemValue('item', 'location', 2);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_new', 'loc1_new=' + loc1_new);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_new', 'loc2_new=' + loc2_new);
        }

        if(soOldRecord==null){
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soOldRecord', 'soOldRecord is null');
        }
        else{
            var loc1_old = soOldRecord.getLineItemValue('item', 'location', 1);
            var loc2_old = soOldRecord.getLineItemValue('item', 'location', 2);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_old', 'loc1_old=' + loc1_old);
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_old', 'loc2_old=' + loc2_old);
        }
    }
    catch(ex){
        nlapiLogExecution('ERROR', 'error in location logging', ex.message);
    }

    var newId = nlapiGetRecordId();
    var newType = nlapiGetRecordType();
    nlapiLogExecution('DEBUG', '(After Submit Script) type:' + type + ', RecordType: ' + newType + ', Id:' + newId);
    */

    //nlapiLogExecution('AUDIT', 'Invoice_Script_ue__type=' + type + '__AfterSubmit_EndTime=', getDateTime());
}

function getDateTime()
{
    try
    {
        var dt = new Date();
        var date = dt.getDate();
        var month = dt.getMonth()+1;
        var year = dt.getFullYear();
        var hrs = dt.getHours();
        var min = dt.getMinutes();
        var sec = dt.getSeconds();
        var datestring = month + '/' + date + '/' + year + ' ' + hrs + ':' + min + ':' + sec;
        return new Date(datestring);
    }
    catch(ex)
    {
        nlapiLogExecution('ERROR','error in func getDateTime',ex.toString());
    }
}