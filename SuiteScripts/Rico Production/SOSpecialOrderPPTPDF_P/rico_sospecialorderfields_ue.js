/**
 * Created by smehmood on 9/30/2015.
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
 * RicoSoSpecialOrderUserevent class that has the actual functionality of User Event
 * All business logic will be encapsulated in this class.
 */
var RicoSoSpecialOrderUserevent = (function () {
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
            try {
                var sublist = form.getSubList('item');
                // if execution context is 'user interface' then hide this field,
                // otherwise, this field value was not setting from csv import due to this hidden field code snippet
                if (nlapiGetContext().getExecutionContext() == 'userinterface') {
               //     sublist.getField('custcol_linkedpo').setDisplayType('hidden');
                   sublist.getField('custcol_linkedwo').setDisplayType('hidden');
                }
            }
            catch (ex) {
                nlapiLogExecution('ERROR', 'error in func beforeLoad', ex.toString());
            }
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
            nlapiLogExecution('debug', 'set so special fields ue started');

            if (type == 'create' || type == 'edit') {
                var soRec = nlapiLoadRecord('salesorder', nlapiGetRecordId());
                var count = soRec.getLineItemCount('item');
                var createdpo;
                var createdwo;

                nlapiLogExecution('debug', 'set so specialorder fields ue called', count);
                for (var i = 1; i <= count; i++) {

                    createdpo = soRec.getLineItemValue('item', 'createdpo', i);
                    createdwo = soRec.getLineItemValue('item', 'woid', i);
                    nlapiLogExecution('debug', 'createdpo', createdpo);
                    nlapiLogExecution('debug', 'createdwo', createdwo);

                    if (!createdpo)
                        createdpo = '';
                    else
                        createdpo = nlapiLookupField('purchaseorder', createdpo, 'transactionnumber');

                    if (!createdwo)
                        createdwo = '';
                    else
                        createdwo = nlapiLookupField('workorder', createdwo, 'transactionnumber');

                    try {
                    	
                    //    soRec.setLineItemValue('item', 'custcol_linkedpo', i, createdpo);
                        soRec.setLineItemValue('item', 'custcol_linkedwo', i, createdwo + createdpo );
                        
                    } catch (ex) {
                        nlapiLogExecution('debug', 'Error in setting custcol_linkedpo/custcol_linkedwo ', ex.toString());
                    }
                }

                try {
                    nlapiSubmitRecord(soRec);
                } catch (ex) {
                    nlapiLogExecution('debug', 'Error in submitting record', ex.toString());
                }
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
function RicoSoSpecialOrderUEAfterSubmit(type) {
	
    return RicoSoSpecialOrderUserevent.userEventAfterSubmit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function RicoSoSpecialOrderUEBeforeLoad(type, form, request) {
	
    return RicoSoSpecialOrderUserevent.userEventBeforeLoad(type, form, request);
}