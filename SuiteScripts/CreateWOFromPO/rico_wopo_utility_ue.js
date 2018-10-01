/**
 * Created by zahmed on 17-Feb-15.
 * Description:
 * - Adding button in before load on purchase order for creating work orders.
 * - Update work orders if the respective line's receipt data is changed.
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var WOPOUtility = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        userEventBeforeLoad: function (type, form, request) {
            if (type.toString() === 'view') {
                var id = nlapiGetFieldValue('id');
                var btnClick = 'window.open(\'/app/site/hosting/scriptlet.nl?script=customscript_createwo_su&deploy=customdeploy_createwo_su&poid=' + id + '\');';
                form.addButton('custpage_btnCreateWO', 'Create WO', btnClick);
            }
        },
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
        userEventBeforeSubmit: function (type) {
            //TODO: Write Your code here
        },

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
        userEventAfterSubmit: function (type) {
            try {
                if (type.toString() === 'edit') {
                    var oldRec = nlapiGetOldRecord();
                    var newRec = nlapiGetNewRecord();

                    var totalLines = nlapiGetLineItemCount('item');

                    for (var oldLine = 1; oldLine <= totalLines; oldLine++) {

                        var lineId = oldRec.getLineItemValue('item', 'line', oldLine);
                        var newLine = newRec.findLineItemValue('item', 'line', lineId);

                        if (newLine > 0) {
                            var oldRecepiet = oldRec.getLineItemValue('item', 'expectedreceiptdate', oldLine);
                            var newReceipt = newRec.getLineItemValue('item', 'expectedreceiptdate', newLine);
                            var woIds = newRec.getLineItemValue('item', WOPOUtilityCommon.Transaction.Columns.WOIds, newLine);

                            if (oldRecepiet !== newReceipt) {
                                nlapiLogExecution('DEBUG', 'Line Id ' + lineId, 'oldRecepiet: ' + oldRecepiet + ' !== newReceipt: ' + newReceipt + ' woIds: ' + woIds);
                                if (!!woIds) {
                                    woIds = JSON.parse(woIds);

                                    for (var i in woIds) {
                                        try {
                                            
                                             var newDate = nlapiAddDays(nlapiStringToDate(newReceipt),7);
                                            var strDate = nlapiDateToString(newDate);
                                            nlapiSubmitField('workorder', woIds[i], 'enddate', strDate);
                                            nlapiLogExecution('DEBUG', 'New Receipt Date Updated', 'Work Order Internal Id: ' + woIds[i]);
                                        } catch (e) {
                                            nlapiLogExecution('ERROR', 'Error in Updating New Receipt Date', 'Work Order Internal Id: ' + woIds[i] + ' Error: ' + e.toString());
                                        }
                                    }
                                }
                            }
                        }

                    }
                }
            } catch (e) {
                nlapiLogExecution('DEBUG', 'WOPOUtility.userEventAfterSubmit', e.toString());
            }
        }
    };
})();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function WOPOUtilityUserEventBeforeLoad(type, form, request) {
    return WOPOUtility.userEventBeforeLoad(type, form, request);
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
function WOPOUtilityUserEventBeforeSubmit(type) {
    return WOPOUtility.userEventBeforeSubmit(type);
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
function WOPOUtilityUserEventAfterSubmit(type) {
    return WOPOUtility.userEventAfterSubmit(type);
}

/**
 * This class contains the constants used in the project
 */
var WOPOUtilityCommon = (function () {
    return {
        Transaction: {
            Columns: {
                WOIds: "custcol_wo_ids"
            }
        }
    };
})();