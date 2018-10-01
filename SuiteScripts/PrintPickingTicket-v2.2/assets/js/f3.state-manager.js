/**
 * Created by zshaikh on 9/10/2015.
 */

/**
 * StateManager class to manage state of grid
 * Store checkbox selection, ship date and item selection
 * Perform following operations:
 * - Save state
 * - Delete state
 * - Reload state
 * - Get State
 */
function StateManager($grid, prefix) {

    var _$grid = $grid;
    var _prefix = prefix;

    this.clearState = function() {
        $.jStorage.flush();
    };

    this.saveCurrentState = function (page) {
        console.log('saveCurrentState();');
        var saveCurrentStateStopWatch = StopWatch.start('saveCurrentState()');

        var data = this.getSelectedData();

        console.log('saveCurrentState(); // data = ' , data);

        $.jStorage.set(_prefix + '_uidata_' + page, data);

        console.log('saveCurrentState(); // page = ', page);
        console.log('saveCurrentState(); // saved data = ' , $.jStorage.get(_prefix + '_uidata_' + page));

        saveCurrentStateStopWatch.stop();
    };


    this.reloadCurrentState = function(page) {
        console.log('reloadCurrentState(); Testing');
        var reloadCurrentStateStopWatch = StopWatch.start('reloadCurrentState()');

        var data = $.jStorage.get(_prefix + '_uidata_' + page);

        console.log('reloadCurrentState(); // page = ', page);
        console.log('reloadCurrentState(); // data = ', data);

        if (!data) {
            return;
        }


        // mark print checkboxes
        var printIds = data.checkbox.prints;
        _$grid.find('.print-checkbox').filter(function () {
            var salesorderId = this.getAttribute('data-salesorder-id');
            return printIds.indexOf(salesorderId) > -1;
        }).prop('checked', true);


        // mark close checkboxes
        var lineitems = data.checkbox.items;
      	var orders = data.checkbox.orders;


        var $checkboxes = _$grid.find('.close-checkbox').filter(function () {

            var salesorderId = this.getAttribute('data-salesorder-id');
            var itemText = this.getAttribute('data-item-id');

            // if line item then add item id along with order id
            if (!!itemText) {
                var mather = _.matcher({ order : salesorderId , item : itemText});
                return  _.findIndex(lineitems, mather) > -1;
            }
            else {
                return orders.indexOf(salesorderId) > -1;
            }
        });

        // first uncheck all of them
        // then trigger click event so that `onCheckChanged` event is fired.
        $checkboxes.prop('checked', false).click();



        var $rows = _$grid.find('tr[id]');
        _.each(data.salesorders, function(val, key, obj) {
            var salesorder = val;
            var id = salesorder.row_id;
            var $row = $rows.filter('#' + id);

            // set mainline date
            if ( salesorder.ship_date != salesorder.orig_ship_date) {
                var $datePicker = $row.find('.input-group.ship-date');
                $datePicker.attr('data-orig-value', salesorder.orig_ship_date);
                $datePicker.datepicker('setDate', salesorder.ship_date);
                $row.addClass('modified-ship-date');
            }

            if ( salesorder.cancel_date != salesorder.orig_cancel_date) {
                var $cancelDatePicker = $row.find('.input-group.cancel-date');
                $cancelDatePicker.attr('data-orig-value', salesorder.orig_cancel_date);
                $cancelDatePicker.datepicker('setDate', salesorder.cancel_date);
                $row.addClass('modified-cancel-date');
            }

            // loop on items
            _.each(salesorder.items, function (item, index) {
                var $itemRow = $rows.filter('#' + item.row_id);

                if (item.item_modified == true) {
                    $itemRow.find('.close-checkbox').attr('data-item-id', item.item_text);

                    var $itemPicker = $itemRow.find('.item-picker');

                    $itemPicker.attr('data-orig-value', item.orig_item_text);
                    $itemPicker.attr('data-selected-id', item.item_id);
                    $itemPicker.attr('data-selected-text', item.item_text);
                    $itemPicker.val(item.item_text);

                    $itemRow.addClass('modified-item');
                }

                // set lineitem date
                if ( item.ship_date != item.orig_ship_date) {
                    var $datePicker = $itemRow.find('.input-group.ship-date');
                    $datePicker.attr('data-orig-value', item.orig_ship_date);
                    $datePicker.datepicker('setDate', item.ship_date);
                    $itemRow.addClass('modified-ship-date');
                }

            });
        });

        reloadCurrentStateStopWatch.stop();
    };


    this.getSelectedData = function() {

        var data = {
            checkbox: {
                orders: [],
                items: [],
                prints: []
            },
            salesorders: {}
        };

        var $printCheckboxes = _$grid.find('.print-checkbox').filter(':checked');
        var $closeCheckboxes = _$grid.find('.close-checkbox').filter(':not(:disabled):checked');

        $closeCheckboxes.each(function () {
            var row = this.parentNode.parentNode;
            var salesorderId = this.getAttribute('data-salesorder-id');
            var itemText = this.getAttribute('data-item-id');
            var lineId = row.getAttribute('data-line-id');

            // if line item then add item id along with order id
            if (!!itemText) {
                data.checkbox.items.push({
                    order: salesorderId,
                    item: itemText,
                    lineId: lineId
                });
            }
            else {
                data.checkbox.orders.push(salesorderId);
            }
        });

        var printIds = $printCheckboxes.map(function () {
            return this.getAttribute('data-salesorder-id')
        }).toArray();

        data.checkbox.prints = data.checkbox.prints.concat(printIds);


        var modifiedSalesorders = {};
        var modifiedItems = $('.modified-item, .modified-ship-date, .modified-cancel-date');
        modifiedItems.each(function() {

            var $this =  $(this);
            var $itemPicker = $this.find('.item-picker');
            var $datePicker = $this.find('.input-group.ship-date');
            var $cancelDatePicker = $this.find('.input-group.cancel-date');

            var row_id = this.getAttribute('id');
            var isMainline = this.getAttribute('data-is-mainline') === 'true';
            var salesorderId = this.getAttribute('data-salesorder-id');
            var itemId = $itemPicker.attr('data-selected-id');
            var itemText = $itemPicker.attr('data-selected-text');
            var origItemText = $itemPicker.attr('data-orig-value');
            var lineid = this.getAttribute('data-line-id');
            var itemModified = $this.hasClass('modified-item');


            var cancelDate = $cancelDatePicker.datepicker('getDate');
            var origCancelDate = $cancelDatePicker.attr('data-orig-value');
            var cancelDateFormatted = isMainline && cancelDate && (cancelDate instanceof Date) ?
                                            ((cancelDate.getMonth() + 1) + '/' + cancelDate.getDate() + '/' + cancelDate.getFullYear()) :
                                            '';

            var shipDate = $datePicker.datepicker('getDate');
            var origShipDate = $datePicker.attr('data-orig-value');
            var shipDateFormatted = shipDate ?
                                        ((shipDate.getMonth() + 1) + '/' + shipDate.getDate() + '/' + shipDate.getFullYear()) :
                                        '';

            modifiedSalesorders[salesorderId] = modifiedSalesorders[salesorderId] || {};
            modifiedSalesorders[salesorderId].items = modifiedSalesorders[salesorderId].items || [];
            modifiedSalesorders[salesorderId].id = salesorderId;

            if ( isMainline ) {
                modifiedSalesorders[salesorderId].ship_date = shipDateFormatted;
                modifiedSalesorders[salesorderId].orig_ship_date = origShipDate;
                modifiedSalesorders[salesorderId].cancel_date = cancelDateFormatted;
                modifiedSalesorders[salesorderId].orig_cancel_date = origCancelDate;
                modifiedSalesorders[salesorderId].row_id = row_id;
            }
            else {
                modifiedSalesorders[salesorderId].items.push({
                    line_id: lineid,
                    item_id: itemId,
                    item_text: itemText,
                    orig_item_text: origItemText,
                    item_modified: itemModified,
                    row_id: row_id,
                    ship_date: shipDateFormatted,
                    orig_ship_date: origShipDate
                });
            }

            //var salesorder = {
            //    row_id: row_id,
            //    is_mainline: isMainline,
            //    id: salesorderId,
            //    ship_date: shipDateFormatted,
            //    orig_ship_date: origShipDate,
            //
            //    line_id: lineid,
            //    item_id: itemId,
            //    item_text: itemText,
            //    orig_item_text: origItemText,
            //    item_modified: itemModified
            //};
            //
            //modifiedSalesorders.push(salesorder);
        });


        data.salesorders = modifiedSalesorders;

        return data;
    };


    this.getAllData = function () {

        // now get all selections from localstorage
        var finalData = {
            checkbox: {
                orders: [],
                items: [],
                prints: []
            },
            salesorders: {}
        };

        var dataArr = [];
        for (var i = 1; i <= 100; i++) {
            var data = $.jStorage.get(_prefix + '_uidata_' + i);
            if (!!data) {
                dataArr.push(data);
                finalData.checkbox.items = finalData.checkbox.items.concat(data.checkbox.items);
                finalData.checkbox.orders = finalData.checkbox.orders.concat(data.checkbox.orders);
                finalData.checkbox.prints = finalData.checkbox.prints.concat(data.checkbox.prints);

                _.extend(finalData.salesorders, data.salesorders);

                //finalData.salesorders = finalData.salesorders.concat(data.salesorders);
            }
        }


        return finalData;
    };
}