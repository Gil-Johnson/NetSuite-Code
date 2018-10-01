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
 * RicoPoRemQtyUserevent class that has the actual functionality of Userevent script.
 * All business logic will be encapsulated in this class.
 */
var RicoCaseUserevent = (function() {
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
        userEventBeforeLoad: function(type, form, request) {
            try {
                if(type == 'create' || type == 'edit') {

                    nlapiLogExecution('Debug', 'request.getParameter(transactionid)', request.getParameter('transactionid'));

                    if(!!request.getParameter('transactionid'))
                        nlapiSetFieldValue('custevent_transactionref',request.getParameter('transactionid'));
                }
            } catch(ex) {
                nlapiLogExecution('ERROR', 'error in func beforeLoad', ex.toString());
            }
        }
    };
})();


function RicoCaseUEBeforeLoad(type, form, request) {
    return RicoCaseUserevent.userEventBeforeLoad(type, form, request);
}