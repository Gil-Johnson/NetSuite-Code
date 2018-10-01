/**
 * Module Description
 * 
 * Author Remarks 1.00 07 May 2015 AndrewH
 * 
 */

var tranSearch = '4389';
var timeSearch = '101';
var oppSearch = '';
var eventSearch = '106';
var jobTaskSearch = '103';
var jobSearch = '102';

var sendTo = 'andrewh@kbscloud.net';
var sendBcc = null;

/**
 * @param {String}
 *            type Context Types: scheduled, ondemand, userinterface, aborted,
 *            skipped
 * @returns {Void}
 */
function purgeScheduled(type) {
//	runSearch('calendarevent');
//	runSearch('deposit');
//	runSearch('customerpayment');
//	runSearch('creditmemo');
//	runSearch('returnauthorization');
//	runSearch('invoice');
//	runSearch('cashsale');
//	runSearch('customerdeposit');
//	runSearch('vendorpayment');
//	runSearch('vendorcredit');
//	runSearch('vendorreturnauthorization');
//	runSearch('vendorbill');
//	runSearch('itemfulfillment');
//	runSearch('itemreceipt');
//	runSearch('assemblybuild');
//	runSearch('workorder');
//	runSearch('inventorycount');
//	runSearch('binworksheet');
//	runSearch('bintransfer');
//	runSearch('transferorder');
//	runSearch('inventoryworksheet');
//	runSearch('inventorytransfer');
//	runSearch('inventoryadjustment');
//	runSearch('purchaseorder');
//	runSearch('salesorder');
//	runSearch('estimate');
//	runSearch('check');
//	runSearch('expensereport');
//	runSearch('timebill');
//	runSearch('journalentry');
//	runSearch('projecttask');
//	runSearch('job');
//	runSearch('opportunity');
//	runSearch('customtransaction_royalty_fee');
	runSearch('customtransaction_comm_accrual');
	
	// deleteCustomRecord('customrecord_so_update');
}

function runSearch(recordType) {
	try {
		var records = null;
		nlapiLogExecution('debug', 'recordType', recordType);
		if (recordType == 'calendarevent'){
			records = nlapiSearchRecord(recordType, eventSearch);
		}
		else if (recordType == 'timebill') {
			records = nlapiSearchRecord(recordType, timeSearch);
		}
		else if (recordType == 'projecttask') {
			records = nlapiSearchRecord(recordType, jobTaskSearch);
		}
		else if (recordType == 'job') {
			records = nlapiSearchRecord(recordType, jobSearch);
		}
		else {
			records = nlapiSearchRecord(recordType, tranSearch);
		}
		var threshold = 40;
		
		var prevRec = ''; //journals show two lines with main line true
		for (var x = 0; records && x < records.length; x++) {
			var recToDelete = records[x].getId();
			if (recToDelete == prevRec)
				continue;
			
			prevRec = recToDelete;
			nlapiLogExecution('debug', 'Attempting to delete record ' + recordType + ' ' + recToDelete);
			nlapiDeleteRecord(recordType, recToDelete);

			var context = nlapiGetContext();
			var remainingUsage = context.getRemainingUsage();
			var scriptId = context.getScriptId();

			if (remainingUsage < threshold) {
				nlapiLogExecution('debug', 'Rescheduling script, remaining usage is below '+ threshold);
				nlapiScheduleScript(scriptId);
				return;
			}
		}
		if (!records) {
			nlapiLogExecution('debug', 'No records Found - Moving to next record type');
			return;
		}
			
		
		nlapiLogExecution('debug', 'Search loop finished');
		nlapiLogExecution('debug', 'Remaining Usage ' + remainingUsage);
		nlapiLogExecution('debug', 'The last record deleted was ' + recordType + ' ' + recToDelete);
	}
	catch (e) {
		logError(e);
	}
}

function deleteCustomRecord(recordType) {
	try {
		var records = nlapiSearchRecord(recordType);
		var lastTrans = null;
		var threshold = 6100;

		for (var x = 0; records && x < records.length; x++) {

			var recToDelete = records[x].getId();

			if (lastTrans == recToDelete) {
				continue;
			}
			nlapiLogExecution('debug', 'Currently deleting transaction', recordType + ': ' + recToDelete);

			nlapiDeleteRecord(recordType, recToDelete);

			lastTrans = recToDelete;

			var context = nlapiGetContext();
			var remainingUsage = context.getRemainingUsage();
			var scriptId = context.getScriptId();
			var deploymentId = context.getDeploymentId();

			if (remainingUsage < threshold) {
				nlapiLogExecution('debug', 'Remaining usage is below', threshold);
				nlapiScheduleScript(scriptId, deploymentId);
				return;
			}
		}
		nlapiLogExecution('debug', 'Context, Remaining Usage', context + ' : ' + remainingUsage);
		nlapiLogExecution('debug', 'The last transaction deleted was' + recToDelete);
	}
	catch (e) {
		logError(e);
	}
}

function logError(e, message) {
	var errorMessage = '';

	if (e instanceof nlobjError) {
		nlapiLogExecution('ERROR', e.getCode(), e.getDetails());
		errorMessage = e.getCode() + ': ' + e.getDetails();
	}
	else {
		nlapiLogExecution('ERROR', 'Unspecified', e.toString());
		errorMessage = e.toString();
	}

	if (message) {
		errorMessage += '\n' + message + '\n';
	}
	nlapiSendEmail('19362', sendTo, 'Script Error when deleting transaction', errorMessage, null, sendBcc);
	return errorMessage;
}
