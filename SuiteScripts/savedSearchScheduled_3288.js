/**
 * Created by Kaiser on March 4, 2016.
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
 * F3_Contact_Report class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var ToolingScheduled = (function () {
	var SAVED_SEARCH = "3288";
	var countInserted;
    return {
        scheduled: function (type) {
            var context = nlapiGetContext();
			countInserted = 0;
			nlapiLogExecution('DEBUG', 'Scheduled Script called.', countInserted + ' records have been inserted.');
			if(context.getSetting('SCRIPT', 'custscript_count'))
				countInserted = parseInt(context.getSetting('SCRIPT', 'custscript_count'));

			var records = nlapiSearchRecord('transaction', SAVED_SEARCH);
			this.processRecords(records);
        },
		
		processRecords: function(records) {
			var context = nlapiGetContext();
			var params = [];
			for (i in records) {
				try {
					var toolingNumber = records[i].getValue('custcol_tooling_number');
					if (toolingNumber) {		
						var record = nlapiLoadRecord('customrecord_tooling', toolingNumber);
						record.setFieldValue('custrecord_received', 'T');
						nlapiSubmitRecord(record);
					}
					
					if (this.rescheduleIfNeeded(context, params)) {
							return;
					}
				} catch (e) {
                    nlapiLogExecution('ERROR', 'Error during processRecords', e.toString());
                }
			}
		},
		rescheduleScript: function (context, params) {
            var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        },
		//Reschedules script if usage remianing is less than 1000
		rescheduleIfNeeded: function (context, params) {
            try {
                var usageRemaining = context.getRemainingUsage();

                if (usageRemaining < 1000) {
                    this.rescheduleScript(context, params);
                    return true;
                }

            }
            catch (e) {
                nlapiLogExecution('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining);
            }
            return false;
        }
    };
})();

function savedSearchScheduled(type) {
    return ToolingScheduled.scheduled(type);
}