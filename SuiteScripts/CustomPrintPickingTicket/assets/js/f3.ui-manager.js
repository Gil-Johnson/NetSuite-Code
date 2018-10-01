/**
 * Created by zshaikh on 9/1/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */



// Reference: https://github.com/hongymagic/jQuery.serializeObject
// Use internal $.serializeArray to get list of form elements which is
// consistent with $.serialize
//
// From version 2.0.0, $.serializeObject will stop converting [name] values
// to camelCase format. This is *consistent* with other serialize methods:
//
//   - $.serialize
//   - $.serializeArray
//
// If you require camel casing, you can either download version 1.0.4 or map
// them yourself.
//
(function($){
    $.fn.serializeObject = function () {
        "use strict";

        var result = {};
        var extend = function (i, element) {
            console.log('extend: ' , element);
            //// CUSTOM HANDLING: added data-key handling to preserve names
            var name = element.name; // element.getAttribute('data-key') ||
            var node = result[name];

            // If node with same name exists already, need to convert it to an array as it
            // is a multi-value field (i.e., checkboxes)
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                } else {
                    result[name] = [node, element.value];
                }
            } else {
                result[name] = element.value;
            }
        };

        $.each(this.serializeArray(), extend);
        return result;
    };
})(window.jQuery);




/**
 * UIManager class to manage all types of UI actions
 *  - Binding Filters
 *      - Partners
 *      - Locations
 *      - Customers
 *  - Applying Filters
 *  - Binding Grid
 */
