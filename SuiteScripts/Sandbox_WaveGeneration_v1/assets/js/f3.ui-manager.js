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
var number;
var previousId;
(function($){
    $.fn.serializeObject = function () {
        "use strict";

        var result = {};
        var extend = function (i, element) {
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

        var $customerIsNotDropdown = $('.customer-is-not-dropdown');
        var customerIsNotText = $customerIsNotDropdown.val();
        var customerIsNotId = $customerIsNotDropdown.attr('data-selected-id');

        // validate customer
        if (!customerId && customerText != "") {
            alert('Selected customer is not valid!');
            $customerDropdown.focus();
            return false;
        }

        return {
            customerId: customerId,
            customerText: customerText,
            customerIsNotId : customerIsNotId,
            customerIsNotText: customerIsNotText
        };
    }

    function initDatePicker($el) {
        if (!$el.data('datepicker_created')) {
            console.log('register date picker control.');

            $el.data('datepicker_created', true);

            $el.datepicker({
                format: "m/d/yyyy",
                clearBtn: true,
                autoclose: true
            });

            if ($el.is('.ship-date')) {
                $el.on('changeDate', onShipDateChanged);
            }
            else if ($el.is('.cancel-date')) {
                $el.on('changeDate', onCancelDateChanged);
            }
        }
    }


    /**
     * bindDatePicker - Bind date picker control with textboxes
     */
    function bindDatePicker(e) {
        var $this = $(this);

        if ( $this.find('input').is(':disabled')) {
            e.cancelBubble = true;
            e.preventDefault();
            return;
        }

        initDatePicker($this);

        console.log('show date picker.');
        $this.datepicker('show');

        e.cancelBubble = true;
        e.preventDefault();
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
     * Description of method onShipDateChanged
     * @param parameter
     */
    function onShipDateChanged(e) {
        try {
            console.log('onShipDateChanged()', arguments);

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
                $tr.removeClass('modified-ship-date');
            }
            else {
                $tr.addClass('modified-ship-date');
            }

            // update ship date in all line items
            if (isMainline === true) {
                var salesorderId = $tr.attr('data-salesorder-id');
                var $siblingRows = $tr.parent().find('tr[data-salesorder-id="' + salesorderId + '"]').not($tr);
                $siblingRows.find('.input-group.ship-date input:not(:disabled)').parent().each(function (i, item) {
                    console.log('each: ',i, item);
                    var $this = $(this);
                    var $thisTr = $this.parents('tr:first');
                    var lineVal = val;
                    var lineOrigVal = $this.attr('data-orig-value');

                    $this.datepicker('setDate', lineVal);

                    if (lineVal === lineOrigVal) {
                        $thisTr.removeClass('modified-ship-date');
                    }
                    else {
                        $thisTr.addClass('modified-ship-date');
                    }
                });
            }

            //e.cancelBubble = true;
            //e.preventDefault();

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

                var $closeCheckboxes = $siblingRows.find('input.close-checkbox:not(:disabled)').not($input);
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
     * Invoked when user leave the customer textbox.
     */
    function onCustomerFocusOut(e) {

        console.log('onCustomerFocusOut','asdsa');

        var val = $("#customer").val();

        if(val != "" && val != undefined) {
            $("#customer_is_not").attr("disabled","disabled");
        } else {
            $("#customer_is_not").removeAttr("disabled");
        }
    }

    function onCustomerIsNotFocusOut(e) {

        console.log('onCustomerIsNotFocusOut','asdsa');

        var val = $("#customer_is_not").val();

        if(val != "" && val != undefined) {
            $("#customer").attr("disabled","disabled");
        } else {
            $("#customer").removeAttr("disabled");
        }
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
                    return obj.name;// + "|" + obj.quantityavailable + "|" + obj.salesdescription;
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
                var shouldFlash = rowObject.is_substitute_for && rowObject.is_substitute_for.quantityavailable > 0
                    || rowObject.substitute && !(rowObject.quantity_committed > 0);
                var itemId = rowObject.item && rowObject.item.value;
                var disabledAttribute = parseInt(rowObject.quantity_packed) > 0 ? ' disabled="disabled" ' : '';
                var inputHtml = '<input type="text" class="form-control input-sm item-picker '+ (shouldFlash ? 'flash-red' : '') +'" ' + disabledAttribute +
                    'data-selected-id="' + itemId + '" data-selected-text="' + cellValue + '" ' +
                    'data-orig-value="' + cellValue + '" value="' + cellValue + '" ' +
                    'data-toggle="popover" data-placement="bottom" ' +
                    '/>';

                return inputHtml;
            }
            else {
                function encodeAttribute(text) {
                    return text.replace(/"/g, '&quot;');
                }
                //return '';
                // var id = (rowObject.name && rowObject.name.value) || '';
                // return '<a href="javascript:;" id="custname_anchor_' + id + '" onmouseout="hideCustomerQuickView('+id+')" onmouseover="showCustomerQuickView(' + id + ', ' + id + ');" >' + rowObject.name.text + '</a>';

                var id = (rowObject.name && rowObject.name.value) || '';
                var content = '<div>'+(rowObject.custbody_ptcmnt ? rowObject.custbody_ptcmnt : '')+'</div><br />'
                    + '<div>'+(rowObject.shipmethod ? rowObject.shipmethod.text : '')+'</div>';

                return '<a href="javascript:;" class="customer-name-anchor" ' +
                    'data-content="'+ encodeAttribute(content) +'" ' +
                    'data-toggle="popover" data-placement="bottom" ' +
                    'id="custname_anchor_' + id + '">' + rowObject.name.text + '</a>';

                // var id = (rowObject.name && rowObject.name.value) || '';
                // return '<a href="javascript:;" id="custname_anchor_' + id + '" onmouseout="hideCustomerQuickView('+id+')" onmouseover="showCustomerQuickView(' + id + ', ' + id + ');" >' + "" + '</a>';
            }
        },

        createItemDescriptionLink: function (cellValue, options, rowObject) {
            if (!!rowObject.item) {
                var id = (rowObject.item && rowObject.item.value) || '';
                // return '<a href="javascript:;" id="itemdesc_anchor_' + id + '" onclick="showItemQuickView(' + id + ', ' + id + ', this);" >' + cellValue + '</a>';/**/
                return '<a href="javascript:;" class="itemdesc_anchor" id="itemdesc_anchor_' + id + '" ' +
                    ' data-selected-text="' + (rowObject.item.text) + '" ' +
                    'data-toggle="popover" data-placement="bottom" ' +
                    '>' + cellValue +
                    '</a>';
            }
            else {
                return cellValue;
            }
        },

        createCustomerNameLink: function (cellValue, options, rowObject) {
            var id = (rowObject.name && rowObject.name.value) || '';
            return '<a href="javascript:;" id="custname_anchor_' + id + '" onmouseout="hideCustomerQuickView('+id+')" onmouseover="showCustomerQuickView(' + id + ', ' + id + ');" >' + cellValue + '</a>';
        },

        createStatusAndCustomerNameLink: function (cellValue, options, rowObject) {
            var customer = rowObject.name.text;
            var id = (rowObject.name && rowObject.name.value) || '';
            return '<span>' + cellValue + '</span> / <a href="javascript:;" id="custname_anchor_' + id + '" onmouseout="hideCustomerQuickView('+id+')" onclick="showCustomerQuickView(' + id + ', ' + id + ');" >' + customer + '</a>';
        },
/*
        createPrintCheckbox: function (cellValue, options, rowObject) {

            // if it is mainline then show checkbox
            if (!rowObject.item) {
                return '<input type="checkbox" class="print-checkbox" data-salesorder-id="' + rowObject.id + '" />';
            }
            else {
                return '';
            }
        },
*/
        createSalesOrderLink: function (cellValue, options, rowObject) {
            /*if (rowObject.number) {
             number = rowObject.number;
             }
             else if (!rowObject.next_receipt) {
             number = rowObject.number_nextreceipt;
             }*/
            if (rowObject.number) {
                number = rowObject.number;
            }
            else {
                number = rowObject.id;
            }
            var url = '/app/accounting/transactions/salesord.nl?id=' + rowObject.id;
            return '<a href="' + url + '" target="_blank" >' + number + '</a>';
        },

        createCloseCheckbox: function (cellValue, options, rowObject) {
            var itemText = (rowObject.item && rowObject.item.text) || '';
             var disabledAttribute1 = parseInt(rowObject.quantity_committed) == 0 ? ' disabled="disabled" ' : '';

            return '<input type="checkbox" class="close-checkbox" ' +disabledAttribute1+ ' data-salesorder-id="' + rowObject.id + '"  ' +
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

            if (!!validated.customerIsNotId) {
                serializedData.customer_is_not = validated.customerIsNotId;
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


        bindTeamsDropdown: function() {
            console.log('bindTeamsDropdown();');

            var league = $('#league option:selected').val();

            // remove all options
            $('#team').find('option').remove();



        },

        bindDropdowns: function () {

            // fill partners dropdown
            _dataManager.getPartners(function (result) {

                // make it async
                setTimeout(function () {
                    var select = document.getElementById('partner');
                    var selectNonPartner = document.getElementById('partner_is_not');
                    if (result.status_code === 200) {

                        // add each item on UI
                        $.each(result.data, function (i, item) {
                            var name = item.isperson === 'T' ? (item.firstname + ' ' + item.lastname) : item.companyname;
                            select.options[select.options.length] = new Option(name, item.id);
                        });

                        $.each(result.data, function (i, item) {
                            var name = item.isperson === 'T' ? (item.firstname + ' ' + item.lastname) : item.companyname;
                            selectNonPartner.options[selectNonPartner.options.length] = new Option(name, item.id);
                        });
                    }
                }, 10);
            });



            // fill partners dropdown
            _dataManager.getProductTypes(function (result) {

                // make it async
                setTimeout(function () {
                    var select = document.getElementById('product_type');
                    if (result.status_code === 200) {

                        // add each item on UI
                        $.each(result.data, function (i, item) {
                            var name = item.name;
                            select.options[select.options.length] = new Option(name, item.id);
                        });
                    }
                }, 10);
            });


            // fill locations dropdown
            _dataManager.getLocations(function (result) {

                // make it async
                setTimeout(function () {
                    var select = document.getElementById('warehouse');
                    if (result.status_code === 200) {

                        // add each item on UI
                        $.each(result.data, function (i, item) {
                            select.options[select.options.length] = new Option(item.name, item.id);
                        });
                    }
                }, 10);
            });



            // fill locations dropdown
            _dataManager.getLeagues(function (result) {

                // make it async
                setTimeout(function () {
                    var select = document.getElementById('league');
                    if (result.status_code === 200) {

                        // add each item on UI
                        $.each(result.data, function (i, item) {
                            select.options[select.options.length] = new Option(item.name, item.id);
                        });
                    }
                }, 10);
            });

            // fill locations dropdown
            _dataManager.getTeams(null, function (result) {

                // make it async
                setTimeout(function () {

                    var select = document.getElementById('team');
                    if (result.status_code === 200) {

                        // add each item on UI
                        $.each(result.data, function (i, item) {
                            select.options[select.options.length] = new Option(item.name, item.id);
                        });

                        //defaut settings for user are loaded here so that all dropdowns are loaded with data first
                        _dataManager.loadDefaultSettings();
                    }
                }, 10);
            });



            var $customerDropdown = $('.customer-dropdown');
            var $customerIsNotDropdown = $('.customer-is-not-dropdown');
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

            $customerIsNotDropdown.typeahead(typeaheadOptions, customerDataset);
            $customerIsNotDropdown.bind('typeahead:change', function (ev, val) {
                console.log('typeahead1:change: ', arguments);

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

            this.$grid.find('.close-checkbox:not(:disabled)').prop('checked', true); //('.close-checkbox:not(:disabled)')

            $(e.target).blur();
            e.preventDefault();
        },

        /**
         * unmarkAllPrintCheckboxes - invoked when unmark all button is clicked
         * @param e {Event} details of current event
         */
        unmarkAllPrintCheckboxes: function( e ) {

            this.$grid.find('.close-checkbox').prop('checked', false);

            $(e.target).blur();
            e.preventDefault();
        },


        /**
         * swapShipDate - invoked when swap Ship Date button is clicked
         * @param e {Event} details of current event
         */
        swapShipDate: function( e ) {

            var $modal = $('#swapShipDateModal');
            var $shipDateTextbox = $modal.find('.swap-ship-date-text');
            var $formHorizontal = $modal.find('.form-horizontal');
            var $successMessage = $modal.find('.alert-success');

            $formHorizontal.hide();
            $successMessage.show();


            var val = $shipDateTextbox.datepicker('getDate');

            var setDateStopWatch = StopWatch.start('$this.datepicker("setDate", ' + val + ')');
            var $trs = this.$grid.find('tr');
            var mainlineItems = $trs.filter('[data-is-mainline="true"]');
            var mainlineIds = mainlineItems.map(function() {
                return this.getAttribute('data-salesorder-id');
            }).toArray();

            var lineitems = $trs.filter('[data-is-mainline="false"]');
            var lineitemSOIds = lineitems.map(function() {
                return this.getAttribute('data-salesorder-id');
            }).toArray();

            lineitemSOIds = _.difference(lineitemSOIds, mainlineIds);

            var foundIds = mainlineIds.concat(lineitemSOIds);


            // to prevent DOM references inside setTimeout
            setTimeout(function() {

                _.each(foundIds , function(soId) {
                    console.log('setting ship date on: ' + soId);
                    var $row = $trs.filter('[data-salesorder-id="' + soId + '"]');
                    var $datepicker = $row.find('.input-group.ship-date');
                    $datepicker.each(function() {
                        var $this = $(this);
                        initDatePicker($this);
                        $this.datepicker('setDate', val);
                    });
                });

                setDateStopWatch.stop();
                $modal.modal('hide');
            }, 50);

            $(e.target).blur();
            e.preventDefault();
        },

        /**
         * swapItem - invoked when swap item button is clicked
         * @param e {Event} details of current event
         */
        swapItem: function( e ) {
            var swapItemStopWatch = StopWatch.start('swapItem()');


            var $modal = $('#swapItemModal');
            var $itemTextbox = $modal.find('.swap-item-text');

            // get all item pickers in grid
            var $itemPickers = this.$grid.find('.item-picker:not(:disabled)');

            var selectedSuggestion = {
                id: $itemTextbox.attr('data-selected-id'),
                name: $itemTextbox.attr('data-selected-text')
            };

            //alert(selectedSuggestion.id);
            //alert(selectedSuggestion.name);

            if (!selectedSuggestion.id || !selectedSuggestion.name) {
                alert('Please select an item to swap.');
                return;
            }

            // filter only selected items
            var $filteredItemPickers = $itemPickers;

            console.log('$selectedItemPickers: ', $filteredItemPickers);

            // iterate them, and invoke selection
            $filteredItemPickers.each(function() {
                var $this = $(this);

                // if both values are same, then we donot need to invoke autocomplete.
                //if ( $this.attr('data-selected-text') == selectedSuggestion.name) {
                //    return;
                //}

                //$this.attr('data-orig-value', item.orig_item_text);
                $this.attr('data-selected-id', selectedSuggestion.id);
                $this.attr('data-selected-text', selectedSuggestion.name);
                $this.val(selectedSuggestion.name);


                var $itemRow = $this.parents('tr:first');
                var origValue = $this.attr('data-orig-value');
                if (origValue === selectedSuggestion.name) {
                    $itemRow.removeClass('modified-item');
                }
                else {
                    $itemRow.addClass('modified-item');
                }


            });


            $modal.modal('hide');

            $(e.target).blur();
            e.preventDefault();


            swapItemStopWatch.stop();
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


            var $swapItemButton = $('#btn_swap_item');
            var $item = $('#item');
            var itemVal = $item.val().trim();
            if (!!itemVal) {
                $swapItemButton.removeAttr('disabled');
            }
            else {
                $swapItemButton.attr('disabled', 'disabled');
            }


            this.fetchGridData({page: 1});
        },

        saveDefaultSettings: function() {
            var settings = {};

            /*settings. printed_picking_ticket = $("#printed_picking_ticket").val();
             settings.warehouse = $("#warehouse").val();
             settings.customer = $("#customer").val();
             settings.item = $("#item").val();
             settings.can_be_on_so = $("#can_be_on_so").val();
             settings.ready_to_print = $("#ready_to_print").val();
             settings.ship_date_from = $("#ship_date_from").val();
             settings.customer_is_not = $("#customer_is_not").val();
             settings.item_discontinued = $("#item_discontinued").val();
             settings.print_status = $("#print_status").val();
             settings.ready_to_print = $("#ready_to_print").val();
             settings.ready_to_print = $("#ready_to_print").val();
             settings.ready_to_print = $("#ready_to_print").val();
             settings.ready_to_print = $("#ready_to_print").val();
             settings.ready_to_print = $("#ready_to_print").val();
             settings.ready_to_print = $("#ready_to_print").val();
             settings.ready_to_print = $("#ready_to_print").val();*/

            var serializedData = $('.form-horizontal :input').serializeObject();

            var validated = validateFilters();

            // if not valid then return
            if (validated === false) {
                return;
            }

            if (!!validated.customerId) {
                serializedData.customer = validated.customerId;
                serializedData.customer_text = validated.customerText;
            }

            if (!!validated.customerIsNotId) {
                serializedData.customer_is_not = validated.customerIsNotId;
                serializedData.customer_is_not_text = validated.customerIsNotText;
            }

            showLoading();

            var context = nlapiGetContext();
            var name = context.getName();
            var userId = context.getUser();

            var searchResult = nlapiSearchRecord('customrecord_ppt_default_settings', null, new nlobjSearchFilter('custrecord_userid', null, 'is', userId))


            if (searchResult) {
                var id = searchResult[0].getId();
                var record = nlapiLoadRecord('customrecord_ppt_default_settings', id);
                record.setFieldValue('custrecord_settings', JSON.stringify(serializedData));
                nlapiSubmitRecord(record);
            }
            else {
                var newRecord = nlapiCreateRecord('customrecord_ppt_default_settings');
                newRecord.setFieldValue('custrecord_userid', userId);
                newRecord.setFieldValue('custrecord_settings', JSON.stringify(serializedData));
                newRecord.setFieldValue('name', name + " Default Settings");
                nlapiSubmitRecord(newRecord);
            }
            hideLoading();

        },


        /**
         * Description of method onSubmit
         */
        onSubmit: function () {
            try {
                console.log('onSubmit()', arguments);

                // save current page selection in localstorage
                _stateManager.saveCurrentState(_currentPage);

                var finalData = _stateManager.getAllData();

                if (finalData.checkbox.orders.length <= 0 &&
                    finalData.checkbox.items.length <= 0 &&
                  //  finalData.checkbox.prints.length <= 0 &&
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


        bindGrid: function () {


        },

        init: function (type) {

            this.preselectFilters();

            var margins = 60;
            $.jgrid.defaults.width = $('#main_form').innerWidth();

            // cache UI elements
            this.$grid = $("#jqGrid");

            // create manager classes
            _dataManager = new DataManager(type);
            _tooptipManager = new TooltipManager(window);
            _stateManager = new StateManager(this.$grid, type);


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
            this.$grid.on('focusin click', '.input-group.date', bindDatePicker);
            this.$grid.on('focusin', '.item-picker', bindItemPicker);

            this.$grid.on('click', '.itemdesc_anchor', function () {
                $el = $(this);
                if (!$el.data('bs.popover')) {
                    $('[data-toggle="popover"]').not($el).popover('hide');
                    itemsPickerSource($el.attr('data-selected-text'), null, function (obj) {
                        data = obj[0];
                        $el.popover({
                            content: function() {
                                return '<div>'+data.custitem_internalimagethumb+'</div>' +
                                    '<div>Available Qty: ' + data.quantityavailable+'</div>' +
                                    '<div>On Order Qty: ' + data.quantityonorder+'</div>' +
                                    '<div>Buildable Qty: ' + data.custitem_buildableqty+'</div>' +
                                    '<div>Is Sub For: ' + (data.custitem_is_substitute_for ? (data.custitem_is_substitute_for.text + ' | ' + (data.custitem_is_substitute_for.quantityavailable || 0)) : '') +'</div>' +
                                    '<div>Substitute: ' + (data.custitem_substitute ? (data.custitem_substitute.text + ' | ' + (data.custitem_substitute.quantityavailable || 0)) : '') +'</div>';

                                // return data ? (data.name + "|" + data.available + "|" + data.salesdescription) : ''
                            },
                            html: true,
                            trigger: 'manual'
                        }).popover('show');
                    });
                }
                else {
                    $el.popover('toggle');
                }
            });

            this.$grid.on('click', '.customer-name-anchor', function () {
                $el = $(this);
                $('[data-toggle="popover"]').not($el).popover('hide');
                if (!$el.data('bs.popover')) {
                    $el.popover({
                        html: true,
                        trigger: 'manual'
                    }).popover('show');
                }
                else {
                    $el.popover('toggle');
                }
            });

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


            //$('#league').on('change', $.proxy(this.bindTeamsDropdown, this));

            $('#swapItemModal').on('hidden.bs.modal', onSwapItemModalHidden);
            $('#swapShipDateModal').on('hidden.bs.modal', onShipDateModalHidden);
            $('#filter_panel_id').on('click', onFilterPanelClick);
            $('#customer').on('focusout', onCustomerFocusOut);
            $('#customer_is_not').on('focusout', onCustomerIsNotFocusOut);
            $('.save-default').on('click', $.proxy(this.saveDefaultSettings, this));


        }
    };


    return exports;
});








/**
 * OrderReviewGridManager class to handle
 * all the grid operations related to Order Review
 */
var OrderReviewUIManager = UIManager.extend(function OrderReviewUIManager(base) {

    function addClass(el, cl) {
        if (el.className.indexOf(cl) === -1)
            el.className += ' ' + cl;
    }


    var itemsRunningTotal = {};
    function manageItemRunningTotal(item, quantity, totalavailable) {

        var currentTotal = '';

        if (!!itemsRunningTotal[item]) {
            currentTotal = itemsRunningTotal[item];
        }
        else {
            currentTotal = totalavailable;
        }

        var remaining = parseInt(currentTotal) - parseInt(quantity);
        itemsRunningTotal[item] = remaining;

        return remaining;
    }

    function formatData (data, page) {

        // get items running total of previous page
        var cacheKeyPreviousPage = 'OrderReview_ItemsRunningTotal_' + (page - 1);
        var cacheKeyCurrentPage = 'OrderReview_ItemsRunningTotal_' + (page);
        itemsRunningTotal = $.jStorage.get(cacheKeyPreviousPage) || {};
        console.log('itemsRunningTotal: ', itemsRunningTotal);

        // merge current page's items running total with previous page
        for (var i = 0; i < data.length; i++) {
            var obj = data[i];

            // if it is mainline, then skip
            if (!obj.item) {
                continue;
            }

            var openQuantity = parseInt(obj.open_quantity) || 0;
            var availableQuantity = parseInt(obj.item_available_quantity) || 0;
            var item = obj.item && obj.item.text;
            var remaining = manageItemRunningTotal(item, openQuantity, availableQuantity);

            obj.cust_total_available_quantity = itemsRunningTotal[item];
        }

        // store in cache for one hour
        var oneSecond = 1000;
        var oneMinute = 60 * oneSecond;
        var oneHour = 60 * oneMinute;
        $.jStorage.set(cacheKeyCurrentPage, itemsRunningTotal, {TTL: oneHour});
        console.log('itemsRunningTotal: ', itemsRunningTotal);


        //for (var i = 0; i < data.length; i++) {
        //    var obj = data[i];
        //
        //    // if it is mainline, then skip
        //    if (!obj.item) {
        //        continue;
        //    }
        //
        //    var item = obj.item && obj.item.text;
        //    obj.cust_total_available_quantity = itemsRunningTotal[item];
        //}

        return data;
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
                if (!this.data || this.data.length <= 0) {

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
                    }
                    else if (obj.back_order_allowed && obj.back_order_allowed.text === 'No') {
                        addClass($row, 'bg-orange');
                    } else {

                        // set background-color to yellow if: current line item is on_hold = yes: warning
                        if (obj.on_hold == 'T') {
                            addClass($row, 'bg-yellow');
                        }

                        var item = obj.item && obj.item.text;
                        var remaining = itemsRunningTotal[item];
                        if (remaining >= 0) {
                            addClass($row, 'text-bright-green');
                        }
                        else {
                            addClass($row, 'text-red');
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

        addData: function (data, page) {

            this.data = formatData(data, page);

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

        preselectFilters: function(){
            var $options = $('.status-dropdown option');
            //$options.each(function(){
            //    $(this).prop('selected', false);
            //});

            $options.first().prop('selected', true);
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
              /*      {sortable: false, label: 'Approve', name: 'id', width: 70, formatter: this.createPrintCheckbox}, */
                    {
                        sortable: false,
                        label: 'Wave',
                        name: 'line_id',
                        width: 50,
                        formatter: this.createCloseCheckbox
                    },
                    {sortable: false, label: 'Date', name: 'date', width: 100},
                    {sortable: false, label: 'Status', name: 'status', width: 125},
                    {sortable: false, label: 'Partner', name: 'partner.text', width: 200},
                    {
                        sortable: false,
                        label: 'Number',
                        name: 'number',
                        width: 100,
                        formatter: this.createSalesOrderLink
                    },
                    {
                        sortable: false,
                        label: 'Ship Date',
                        name: 'ship_date',
                        width: 140,
                        formatter: this.createShipDatePicker
                    },
                    {
                        sortable: false,
                        label: 'Cancel Date',
                        name: 'cancel_date',
                        width: 100
                    },
                    {
                        sortable: false,
                        hidden:true,
                        label: 'Name',
                        name: 'name.text',
                        width: 300,
                        hidden:true,
                        formatter: this.createCustomerNameLink
                    },
                    {

                        sortable: false,
                        label: 'Item',
                        name: 'item.text',
                        width: 100,
                        formatter: this.createItemPicker
                    },
                    {
                        sortable: false,
                        label: 'Item Description',
                        name: 'item_description',
                        width: 200,
                        formatter: this.createItemDescriptionLink
                    },
                    {sortable: false, label: 'Open Quantity', name: 'open_quantity', width: 110},
                    {
                        sortable: false,
                        label: 'Total Available Quantity',
                        name: 'cust_total_available_quantity',
                        width: 170
                    },
                    {sortable: false, label: 'On Hand', name: 'on_hand', width: 75},
                    {sortable: false, label: 'Next Receipt', name: 'next_receipt', width: 100},
                    {sortable: false, label: 'Values', name: 'values', width: 80}
                ],
                viewrecords: false, // show records label in footer
                height: 600,
                //rowTotal: 1000,
                //loadonce: true,
                rowNum: 1000,
                pager: "#jqGridPager"
            });
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

        preselectFilters: function() {
            var $options = $('.status-dropdown option');
            //$options.each(function () {
            //    $(this).prop('selected', false);
            //});

            $options.filter('[value="SalesOrd:B"], [value="SalesOrd:D"]').prop('selected', true);
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
                    {
                        sortable: false,
                        label: 'Wave',  //removed closed
                        name: 'line_id',
                        width: 50,
                        formatter: this.createCloseCheckbox
                        
                    },
                    {sortable: false, label: 'Date / Partner', name: 'date_partner', width: 108},
                    /*{sortable: false, label: 'Status / Customer', name: 'status', width: 125},*/
                    {sortable: false, hidden:true,label: 'Partner', name: 'partner.text', width: 200},
                    {
                        sortable: false,
                        label: 'Status / Customer',
                        name: 'status',
                        width: 200,
                        formatter: this.createStatusAndCustomerNameLink
                    },

                    {
                        sortable: false,
                        label: 'Number',
                        name: 'number_nextreceipt',
                        width: 100,
                        formatter: this.createSalesOrderLink
                    },
                    {
                        sortable: false,
                        label: 'Ship Date',
                        name: 'ship_date',
                        width: 130,
                        formatter: this.createShipDatePicker
                    },
                    {
                        sortable: false,
                        label: 'Cancel Date',
                        name: 'cancel_date',
                        width: 130,
                        formatter: this.createCancelDatePicker
                    },
                    {
                        sortable: false,
                        hidden : true,
                        label: 'Name',
                        name: 'name.text',
                        width: 300,
                        formatter: this.createCustomerNameLink
                    },
                    {
                        sortable: false,
                        label: 'Item',
                        name: 'item.text',
                        width: 300,
                        formatter: this.createItemPicker
                    },
                    {
                        sortable: false,
                        label: 'Item Description',
                        name: 'item_description',
                        width: 200,
                        formatter: this.createItemDescriptionLink
                    },
                    {sortable: false, label: 'Next Receipt', name: 'next_receipt', width: 100},
                    {sortable: false, label: 'Open Qty', name: 'open_quantity', width: 100},
                    {sortable: false, label: 'Com Qty', name: 'quantity_committed', width: 100},
                    {sortable: false, hidden: true,label: 'Quantity Packed', name: 'quantity_packed', width: 100},
                    {sortable: false, label: 'On Hand', name: 'on_hand', width: 75},
                    {sortable: false, label: 'On Order', name: 'on_order', width: 80},
                    {sortable: false,hidden:true, label: 'Next Receipt', name: 'next_receipt', width: 100},
                    {sortable: false, label: 'Values', name: 'values', width: 80},
                    {sortable: false, label: 'Com Value', name: 'committed_value', width: 150}
                ],
                viewrecords: false, // show records label in footer
                height: 800,
                //rowTotal: 1000,
                //loadonce: true,
                rowNum: 1000,
                pager: "#jqGridPager"
            });
        }
    };

    return exports;
});
