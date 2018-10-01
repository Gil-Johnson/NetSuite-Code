/**
 * Created by wahajahmed on 9/22/2015.
 * TODO:
 * -
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
var CID_Item_UserEventHelper = (function () {
    return {
        /**
         * Config data attributes
         */
        configData : {
            SupportedRecordTypes : ['assemblyitem', 'kititem', 'inventoryitem']
            , SuiteletUrl: '/app/common/custom/custrecordentry.nl?rectype=23'
            //, SuiteletUrl: 'https://www.google.com.pk'
            , NewCustomerDetailButton: {
                name: 'custpage_f3_new_customer_detail_button',
                label: 'New Customer Detail'
            }
        },

        /**
         * Add "New Customer Details" button
         * @param type
         * @param form
         * @param request
         */
        addNewCustomerDetailsButton : function(type, form, request) {
            if (type.toString() === 'view') {
                var recordType = nlapiGetRecordType();
                if(this.configData.SupportedRecordTypes.indexOf(recordType) > -1) {
                    var url = this.configData.SuiteletUrl;
                    url += url.indexOf('?') === -1 ? '?' : '&';
                    url += 'itemid=' + nlapiGetRecordId();
                    url += '&itemtype=' + recordType;
                    var script = '';
                    script += "window.open('" + url + "', '_blank', 'toolbar=yes, scrollbars=yes, resizable=yes, top=10, left=200, width=800, height=600');";
                    form.addButton(this.configData.NewCustomerDetailButton.name, this.configData.NewCustomerDetailButton.label, script);
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
            this.addNewCustomerDetailsButton(type, form, request);
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
function CIDItemUserEventBeforeLoad(type, form, request) {
    return CID_Item_UserEventHelper.userEventBeforeLoad(type, form, request);
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
function CIDItemUserEventBeforeSubmit(type) {
    return CID_Item_UserEventHelper.userEventBeforeSubmit(type);
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
function CIDItemUserEventAfterSubmit(type) {
    return CID_Item_UserEventHelper.userEventAfterSubmit(type);
}
