/**
 * Created by sameer on 8/28/15.
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
 * deletingOldSOLogs class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */



var deletingOldSOLogs = (function () {
    return {

        configData: {
            DaysToContainData: 25
        },

        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {
                FCLogger.debug('Start', 'Data Cleansing activity started');
                var filters = [],
                context = nlapiGetContext(),
                // days older records to be deleted...
                //days = context.getSetting('SCRIPT', 'custscript_days');
                days = this.configData.DaysToContainData;

                FCLogger.debug('Days old file to be deleted', days);
                filters.push(new nlobjSearchFilter(SO_SplittingDao.FieldName.SO_SPLITTING_STATUS, null, 'noneof', [CONSTANTS.SOSplittingStatues.Pending, CONSTANTS.SOSplittingStatues.SplittedWithErrors]));
                filters.push(new nlobjSearchFilter('formulatext', null, 'is', '1'));
                filters[1].setFormula("case when trunc({lastmodified}) <= trunc(TO_DATE({today}) - " + days.toString() +") then '1' else '0' end");

                FCLogger.debug('Fetching Data', 'fetching data');

                // get the data from dao.
                var data = SO_SplittingDao.getAll(filters);

                FCLogger.debug('data', data.length);

                if (!!data && data.length > 0) {
                    for(var i = 0; i < data.length; i++) {
                        FCLogger.debug('going to delete record', data[i].id);

                        // Removing the entry from record type
                        SO_SplittingDao.remove(data[i].id);

                        // Rescheduling The script
                        if (context.getRemainingUsage() < 9000) {
                            var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                            FCLogger.debug('Script re-scheduling', 'Script rescheduled with status:' + status);
                            return;
                        }
                    }
                } else {
                    FCLogger.debug('Nothing to delete', '');
                }
                FCLogger.debug('Script Completed', '');
            } catch (e) {
                FCLogger.error('Error during Script working', e.toString());
            }
        }

    };
})();


/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function deletingOldSOLogsScheduled(type) {
    return deletingOldSOLogs.scheduled(type);
}