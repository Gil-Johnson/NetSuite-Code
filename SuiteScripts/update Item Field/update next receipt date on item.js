/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var startTime;
var minutesAfterReschedule;

function main() {
    try {
        var context = nlapiGetContext();
        startTime = (new Date()).getTime();
        minutesAfterReschedule = 15;
        var woResult = nlapiSearchRecord(null, 1567);
        var poResult = nlapiSearchRecord(null, 1613);
        var obj;
        if (woResult) {
            for (var i = 0; i < woResult.length; i++) {
                obj = new Object();
                obj.itemId = woResult[i].getValue('internalid', null, 'group');
                obj.recType = getItemRecordType(obj.itemId);
                obj.nextReceiptDate = woResult[i].getValue('formuladate', null, 'min');
                updateItem(obj);
                if (rescheduleIfNeeded(context, null)) {
                    return;
                }
            }
        }
        if (poResult) {
            for (var j = 0; j < poResult.length; j++) {
                obj = new Object();
                obj.itemId = poResult[j].getValue('internalid', null, 'group');
                obj.recType = getItemRecordType(obj.itemId);
                obj.nextReceiptDate = poResult[j].getValue('formuladate', null, 'min');
                updateItem(obj);
                if (rescheduleIfNeeded(context, null)) {
                    return;
                }
            }
        }
        if (poResult && woResult) {
            updateCommonItems(woResult, poResult);
        }
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in func main', ex.toString());
    }
}

function getItemRecordType(itemId) {
    try {
        var fils = new Array();
        fils.push(new nlobjSearchFilter('internalid', null, 'is', itemId));
        var res = nlapiSearchRecord('item', null, fils, null)[0].getRecordType();
        return res;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in func getItemRecordType', ex.toString());
    }
}

function updateItem(obj) {
    try {
        //var rec = nlapiLoadRecord(obj.recType,obj.itemId);
        nlapiLogExecution('DEBUG', 'itemId', obj.itemId);
        nlapiLogExecution('DEBUG', 'recType', obj.recType);
        //nlapiLogExecution('DEBUG','oldDate',rec.getFieldValue('custitem_nextrcptdate'));
        nlapiLogExecution('DEBUG', 'newDate', obj.nextReceiptDate);
        //rec.setFieldValue('custitem_nextrcptdate',obj.nextReceiptDate);

        //nlapiSubmitRecord(rec);

        nlapiSubmitField(obj.recType, obj.itemId, 'custitem_nextrcptdate', obj.nextReceiptDate);
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in func updateItem', ex.toString());
    }
}

function updateCommonItems(woResult, poResult) {
    try {
        //var itemarr = new Array();
        for (var i = 0; i < woResult.length; i++) {
            for (var j = 0; j < poResult.length; j++) {
                if (woResult[i].getValue('internalid', null, 'group') == poResult[j].getValue('internalid', null, 'group')) {
                    var obj = new Object();
                    obj.itemId = woResult[i].getValue('internalid', null, 'group');
                    obj.recType = getItemRecordType(obj.itemId);
                    nlapiLogExecution('DEBUG', 'common item', obj.itemId);
                    if (poResult[j].getValue('formuladate', null, 'min') && woResult[i].getValue('formuladate', null, 'min')) {
                        obj.nextReceiptDate = getClosestDate(poResult[j].getValue('formuladate', null, 'min'), woResult[i].getValue('formuladate', null, 'min'));
                    }
                    else if (poResult[j].getValue('formuladate', null, 'min')) {
                        obj.nextReceiptDate = poResult[j].getValue('formuladate', null, 'min');
                    }
                    else if (woResult[i].getValue('formuladate', null, 'min')) {
                        obj.nextReceiptDate = woResult[i].getValue('formuladate', null, 'min');
                    }
                    else {
                        obj.nextReceiptDate = woResult[i].getValue('formuladate', null, 'min');
                    }
                    updateItem(obj);
                    if (rescheduleIfNeeded(context, null)) {
                        return;
                    }
                    break;
                }
            }
        }
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in func getCommonItems', ex.toString());
    }
}

function getClosestDate(date1, date2) {
    try {
        var diff1 = getDateDiff(date1);
        var diff2 = getDateDiff(date2);
        if (diff1 > diff2) {
            return date2;
        }
        else if (diff1 < diff2) {
            return date1;
        }
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in func getClosestDate', ex.toString());
    }
}

function getDateDiff(date) {
    try {
        var currDate = new Date();
        return currDate - date;
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in func getDateDiff', ex.toString());
    }
}


/**
 * Reschedules only there is any need
 * @param context Context Object
 * @returns {boolean} true if rescheduling was necessary and done, false otherwise
 */
function rescheduleIfNeeded(context, params) {
    try {
        var usageRemaining = context.getRemainingUsage();

        if (usageRemaining < 4500) {
            nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
            return true;
        }

        var endTime = (new Date()).getTime();

        var minutes = Math.round(((endTime - startTime) / (1000 * 60)) * 100) / 100;
        nlapiLogExecution('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + startTime);
        // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

        if (minutes > minutesAfterReschedule) {
            nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
            return true;
        }
    }
    catch (e) {
        nlapiLogExecution('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining);
    }
    return false;
}