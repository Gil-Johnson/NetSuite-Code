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
var CID_CustomRecord_UserEventHelper = (function () {
    return {
        /**
         * Config Data
         */
        configData: {
            CustomRecordInternalId: 'customrecord_custitemdet',
            Fields : {
                InternalId: 'internalid',
                RelatedCustomer: 'custrecord_relcust',
                RelatedItem: 'custrecord_relitem',
                CasePack: 'custrecord_cspk',
                InnerPack: 'custrecord_inpk',
                RetailPrice: 'custrecord_rtlprc',
                CustomerSKU: 'custrecord_custsku',
                UPCCode: 'custrecord_custupc',
                DescriptionAndComments: 'custrecord_custdesc'
            },
            CustomErrors: {
                ErrorMessage: 'There is an active previous item for this item selection ',
                CSVError: 'You can not create or update Customer Item Details record from CSV import.',
                DuplicateRecordError: 'A duplicate record already exist for this customer and item.'
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
            if(!!request) {
                var itemId = request.getParameter('itemid');
                nlapiLogExecution('DEBUG', 'Check','BeforeLoad Worked');
                //nlapiLogExecution('DEBUG', 'itemId', itemId);
                if (!!itemId && (type.toString() === 'create')) {
                    var itemType = request.getParameter('itemtype');
                    var fields = ['custitem_cspk', 'custitem_inpk', 'custitem_rtlprc', 'custitem_custsku', 'upccode'];
                    var values = nlapiLookupField(itemType, itemId, fields);

                    nlapiSetFieldValue(this.configData.Fields.RelatedItem, itemId);
                    nlapiSetFieldValue(this.configData.Fields.CasePack, values['custitem_cspk']);
                    nlapiSetFieldValue(this.configData.Fields.InnerPack, values['custitem_inpk']);
                    nlapiSetFieldValue(this.configData.Fields.RetailPrice, values['custitem_rtlprc']);
                    nlapiSetFieldValue(this.configData.Fields.CustomerSKU, values['custitem_custsku']);
                    //nlapiSetFieldValue(this.configData.Fields.UPCCode, values['upccode']);

                    var script = '<script type="text/javascript "> setTimeout(function(){ jQuery("#custrecord_relcust_display").focus(); }, 500); </script>';
                    form.addField('custpage_script_customscript', 'inlinehtml', '').setDefaultValue(script);


                    form.addButton(COMMON.BTN_GET_UPC_ID, 'Reserve UPC', 'getUpcScript()');
                    var script = form.addField(COMMON.INLINE_UPC_SCRIPT_ID, 'inlinehtml');

                    var sc = "<script>";
                    sc += "var g_type = '" + type + "';";
                    sc += getUpcScript.toString();
                    sc += getUpcRecord.toString();
                    sc += getCommon.toString();
                    sc += "</script>";
                    script.setDefaultValue(sc);
                }
            }
            nlapiLogExecution('DEBUG', 'Check','BeforeLoad Not Worked BUt Executed');
        },

        /**
         * "Reverse UPC" button script
         */
        getUpcScript: function() {
            UPC_CODE_RECORDS = getUpcRecord();
            COMMON = getCommon();
            nlapiLogExecution('DEBUG', 'Check','GetUPC Worked');
            var filters = [];
            var columns = [];
            var result = [];

            filters[filters.length] = new nlobjSearchFilter(UPC_CODE_RECORDS.FieldName.RESERVERD_ID,null,'is','F');
            columns[columns.length] = new nlobjSearchColumn(UPC_CODE_RECORDS.FieldName.UPC_CODE_ID).setSort(false);
            columns[columns.length] = new nlobjSearchColumn('internalid').setSort(false);

            result = nlapiSearchRecord(UPC_CODE_RECORDS.INTERNAL_ID, null, filters, columns);

            if(result != null){
                nlapiDisableField(COMMON.BTN_GET_UPC_ID, true);
                var bottomGetUpcNumBtn = document.getElementById('secondary'+COMMON.BTN_GET_UPC_ID);
                var classDisBtn = document.getElementById(COMMON.BTN_GET_UPC_ID).parentElement.parentElement.className;
                bottomGetUpcNumBtn.disabled = true;
                bottomGetUpcNumBtn.parentElement.parentElement.className = classDisBtn;

                var upcCode = result[0].getValue('name');
                var recId = result[0].getId();
                nlapiSubmitField(UPC_CODE_RECORDS.INTERNAL_ID, recId, UPC_CODE_RECORDS.FieldName.RESERVERD_ID, 'T');

                // set upc in item
                if(g_type == 'create' || g_type == 'edit' || g_type == 'copy'){
                    nlapiSetFieldValue('upccode', upcCode);
                }
            } else {
                nlapiLogExecution('DEBUG', 'Check',' UPC Not Found');
                alert('UPC code is not found.');
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
            var throwCustomError = false;
            nlapiLogExecution('DEBUG', 'Check','BeforeSubmit Worked');
            try {
                var context = nlapiGetContext();
                var execContext = context.getExecutionContext();
                /*if(execContext == 'csvimport'){
                    throwCustomError = true;
                    this.throwError(this.configData.CustomErrors.CSVError);
                }*/

                if (type.toString() === 'create' || type.toString() === 'edit') {
                    var internalId = null;
                    nlapiLogExecution('DEBUG', 'Check','BeforeLoad Worked and Enter into COndition');
                    var itemId = nlapiGetFieldValue(this.configData.Fields.RelatedItem);
                    var customerId = nlapiGetFieldValue(this.configData.Fields.RelatedCustomer);
                    if(type.toString() === 'edit'){
                        internalId = nlapiGetRecordId();
                    }
                    var recordExist = this.checkDuplicateRecord(internalId, customerId, itemId);
                    Utility.logDebug('recordExist', recordExist);
                    if(recordExist) {
                        throwCustomError = true;
                        this.throwError(this.configData.CustomErrors.DuplicateRecordError);
                    }

                    var fields = ['custitem_is_substitute_for'];
                    var values = nlapiLookupField('item', itemId, fields);
                    var isSubstituteFor = values['custitem_is_substitute_for'];
                    Utility.logDebug('isSubstituteFor', isSubstituteFor);
                    if(!!isSubstituteFor){
                        var canBeOnSO = nlapiLookupField('item', isSubstituteFor, 'custitem_can_be_on_so');
                        Utility.logDebug('isSubstituteForItem_canBeOnSO', canBeOnSO);
                        if(!!canBeOnSO && canBeOnSO === 'T') {
                            var substituteForItemName  = nlapiLookupField('item', isSubstituteFor, 'itemid');
                            Utility.logDebug('isSubstituteForItemName', substituteForItemName);
                          //  throwCustomError = true;
                           // this.throwError(this.configData.CustomErrors.ErrorMessage + substituteForItemName + '.');
                        }
                    }
                }
            } catch (ex) {
                if(throwCustomError) {
                    throw ex;
                } else {
                    nlapiLogExecution('DEBUG', 'Check','BeforeSubmit  Worked and thrown an error');
                    Utility.logException('CID_CustomRecord_UserEventHelper BeforeSubmit', ex);
                }
            }

        },

        /**
         * Method to throw custom error
         * @param error
         */
        throwError: function(error) {
            var err = nlapiCreateError('ERROR', error, true);
            throw err;
        },

        /**
         * Check if duplicate record exist
         * @param customerId
         * @param itemId
         */
        checkDuplicateRecord: function (customRecordId, customerId, itemId) {
            var recordExist = false;
            var filters = [];
            filters.push(new nlobjSearchFilter(this.configData.Fields.RelatedCustomer, null, 'is', customerId));
            filters.push(new nlobjSearchFilter(this.configData.Fields.RelatedItem, null, 'is', itemId));
            if(!!customRecordId) {
                filters.push(new nlobjSearchFilter(this.configData.Fields.InternalId, null, 'noneof', [customRecordId]));
            }
            var records = nlapiSearchRecord(this.configData.CustomRecordInternalId, null, filters);
            if(!!records && records.length > 0) {
                recordExist = true;
            }
            return recordExist;
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
function CID_CustomRecord_UserEventBeforeLoad(type, form, request) {
    nlapiLogExecution('DEBUG', 'Check','BeforeLoad CID Worked');
    return CID_CustomRecord_UserEventHelper.userEventBeforeLoad(type, form, request);
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
function CID_CustomRecord_UserEventBeforeSubmit(type) {
    return CID_CustomRecord_UserEventHelper.userEventBeforeSubmit(type);
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
function CID_CustomRecord_UserEventAfterSubmit(type) {
    nlapiLogExecution('DEBUG', 'Check','aftersubmit worked');
    return CID_CustomRecord_UserEventHelper.userEventAfterSubmit(type);
}

function getUpcScript() {
    nlapiLogExecution('DEBUG', 'Check','gteUPC2 Worked');
    UPC_CODE_RECORDS = getUpcRecord();
    COMMON = getCommon();

    var filters = [];
    var columns = [];
    var result = [];

    filters[filters.length] = new nlobjSearchFilter(UPC_CODE_RECORDS.FieldName.RESERVERD_ID,null,'is','F');
    columns[columns.length] = new nlobjSearchColumn(UPC_CODE_RECORDS.FieldName.UPC_CODE_ID).setSort(false);
    columns[columns.length] = new nlobjSearchColumn('internalid').setSort(false);

    result = nlapiSearchRecord(UPC_CODE_RECORDS.INTERNAL_ID, null, filters, columns);

    if(result != null){
        nlapiDisableField(COMMON.BTN_GET_UPC_ID, true);
        var bottomGetUpcNumBtn = document.getElementById('secondary'+COMMON.BTN_GET_UPC_ID);
        var classDisBtn = document.getElementById(COMMON.BTN_GET_UPC_ID).parentElement.parentElement.className;
        bottomGetUpcNumBtn.disabled = true;
        bottomGetUpcNumBtn.parentElement.parentElement.className = classDisBtn;

        var upcCode = result[0].getValue('name');
        var recId = result[0].getId();
        // set upc in item
        if(g_type == 'create' || g_type == 'edit' || g_type == 'copy'){
            nlapiSetFieldValue('custrecord_custupc', upcCode);
            nlapiSubmitField(UPC_CODE_RECORDS.INTERNAL_ID, recId, UPC_CODE_RECORDS.FieldName.RESERVERD_ID, 'T');
        }
    } else {
        alert('UPC code is not found.');
    }
}