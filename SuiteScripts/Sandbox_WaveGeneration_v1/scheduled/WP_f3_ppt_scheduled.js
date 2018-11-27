
function scheduled(type) {

    F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // start','');

    var startTime = (new Date()).getTime();
    var minutesAfterReschedule = 50;
    var usageLimit = 200;

    var errors = {
        salesorders: []
    };

    var filters = [];
    var columns = [];
    columns.push((new nlobjSearchColumn('internalid')).setSort(true));
    columns.push(new nlobjSearchColumn('custrecord_cancel_list'));
    columns.push(new nlobjSearchColumn('custrecord_script_status'));
    filters.push(new nlobjSearchFilter('custrecord_script_status', null, 'is', 'pending'));

    var rec = nlapiSearchRecord('customrecord_ppt_schedule', null, filters, columns);

    F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // recs: ', JSON.stringify(rec));

    if (!isBlankOrNull(rec)) {
        var ctxt = nlapiGetContext();
        //        var cancelList = ctxt.getSetting('SCRIPT', 'custscript_cancellist');
        var cancelListData = rec[0].getValue('custrecord_cancel_list');
        var id = rec[0].getValue('internalid');

        F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // cancelListData: ', cancelListData);

        cancelListData = eval('(' + cancelListData + ')');
        var cancelList = eval('(' + cancelListData.custscript_cancellist + ')');
        F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // cancelListData: ', cancelListData);

        if (!!cancelListData.salesorders) {

            var salesordersArr = _.values(cancelListData.salesorders);

            // since we need to handle reshedule logic
            // so we will pass salesorders one by one to SalesOrdersDAL
            var salesordersDAL = new SalesOrdersDAL();

            while (salesordersArr.length > 0) {

                var toProcess = salesordersArr.pop();

                try {
                    // pass single order as array,
                    // because the method expects an array
                    salesordersDAL.updateOrders([toProcess]);
                } catch (ex) {
                    F3.Util.Utility.logException('Error during updating salesorders/items', ex.toString());
                    errors.salesorders.push(errors.salesorders.push({soId: toProcess.id, err: ex.toString()}));
                }

                // reshedule if needed with pending salesorders
                if (rescheduleIfNeeded(ctxt, startTime, minutesAfterReschedule, usageLimit)) {
                    params = {
                        custscript_cancellist: JSON.stringify(cancelList),
                        salesorders: salesordersArr
                    };
                    updatePptScheduleRecord(id, params);
                    var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId(), params);
                    F3.Util.Utility.logDebug('Print Picking Ticket', 'Script rescheduled with status:' + status);
                    return;
                }
            }
        }


        var orders = cancelList.orders;
        while (orders.length > 0) {
            var order = orders[0];
            var rec = nlapiLoadRecord('salesorder', order);
            for (var j = 1; j <= rec.getLineItemCount('item'); j++) {
                rec.setLineItemValue('item', 'isclosed', j, 'T');
            }
            nlapiSubmitRecord(rec);
            cancelList.orders.splice(0, 1);
            F3.Util.Utility.logDebug('Print Picking Ticket',
                'Sales Order closed:' + order);
            if (rescheduleIfNeeded(ctxt, startTime, minutesAfterReschedule, usageLimit)) {
                params = {
                    custscript_cancellist: JSON.stringify(cancelList)
                };
                updatePptScheduleRecord(id, params);
                var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId(), params);
                F3.Util.Utility.logDebug('Print Picking Ticket', 'Script rescheduled with status:' + status);
                return;
            }
        }


        var items = cancelList.items;
        while (items.length > 0) {
            var item = items[0];

            var rec = nlapiLoadRecord('salesorder', item.order);

            if (!!item.lineId) {
                var lineIdentifier = item.order + '_' + item.lineId;
                var lineNumber = rec.findLineItemValue('item', 'id', lineIdentifier);
                if (lineNumber > -1) {
                    rec.setLineItemValue('item', 'isclosed', lineNumber, 'T');
                    nlapiSubmitRecord(rec);
                    F3.Util.Utility.logDebug('Print Picking Ticket',
                        'Line Item Id: ' + lineIdentifier +
                        ' --- Item closed: ' + item.item +
                        ' on Sales Order:' + item.order);
                }
            }
            else {

                for (var j = 1; j <= rec.getLineItemCount('item'); j++) {

                    if (rec.getLineItemText('item', 'item', j) == item.item) {
                        rec.setLineItemValue('item', 'isclosed', j, 'T');
                        nlapiSubmitRecord(rec);

                        F3.Util.Utility.logDebug('Print Picking Ticket',
                            'Item closed:' + item.item + ' on Sales Order:' +
                            item.order);
                        break;
                    }
                }
            }

            cancelList.items.splice(0, 1);
            if (rescheduleIfNeeded(ctxt, startTime, minutesAfterReschedule, usageLimit)) {
                params = {
                    custscript_cancellist: JSON.stringify(cancelList)
                };
                updatePptScheduleRecord(id, params);
                var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId(), params);
                F3.Util.Utility.logDebug('Print Picking Ticket', 'Script rescheduled with status:' + status);
                return;
            }
        }


        prints = cancelList.prints;
        while (prints.length > 0) {
            var order = prints[0];
            nlapiSubmitField('salesorder', order, 'custbody_readyprintpt', 'T');
            cancelList.prints.splice(0, 1);
            F3.Util.Utility.logDebug('Print Picking Ticket',
                'Sales Order Ready to print PT:' + order);
            if (rescheduleIfNeeded(ctxt, startTime, minutesAfterReschedule, usageLimit)) {
                params = {
                    custscript_cancellist: JSON.stringify(cancelList)
                };
                updatePptScheduleRecord(id, params);
                var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId(), params);
                F3.Util.Utility.logDebug('Print Picking Ticket', 'Script rescheduled with status:' + status);
                return;
            }
        }

        var record = nlapiLoadRecord('customrecord_ppt_schedule', id);
        record.setFieldValue('custrecord_script_status', 'completed');
        nlapiSubmitRecord(record, true);
        F3.Util.Utility.logDebug('Status', 'Completed');


        F3.Util.Utility.logDebug('receipient email', ctxt.getEmail());
        F3.Util.Utility.logDebug('entity id', ctxt.getUser());

        var email = null;

        try {
            email = nlapiLookupField('employee', ctxt.getUser(), 'email');
        } catch (ex) {

        }


        try {

            // SEND ERRORS EMAIL:
            // ------------------
            // if email address found and has errors
            if (!!email && errors.salesorders.length > 0) {

                var body = 'Some error occured with following salesorders: ';
                body += '<style type="text/css">' +
                        'table thead th { padding: 5px; background-color: #dedede; } ' +
                        'table tbody td { padding: 5px; } ' +
                        '</style>';

                body += '<table><thead><tr><th>Salesorder Id</th><th>Error Detail</th></tr></thead><tbody>';

                var template = '<tr><td>{0}</td><td>{1}</td></tr>';
                for (var i = 0; i < errors.salesorders.length; i++) {
                    var soError = errors.salesorders[i];

                    F3.Util.Utility.logDebug('sales order error:', JSON.stringify(soError));

                    if (!soError.soId) {
                        continue;
                    }

                    var rowHtml = template;
                    rowHtml = rowHtml.replace('{0}', soError.soId);
                    rowHtml = rowHtml.replace('{1}', soError.err);
                    body += rowHtml;
                }

                body += '</tbody></table>';

                nlapiSendEmail(5, email, 'Print Picking Ticket in Bulk - Errors', body);
            }

        } catch (e) {
            F3.Util.Utility.logException('Error in sending email', e.toString());
        }

        //





        try {
            // SEND SUCCESS EMAIL:
            // ------------------
            // if email address found
            if (!!email ) {

                //nlapiSendEmail(ctxt.getUser(), 'jayc@ricoinc.com', 'Print Picking Ticket in Bulk Status', 'Scheduled script suuccessful');
                var datetime = getDateTime();
                var body = "Your picking ticket changes submitted on " + datetime + " were successful.  To print your picking tickets, go to the following link: https://system.netsuite.com/app/accounting/print/printform.nl?printtype=pickingticket&trantype=salesord&method=print&title=Picking+Tickets&whence";

                nlapiSendEmail(5, email, 'Print Picking Ticket in Bulk Status', body);
            }
        } catch (e) {
            F3.Util.Utility.logException('Error in getting email', e.toString());
        }





        var status = nlapiScheduleScript('customscript_wp_sch', 'customdeploy_wp_sch');
        F3.Util.Utility.logDebug('status_reschedule', status);
    }


    F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // end','');

}

