/**
 * Created by wahajahmed on 7/24/2015.
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
 * PO_Manager class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var PO_Manager = (function () {
    return {
        addedNonApprovedItems: [],
        config: {
            status :{
                approved: '14',
                completed: '8'
            },
            message : {
                itemNonApprovalMessage: 'This item is not yet approved.'
            }
        },
        /**
         * Check if item already added in non approved items array
         * @param itemId
         */
        checkInAddedNonApprovedItems: function(itemId){
            if(this.addedNonApprovedItems.indexOf(itemId) > -1) {
                return true;
            }
            return false;
        },

        /**
         * Check if item status is 'Approved' or 'Completed'
         * @param itemId
         */
        checkItemReadyToAdd: function(itemId) {
            var status = nlapiLookupField('item', itemId, 'custitem_status');
            if(status == this.config.status.approved || status == this.config.status.completed) {
                return true;
            }
            else {
                return false;
            }
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
            try {
                if (type == 'item') {
                    if(name == 'item') {
                        //alert('Item Sublists item field changed..');
                        //alert('linenum='+linenum);
                        //var selectedItem = nlapiGetLineItemValue('item','item',linenum);
                        var selectedItemId = nlapiGetCurrentLineItemValue('item','item');
                        //alert(selectedItem);
                        if(!this.checkInAddedNonApprovedItems(selectedItemId)) {
                            if(!this.checkItemReadyToAdd(selectedItemId)) {
                                this.addedNonApprovedItems.push(selectedItemId);
                                alert(this.config.message.itemNonApprovalMessage);
                            }
                        }
                    }
                }
            }
            catch (ex) {
                console.log('Error Occured in PO item adding alert client script clientFieldChanged');
                console.log(ex.message);
            }
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function (type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @returns {Boolean} True to continue save, false to abort save
         */
        clientSaveRecord: function () {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Boolean} True to continue changing field value, false to abort value change
         */
        clientValidateField: function (type, name, linenum) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @returns {Void}
         */
        clientPostSourcing: function (type, name) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientLineInit: function (type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to save line item, false to abort save
         */
        clientValidateLine: function (type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientRecalc: function (type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item insert, false to abort insert
         */
        clientValidateInsert: function (type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item delete, false to abort delete
         */
        clientValidateDelete: function (type) {

            return true;
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
function PO_ManagerclientPageInit(type) {
    return PO_Manager.clientPageInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function PO_ManagerclientSaveRecord() {

    return
    return PO_Manager.clientSaveRecord();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function PO_ManagerclientValidateField(type, name, linenum) {

    return PO_Manager.clientValidateField(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function PO_ManagerclientFieldChanged(type, name, linenum) {
    return PO_Manager.clientFieldChanged(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function PO_ManagerclientPostSourcing(type, name) {
    return PO_Manager.clientPostSourcing(type, name);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function PO_ManagerclientLineInit(type) {
    return PO_Manager.clientLineInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function PO_ManagerclientValidateLine(type) {

    return PO_Manager.clientValidateLine(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function PO_ManagerclientRecalc(type) {
    return PO_Manager.clientRecalc(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function PO_ManagerclientValidateInsert(type) {

    return PO_Manager.clientValidateInsert(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function PO_ManagerclientValidateDelete(type) {

    return PO_Manager.clientValidateDelete(type);
}
