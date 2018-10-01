/**
 * Created by zahmed on 15-Dec-14.
 */

ReleaseOnHoldCustomers = (function () {
    return {
        InternalId: 'customrecord_release_onhold_customers',
        FieldName: {
            CustomerId: 'custrecord_roc_customer',
            Status: 'custrecord_roc_status'
        },
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id, null) : nlapiCreateRecord(this.InternalId, null);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec);
                nlapiLogExecution('DEBUG', 'ReleaseOnHoldCustomers.upsert', id);
            } catch (e) {
                nlapiLogExecution('ERROR', 'ReleaseOnHoldCustomers.upsert', e.toString());
            }
            return id;
        },
        lookup: function (filters) {
            var result = [];
            try {
                var cols = [];
                var fils = filters || [];
                for (var i in this.FieldName) {
                    var col = new nlobjSearchColumn(this.FieldName[i], null, null);
                    cols.push(col);
                }
                result = nlapiSearchRecord(this.InternalId, null, fils, cols) || [];
            } catch (e) {
                nlapiLogExecution('ERROR', 'ReleaseOnHoldCustomers.lookup', e.toString());
            }
            return result;
        },
        updateStatus: function (customerId, status) {
            var fils = [];
            fils.push(new nlobjSearchFilter(this.FieldName.CustomerId, null, 'is', customerId, null));
            var result = this.lookup(fils);

            var obj = {};
            obj[this.FieldName.CustomerId] = customerId;
            obj[this.FieldName.Status] = status;

            if (result.length === 0) {
                this.upsert(obj, null);
            } else {
                this.upsert(obj, result[0].getId());
            }
        },
        // get customers from customer record which are in release procees.
        customersInProcess: function () {
            var customerIds = [];
            var fils = [];
            fils.push(new nlobjSearchFilter(this.FieldName.Status, null, 'is', 'T', null));
            var result = this.lookup(fils);
            if (result.length > 0) {
                for (var i in result) {
                    var custId = result[i].getValue(this.FieldName.CustomerId);
                    if (customerIds.indexOf(custId) === -1) {
                        customerIds.push(custId);
                    }
                }
            }
            return customerIds;
        }
    };
})();