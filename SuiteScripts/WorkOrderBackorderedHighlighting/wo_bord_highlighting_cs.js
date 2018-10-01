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
 * WorkOrderHighlighting class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 *
 */
var WorkOrderHighlighting = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function (type) {
            /**
             * Appends custom css style in body
             * @type {string}
             */
            var css = '<style type="text/css">  #item_splits td.custom-highlight { color: red !important; }  </style>';
            var d = document.createElement('div'); d.innerHTML = css; document.body.appendChild(d);
       //     if (type.toString() === 'edit') {
                try {
                    var record,
                        totalLines = nlapiGetLineItemCount('item'), lineNumber, _lineNumber = [],_remove = [];
                    for (lineNumber = 1; lineNumber <= totalLines; lineNumber++) {
                        //record = nlapiSearchRecord('item', '', [new nlobjSearchFilter('internalid', '', 'is', nlapiGetLineItemValue('item', 'item', lineNumber))], [new nlobjSearchColumn('quantitybackordered')]);
                        record = parseFloat(nlapiGetLineItemValue('item', 'quantitybackordered', lineNumber));// - parseFloat(nlapiGetLineItemValue('item', 'quantity', lineNumber));
                        /*if (!!this.isBackOrdered(record)) {

                         */
                        if (record > 0) {
                            _lineNumber.push(lineNumber);
                        } else {
                            _remove.push(lineNumber)
                        }
                    }
                    this.highlightLines(_lineNumber, _remove);
                }
                catch (e) {
                    nlapiLogExecution('ERROR', 'Exception', e.toString());
                }
        //    }
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Void}
         */
        clientFieldChanged: function (type, name, linenum) {
            if (name.toString() === 'quantity') {
                try {
                    var record,
                        totalLines = nlapiGetLineItemCount('item'), lineNumber, _lineNumber = [], _remove = [];
                    /* record = parseFloat(nlapiGetLineItemValue('item', 'quantityavailable', linenum)) - parseFloat(nlapiGetLineItemValue('item', 'quantity', linenum));

                     if (record < 0) {
                     _lineNumber.push(linenum);
                     }
                     this.highlightLines(_lineNumber);*/


                    for (lineNumber = 1; lineNumber <= totalLines; lineNumber++) {
                        //record = nlapiSearchRecord('item', '', [new nlobjSearchFilter('internalid', '', 'is', nlapiGetLineItemValue('item', 'item', lineNumber))], [new nlobjSearchColumn('quantitybackordered')]);
                        record = parseFloat(nlapiGetLineItemValue('item', 'quantityavailable', lineNumber)) - parseFloat(nlapiGetLineItemValue('item', 'quantity', lineNumber));
                        /*if (!!this.isBackOrdered(record)) {

                         */
                        if (record < 0) {
                            _lineNumber.push(lineNumber);
                        } else {
                            _remove.push(lineNumber);
                        }
                    }
                    this.highlightLines(_lineNumber, _remove);
                }
                catch (e) {
                    nlapiLogExecution('ERROR', 'Exception', e.toString());
                }
            }
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientRecalc: function (type) {
            if (type.toString() === 'item') {
                try {
                    var record,
                        totalLines = nlapiGetLineItemCount(type), lineNumber, _lineNumber = [], _remove = [];
                    for (lineNumber = 1; lineNumber <= totalLines; lineNumber++) {
                        //record = nlapiSearchRecord('item', '', [new nlobjSearchFilter('internalid', '', 'is', nlapiGetLineItemValue('item', 'item', lineNumber))], [new nlobjSearchColumn('quantitybackordered')]);
                        record = parseFloat(nlapiGetLineItemValue('item', 'quantityavailable', lineNumber)) - parseFloat(nlapiGetLineItemValue('item', 'quantity', lineNumber));

                        if (record < 0) {
                            _lineNumber.push(lineNumber);
                        } else {
                            _remove.push(lineNumber);
                        }
                    }
                    this.highlightLines(_lineNumber, _remove);
                }
                catch (e) {
                    nlapiLogExecution('ERROR', 'Exception', e.toString());
                }
            }
        },

        /**
         * Finds whether item is back ordered or not
         * @param record
         * @returns {boolean}
         */
        isBackOrdered: function(record) {
            var backOrdered = record[0].getValue('quantitybackordered');
            if (backOrdered > 0) {
                return true;
            } else {
                return false;
            }
        },

        /**
         * Highlight lines in array
         * @param arr
         */
        highlightLines: function(arr, removeCl) {
            setTimeout(function () {
                for (var i = 0; i < arr.length; i++) {
                    jQuery('#item_row_' + arr[i]).children('td').addClass('custom-highlight');
                }
                for (var i = 0; i < removeCl.length; i++) {
                    jQuery('#item_row_' + removeCl[i]).children('td').removeClass('custom-highlight');
                }
            }, 200);

        }
    };
})();


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function WorkOrderHighlightingclientPageInit(type) {
    return WorkOrderHighlighting.clientPageInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function WorkOrderHighlightingclientRecalc(type) {
    return WorkOrderHighlighting.clientRecalc(type);
}



/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function WOHighlightingFieldChanged(type, name, linenum) {
    return WorkOrderHighlighting.clientFieldChanged(type, name, linenum);
}