/**
 * Update 'PPT Schedule' custom record at the time of rescheduling
 * @param id
 * @param cancelList
 */
function updatePptScheduleRecord(id, cancelList) {
    var rec = nlapiLoadRecord('customrecord_ppt_schedule', id);
    rec.setFieldValue('custrecord_cancel_list', JSON.stringify(cancelList));
    rec.setFieldValue('custrecord_script_status', 'pending');
    nlapiSubmitRecord(rec, true);
}

function getDateTime()
{
	try
	{
		var dt = new Date();
		var date = dt.getDate();
		var month = dt.getMonth()+1;
		var year = dt.getFullYear();
                var hrs = dt.getHours();
		var min = dt.getMinutes();
		var sec = dt.getSeconds();
		var datestring = month + '/' + date + '/' + year + ' ' + hrs + ':' + min + ':' + sec;
		return new Date(datestring);
	}	
	catch(ex)
	{
        F3.Util.Utility.logException('error in func getDateTime',ex.toString());
	}
}

function rescheduleIfNeeded(context, startTime, minutesAfterReschedule, usageLimit) {
	try {
		var usageRemaining = context.getRemainingUsage();

		if (usageRemaining < usageLimit) {
			return true;
		}

		var endTime = (new Date()).getTime();

		var minutes = Math.round(((endTime - startTime) / (1000 * 60)) * 100) / 100;
        F3.Util.Utility.logDebug('Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + startTime, '');
		// if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

		if (minutes > minutesAfterReschedule) {
			return true;
		}

	} catch (ex) {
        F3.Util.Utility.logException('rescheduleIfNeeded', ex.toString());
	}
	return false;
}


function isBlankOrNull(str) {
    if (str == undefined || typeof(str) == 'undefined' || str == 'undefined' || str == null || str == '' || str == 'null' || str == '- None -') {
        return true;
    }
    else {
        return false;
    }
}