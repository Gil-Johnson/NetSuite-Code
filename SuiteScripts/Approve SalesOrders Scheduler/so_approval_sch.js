var LimitConstants = {
    Minutes: 50,
    RemainingUsage: 200
};

function salesOrdersToApprove(type) {

    try {

        var startTime = (new Date()).getTime();

        nlapiLogExecution('DEBUG', 'f3_logs', 'SP Approval SCH script started');

        var ctx = nlapiGetContext();

        var savedSearchIdsArr = getSavedSearchIds('custscript_approval_search_ids');
        //var savedSearchIdsArr = [1802];

        for (var i in savedSearchIdsArr) {

            nlapiLogExecution('DEBUG', 'saved search id', savedSearchIdsArr[i]);

            var orders = null;

            try {
                orders = nlapiSearchRecord('transaction', savedSearchIdsArr[i], null, null);
            } catch (e) {
                nlapiLogExecution('ERROR', 'Invalid saved search id');
                continue;
            }

            var ordersData = [];

            if (!!orders && orders.length > 0) {

                nlapiLogExecution('DEBUG', 'f3_logs', 'sales orders found: ' + orders.length);

                nlapiLogExecution('DEBUG', 'f3_logs', 'ordersData parsing started');

                for (var j = 0; j < orders.length; j++) {
                //for (var j = 0; j < 9; j++) {

                    var orderId = orders[j].getId();

                    nlapiLogExecution('DEBUG', 'f3_logs', 'approving so: ' + orderId);

                    var pendingFulfillmentStatus = 'B';
                    
                    try{
                    nlapiSubmitField('salesorder', orderId, 'orderstatus', pendingFulfillmentStatus);
                    } catch (ex) {
                        nlapiLogExecution('ERROR', 'error while submitting record updates', 'Errror_Occurred: ' + ex.message);
                        nlapiSendEmail(1, ['kennys@ricoinc.com, gjohnson@ricoinc.com, jayc@ricoinc.com'], 'Error Occured in Approve SalesOrders Scheduler Script', 'Error:  ' +  ex.message, null, null, null, null, true, null, 'gjohnson@rico.com');
                    };

                    nlapiLogExecution('DEBUG', 'f3_logs', 'so approved: ' + orderId);

                    if (rescheduleIfRequired(startTime)) {
                        return;
                    }

                }

            }

        }

        nlapiLogExecution('DEBUG', 'f3_logs', 'All OK and Completed');

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error_logs', 'Errror_Occurred: ' + ex.message);
        nlapiSendEmail(1, ['kennys@ricoinc.com, gjohnson@ricoinc.com, jayc@ricoinc.com'], 'Error Occured in Approve SalesOrders Scheduler Script', 'Error:  ' +  ex.message, null, null, null, null, true, null, 'gjohnson@rico.com');
    }
}

/*
Get saved search ids from "General Preferences"
 */
function getSavedSearchIds(id) {
    var ctx, idStr;
    var idsArr = [];
    ctx = nlapiGetContext();
    idStr = ctx.getSetting('SCRIPT', id);
    nlapiLogExecution('DEBUG', 'saved search ids', idStr);
    if (isValidValue(idStr)) {
        var tempIds = idStr.split(',');
        tempIds.forEach(function(id) {
            if (!isNaN(id) && isValidValue(id))
                idsArr.push(id);
        });
    }
    return idsArr;
}

/*
check for valid value
 */
function isValidValue(value) {
    return !(value == '' || value == null || typeof value == 'undefined');
}

/*
Check RemainingExecution limit and Time elapsed for rescheduling
 */
function rescheduleIfRequired(startTime) {
    var context = nlapiGetContext();
    var endTime;
    var minutes;

    endTime = (new Date()).getTime();
    minutes = Math.round(((endTime - startTime) / (1000 * 60)) * 100) / 100;

    if (context.getRemainingUsage() < LimitConstants.RemainingUsage) {
        nlapiLogExecution('AUDIT', 'RESCHEDULED', 'Remaining Usage: ' + context.getRemainingUsage());
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
        return true;
    }

    if (minutes > LimitConstants.Minutes) {
        nlapiLogExecution('AUDIT', 'RESCHEDULED', 'Time Elapsed: ' + minutes);
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
        return true;
    }

    return false;
}