var UIManager = Fiber.extend(function UIManager () {

    var _dataManager = null;
    var _tooptipManager = null;
    var _stateManager = null;


    function showLoading() {
        $(".loading, .jqgrid-overlay").show();
    }

    function hideLoading() {
        $(".loading, .jqgrid-overlay").hide();
    }


    /**
     * validateFilters - validate selected customer id
     */
    function validateFilters() {

        var $customerDropdown = $('.customer-dropdown');
        var customerText = $customerDropdown.val();
        var customerId = $customerDropdown.attr('data-selected-id');

        // validate customer
        if (!customerId && customerText != "") {
            alert('Selected customer is not valid!');
            $customerDropdown.focus();
            return false;
        }

        return {
            customerId: customerId
        };
    }

    function onCancelDateChanged(e) {
        try {
            console.log('onCancelDateChanged()', arguments);

            var $currentTarget = $(e.currentTarget);
            var currentDate = $currentTarget.datepicker('getDate');
            var val = currentDate ? ((currentDate.getMonth() + 1) + '/' + currentDate.getDate() + '/' + currentDate.getFullYear()) : '';
            var origValue = $currentTarget.attr('data-orig-value');
            var $tr = $currentTarget.parents('tr:first');
            var isMainline = $tr.attr('data-is-mainline') == "true";

            console.log('val: ', val);
            console.log('origValue: ', origValue);
            console.log('isMainline: ', isMainline);
            //console.log('$siblingRows: ', $siblingRows);

            if (val === origValue) {
                $tr.removeClass('modified-cancel-date');
            }
            else {
                $tr.addClass('modified-cancel-date');
            }

        } catch (e) {
            console.error('ERROR', 'Error during main onShipDateChanged', e.toString());
        }
    }

    /**
     * onCheckChanged:
     * if close checkbox is checked on mainline
     * then mark all child close checkboxes as checked and disable them
     * also uncheck print checkbox and disable
     * @param parameter
     */
    function onCheckChanged(e) {
        try {
            console.log('onCheckChanged()', arguments);

            var $input = $(e.target);
            var isChecked = $input.is(':checked');
            var $tr = $input.parent().parent();
            var isMainLine = $tr.attr('data-is-mainline') === "true";
            var salesorderId = $tr.attr('data-salesorder-id');
            var $itemAndDatePickers = null;


            // disable child checkboxes
            // also disable print checkboxes
            if ( isMainLine === true) {

                var $siblingRows = $tr.parent().find('tr[data-salesorder-id="' + salesorderId + '"]');
                $itemAndDatePickers = $siblingRows.find('.item-picker, .input-group.date input');

                var $closeCheckboxes = $siblingRows.find('input.close-checkbox').not($input);
                var $printCheckbox = $siblingRows.find('input.print-checkbox');

                $closeCheckboxes.prop('checked', isChecked);

                if (isChecked === true) {
                    $closeCheckboxes.attr('disabled', 'disabled');
                    $printCheckbox.attr('disabled', 'disabled');
                    $printCheckbox.prop('checked', false);
                }
                else {
                    $closeCheckboxes.removeAttr('disabled');
                    $printCheckbox.removeAttr('disabled');
                }
            }
            else {
                $itemAndDatePickers = $tr.find('.item-picker, .input-group.date input');
            }


            // disable item and date pickers
            if (isChecked === true) {
                var $parents = $itemAndDatePickers
                    .filter(':not(:disabled)')
                    .attr('disabled', 'disabled')
                    .attr('data-custom-disabled', 'true')
                    .not('.item-picker')
                    .parent()
                    .each(function(){
                        $(this).datepicker('remove');
                    });


                //datepicker

                //console.log($itemAndDatePickers);
                //console.log($parents);

                //$parents.datepicker('remove');
            }
            else {
                $itemAndDatePickers
                    .filter('[data-custom-disabled="true"]')
                    .removeAttr('disabled')
                    .removeAttr('data-custom-disabled');
            }

        } catch (e) {
            console.error('ERROR', 'Error during main onCheckChanged', e.toString());
        }
    }


    /**
     * Invoked when swap item modal window is hidden from user
     */
    function onSwapItemModalHidden() {
        var $item = $(this).find('.swap-item-text');
        $item.removeAttr('data-selected-id');
        $item.removeAttr('data-selected-text');
        $item.typeahead('val', '');
    }

    /**
     * Invoked when swap item modal window is hidden from user
     */
    function onShipDateModalHidden() {
        var $modal = $(this);
        var $shipDatePicker = $modal.find('.input-group.date');
        var $formHorizontal = $modal.find('.form-horizontal');
        var $successMessage = $modal.find('.alert-success');

        $shipDatePicker.datepicker('clearDates');
        $formHorizontal.show();
        $successMessage.hide();
    }

    /**
     * Invoked when user click on the Filter Panel Header in the Print Picking Ticket Screen
     */
    function onFilterPanelClick(e) {

        e.preventDefault();

        var isExpanded = $('.panel-body-wrapper').attr("aria-expanded");
        if(isExpanded == "true" || isExpanded == undefined || isExpanded == null) {
            $("#filter_panel_id").text("+ Filters");
        } else if (isExpanded == "false") {
            $("#filter_panel_id").text("- Filters");
        }

        $('.panel-body-wrapper').collapse('toggle');
    }

    /**
     * Description of method onBeforeUnload
     */
    function onBeforeUnload() {
        _stateManager.saveCurrentState(_currentPage);
    }


    /**
     * itemsPickerSource - fetch data from server based on provided query
     * @param query {string} the keyword which user has typed
     * @param sync {function} the callback method to invoke synchronously
     * @param async {function} the callback method to invoke asynchronously
     */
    function itemsPickerSource(query, sync, async) {

        setTimeout(function () {

            _dataManager.getItems({query: query}, function (items) {

                try {
                    async(items.data);
                } catch (e) {
                    console.error('ERROR', 'Error during async binding.', e.toString());
                }

            });

        }, 10);

    }

    /**
     * bindItemPicker - Bind item picker control with typeahead autocomplete
     */
    function bindItemPicker(e) {
        var $el = $(this);

        if (!$el.data('itempicker_created')) {

            console.log('bind item picker control.');

            var options = {
                hint: false,
                minLength: 3,
                highlight: true
            };

            var dataSet = {
                name: 'Items',
                limit: 500,
                display: function (obj) {
                    return obj.name;
                },
                source: itemsPickerSource,
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'unable to find any items that match the current query',
                        '</div>'
                    ].join('\n')
                    //   , suggestion: function (context) {
                    //        var isPerson = context.isperson == 'T';
                    //        var name = isPerson ? (context.firstname + ' ' + context.lastname) : context.companyname;
                    //        return $('<div />').html(name);
                    //    }
                }

            };

            $el.typeahead(options, dataSet);
            $el.bind('typeahead:change', function () {
                console.log('typeahead:change: ', arguments);

                var $this = $(this);

                var selectedId = $this.attr('data-selected-id');
                var selectedText = $this.attr('data-selected-text');
                var val = $this.val();
                var isMatched = selectedText == val;

                console.log('selectedText: ', selectedText);
                console.log('val: ', val);
                console.log('selectedText == val: ', selectedText == val);

                // if it does not match,
                // then remove the last selected value.
                if (isMatched == false) {
                    $this.typeahead('val', selectedText);
                    alert('Selected item does not exist.');
                }

            }).bind('typeahead:select', function (ev, suggestion, extra) {
                console.log('typeahead:select: ', arguments);

                var $this = $(this);
                var $tr = $this.parents('tr:first');

                $this.attr('data-selected-id', suggestion.id);
                $this.attr('data-selected-text', suggestion.name);

                // only set modified class in case of item pickers inside grid
                if ( $this.is ('.item-picker') === true ) {
                    var origValue = $this.attr('data-orig-value');
                    if (origValue === suggestion.name) {
                        $tr.removeClass('modified-item');
                    }
                    else {
                        $tr.addClass('modified-item');
                    }
                }


            });

            $el.data('itempicker_created', true);

            $el.focus();
        }
    }

    var exports = {

        $grid: null,
        data: null,

        addData: function (data, page) {
        },
        preselectFilters: function(){},

        /**
         * updatePagination
         * - updates pagination label
         * - enables or disables pagination buttons
         */
        updatePagination: function () {
            console.log('updatePagination: ', arguments);

            if (_currentPage <= 1) {
                // disable prev button
                $('#btn_previous').attr('disabled', 'disabled');
            }
            else {
                // enable prev button
                $('#btn_previous').removeAttr('disabled');
            }

            // if no records found
            // then hide pagination
            var $paginationLabel = $('.pagination-label');
            if (!this.data || this.data.length <= 0) {
                $paginationLabel.empty();
            }
            else {
                var paginationLabel = 'Page ' + _currentPage;
                $paginationLabel.html(paginationLabel);
            }

        },

        createItemPicker: function (cellValue, options, rowObject) {

            // create item textbox only incase of line item
            if (!!rowObject.item) {

                var itemId = rowObject.item && rowObject.item.value;
                var disabledAttribute = parseInt(rowObject.quantity_packed) > 0 ? ' disabled="disabled" ' : '';
                var inputHtml = '<input type="text" class="form-control input-sm item-picker" ' + disabledAttribute +
                    'data-selected-id="' + itemId + '" data-selected-text="' + cellValue + '" ' +
                    'data-orig-value="' + cellValue + '" value="' + cellValue + '" />';

                return inputHtml;
            }
            else {
                return '';
            }
        },

        createItemDescriptionLink: function (cellValue, options, rowObject) {
            if (!!rowObject.item) {
                var id = (rowObject.item && rowObject.item.value) || '';
                return '<a href="javascript:;" id="itemdesc_anchor_' + id + '" onmouseover="showItemQuickView(' + id + ', ' + id + ', this);" >' + cellValue + '</a>';
            }
            else {
                return cellValue;
            }
        },

        createCustomerNameLink: function (cellValue, options, rowObject) {
            var id = (rowObject.customer && rowObject.customer.value) || '';
            return '<a href="javascript:;" id="custname_anchor_' + id + '" onmouseout="hideCustomerQuickView('+id+')" onmouseover="showCustomerQuickView(' + id + ', ' + id + ');" >' + cellValue + '</a>';
        },

        createPrintCheckbox: function (cellValue, options, rowObject) {

            // if it is mainline then show checkbox
            if (!rowObject.item) {
                return '<input type="checkbox" class="print-checkbox" data-salesorder-id="' + rowObject.id + '" />';
            }
            else {
                return '';
            }
        },

        createSalesOrderLink: function (cellValue, options, rowObject) {
            var url = '/app/accounting/transactions/salesord.nl?id=' + rowObject.id;
            return '<a href="' + url + '" target="_blank" >' + cellValue + '</a>';
        },

        createCloseCheckbox: function (cellValue, options, rowObject) {
            var itemText = (rowObject.item && rowObject.item.text) || '';
            return '<input type="checkbox" class="close-checkbox" data-salesorder-id="' + rowObject.id + '"  ' +
                ' data-item-id="' + itemText + '" />';
        },

        createShipDatePicker: function (cellValue, options, rowObject) {
            return '<div class="input-group input-group-sm date ship-date" data-orig-value="' + cellValue + '">' +
                '<input type="text" class="form-control" value="' + cellValue + '" />' +
                '<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>' +
                '</div>';
        },

        createCancelDatePicker: function (cellValue, options, rowObject) {
            // if it is mainline then show checkbox
            if (!rowObject.item) {
                return '<div class="input-group input-group-sm date cancel-date" data-orig-value="' + cellValue + '">' +
                    '<input type="text" class="form-control" value="' + cellValue + '" />' +
                    '<span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>' +
                    '</div>';
            }
            else {
                return '';
            }
        },



        afterGridComplete: function () {
            _stateManager.reloadCurrentState(_currentPage);

            //// show/hide swap item button
            //var $swapButton = $('#btn_swap_item');
            //var itemFilterValue = $('.form-control.item-text').val();
            //if ( !!itemFilterValue) {
            //    $swapButton.show();
            //}
            //else {
            //    $swapButton.hide();
            //}

        },

        /**
         * fetchGridData - fetch data from server based on selected filters
         * @param options {obj} options object, used for specifying page index.
         */
        fetchGridData: function (options) {

            console.log('fetchGridData()', arguments);
            var fetchGridDataStopWatch = StopWatch.start('fetchGridData()');

            var self = this;


            var validated = validateFilters();

            // if not valid then return
            if (validated === false) {
                return;
            }


            showLoading();

            var serializedData = $('.form-horizontal :input').serializeObject();

            if (!!validated.customerId) {
                serializedData.customer = validated.customerId;
            }


            _currentPage = options.page || 1;
            var pageIndex = _currentPage - 1;

            var getSalesOrdersStopWatch = StopWatch.start('getSalesOrders()');
            _dataManager.getSalesOrders(serializedData, pageIndex, function (data) {
                console.log('fetchGridData() // ajax complete: ', arguments);
                getSalesOrdersStopWatch.stop();

                // store data in global variable
                self.data = data;

                setTimeout($.proxy(function () {

                    this.addData(this.data, _currentPage);

                    // update pagination
                    this.updatePagination();

                    // hide loading when data is added in grid
                    hideLoading();

                    fetchGridDataStopWatch.stop();

                }, self), 10);

            });

        },

        bindDropdowns: function () {

            var $customerDropdown = $('.customer-dropdown');

            var typeaheadOptions = {
                hint: false,
                minLength: 3,
                highlight: true
            };
            var customerDataset = {
                name: 'customers',
                limit: 500,
                display: function (obj) {
                    var isPerson = obj.isperson === 'T';
                    var name = isPerson ? (obj.firstname + ' ' + obj.lastname) : obj.companyname;
                    return obj.entityid + ' ' + name;
                },
                source: function (query, sync, async) {

                    setTimeout(function () {
                        _dataManager.getCustomers({
                            query: query
                        }, function (customers) {
                            try {
                                async(customers.data);
                            } catch (e) {
                                console.error('ERROR', 'Error during async binding.', e.toString());
                            }
                        });
                    }, 10);

                },
                templates: {
                    empty: [
                        '<div class="empty-message">',
                        'unable to find any customers that match the current query',
                        '</div>'
                    ].join('\n')
                }
            };

            $customerDropdown.typeahead(typeaheadOptions, customerDataset);
            $customerDropdown.bind('typeahead:change', function (ev, val) {
                console.log('typeahead:change: ', arguments);

                var $this = $(this);

                var selectedId = $this.attr('data-selected-id');
                var selectedText = $this.attr('data-selected-text');
                var selectedEntityId = $this.attr('data-selected-entityid');
                var text = selectedEntityId + ' ' + selectedText;
                var isMatched = text == val;

                console.log('text: ', text);
                console.log('val: ', val);
                console.log('text == val: ', text == val);

                // if it does not match,
                // then remove the last selected value.
                if (isMatched == false) {
                    $this.attr('data-selected-id', '');
                    $this.attr('data-selected-text', '');
                    $this.attr('data-selected-entityid', '');
                }

            }).bind('typeahead:select', function (ev, suggestion) {
                console.log('typeahead:select: ', arguments);

                var name = suggestion.isperson == 'T'
                    ? (suggestion.firstname + ' ' + suggestion.lastname)
                    : suggestion.companyname;

                var $this = $(this);
                $this.attr('data-selected-id', suggestion.id);
                $this.attr('data-selected-entityid', suggestion.entityid);
                $this.attr('data-selected-text', name);
            });

        },


        /**
         * fetchPrevPageItems - invoked when prev button is clicked
         * @param e {Event} details of current event
         */
        fetchPrevPageItems: function (e) {
            var $btnPrev = $('#btn_previous');

            // store current grid state
            _stateManager.saveCurrentState(_currentPage);

            // fetch data of prev page
            _currentPage--;
            this.fetchGridData({page: _currentPage});

            // if it is last page, then disable prev button
            if (_currentPage == 1) {
                $btnPrev.attr('disabled', 'disabled');
            }

            $btnPrev.blur();
            e.preventDefault();
        },

        /**
         * markAllPrintCheckboxes - invoked when mark all button is clicked
         * @param e {Event} details of current event
         */
        markAllPrintCheckboxes: function( e ) {

            this.$grid.find('.print-checkbox:not(:disabled)').prop('checked', true);

            $(e.target).blur();
            e.preventDefault();
        },

        /**
         * unmarkAllPrintCheckboxes - invoked when unmark all button is clicked
         * @param e {Event} details of current event
         */
        unmarkAllPrintCheckboxes: function( e ) {

            this.$grid.find('.print-checkbox').prop('checked', false);

            $(e.target).blur();
            e.preventDefault();
        },


        /**
         * fetchNextPageItems - invoked when next button is clicked
         * @param e {Event} details of current event
         */
        fetchNextPageItems: function (e) {
            var $this = $('#btn_next');

            // enable prev button
            $('#btn_previous').removeAttr('disabled');

            // save current grid state
            _stateManager.saveCurrentState(_currentPage);

            // fetch data of next page
            _currentPage++;
            this.fetchGridData({page: _currentPage});

            $this.blur();
            e.preventDefault();
        },

        /**
         * Description of method onFilter
         */
        onFilter: function () {

            _stateManager.clearState();

            this.fetchGridData({page: 1});
        },


        /**
         * Description of method onSubmit
         */
        onSubmit: function () {
            try {
                debugger;
                console.log('onSubmit()', arguments);

                // save current page selection in localstorage
                _stateManager.saveCurrentState(_currentPage);

                var finalData = _stateManager.getAllData();

                if (finalData.checkbox.orders.length <= 0 &&
                    finalData.checkbox.items.length <= 0 &&
                    finalData.checkbox.prints.length <= 0 &&
                    _.size(finalData.salesorders) <= 0) {
                    alert('Please modify at least one sales order/item');
                    return;
                }

                console.log(finalData);

                $('#load_jqGrid').html('Submitting Changes...');
                showLoading();

                _dataManager.submit(finalData, $.proxy(function (result) {

                    $('#load_jqGrid').html('Loading...');
                    hideLoading();

                    _stateManager.clearState();

                    $('#submitChangesSuccessModal').modal('show');

                    // rebind grid with cleared state
                    this.fetchGridData({page: 1});
                }, this));


                //fetchPrevPageItems()

            } catch (e) {
                console.error('ERROR', 'Error during main onSubmit', e.toString());
            }
        },


        onModalDialogClose : function() {
            console.log("onModalDialogClose");
            $('#submitChangesSuccessModal').modal('hide');
            location.reload();
        },

        bindGrid: function () {


        },

        init: function () {

            console.log('init');

            var margins = 60;
            $.jgrid.defaults.width = $('#main_form').innerWidth();

            // cache UI elements
            this.$grid = $("#jqGrid");

            // create manager classes
            _dataManager = new DataManager();
            _tooptipManager = new TooltipManager(window);
            _stateManager = new StateManager(this.$grid);


            // bind grid and dropdown
            this.bindGrid();
            this.bindDropdowns();


            // apply datepicker on filters
            $('.filters .input-group.date, #swapShipDateModal .input-group.date').datepicker({
                format: "m/d/yyyy",
                clearBtn: true,
                autoclose: true
            });


            // register events
            this.$grid.on('click', 'tr .close-checkbox', onCheckChanged);
           // this.$grid.on('focusin click', '.input-group.date', bindDatePicker);
            this.$grid.on('focusin', '.item-picker', bindItemPicker);


            // initiate item picker on swap item textbox
            bindItemPicker.apply($('.swap-item-text'));

            $(window).on('beforeunload', onBeforeUnload);
            $('#btn_previous').on('click', $.proxy(this.fetchPrevPageItems, this));
            $('#btn_next').on('click', $.proxy(this.fetchNextPageItems, this));
            $('#btn_mark_all').on('click', $.proxy(this.markAllPrintCheckboxes, this));
            $('#btn_unmark_all').on('click', $.proxy(this.unmarkAllPrintCheckboxes, this));
            $('.btn-apply-filters').on('click', $.proxy(this.onFilter, this));
            $('.btn-submit').on('click', $.proxy(this.onSubmit, this));
            $('.btn_swap_modal_ok').on('click', $.proxy(this.swapItem, this));
            $('.btn_ship_date_modal_ok').on('click', $.proxy(this.swapShipDate, this));

            $('#modalClose').on('click',$.proxy(this.onModalDialogClose,this));

            //$('#league').on('change', $.proxy(this.bindTeamsDropdown, this));

            $('#swapItemModal').on('hidden.bs.modal', onSwapItemModalHidden);
            $('#swapShipDateModal').on('hidden.bs.modal', onShipDateModalHidden);
            $('#filter_panel_id').on('click', onFilterPanelClick);

        }
    };


    return exports;
});


