/**
 * Created by sameer on 9/28/15.
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
 * This User event scripts adds Helper Client Script on WO page in view mode.
 */
var WOHighlightingUE = (function () {
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
            //TODO: Write Your code here
                nlapiLogExecution('DEBUG', 'TYPE', type);
                form.setScript('customscript_wo_highlighting_helper');
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
function WOHighlightingUEUserEventBeforeLoad(type, form, request) {
    return WOHighlightingUE.userEventBeforeLoad(type, form, request);
}
