/**
 * Created by wahajahmed on 5/22/2015.
 */


/**
 * ExportSalesOrders class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var SO_Splitting_Invoker = (function () {

    /**
     * Delete record if already exist in splitting queue
     * @param recordId
     * @param soInternalId
     */
    function deleteDuplicateRecords(recordId, soInternalId) {
        try {
            var dupRecords = SO_Splitting_Manager.getDuplicateSOAlreadyExistInQueue(recordId, soInternalId);
            if(!!dupRecords && dupRecords.length > 0) {
                for (var i = 0; i < dupRecords.length; i++) {
                    FCLogger.debug('Duplicate Records found', dupRecords.length + ' record(s) found  >>  for recordId=' + recordId + '  >>  soInternalId=' + soInternalId);
                    var obj = dupRecords[i];
                    var id = obj.id;
                    nlapiDeleteRecord(SO_SplittingDao.INTERNAL_ID, id);
                }
            }
        } catch (e) {
            FCLogger.error('deleteDuplicateRecords >> recId='+recordId +' >> soId=' + soInternalId, e);
        }
    }

    /**
     * Get records count by status
     * @param status
     */
    function getRecordsCountByStatus(status) {
        var count = 0;
        var recs = SO_SplittingDao.getByStatus([status]);
        if(!!recs) {
            count = recs.length;
        }
        return count;
    }

    return {

        startTime: (new Date()).getTime(),
        minutesAfterReschedule: 50,
        usageLimit: 500,
        errorCodes: {
          RecordDoesNotExist: 'RCRD_DSNT_EXIST'
        },
        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {
                FCLogger.debug('Starts', 'Started');
                var context = nlapiGetContext();


                //region Process Pending Records

                var recs = SO_SplittingDao.getByStatus([CONSTANTS.SOSplittingStatues.Pending]);
                if(!!recs && recs.length > 0) {
                    FCLogger.debug('Pending Records Found', recs.length + ' Pending record(s) found');
                    //FCLogger.debug('Data', JSON.stringify(recs));
                    for (var i = 0; i < recs.length; i++) {
                        var result = null;
                        var obj = recs[i];
                        var recordId = obj.id;
                        var soInternalId = obj[SO_SplittingDao.FieldName.MAIN_SO_INTERNAL_ID];
                        var soNumber = obj[SO_SplittingDao.FieldName.MAIN_SO_NUMBER];
                        var soExecutionContext = obj[SO_SplittingDao.FieldName.EXECUTION_CONTEXT];

                        try {
                            deleteDuplicateRecords(recordId, soInternalId);
                            var salesOrderObj = nlapiLoadRecord('salesorder', soInternalId);
                            result = SO_Splitting_Manager.splitSalesOrder(soInternalId, soNumber, salesOrderObj, soExecutionContext);
                        } catch(ex) {
                            if (ex instanceof nlobjError) {
                                var errorCode = ex.getCode();
                                // If 'RecordDoesNotExist' error occur during loading a salesorder then delete this SO record from splitting queue
                                if(errorCode == this.errorCodes.RecordDoesNotExist) {
                                    nlapiDeleteRecord(SO_SplittingDao.INTERNAL_ID, recordId);
                                }
                            }
                            result = {};
                            result.status = CONSTANTS.SOSplittingStatues.Error;
                            result.splittedSOIds = '';
                            result.splittedSONumbers = '';
                            result.errorMessage = ex.toString();
                            result.customErrorMessage = {customError: ex.toString()};
                        }

                        try {
                            var fields = [];
                            fields.push(SO_SplittingDao.FieldName.SO_SPLITTING_STATUS);
                            fields.push(SO_SplittingDao.FieldName.SPLITTED_SO_IDS);
                            fields.push(SO_SplittingDao.FieldName.SPLITTED_SO_NUMBERS);
                            fields.push(SO_SplittingDao.FieldName.SO_SLITTING_ERROR);
                            fields.push(SO_SplittingDao.FieldName.ERROR_JSON);
                            var values = [];
                            values.push(result.status);
                            values.push(result.splittedSOIds);
                            values.push(result.splittedSONumbers);
                            values.push(result.errorMessage);
                            values.push(JSON.stringify(result.customErrorMessage));

                            nlapiSubmitField(SO_SplittingDao.INTERNAL_ID, recordId, fields, values);
                        }
                        catch (e) {
                            FCLogger.error('error in updating splitting custom record >> recId='+recordId +' >> soId=' + soInternalId, e);
                        }

                        if (this.rescheduleIfNeeded(context, null)) {
                            FCLogger.debug('Rescheduling', 'Rescheduled');
                            return null;
                        }
                    }

                } else {
                    FCLogger.debug('NoPendingRecordsFound', 'No Pending record found to Split.');
                }

                //endregion


                //region Process SplittedWithErrors Records (if any)

                var recs = SO_SplittingDao.getByStatus([CONSTANTS.SOSplittingStatues.SplittedWithErrors]);
                if(!!recs && recs.length > 0) {
                    FCLogger.debug('SplittedWithErrors Records Found', recs.length + ' SplittedWithErrors record(s) found');
                    for (var i = 0; i < recs.length; i++) {
                        var obj = recs[i];
                        var recordId = obj.id;
                        var soInternalId = obj[SO_SplittingDao.FieldName.MAIN_SO_INTERNAL_ID];
                        var soNumber = obj[SO_SplittingDao.FieldName.MAIN_SO_NUMBER];
                        var soExecutionContext = obj[SO_SplittingDao.FieldName.EXECUTION_CONTEXT];

                        try {
                            deleteDuplicateRecords(recordId, soInternalId);
                            var salesOrderObj = nlapiLoadRecord('salesorder', soInternalId);
                            var result = SO_Splitting_Manager.splitSalesOrder(soInternalId, soNumber, salesOrderObj, soExecutionContext);
                        } catch(ex) {
                            if (ex instanceof nlobjError) {
                                var errorCode = ex.getCode();
                                // If 'RecordDoesNotExist' error occur during loading a salesorder then delete this SO record from splitting queue
                                if(errorCode == this.errorCodes.RecordDoesNotExist) {
                                    nlapiDeleteRecord(SO_SplittingDao.INTERNAL_ID, recordId);
                                }
                            }
                            result = {};
                            result.status = CONSTANTS.SOSplittingStatues.Error;
                            result.splittedSOIds = '';
                            result.splittedSONumbers = '';
                            result.errorMessage = ex.toString();
                            result.customErrorMessage = {customError: ex.toString()};
                        }

                        try {
                            var fields = [];
                            fields.push(SO_SplittingDao.FieldName.SO_SPLITTING_STATUS);
                            fields.push(SO_SplittingDao.FieldName.SPLITTED_SO_IDS);
                            fields.push(SO_SplittingDao.FieldName.SPLITTED_SO_NUMBERS);
                            fields.push(SO_SplittingDao.FieldName.SO_SLITTING_ERROR);
                            fields.push(SO_SplittingDao.FieldName.ERROR_JSON);
                            var values = [];
                            values.push(result.status);
                            values.push(result.splittedSOIds);
                            values.push(result.splittedSONumbers);
                            values.push(result.errorMessage);
                            var errorJson = {customError: result.customErrorMessage};
                            values.push(JSON.stringify(errorJson));

                            nlapiSubmitField(SO_SplittingDao.INTERNAL_ID, recordId, fields, values);
                        }
                        catch (e) {
                            FCLogger.error('error in updating splitting custom record >> recId='+recordId +' >> soId=' + soInternalId, e);
                        }

                        if (this.rescheduleIfNeeded(context, null)) {
                            FCLogger.debug('Rescheduling', 'Rescheduled');
                            return null;
                        }
                    }
                } else {
                    FCLogger.debug('NoSplittedWithErrorsRecordsFound', 'No SplittedWithErrors record found to Split.');
                }

                //endregion


                //region re-schedule the script if any pending records remaining

                var pendingRecordsCount = getRecordsCountByStatus(CONSTANTS.SOSplittingStatues.Pending);
                if(pendingRecordsCount > 0) {
                    FCLogger.debug('Some Pending SO(s) for splitting found', 'Re-scheduling the script...');
                    var queuingStatus = nlapiScheduleScript(
                        context.getScriptId(),
                        context.getDeploymentId(),
                        null);

                    //log the result so that we know what happened with this script
                    FCLogger.debug('Schedule Script Result = ', queuingStatus);
                }

                //endregion


                FCLogger.debug('Ends', 'Ended');

            } catch (e) {
                FCLogger.error('SO_Splitting_Invoker.scheduled', e);
            }
        },

        parseFloatNum: function (num) {
            var no = parseFloat(num);
            if (isNaN(no)) {
                no = 0;
            }
            return no;
        },

        getDateUTC: function (offset) {
            var today = new Date();
            var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
            offset = parseInt(this.parseFloatNum(offset * 60 * 60 * 1000));
            today = new Date(utc + offset);
            return today;
        },

        /**
         * Reschedules only there is any need
         * @param context Context Object
         * @returns {boolean} true if rescheduling was necessary and done, false otherwise
         */
        rescheduleIfNeeded: function (context, params) {
            try {
                var usageRemaining = context.getRemainingUsage();

                if (usageRemaining < this.usageLimit) {
                    this.rescheduleScript(context, params);
                    return true;
                }

                var endTime = (new Date()).getTime();

                var minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
                FCLogger.debug('Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
                // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

                if (minutes > this.minutesAfterReschedule) {
                    this.rescheduleScript(context, params);
                    return true;
                }

            } catch (e) {
                FCLogger.error('SO_Splitting_Invoker.rescheduleIfNeeded', e);
            }
            return false;
        },


        /**
         * Call this method to reschedule current schedule script
         * @param ctx nlobjContext Object
         */
        rescheduleScript: function (ctx, params) {
            var status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
            FCLogger.debug('SO_Splitting_Invoker.rescheduleScript', 'Status: ' + status + ' Params: ' + JSON.stringify(params));
        }
    };
})();








/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function soSplitScheduled(type) {
    return SO_Splitting_Invoker.scheduled(type);
}