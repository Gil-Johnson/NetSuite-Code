/**
 * Created by zshaikh on 05/21/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * - f3_common.js
 * - dal/f3_items_dal.js
 * -
 */

/**
 * F3UpdateInventoryFeedScheduledScript class that has the actual functionality of scheduled script.
 * All business logic will be encapsulated in this class.
 */
var F3UpdateInventoryFeedScheduledScript = (function () {
    return {

        startTime: null,
        minutesAfterReschedule: 15,
        usageAfterReschedule: 1000,

        /* hold status if current script has been rescheduled or not
         * if true then donot execute any more code. */
        rescheduled: false,


        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {

                F3.Util.Utility.log('DEBUG', 'Starting', '');
                var scheduledTimer = F3.Util.StopWatch.start('F3UpdateInventoryFeedScheduledScript.scheduled();');

                var ctx = nlapiGetContext();
                this.startTime = (new Date()).getTime();


                this.processInventoryItems();


                this.processInactiveItems();


                if (this.rescheduled === false) {
                    this.processKitItems();
                }


                if (this.rescheduled === false) {
                    this.processAssemblyItemsWithoutSubComponents();
                }


                if (this.rescheduled === false) {
                    this.processAssemblyItemsWithSubComponents();
                }


                if (this.rescheduled === false) {
                    this.processEmptyFeedNumberItems();
                }




                if (this.rescheduled === false) {
                    this.rescheduleIfNeeded();
                }


                F3.Util.Utility.log('DEBUG', 'Ends', '');
                scheduledTimer.stop();
            }
            catch (e) {
                F3.Util.Utility.log('ERROR', 'Error during  Script working', e.toString());
            }
        },



        /**
         * processes inventory items
         * checks if quantity is not equal to inventory feed number
         * then set inventory feed number = quantity
         */
        processInventoryItems: function() {

            try {

                var itemsDal = new F3.Storage.ItemsDAL();
                var inventoryItems = itemsDal.getInventoryItems();


                F3.Util.Utility.log('DEBUG', 'Found Inventory Items: ', JSON.stringify(inventoryItems));

                if (inventoryItems !== null && inventoryItems.length > 0) {
					var self = this;
                    this.processItems(inventoryItems, function (item) {

                        nlapiSubmitField('inventoryitem', item.id, 'custitem_invfeednumber', self.handleNegativeValue(Math.round(item.quantity_available)), {disabletriggers: true});

                    });

                } else {
                    F3.Util.Utility.log('DEBUG', ' No Inventory Items found to process', '');
                }


            } catch (e) {
                F3.Util.Utility.log('ERROR', 'Error during processInventoryItems();', e.toString());
            }

        },




        /**
         * processes assembly items which donot have sub-components
         * checks if quantity is not equal to inventory feed number
         * then set inventory feed number = quantity
         */
        processKitItems: function() {

            try {

                var itemsDal = new F3.Storage.ItemsDAL();
                var kitItems = itemsDal.getKitItems();

                F3.Util.Utility.log('DEBUG', 'Found Kit Items: ', JSON.stringify(kitItems));

                if (kitItems !== null && kitItems.length > 0) {
					var self = this;
                    this.processItems(kitItems, function (item) {

                        nlapiSubmitField('kititem', item.internalid, 'custitem_invfeednumber', self.handleNegativeValue(Math.round(item.quantity_available)), {disabletriggers: true});

                    });

                } else {
                    F3.Util.Utility.log('DEBUG', ' No Kit Items found to process', '');
                }

            } catch (e) {
                F3.Util.Utility.log('ERROR', 'Error during processKitItems();', e.toString());
            }

        },



        /**
         * processes assembly items which donot have sub-components
         * checks if quantity is not equal to inventory feed number
         * then set inventory feed number = quantity
         */
        processAssemblyItemsWithoutSubComponents: function() {

            try {

                var itemsDal = new F3.Storage.ItemsDAL();
                var assemblyItems = itemsDal.getAssemblyItemsWithoutSubComponents();

                F3.Util.Utility.log('DEBUG', 'Found Assembly Items: ', JSON.stringify(assemblyItems));

                if (assemblyItems !== null && assemblyItems.length > 0) {
					var self = this;
                    this.processItems(assemblyItems, function (item) {

                        nlapiSubmitField('assemblyitem', item.id, 'custitem_invfeednumber', self.handleNegativeValue(Math.round(item.quantity_available)), {disabletriggers: true});

                    });

                } else {
                    F3.Util.Utility.log('DEBUG', ' No Assembly Items found to process', '');
                }

            } catch (e) {
                F3.Util.Utility.log('ERROR', 'Error during processAssemblyItemsWithoutSubComponents();', e.toString());
            }

        },



        /**
         * processes assembly items which have sub-components
         * checks if quantity is not equal to inventory feed number
         * then set inventory feed number = quantity
         */
        processAssemblyItemsWithSubComponents: function() {

            try {

                var itemsDal = new F3.Storage.ItemsDAL();
                var assemblyItems = itemsDal.getAssemblyItemsWithSubComponents();

                F3.Util.Utility.log('DEBUG', 'Found Assembly Items With Subcomponents: ', JSON.stringify(assemblyItems));

                if (assemblyItems !== null && assemblyItems.length > 0) {
					var self = this;
                    this.processItems(assemblyItems, function (item) {

                        var quantity = Math.round(item.quantity_available) + Math.round(item.quantity_calculated);
                        nlapiSubmitField('assemblyitem', item.internalid, 'custitem_invfeednumber', self.handleNegativeValue(quantity) , {disabletriggers: true});

                    });

                } else {
                    F3.Util.Utility.log('DEBUG', ' No Assembly Items  With Subcomponents found to process', '');
                }

            } catch (e) {
                F3.Util.Utility.log('ERROR', 'Error during processAssemblyItemsWithSubComponents();', e.toString());
            }

        },






        /**
         * processes assembly items which have sub-components
         * checks if quantity is not equal to inventory feed number
         * then set inventory feed number = quantity
         */
        processEmptyFeedNumberItems: function() {

            try {

                var itemsDal = new F3.Storage.ItemsDAL();
                var items = itemsDal.getItemsWithEmptyInventoryFeedNumber();

                F3.Util.Utility.log('DEBUG', 'Found Items With empty feed number: ', JSON.stringify(items));

                if (items !== null && items.length > 0) {

                    this.processItems(items, function (item) {

                        // we need to set quantity to 0
                        var quantity = 0;
                        nlapiSubmitField(item.recordType, item.internalid, 'custitem_invfeednumber', quantity, {disabletriggers: true});

                    });

                } else {
                    F3.Util.Utility.log('DEBUG', ' No Items With empty feed number found to process', '');
                }

            } catch (e) {
                F3.Util.Utility.log('ERROR', 'Error during processEmptyFeedNumberItems();', e.toString());
            }

        },


        /**
         * processes inactive items
         * checks if inventory feed number is not zero
         * then set inventory feed number = 0
         */
        processInactiveItems: function() {

            try {

                var itemsDal = new F3.Storage.ItemsDAL();
                var items = itemsDal.getInactiveItems();

                F3.Util.Utility.log('DEBUG', 'Found Inactive Items: ', JSON.stringify(items));

                if (items !== null && items.length > 0) {

                    this.processItems(items, function (item) {

                        // we need to set quantity to 0
                        var quantity = 0;
                        nlapiSubmitField(item.recordType, item.internalid, 'custitem_invfeednumber', quantity, {disabletriggers: true});

                    });

                } else {
                    F3.Util.Utility.log('DEBUG', ' No Inactive Items found to process', '');
                }

            } catch (e) {
                F3.Util.Utility.log('ERROR', 'Error during processInactiveItems();', e.toString());
            }

        },

        /**
         * Convert a negative value into zero
         * @param originalValue
         */
        handleNegativeValue: function(originalValue) {
            try {
                if(!!originalValue && originalValue < 0) {
                    return 0;
                }
            } catch(ex) {}
            return originalValue;
        },


        /**
         * reschedule script if there are more records to process
         */
        rescheduleIfNeeded: function() {

            var context = nlapiGetContext();
            var params = null;
            var tempUsage = 10000;


            var hasItems = false;
            var itemsDal = new F3.Storage.ItemsDAL();



            // check inventory items first
            var inventoryItems = itemsDal.getInventoryItems();
            hasItems = inventoryItems !== null && inventoryItems.length > 0;




            // if there are no inventory items,
            // then search for kit items
            if (hasItems == false) {
                var kitItems = itemsDal.getKitItems();
                hasItems = kitItems!== null && kitItems.length > 0;
            }





            // if there are no kit items
            // then search for assembly items without sub-components
            if (hasItems == false) {
                var assemblyItems = itemsDal.getAssemblyItemsWithoutSubComponents();
                hasItems = assemblyItems !== null && assemblyItems.length > 0;
            }





            // if there are no assembly items without sub-components,
            // then search for assembly items with sub-components
            if (hasItems == false) {
                var assemblyItemsWithSubComponents = itemsDal.getAssemblyItemsWithSubComponents();
                hasItems = assemblyItemsWithSubComponents !== null && assemblyItemsWithSubComponents.length > 0;
            }




            // if there are no assembly items with sub-components,
            // then search items having empty inventory feed number
            if (hasItems == false) {
                var itemsWithEmptyFeedNumber = itemsDal.getItemsWithEmptyInventoryFeedNumber();
                hasItems = itemsWithEmptyFeedNumber !== null && itemsWithEmptyFeedNumber.length > 0;
            }



            // if there are more items,
            // then reschedule script for Round Robin ;)
            if (hasItems == true) {
                if (F3.Scheduling.ScheduleOp.rescheduleIfNeeded(context, params, this.startTime, tempUsage, this.minutesAfterReschedule)) {
                    F3.Util.Utility.log('DEBUG', 'Rescheduling script...', '');
                    return;
                }
            }


        },



        /**
         * sends records to Salesforce using its API
         */
        processItems: function (records, callback) {
            var context = nlapiGetContext();
            var params = null;

            F3.Util.Utility.log('DEBUG', 'inside processRecords', 'processRecords');

            //HACK: Need to remove this
            var count = records.length;

            F3.Util.Utility.log('DEBUG', 'value of count', count);


            // process 100 records at a time.
            var recordsCount = records.length;
            var hasRecords = recordsCount > 0;
            var maxItemsToProcess = 100;
            var alreadyProcessed = 0;

            // TODO : steps to follow
            // 1. pop 100 records from list
            // 2. fill all the properties as requested by client.
            // 3. create xml file and put in file cabinet
            // 4. get file id and get ids of records, put them in a custom record with pending status
            // 5. set status to 'processed' in SO
            // 6. get xml file from cabinet and push to a webapi on client's server.
            // 7. if successfully saved on server, then update status in custom record with 'success'
            // 8. in case of failure, update status in custom record with 'error'. also log the error message
            while (hasRecords) {

                try {

                    F3.Util.Utility.log('DEBUG', 'Total processed records: ', alreadyProcessed);
                    F3.Util.Utility.log('DEBUG', 'Pending records: ', recordsCount - alreadyProcessed);
                    F3.Util.Utility.log('DEBUG', 'context.getRemainingUsage();', context.getRemainingUsage());


                    // we need this clause as the first step in while loop because
                    // there are some cases in which this method is executed multiple times
                    // therefore it must check the usage limit before proceeding.
                    // reschedule client script if usage quote is about to reach.
                    if (F3.Scheduling.ScheduleOp.rescheduleIfNeeded(context, params, this.startTime, this.usageAfterReschedule, this.minutesAfterReschedule)) {
                        F3.Util.Utility.log('DEBUG', 'Rescheduling script...', '');

                        // set flag to true to prevent any more execution
                        this.rescheduled = true;
                        return;
                    }



                    // find records to process
                    var toProcess = _.chain(records).drop(alreadyProcessed).take(maxItemsToProcess).value();

                    //F3.Util.Utility.log('DEBUG', 'toProcess: ', JSON.stringify(toProcess));


                    // update inventory feed number as per quantity
                    for (var i = 0; i < toProcess.length; i++) {
                        var item = toProcess[i];

                        if (callback) {
                            callback(item);
                        }

                    }


                    F3.Util.Utility.log('DEBUG', 'processed: ', toProcess.length + ' records');

                    // add in already processed
                    // so next time these records are skipped
                    alreadyProcessed += maxItemsToProcess;

                    // check if there are more records for processing
                    // for testing purpose, only process 100 records this time. todo: undo
                    hasRecords = alreadyProcessed < recordsCount;


                } catch (e) {
                    F3.Util.Utility.log('ERROR', 'Error during processRecords', e.toString());
                    hasRecords = false;
                }


                if (hasRecords == false) {
                    F3.Util.Utility.log('DEBUG', 'No more records to process', '');
                }
            }


        }

    };
})();

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function F3UpdInvFeedScheduledScriptScheduled(type) {
    return F3UpdateInventoryFeedScheduledScript.scheduled(type);
}