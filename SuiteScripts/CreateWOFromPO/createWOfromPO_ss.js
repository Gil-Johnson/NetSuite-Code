function main() {
    var context = nlapiGetContext();
    jsonString = context.getSetting('SCRIPT', 'custscriptjson');
    nlapiLogExecution('DEBUG', 'jsonString', jsonString);
    if (jsonString) {
        var arrParam = eval(jsonString);
        var count = context.getSetting('SCRIPT', 'custscript_count');
        var ids = context.getSetting('SCRIPT', 'custscript_ids');
        nlapiLogExecution('DEBUG', 'count', count);
        nlapiLogExecution('DEBUG', 'ids', ids);
        if (arrParam.length > 0) {
            var po = arrParam[0].custbody_createdfrom;
            var rec = nlapiLoadRecord('purchaseorder', po);
            var poDataList = [];
            for (var i = 0; i < arrParam.length; i++) {
                var wo = nlapiCreateRecord('workorder', {recordmode: 'dynamic'});
                wo.setFieldValue('assemblyitem', arrParam[i].assemblyitem);
                wo.setFieldValue('quantity', arrParam[i].quantity);
                wo.setFieldValue('enddate', arrParam[i].enddate);
                wo.setFieldValue('custbody_wocomments', arrParam[i].custbody_wocomments);
                wo.setFieldValue('custbody_linkedpo', po);
                var indexAtPO = arrParam[i].index;
                var woQty = arrParam[i].woQty;
                try {
                    var woId = nlapiSubmitRecord(wo);
                    //rec.setLineItemValue('item', 'custcol_woqty', indexAtPO, woQty + arrParam[i].quantity);
                    var woIds = WOPOUtility.getWOIdsArrayString(rec.getLineItemValue('item', WOPOUtilityCommon.Transaction.Columns.WOIds, indexAtPO), woId);
                    //rec.setLineItemValue('item', WOPOUtilityCommon.Transaction.Columns.WOIds, indexAtPO, woIds);

                    var poData = {};
                    poData.index = indexAtPO;
                    poData.aggregatedQty = woQty + arrParam[i].quantity;
                    poData.woIds = woIds;
                    poDataList.push(poData);

                    ids += nlapiLookupField('workorder', woId, 'tranid') + ' ';
                    count++;
                    if (nlapiGetContext().getRemainingUsage() <= 100 && i + 1 < arrParam.length) {
                        //nlapiSubmitRecord(rec);
                        WOPOUtility.updatePurchaseOrder(po, poDataList);
                        var msg = 'Total Work Order(s) created successfully: ' + count;
                        if (count > 0) {
                            msg += ' with following id\'s:' + ids;
                        }
                        var param = new Array();
                        param['custscript_count'] = count;
                        param['custscript_ids'] = ids;
                        param['custscriptjson'] = JSON.stringify(arrParam.splice(i + 1, arrParam.length));
                        var status = nlapiScheduleScript("customscript_createwo_sch", "customdeploy_createwo_sch", param);
                        msg += ' Script rescheduled, status: ' + status;
                        nlapiLogExecution('DEBUG', 'RESULT', msg);
                        return;
                    }
                } catch (e) {
                    nlapiLogExecution('ERROR', 'Create Work order from Purchase order', 'Unable to create work order for assembly item: ' + arrParam[i].assemblyitem + ', ' + e);
                }
            }
            //nlapiSubmitRecord(rec);
            WOPOUtility.updatePurchaseOrder(po, poDataList);
            var msg = 'Total Work Order(s) created successfully: ' + count;
            if (count > 0) {
                msg += ' with following id\'s:' + ids;
            }
            nlapiLogExecution('DEBUG', 'RESULT', msg);
        }
    }
}

/**
 * This class contains the constants used in the project
 */
var WOPOUtilityCommon = (function () {
    return {
        Transaction: {
            Columns: {
                WOIds: "custcol_wo_ids"
            }
        }
    };
})();

/**
 * This class contains the methods used in project
 */
var WOPOUtility = (function () {
    return {
        getWOIdsArrayString: function (existingId, newId) {
            var ids;
            if (!!existingId) {
                ids = JSON.parse(existingId);
            } else {
                ids = [];
            }

            if (ids.indexOf(newId) === -1) {
                ids.push(newId);
            }
            return JSON.stringify(ids);
        },
        /*
         Update PO
         */
        updatePurchaseOrder: function(poId, poDataList) {
            var rec = nlapiLoadRecord('purchaseorder', poId);
            if(!!poDataList && poDataList.length > 0) {
                for (var i = 0; i < poDataList.length; i++) {
                    var obj = poDataList[i];
                    rec.setLineItemValue('item', 'custcol_woqty', obj.index, obj.aggregatedQty);
                    rec.setLineItemValue('item', WOPOUtilityCommon.Transaction.Columns.WOIds, obj.index, obj.woIds);
                }
                nlapiSubmitRecord(rec);
            }
        }
    };
})();
