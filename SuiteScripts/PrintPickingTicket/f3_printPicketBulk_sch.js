function scheduled(type) {
	var startTime = (new Date()).getTime();
	var minutesAfterReschedule = 50;
	var usageLimit = 200;
	
	
    var filters = new Array();
    var columns = new Array();
    columns.push((new nlobjSearchColumn('internalid')).setSort(true));
    columns.push(new nlobjSearchColumn('custrecord_cancel_list'));
    columns.push(new nlobjSearchColumn('custrecord_script_status'));
    filters.push(new nlobjSearchFilter('custrecord_script_status',null, 'is', 'pending'));
    var rec = nlapiSearchRecord('customrecord_ppt_schedule', null, filters, columns);
    if(!isBlankOrNull(rec)){
        var ctxt = nlapiGetContext();
        //        var cancelList = ctxt.getSetting('SCRIPT', 'custscript_cancellist');
        var cancelList = rec[0].getValue('custrecord_cancel_list');
        var id = rec[0].getValue('internalid');
        cancelList = eval('(' + cancelList + ')');
        cancelList = eval('(' + cancelList.custscript_cancellist + ')');
        var orders = cancelList.orders;
        while (orders.length > 0) {
            var order = orders[0];
            var rec = nlapiLoadRecord('salesorder', order);
            for ( var j = 1; j <= rec.getLineItemCount('item'); j++) {
                rec.setLineItemValue('item', 'isclosed', j, 'T');
            }
            nlapiSubmitRecord(rec);
            cancelList.orders.splice(0, 1);
            nlapiLogExecution('DEBUG', 'Print Picking Ticket',
                'Sales Order closed:' + order);
            if (rescheduleIfNeeded(ctxt, startTime, minutesAfterReschedule, usageLimit)) {
                params = {
                    custscript_cancellist : JSON.stringify(cancelList)
                };
                updatePptScheduleRecord(id, params);
                var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId(), params);
                nlapiLogExecution('DEBUG', 'Print Picking Ticket', 'Script rescheduled with status:' + status);
                return;
            }
        }
        var items = cancelList.items;
        while (items.length > 0) {
            var item = items[0];
        
            var rec = nlapiLoadRecord('salesorder', item.order);
        
            for ( var j = 1; j <= rec.getLineItemCount('item'); j++) {
            
                if (rec.getLineItemText('item', 'item', j) == item.item) {
                    rec.setLineItemValue('item', 'isclosed', j, 'T');
                    nlapiSubmitRecord(rec);
                
                    nlapiLogExecution('DEBUG', 'Print Picking Ticket',
                        'Item closed:' + item.item + ' on Sales Order:'
                        + item.order);
                    break;
                }
            }
            cancelList.items.splice(0, 1);
            if (rescheduleIfNeeded(ctxt, startTime, minutesAfterReschedule, usageLimit)) {
                params = {
                    custscript_cancellist : JSON.stringify(cancelList)
                };
                updatePptScheduleRecord(id, params);
                var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId(), params);
                nlapiLogExecution('DEBUG', 'Print Picking Ticket', 'Script rescheduled with status:' + status);
                return;
            }
        }
        prints = cancelList.prints;
        while (prints.length > 0) {
            var order = prints[0];
            nlapiSubmitField('salesorder', order, 'custbody_readyprintpt', 'T');
            cancelList.prints.splice(0, 1);
            nlapiLogExecution('DEBUG', 'Print Picking Ticket',
                'Sales Order Ready to print PT:' + order);
            if (rescheduleIfNeeded(ctxt, startTime, minutesAfterReschedule, usageLimit)) {
                params = {
                    custscript_cancellist : JSON.stringify(cancelList)
                };
                updatePptScheduleRecord(id, params);
                var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId(), params);
                nlapiLogExecution('DEBUG', 'Print Picking Ticket', 'Script rescheduled with status:' + status);
                return;
            }
        }
        var record = nlapiLoadRecord('customrecord_ppt_schedule', id);
        record.setFieldValue('custrecord_script_status', 'completed');
        nlapiSubmitRecord(record,true);
        nlapiLogExecution('DEBUG', 'Status', 'Completed');
        //nlapiSendEmail(ctxt.getUser(), 'jayc@ricoinc.com', 'Print Picking Ticket in Bulk Status', 'Scheduled script suuccessful');
        var datetime = getDateTime();
		var body = "Your picking ticket changes submitted on " + datetime + " were successful.  To print your picking tickets, go to the following link: https://system.netsuite.com/app/accounting/print/printform.nl?printtype=pickingticket&trantype=salesord&method=print&title=Picking+Tickets&whence";
		nlapiLogExecution('DEBUG', 'receipient email', ctxt.getEmail());
		nlapiLogExecution('DEBUG', 'entity id', ctxt.getUser());
		var email;
		try{
			email = nlapiLookupField('employee', ctxt.getUser(), 'email');
		}catch(e){
			nlapiLogExecution('ERROR', 'Error in getting email', e.toString());
		}
		nlapiSendEmail(5, email, 'Print Picking Ticket in Bulk Status', body);
			var status =  nlapiScheduleScript('customscript_pickingbulk_sch', 'customdeploy_pickingbulk_sch');
			nlapiLogExecution('AUDIT', 'status_reschedule', status);
		}
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
		nlapiLogExecution('ERROR','error in func getDateTime',ex.toString());
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
		nlapiLogExecution('DEBUG', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + startTime, '');
		// if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

		if (minutes > minutesAfterReschedule) {
			return true;
		}

	} catch (ex) {
		nlapiLogExecution('ERROR','rescheduleIfNeeded', ex.toString());
	}
	return false;
}


