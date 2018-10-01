function suitelet(request, response) {
    var po = request.getParameter('poid');
    // load purchase order
    var rec = nlapiLoadRecord('purchaseorder', po);
    var form = nlapiCreateForm('Create Work Order(s) from PO: ' + rec.getFieldValue('tranid'));
    if (request.getMethod() == 'GET') {
        var list = form.addSubList('custpage_items', 'list', 'Components');
        var dataValues = new Array();
        var inventoryItems = new Array();
        var count = 1;
        for (var i = 1; i <= rec.getLineItemCount('item'); i++) {
            var inventoryItemId = rec.getLineItemValue('item', 'item', i);
            inventoryItems.push(inventoryItemId);
            var cols = new Array();
            cols.push(new nlobjSearchColumn('itemid'));
            cols.push(new nlobjSearchColumn('description'));
            cols.push(new nlobjSearchColumn('custitem_workordercomments'));
            cols.push(new nlobjSearchColumn('isinactive'));
            var fils = new Array();
            fils.push(new nlobjSearchFilter('component', null, 'is', inventoryItemId));
            var res = nlapiSearchRecord('assemblyitem', null, fils, cols);
            if (res) {
                var comment = res[0].getValue('custitem_workordercomments');
                var assemblyItemId = res[0].getId();
                var check = res[0].getValue('isinactive') == 'T' ? 'F' : 'T';
                var description = res[0].getValue('description');
                nlapiLogExecution('DEBUG', 'PrintingAssemblyId', 'assemblyItemId=' + assemblyItemId + ';inventoryItemId=' + inventoryItemId + ';description=' + description);
                var item = rec.getLineItemText('item', 'item', i);
                if (check == 'F') {
                    item = '<font color="red">' + item + '</font>';
                }
                var woQty = rec.getLineItemValue('item', 'custcol_woqty', i);
                if (!woQty || typeof woQty == 'undefined') {
                    woQty = 0;
                }
                var qty = rec.getLineItemValue('item', 'quantity', i);
                var diff = qty - woQty;
                if (diff == 0) {
                    continue;
                }
                diff = diff + '';
                var index = diff.indexOf('.');
                if (index >= 0) {
                    diff = diff.substring(0, index);
                }
                var assembly = '<select name=\'cust_assembly' + count++ + '\' onChange=\'onChangeAssembly(this)\'>';
                var comments = '';
                var ids = '';
                var statuses = '';
                for (var j = 0; j < res.length; j++) {
                    comments += res[j].getValue('custitem_workordercomments') + ',';
                    assembly += '<option value=\'' + j + '\'>' + res[j].getValue('itemid') + '</option>';
                    ids += res[j].getId() + ',';
                    statuses += res[j].getValue('isinactive') + ',';
                    if (assembly.length >= 3950) {
                        break;
                    }
                }
                assembly += '</select>';
                dataValues.push({
                    custpage_check: check,
                    custpage_component: item,
                    custpage_quantity: diff,
                    custpage_assembly: assembly,
                    custpage_comments: comment,
                    custpage_inventoryitemid: inventoryItemId,
                    custpage_id: assemblyItemId,
                    custpage_description: description,
                    custpage_idarray: ids,
                    custpage_commentsarray: comments,
                    custpage_statusarray: statuses,
                    custpage_index: i,
                    custpage_woqty: woQty,
                    custpage_qty: diff
                });
            }
        }
        var fils = new Array();
        fils.push(new nlobjSearchFilter('internalid', 'memberItem', 'anyof', inventoryItems));
        var recs = nlapiSearchRecord('assemblyitem', 'customsearch374', fils);
        if (recs && recs.length > 0) {
            var assemblyItemQuantityArray = new Array();
            for (var j = 0; j < recs.length; j++) {
                assemblyItemQuantityArray[recs[j].id] = recs[j].getValue('memberquantity');
            }
            var assemblyItemQty = 1;
            for (var k = 0; k < dataValues.length; k++) {
                assemblyItemQty = assemblyItemQuantityArray[dataValues[k].custpage_id];
                if (!assemblyItemQty || assemblyItemQty == 'undefined' || assemblyItemQty == '0') {
                    assemblyItemQty = 1;
                }
                assemblyItemQty = Math.round(parseInt(dataValues[k].custpage_quantity) / parseInt(assemblyItemQty));
                dataValues[k].custpage_quantity = assemblyItemQty.toString();
                dataValues[k].custpage_qty = assemblyItemQty.toString();
            }
        }
        form.setScript('customscript_createwo_cl');
        form.addSubmitButton('Create WO');
        form.addField('custpage_setenddate', 'date', 'Set End Date');
        var poId = form.addField('poid', 'text', '').setDisplayType('hidden');
        poId.setDefaultValue(po);
        list.addField('custpage_id', 'text', 'Assembly Id').setDisplayType('hidden');
        list.addField('custpage_idarray', 'textarea', 'Assembly Ids').setDisplayType('hidden');
        list.addField('custpage_commentsarray', 'textarea', 'Comments').setDisplayType('hidden');
        list.addField('custpage_statusarray', 'textarea', 'Comments').setDisplayType('hidden');
        list.addField('custpage_index', 'text', '').setDisplayType('hidden');
        list.addField('custpage_woqty', 'float', '').setDisplayType('hidden');
        list.addField('custpage_qty', 'integer', '').setDisplayType('hidden');
        list.addField('custpage_check', 'checkbox', '');
        list.addField('custpage_component', 'text', 'Component');
        list.addField('custpage_assembly', 'textarea', 'Assembly');
        var description = list.addField('custpage_description', 'textarea', 'Description');
        description.setDisplaySize(100, 5);
        description.setDisplayType('entry');
        list.addField('custpage_quantity', 'integer', 'Quantity').setDisplayType('entry');
        var comments = list.addField('custpage_comments', 'textarea', 'Comments');
        comments.setDisplayType('entry');
        comments.setDisplaySize(100, 5);
        list.addField('custpage_enddate', 'date', 'End Date').setDisplayType('entry');
        list.addMarkAllButtons();
        list.setLineItemValues(dataValues);
        response.writePage(form);
    }
    else if (request.getMethod() == 'POST') {
        form.addButton('custpage_print', 'Print BOM', 'window.open(\'/app/accounting/print/printform.nl?printtype=bom&trantype=workord&method=print&title=Bills+of+Materials&whence\')');
        form.addButton('custpage_back', 'Back', 'window.open(\'/app/site/hosting/scriptlet.nl?script=' + nlapiGetContext().getScriptId() + '&deploy=' + nlapiGetContext().getDeploymentId() + '&poid=' + po + '\',\'_self\')');
        var count = 0;
        var ids = '';
        var poDataList = [];
        for (var i = 1; i <= request.getLineItemCount('custpage_items'); i++) {
            var checked = request.getLineItemValue('custpage_items', 'custpage_check', i);
            if (checked == 'T') {
                var wo = nlapiCreateRecord('workorder', {recordmode: 'dynamic'});
                wo.setFieldValue('assemblyitem', request.getLineItemValue('custpage_items', 'custpage_id', i));
                var qty = request.getLineItemValue('custpage_items', 'custpage_quantity', i);
                qty *= 1;
                var woQty = request.getLineItemValue('custpage_items', 'custpage_woqty', i);
                woQty *= 1;
                wo.setFieldValue('quantity', qty);
                wo.setFieldValue('enddate', request.getLineItemValue('custpage_items', 'custpage_enddate', i));
                wo.setFieldValue('custbody_wocomments', request.getLineItemValue('custpage_items', 'custpage_comments', i));
                wo.setFieldValue('custbody_linkedpo', po);
                try {
                    var woId = nlapiSubmitRecord(wo);
                    //rec.setLineItemValue('item', 'custcol_woqty', request.getLineItemValue('custpage_items', 'custpage_index', i), woQty + qty);
                    var woIds = WOPOUtility.getWOIdsArrayString(rec.getLineItemValue('item', WOPOUtilityCommon.Transaction.Columns.WOIds, request.getLineItemValue('custpage_items', 'custpage_index', i)), woId);
                    //rec.setLineItemValue('item', WOPOUtilityCommon.Transaction.Columns.WOIds, request.getLineItemValue('custpage_items', 'custpage_index', i), woIds);

                    var poData = {};
                    poData.index = request.getLineItemValue('custpage_items', 'custpage_index', i);
                    poData.aggregatedQty = woQty + qty;
                    poData.woIds = woIds;
                    poDataList.push(poData);

                    ids += nlapiLookupField('workorder', woId, 'tranid') + ' ';
                    count++;
                    if (nlapiGetContext().getRemainingUsage() < 100 && i + 1 < request.getLineItemCount('custpage_items')) {
                        //nlapiSubmitRecord(rec);
                        WOPOUtility.updatePurchaseOrder(po, poDataList);
                        var msg = 'Total Work Order(s) created successfully: ' + count;
                        if (count > 0) {
                            msg += ' with following id\'s:' + ids;
                        }
                        i++;
                        var objs = new Array();
                        for (; i <= request.getLineItemCount('custpage_items'); i++) {
                            var checked = request.getLineItemValue('custpage_items', 'custpage_check', i);
                            if (checked == 'T') {
                                qty = request.getLineItemValue('custpage_items', 'custpage_quantity', i);
                                qty *= 1;
                                woQty = request.getLineItemValue('custpage_items', 'custpage_woqty', i);
                                woQty *= 1;
                                var obj = {
                                    assemblyitem: request.getLineItemValue('custpage_items', 'custpage_id', i),
                                    quantity: qty,
                                    enddate: request.getLineItemValue('custpage_items', 'custpage_enddate', i),
                                    custbody_wocomments: request.getLineItemValue('custpage_items', 'custpage_comments', i),
                                    custbody_createdfrom: po,
                                    index: request.getLineItemValue('custpage_items', 'custpage_index', i),
                                    woQty: woQty
                                };
                                objs.push(obj);
                            }
                        }
                        var JSONtoSend = JSON.stringify(objs);
                        var param = [];
                        param['custscriptjson'] = JSONtoSend;
                        param['custscript_count'] = count;
                        param['custscript_ids'] = ids;
                        var status = nlapiScheduleScript("customscript_createwo_sch", "customdeploy_createwo_sch", param);
                        msg += '\nRemaining Work Orders are scheduled to be created soon./nScheduled script id: Create WO from PO, status: ' + status;
                        form.addField('custpage_message', 'label', msg);
                        response.writePage(form);
                        return;
                    }
                } catch (e) {
                    nlapiLogExecution('ERROR', 'Create Work order from Purchase order', 'Unable to create work order for assembly item: ' + request.getLineItemValue('custpage_items', 'custpage_id', i) + ', ' + e);
                }
            }
        }
        //nlapiSubmitRecord(rec);
        WOPOUtility.updatePurchaseOrder(po, poDataList);
        var msg = 'Total Work Order(s) created successfully: ' + count;
        if (count > 0) {
            msg += ' with following id\'s:' + ids;
        }
        form.addField('custpage_message', 'label', msg);
        response.writePage(form);
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
