/**
 * Created by zshaikh on 8/26/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * - ../util/underscore-min.js
 * -
 */

/**
 * SalesOrdersDal class that has the functionality of
 */
var SalesOrdersDAL = Fiber.extend(function () {

    var baseTypeDAL = new F3.Storage.BaseTypeDAL();

    function addBooleanFilter(filters, field, join, value) {

        if ( typeof value == 'undefined') {
            value = join;
            join = null;
        }

        if (!F3.Util.Utility.isBlankOrNull(value)) {
            var f = null;
            if (value == true || value == "1") {
                f = new nlobjSearchFilter(field, join, 'is', 'T');
            } else if (value == false || value == "0") {
                f = new nlobjSearchFilter(field, join, 'is', 'F');
            }

            if (!!f) {
                filters.push(f);
            }
        }
    }



    return {

        searchId: '',

        /**
         * Init method
         */
        getPending: function (params) {

            var result = [];
            var filters = [];
            var records = null;

            F3.Util.Utility.logDebug("testing",JSON.stringify(params));

            // create filters
            if (!F3.Util.Utility.isBlankOrNull(params.items_committed)) {
                if( params.items_committed === 'some' ) {

                    //      "Some" - Where quantitycommitted qty is > 0
                    filters.push(new nlobjSearchFilter('quantitycommitted', 'item', 'greaterthan', 0));

                } else if( params.items_committed === 'all' ) {

                    //      "All" - Where ordered qty - qty committed is equal to zero and backordered qty is 0
                    filters.push(new nlobjSearchFilter('formulanumeric', null, 'equalto', 1)
                        .setFormula('CASE WHEN (nvl({quantity},0) = nvl({quantitycommitted},0)) THEN 1 ELSE 0 END'));
                }
            }

            if (!F3.Util.Utility.isBlankOrNull(params.customer)) {
                //F3.Util.Utility.logDebug('customer', params.customer);
                filters.push(new nlobjSearchFilter('entity', null, 'anyof', [params.customer]));
            }

            //Allow Reprinting Filter
            if (!F3.Util.Utility.isBlankOrNull(params.allow_reprinting)) {
                F3.Util.Utility.logDebug('allow_reprinting', params.allow_reprinting);

                if(params.allow_reprinting == "F") {
                    filters.push(new nlobjSearchFilter('custbody_dropship_pt_printed', null, 'is', params.allow_reprinting));
                }
            }

            //PT Sort Identifier Filter
            if (!F3.Util.Utility.isBlankOrNull(params.pt_sort_identifier)) {
                F3.Util.Utility.logDebug('custbody_ptsortidentifier', params.pt_sort_identifier);
                filters.push(new nlobjSearchFilter('custbody_ptsortidentifier', null, 'is', params.pt_sort_identifier));
            }

            var maxItemsPerPage = 100;
            var startIndex = params.startIndex;
            var endIndex = startIndex + maxItemsPerPage;

            // load data from db
            var searchRecordTimer = F3.Util.StopWatch.start('SalesOrdersDAL.getPending(); // nlapiSearchRecord()');
            var savedSearch = nlapiLoadSearch(null, this.searchId);
            savedSearch.addFilters(filters);

            var search = savedSearch.runSearch();
            var resultSet = search.getResults(startIndex, endIndex);

            records = _.flatten(resultSet);
            searchRecordTimer.stop();


            //var searchCounterTimer = F3.Util.StopWatch.start('SalesOrdersDAL.getPending(); // get count using search:');
            //var savedSearch = nlapiLoadSearch(null, this.searchId);
            //savedSearch.columns.splice(0)
            //savedSearch.addColumn(new nlobjSearchColumn('internalid', null, 'count'));
            //var search = savedSearch.runSearch();
            //var countRec = search.getResults(0, 1);
            //var dtEnd = (new Date()).getTime();
            //searchCounterTimer.stop();


            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            // serialize data
            result = baseTypeDAL.getObjects(records);


            if (result.length === 1000 ) {
                for (var i = result.length - 1; i >= 0; i--) {
                    // if it is mainline, then splice
                    if (!result[i].item) {
                        result.splice(i, result.length - 1);
                        break;
                    }
                }
            }


            jsonConverterTimer.stop();

            return result;
        },


        updateOrders: function (salesorderData) {
            var updateOrdersTimer = F3.Util.StopWatch.start('updateOrders();');
            var BY_PASS_SO_ID = 'bypasssoid';
            var context = nlapiGetContext();

            F3.Util.Utility.logDebug('exec_context', context.getExecutionContext());


            // Governance Unit: 30 per iteration
            // for 5 salesorders: 5 * 30 = 150 units consumed
            // for 10 salesorders: 10 * 30 = 300 units consumed
            // for 20 salesorders: 20 * 30 = 600 units consumed
            // for 30 salesorders: 30 * 30 = 900 units consumed
            _.each(salesorderData, function (val, key, obj) {
                var salesorder = val;

                var updateSingleOrderTimer = F3.Util.StopWatch.start('updateOrder(); // ' + salesorder.id);

                F3.Util.Utility.logDebug('salesorders', JSON.stringify(salesorder));
                F3.Util.Utility.logDebug('salesorder.id: ', salesorder.id);

                var salesorderRec = nlapiLoadRecord('salesorder', salesorder.id);

                F3.Util.Utility.logDebug('record loaded: ', salesorder.id);


                if (!!salesorder.ship_date) {
                    salesorderRec.setFieldValue('shipdate', salesorder.ship_date);
                }


                if (!!salesorder.cancel_date) {
                    salesorderRec.setFieldValue('custbody_cncldate', salesorder.cancel_date);
                }


                _.each(salesorder.items, function (item, index) {
                    //for (var j = i + 1; j < salesorderData.length; j++) {
                    //var lineitem = salesorderData[i];
                    var lineitem = item;

                    F3.Util.Utility.logDebug('item: ', JSON.stringify(item));

                    var lineIndex = salesorderRec.findLineItemValue('item', 'line', lineitem.line_id);

                    salesorderRec.setLineItemValue('item', 'expectedshipdate', lineIndex, lineitem.ship_date);

                    if (lineitem.item_modified === true) {

                        salesorderRec.setLineItemValue('item', 'item', lineIndex, lineitem.item_id);

                        var amount = salesorderRec.getLineItemValue('item', 'amount', lineIndex);
                        var rate = salesorderRec.getLineItemValue('item', 'rate', lineIndex);
                        var classField = salesorderRec.getLineItemValue('item', 'class', lineIndex);

                        // Set Price Level to Custom "-1"
                        salesorderRec.setLineItemValue('item', 'price', lineIndex, '-1');
                        salesorderRec.setLineItemValue('item', 'amount', lineIndex, amount);
                        salesorderRec.setLineItemValue('item', 'rate', lineIndex, rate);
                        salesorderRec.setLineItemValue('item', 'class', lineIndex, classField);

                    }

                });



                context.setSessionObject(BY_PASS_SO_ID, salesorder.id);

                nlapiSubmitRecord(salesorderRec);

                context.setSessionObject(BY_PASS_SO_ID, null);

                F3.Util.Utility.logDebug('f3_logs', 'so submitted');


                updateSingleOrderTimer.stop();

            });



            updateOrdersTimer.stop();

        }

    };
});