/**
 * PPTGridManager class to handle
 * all the grid operations related to PPT
 */
var PPTUIManager = UIManager.extend(function PPTUIManager(base) {

    function addClass(el, cl) {
        if (el.className.indexOf(cl) === -1)
            el.className += ' ' + cl;
    }

    var exports = {

        onGridCompleteInner: function () {
            console.log('onGridCompleteInner()', arguments);

            var self = this;
            var onGridCompleteStopWatch = StopWatch.start('onGridComplete()');
            var $gridContainer = $('.ui-jqgrid');
            var $gridScroller = $('.ui-jqgrid-bdiv');
            var $emptyMessageDiv = $('.empty-grid-message');

            try {

                // scroll grid to top
                $gridScroller.scrollTop(0);

                // if no data found
                // then do nothing
                if (!this.data || this.data.length<=0) {

                    $gridContainer.hide();
                    $emptyMessageDiv.show();

                    return;
                }
                else {
                    $emptyMessageDiv.hide();
                    $gridContainer.show();
                }


                var forDataStopWatch = StopWatch.start('for ._data()');
                for (var i = 0; i < this.data.length; i++) {
                    var obj = this.data[i];
                    var id = 'row_' + obj.guid;
                    var $row = document.getElementById(id); // _$rows.filter('#' + id);

                    if (!$row) {
                        continue;
                    }

                    //$row.attr('data-is-mainline', !obj.item);
                    //$row.attr('data-salesorder-id', obj.id);
                    $row.setAttribute('data-is-mainline', !obj.item);
                    $row.setAttribute('data-salesorder-id', obj.id);
                    $row.setAttribute('data-line-id', obj.line_id);

                    // set background-color to gray if: current line item is main line
                    if (!obj.item) {
                        addClass($row, 'bg-mainorder');
                        //$row.addClass('bg-mainorder');
                    }
                    else {
                        // set background-color to yellow if: current line item is on_hold = yes: warning
                        if (obj.on_hold == 'T') {
                            addClass($row, 'bg-yellow');
                            //$row.addClass('bg-yellow');
                        }
                        else {
                            // set background-color to pink if: current line item does not support backorder
                            if (obj.back_order_allowed && obj.back_order_allowed.text === 'No') {
                                addClass($row, 'bg-orange');
                                //$row.addClass('bg-orange');
                            }
                        }

                        // set color to brown if: current line item has quantity_committed = 0
                        if (obj.quantity_committed == 0) {
                            addClass($row, 'text-brown');
                            //$row.addClass('text-brown');
                        }
                        else {
                            // set color to green if: remaining quantity is less than 0
                            if (parseInt(obj.remaining_quantity) == 0) {
                                addClass($row, 'text-green');
                                //$row.addClass('text-green');
                            }
                        }
                    } // end else
                } // end loop
                forDataStopWatch.stop();


                // reload current state
                setTimeout(function () {
                    self.afterGridComplete();
                }, 10);

            } catch (e) {
                console.error('Error in onGridComplete:', e)
            }

            onGridCompleteStopWatch.stop();
        },

        addData: function (data) {

            this.data = data;

            // add data in grid
            if (!this.data || this.data.length <= 0) {
                var clearGridDataStopWatch = StopWatch.start('clearGridData()');
                this.$grid.clearGridData();
                clearGridDataStopWatch.stop();
            } else {
                var addJSONDataStopWatch = StopWatch.start('addJSONData()');
                this.$grid[0].addJSONData(this.data);
                addJSONDataStopWatch.stop();
            }
        },

        bindGrid: function () {
            var self = this;

            // datatype: http://www.trirand.com/jqgridwiki/doku.php?id=wiki:retrieving_data#function
            // disable selection: http://stackoverflow.com/questions/18084214/disable-row-select-in-jqgrid-on-right-click
            this.$grid.jqGrid({
                styleUI: 'Bootstrap',
                datatype:  function (options){
                    self.fetchGridData(options);
                },
                idPrefix: 'row_',
                shrinkToFit: false,
                loadui: 'block',
                hoverrows: false,
                pgbuttons: false,
                pgtext: null,
                beforeSelectRow: function (rowid, e) {
                    return false;
                },
                onSelectRow: function () {
                    return false;
                },
                onRightClickRow: function () {
                    self.$grid.jqGrid('resetSelection');
                },
                gridComplete: function(){
                    self.onGridCompleteInner();
                },
                colModel: [
                    {sortable: false, hidden: true, label: '', name: 'guid', key: true},
                    {sortable: false, label: 'Print', name: 'id', width: 50, formatter: this.createPrintCheckbox},
                    {sortable: false, label: 'Name', name: 'customer.text', width: 450, formatter: this.createCustomerNameLink},
                    {sortable: false, label: 'PO Number', name: 'po_number', width:200},
                    {sortable: false, label: 'PT Sort Identifier', name: 'pt_sort_identifier', width: 200},
                    {sortable: false, label: 'SO Number', name: 'so_number', width: 200},
                    {sortable: false, label: 'Amount', name: 'amount', width: 200},

                ],
                viewrecords: false, // show records label in footer
                height: 600,
                //rowTotal: 1000,
                //loadonce: true,
                rowNum: 100,
                pager: "#jqGridPager"
            });
        }
    };

    return exports;
});