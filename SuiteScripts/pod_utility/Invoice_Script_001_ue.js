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
function userEventBeforeLoad(type, form, request) {
    var newId = nlapiGetRecordId();
    var newType = nlapiGetRecordType();

    var itemSubList = form.getSubList('item');

    var script = '';

    script = 'customAddButtonClick();';

    var btnAddMultiple = itemSubList.addButton('custpage_add_multiple', 'Custom Add Multiple', script);

    //This will disable button from server side.
    //btnAddMultiple.setDisabled(true);

    nlapiLogExecution('DEBUG', '(Before Load Script) type:' + type + ', RecordType: ' + newType + ', Id:' + newId);
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
function userEventBeforeSubmit(type) {
    var newId = nlapiGetRecordId();
    var newType = nlapiGetRecordType();
    nlapiLogExecution('DEBUG', '(Before Submit Script) type:' + type + ', RecordType: ' + newType + ', Id:' + newId);
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
function userEventAfterSubmit(type) {

    var newId = nlapiGetRecordId();
    var newType = nlapiGetRecordType();
    nlapiLogExecution('DEBUG', '(After Submit Script) type:' + type + ', RecordType: ' + newType + ', Id:' + newId);
}
