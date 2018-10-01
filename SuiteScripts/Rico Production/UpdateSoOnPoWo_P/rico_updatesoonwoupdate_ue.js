/**
 * Created by smehmood on 9/30/2015.
 */

/**
 * RicoUpdateSOOnWOUserevent class that has the actual functionality of Userevent script.
 * All business logic will be encapsulated in this class.
 */
var RicoUpdateSOOnWOUserevent = (function () {
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
            var woRec;
            var createdFrom;
            var soRec;
            var createFromTxt;

            if (type == 'create' || type == 'edit' || type == 'delete') {

                if (type == 'create' || type == 'edit') {
                    woRec = nlapiLoadRecord('workorder', nlapiGetRecordId());
                } else if (type == 'delete') {
                    woRec = nlapiGetOldRecord();
                }

                createdFrom = woRec.getFieldValue('createdfrom');
                if (!!createdFrom) {
                    createFromTxt = woRec.getFieldText('createdfrom');
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
function UpdateSOOnWOUsereventUEAfterSubmit(type) {
    return RicoUpdateSOOnWOUserevent.userEventAfterSubmit(type);
}
