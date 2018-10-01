/**
 * Created by zahmed on 09-Jun-15.
 * This is a generalized script deployed on fulfillment.
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * - Scripts:
 *   - f3_utilit_methods.js
 * - Fields:
 *   - custbody_to_be_split - checkbox - normal/hidden
 *   - custbody_message - free-from-text - inline - on top of the main fields
 * -
 */

/**
 * ItemFulfillment class that has the actual functionality of userevent script.
 * All business logic will be encapsulated in this class.
 */
var ItemFulfillment = (function () {
    return {
        /**
         * Stop creating fulfillent if the order is not splitted
         * @param type
         */
        stopCreatingFulfillment: function (type) {
            if (type.toString() === 'create') {
                var toBeSplit = nlapiGetFieldValue(COMMON.TO_BE_SPLIT) + '';
                if (toBeSplit.toString() === 'T') {
                    // throw custom exception to terminate the execution of script
                    Utility.throwError('DEV_ERR', 'Order can not be fulfilled because it needs to be split before making fulfillment', true);
                }
            }
        },
        /**
         * Show the message in custom message field on top of main fields in red color if fulfillment can not be created
         * @param {string} type
         */
        showMessage: function (type) {
            if (type.toString() === 'create') {
                var toBeSplit = nlapiGetFieldValue(COMMON.TO_BE_SPLIT) + '';
                if (toBeSplit.toString() === 'T') {
                    var msg = '<p style="color: red">Order can not be fulfilled because it needs to be split before making fulfillment</p>';
                    nlapiSetFieldValue(COMMON.MESSAGE, msg);
                }
            }
        },
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
            this.showMessage(type);
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
            this.stopCreatingFulfillment(type);
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
            //TODO: Write Your code here
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
function ItemFulfillmentUserEventBeforeLoad(type, form, request) {
    return ItemFulfillment.userEventBeforeLoad(type, form, request);
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
function ItemFulfillmentUserEventBeforeSubmit(type) {
    return ItemFulfillment.userEventBeforeSubmit(type);
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
function ItemFulfillmentUserEventAfterSubmit(type) {
    return ItemFulfillment.userEventAfterSubmit(type);
}
