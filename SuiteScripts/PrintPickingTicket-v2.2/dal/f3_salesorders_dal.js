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

            var isItemFilterSelected = false;

            //F3.Util.Utility.logDebug("testing",JSON.stringify(params));

            // create filters
            //filters.push(new nlobjSearchFilter('memorized', null, 'is', 'F'));
            //filters.push(new nlobjSearchFilter('custbody_to_be_split', null, 'is', 'F'));
            addBooleanFilter(filters, 'memorized', false);
            addBooleanFilter(filters, 'custbody_to_be_split', false);

            // as per requirement, these fields will be either true or false only
            addBooleanFilter(filters, 'printedpickingticket', params.printed_picking_ticket);
            addBooleanFilter(filters, 'custbody_readyprintpt', params.ready_to_print);
            addBooleanFilter(filters, 'custbody_hotmarketorder', params.hot_market_order);
            addBooleanFilter(filters, 'custbody_customproductonorder', params.custom_order);

            // these fields can be null or true or false
            addBooleanFilter(filters, 'custcol_hidden_discontinued_filter', params.item_discontinued);
            addBooleanFilter(filters, 'custcol_hidden_inactive_filter', params.item_is_inactive);
            addBooleanFilter(filters, 'custbody_hrdcncl', params.hard_cancel);
            addBooleanFilter(filters, 'custbody_dropship', params.drop_ship);

            if (params.status && params.status.length > 0)
                filters.push(new nlobjSearchFilter('status', null, 'anyof', params.status));

            //if (!F3.Util.Utility.isBlankOrNull(params.item))
            //    filters.push(new nlobjSearchFilter('itemid', 'item', 'is', params.item));

            if (!F3.Util.Utility.isBlankOrNull(params.item)) {
                var itemFilter = new nlobjSearchFilter('formulanumeric', null, 'equalto', 1);
                itemFilter.setFormula('CASE WHEN (LOWER({item.itemid}) LIKE \'' + params.item.toString().toLowerCase() + '\')   THEN 1 ELSE  0 END');
                filters.push(itemFilter);
            }


            if (!F3.Util.Utility.isBlankOrNull(params.backordered_quantity)) {
                if (params.backordered_quantity === 'some') {

                    //      "Some" - Where qty committed on the order is > 0  and backordered qty is also > 0
                    filters.push(new nlobjSearchFilter('formulanumeric', null, 'equalto', 1)
                        .setFormula('CASE WHEN ({quantity} - nvl({quantitycommitted},0) - nvl({quantityshiprecv},0)) > 0 THEN 1 ELSE 0 END'));
                    filters.push(new nlobjSearchFilter('quantitycommitted', null, 'greaterthan', 0));
                    filters.push(new nlobjSearchFilter('quantitybackordered', 'item', 'greaterthan', 0));

                } else if (params.backordered_quantity === 'all') {

                    //      "All" - Where qty committed on the order is 0 (or null) and backordered qty is > 0
                    filters.push(new nlobjSearchFilter('quantitycommitted', null, 'lessthanorequalto', 0));
                    filters.push(new nlobjSearchFilter('quantitybackordered', 'item', 'greaterthan', 0));
                } else if(params.backordered_quantity === 'any'){
                    // "Any"-where qty ///////////////Ahmed_chkpoint
                    filters.push(new nlobjSearchFilter('quantitybackordered', 'item', 'greaterthan', 0));


                }

            }
            if (!F3.Util.Utility.isBlankOrNull(params.Allow_Subs)) {
                if(params.Allow_Subs==1) {
                    filters.push(new nlobjSearchFilter('custbody_allow_substitutions', null, 'is', 'T'));
                }else if(params.Allow_Subs==0){
                    filters.push(new nlobjSearchFilter('custbody_allow_substitutions', null, 'is', 'F'));
                }
            }

            if (!F3.Util.Utility.isBlankOrNull(params.partner))
                filters.push(new nlobjSearchFilter('partner', null, 'is', params.partner));
            
            if (!F3.Util.Utility.isBlankOrNull(params.commit_status))
                filters.push(new nlobjSearchFilter('custbody_commit_status', null, 'is', params.commit_status));

            if (!F3.Util.Utility.isBlankOrNull(params.warehouse))
                filters.push(new nlobjSearchFilter('location', null, 'is', params.warehouse));
            
            if (!F3.Util.Utility.isBlankOrNull(params.cs_order_management)){
                filters.push(new nlobjSearchFilter('custbody_cs_order_mgmt_area', null, 'is', params.cs_order_management)); 
            }
            

            if (!F3.Util.Utility.isBlankOrNull(params.customer)) {
                //F3.Util.Utility.logDebug('customer', params.customer);
                filters.push(new nlobjSearchFilter('entity', null, 'anyof', [params.customer]));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.customer_is_not)) {
                //F3.Util.Utility.logDebug('customer_is_not', params.customer_is_not);
                filters.push(new nlobjSearchFilter('entity', null, 'noneof', [params.customer_is_not]));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.print_status))
                filters.push(new nlobjSearchFilter('custbody_printstatus', null, 'is', params.print_status));

            if (!F3.Util.Utility.isBlankOrNull(params.team))
                filters.push(new nlobjSearchFilter('custitem2', 'item', 'anyof', params.team));

            if (!F3.Util.Utility.isBlankOrNull(params.league))
                filters.push(new nlobjSearchFilter('custitem1', 'item', 'anyof', params.league));

            if (!F3.Util.Utility.isBlankOrNull(params.purchase_order_number))
                filters.push(new nlobjSearchFilter('formulatext', null, 'contains', params.purchase_order_number).setFormula('{otherrefnum}'));

            if (!F3.Util.Utility.isBlankOrNull(params.product_type))
                filters.push(new nlobjSearchFilter('custitem_prodtype', 'item', 'anyof', [params.product_type]));

            // remaining filters
            //shipdate
            if (params.ship_date_from && params.ship_date_to) {
                filters.push(new nlobjSearchFilter('shipdate', null, 'within', params.ship_date_from, params.ship_date_to));
            }
            else if (params.ship_date_from && !params.ship_date_to) {
                filters.push(new nlobjSearchFilter('shipdate', null, 'onorafter', params.ship_date_from));
            }
            else if (!params.ship_date_from && params.ship_date_to) {
                filters.push(new nlobjSearchFilter('shipdate', null, 'onorbefore', params.ship_date_to));
            }

            //last ship date
            if (params.last_ship_date_from && params.last_ship_date_to) {
                filters.push(new nlobjSearchFilter('custbody_last_so_ship_date', null, 'within', params.last_ship_date_from, params.last_ship_date_to));
            }
            else if (params.last_ship_date_from && !params.last_ship_date_to) {
                filters.push(new nlobjSearchFilter('custbody_last_so_ship_date', null, 'onorafter', params.last_ship_date_from));
            }
            else if (!params.last_ship_date_from && params.last_ship_date_to) {
                filters.push(new nlobjSearchFilter('custbody_last_so_ship_date', null, 'onorbefore', params.last_ship_date_to));
            }

            var maxItemsPerPage = 1000;
            var startIndex = params.startIndex;
            var endIndex = startIndex + maxItemsPerPage;

            if (!F3.Util.Utility.isBlankOrNull(params.items_committed)) {

                var operator = null;
                if (params.items_committed === 'some') {

                    //"Some" - Where quantitycommitted qty is > 0
                    operator = 'greaterthan';
                } else if (params.items_committed === 'all') {

                    //"All" - Where ordered qty - qty committed is equal to zero and backordered qty is 0
                    operator = 'equalto';
                }

                if(!!operator) {

                    //Run a search to get the internal ids of filtered sales orders
                    var newFilters = new Array();
                    _.extend(newFilters, filters);
                    var salesOrderSavedSearch = nlapiLoadSearch(null, this.searchId);
                    newFilters.push(new nlobjSearchFilter('formulanumeric', null, operator, 0).setFormula('nvl({quantitycommitted},0)').setSummaryType('sum'));
                    salesOrderSavedSearch.addFilters(newFilters);

                    var newColumns = new Array();
                    newColumns[0] = new nlobjSearchColumn('internalid', null, 'GROUP');
                    newColumns[1] = new nlobjSearchColumn('quantitycommitted', null, 'SUM');

                    salesOrderSavedSearch.setColumns(newColumns);

                    var searchObj = salesOrderSavedSearch.runSearch();
                    var salesOrderResultSet = searchObj.getResults(startIndex, endIndex);

                    F3.Util.Utility.logDebug('salesOrderResultSet ', JSON.stringify(salesOrderResultSet));

                    //var salesOrderRecords = _.flatten(salesOrderResultSet);
                    var internalIds = [];

                    _.each(salesOrderResultSet, function (value, index) {

                        var columns = salesOrderResultSet[index].getAllColumns();
                        var internalId = salesOrderResultSet[index].getValue(columns[0]);
                        internalIds.push(internalId);
                    });

                    F3.Util.Utility.logDebug('internalIds ', internalIds);

                    filters.push(new nlobjSearchFilter('internalid', null, 'anyof', internalIds));
                }
            }




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
                       F3.Util.Utility.logDebug('testing qty changes', lineitem.newQty);
                       var newQty = 0;                       
                       var newAmt = 0;
                       
                       var rate = salesorderRec.getLineItemValue('item', 'rate', lineIndex);
                       var classField = salesorderRec.getLineItemValue('item', 'class', lineIndex);
                       var amount = salesorderRec.getLineItemValue('item', 'amount', lineIndex);
                       
                       if(lineitem.newQty){
                    	   
                       var qtyPicked = salesorderRec.getLineItemValue('item', 'quantityfulfilled', lineIndex);
                       newQty = parseInt(lineitem.newQty) + parseInt(qtyPicked);                       
                       newAmt = newQty * parseFloat(rate);                      
                       
                    // Set Price Level to Custom "-1"
                       salesorderRec.setLineItemValue('item', 'price', lineIndex, '-1');
                       salesorderRec.setLineItemValue('item', 'rate', lineIndex, rate);
                       salesorderRec.setLineItemValue('item', 'quantity', lineIndex,  newQty);
                       salesorderRec.setLineItemValue('item', 'amount', lineIndex, newAmt);                        
                       salesorderRec.setLineItemValue('item', 'class', lineIndex, classField);                         
                       
                       }else{                     	  
                    
                        // Set Price Level to Custom "-1"
                        salesorderRec.setLineItemValue('item', 'price', lineIndex, '-1');
                        salesorderRec.setLineItemValue('item', 'rate', lineIndex, rate);                       
                        salesorderRec.setLineItemValue('item', 'amount', lineIndex, amount);                        
                        salesorderRec.setLineItemValue('item', 'class', lineIndex, classField);
                        
                       }

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
