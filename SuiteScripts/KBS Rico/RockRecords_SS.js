/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 Feb 2017     AndrewH
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */

var tranSearch = '4406';
var sendTo = 'ericj@kbscloud.net';
var sendBcc = null;
var threshold = 40;


function rockRecsScheduled(type) {
	try {
		var search = nlapiSearchRecord(type, id, filters, columns);
		if (!search)
			return;
		
		var context = nlapiGetContext();
		var prevRecId = '';
		for (var z = 0; z < search.length; z++) {
			var recType = search[z].getValue('type');
			var recId = search[z].getValue('internalid');
			
			if (recId == prevRecId)
				continue;
			
			prevRecId = recId;
			
			switch (recType) {
	        case 'Cash Refund':
	        	recType = 'cashrefund';
	        	break;
	        case 'Cash Sale':
	        	recType = 'cashsale';
	        	break;
	        case 'Credit Memo':
	        	recType = 'creditmemo';
	        	break;
	        case 'Customer Deposit':
	        	recType = 'customerdeposit';
	        	break;
	        case 'Customer Refund':
	        	recType = 'customerrefund';
	        	break;
	        case 'Estimate':
	        	recType = 'estimate';
	        	break;
	        case 'Expense Report':
	        	recType = 'expensereport';
	        	break;
	        case 'Intercompany Journal Entry':
	        	recType = 'intercompanyjournalentry';
	        	break;
	        case 'Invoice':
	        	recType = 'invoice';
	        	break;
	        case 'Journal Entry':
	        	recType = 'journalentry';
	        	break;
	        case 'Paycheck Journal':
	        	recType = 'paycheckjournal';
	        	break;
	        case 'Return Authorization':
	        	recType = 'returnauthorization';
	        	break;
	        case 'Sales Order':
	        	recType = 'salesorder';
	        	break;
	        case 'Transfer Order':
	        	recType = 'transferorder';
	        	break;
	        case 'Vendor Bill':
	        	recType = 'vendorbill';
	        	break;
	        case 'Vendor Credit':
	        	recType = 'vendorcredit';
	        	break;
	        case 'Vendor Payment':
	        	recType = 'vendorpayment';
	        	break;
	        case 'Vendor Return Authorization':
	        	recType = 'vendorreturnauthorization';
	        	break;
	        case 'Work Order':
	        	recType = 'workorder';
	        	break;
	        default:
	        	recType = 'invoice';
	            break;
			}
			
			var rec = nlapiLoadRecord(recType, recId);
			var recordId = nlapiSubmitRecord(rec);	
			nlapiLogExecution('debug', recType + ' internal id: ' + recordId + ' has been submitted');
			
			var remainingUsage = context.getRemainingUsage();

			if (remainingUsage < threshold) {				
				var scriptId = context.getScriptId();
				nlapiScheduleScript(scriptId);
				nlapiLogExecution('debug', 'Remaining usage is ' + remainingUsage + ' script rescheduled');
				return;
			}
		}
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
	nlapiSendEmail('122', sendTo, 'Script Error when deleting transaction', errorMessage, null, sendBcc);
	return errorMessage;
}