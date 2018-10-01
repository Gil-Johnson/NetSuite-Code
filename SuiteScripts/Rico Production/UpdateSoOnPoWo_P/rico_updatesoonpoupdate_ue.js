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
 * RicoUpdateSOOnPOUserevent class that has the actual functionality of Userevent script.
 * All business logic will be encapsulated in this class.
 */
var RicoUpdateSOOnPOUserevent = (function () {
    return {
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
            var poRec;
            var createdFrom;
            var soRec;
            var createFromTxt;

            if (type == 'create' || type == 'edit' || type == 'delete') {
                if (type == 'create' || type == 'edit') {
                    poRec = nlapiLoadRecord('purchaseorder', nlapiGetRecordId());
                } else if (type == 'delete') {
                    poRec = nlapiGetOldRecord();
                }

                createdFrom = poRec.getFieldValue('createdfrom');
                if (!!createdFrom) {
                    createFromTxt = poRec.getFieldText('createdfrom');
                    nlapiLogExecution('debug', 'createdFrom', createdFrom);
                    nlapiLogExecution('debug', 'createFromTxt', createFromTxt);

                    if (createFromTxt.indexOf('Sales Order') > -1) {
                        RicoSalesOrderDao.updateSOSpecialOrderFields(createdFrom);
                        if (type == 'delete')
                        nlapiSetRedirectURL( 'RECORD', 'salesorder', createdFrom, false );
                    }
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
function UpdateSOOnPOUsereventUEAfterSubmit(type) {
    return RicoUpdateSOOnPOUserevent.userEventAfterSubmit(type);
}
