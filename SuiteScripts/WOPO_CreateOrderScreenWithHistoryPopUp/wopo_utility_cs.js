/**
 * Module Description
 * A quick way to remove or swap certain item from an assembly BOM, while preserving the other items on the BOM
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Mar 2014     hakhtar
 *
 */

/**
 * wopoCsConstants used in this utility
 */
var wopoCsConstants = {
    ApiUrls: {
        searchTransactions: "https://3500213.app.netsuite.com/app/site/hosting/scriptlet.nl?script=93&deploy=1&method=searchTransactions",
        getTeamsByLeagueIds: "https://3500213.app.netsuite.com/app/site/hosting/scriptlet.nl?script=93&deploy=1&method=getTeamsByLeagueIds",
        processItems: "https://3500213.app.netsuite.com/app/site/hosting/scriptlet.nl?script=93&deploy=1&method=processItems",
        noImageUrl: "https://3500213.app.netsuite.com/core/media/media.nl?id=383929&c=3500213&h=39c5fe363c1150fe692d",
        printRecord: "https://3500213.app.netsuite.com/app/site/hosting/scriptlet.nl?script=93&deploy=1&method=printRecord",
        order_0: "https://3500213.app.netsuite.com/app/accounting/transactions/workord.nl?id=",
        order_1: "https://3500213.app.netsuite.com/app/accounting/transactions/purchord.nl?id="
    },
    RecordType: {
        "0": "work order",
        "1": "purchase order"
    },
    RecordTypeValues: {
        WorkOrder: "0",
        PurchaseOrder: "1"
    },
    Setting: {
        LoggingEnabled: true, //Log messages on console
        ShowAssocItem: false //Show associated items on UI for the selected item
    },
    Message: {
        SuccessfullySwapped: "{item1} & {item2} are successfully swapped within all BOMs",
        SureToRemove: "Are you sure you want to remove this item from all the BOMs?",
        AssocItemsRemoved: "Items have been removed from all BOMs",
        SureSwap: "This item is part of {count} BOMs, are you sure you want to swap?",
        WaitWhileProcessingRequest: "* Please wait while your request is being processed. This might take some time. Leaving the page before processing get completed will result in incomplete operation.",
        SelectionRequired: "Please select at least one Record.",
        ScheduleScriptExecutionStarted: "A scheduled script has been started to create work orders. You would be notified by email after scheduled script execution completion."
    },
    SavedSearch: {
        SearchMemberParent: "customsearch360",
        SearchInvoices: "customsearch_pod_invoice_tracking_search",
        ItemMonthlySearch: 1649,
        ItemMonthlySearchDetail: 1650,

        CustomLeagueSearch: "customsearch1263",
        CustomProdTypeSearch: "customsearch1262",

        OnOrderSearch: 1651,
        CommittedSearch: 1652,
        //BackorderedSearch: 1653,
        BackorderedSearch: 3816,

        OpensalesSearch: 1678,
        OpensalesSearchDetail: 1661
    },
    ItemField: {
        League1: "custitem1",
        ProductType: "custitem_prodtype"
    }
};

//defines data in the main grid
var mainData = [];

window.jTableHelper = null;

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        for (var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    };
}

/**
 * Get BOMs of the items
 * @param itemId
 * @returns {Array} BOM
 */
function getParentBOMItems(itemId) {
    logMethodStart(arguments.callee.name);

    var context = nlapiGetContext();
    //Hack: increase governance limit
    context.getRemainingUsage = function () {
        return 1000;
    };

    var savedSearch = [];
    var lastId = 0;
    do {
        lastRecord = nlapiSearchRecord(null, wopoCsConstants.SavedSearch.SearchMemberParent,
            [new nlobjSearchFilter('internalid', 'memberitem', 'is', itemId),
                new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId)]);
        if (lastRecord != null) {
            lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record
            savedSearch = savedSearch.concat(lastRecord); //Concatenate the just fetched records in a list
        }
    }
    while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

    return savedSearch;
}

/**
 * Initialize functionality on page load
 */
(function () {

    var context = nlapiGetContext();
    context.getRemainingUsage = function () {
        return 1000;
    };

    //Move the custom HTML to the appropriate place first.
    $('body').append($('#custpage_page_template_val'));

    $('#custpage_sf_vendor_display').attr('disabled', true);
    $('#custpage_sf_vendor_popup_muli').hide();
    $('#custpage_dummy_1').hide();

    $('#custpage_txt_order_end_received_by_date').datepicker({
        changeMonth: true,
        changeYear: true
    });

    var x = 1; //or whatever offset
    var nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + x);

    //Apply smaller fonts
    $('.ui-datepicker').css('font-size', '0.8em');
    initializeGrid();

    //move the paging stuff to top
    $('.jtable-bottom-panel').insertAfter($('.jtable-title'));


    $('#custpage_sf_league_popup_new').parent().remove();

    $(document).ready(function () {
        setGridWidth();
    });

    window.onresize = function () {
        setGridWidth();
    };

})();

function getApiUrlWithFilters(lastInternalId, jtParams) {

    showMessage(null);

    var url = wopoCsConstants.ApiUrls.searchTransactions;

    var selectedTransactionType = nlapiGetFieldValue('custpage_sf_type');

    var league = nlapiGetFieldValue('custpage_sf_league'); //jQuery('#league').val() != null ? jQuery('#league').val().join(): '';
    var team = nlapiGetFieldValue('custpage_sf_team'); //jQuery('#team').val() != null ? jQuery('#team').val().join(): '';
    var productType = nlapiGetFieldValue('custpage_sf_producttype'); // jQuery('#prod-type').val() != null ? jQuery('#prod-type').val().join() : '';

    var custitem_custom = nlapiGetFieldValue('custitem_custom'); //$('#chkCustom').prop('checked') == true ? "T" : "F";
    var custitem_discontinued = nlapiGetFieldValue('custitem_discontinued'); //$('#chkDiscontinued').prop('checked') == true ? "T" : "F";
    var custitem_overcommitted = nlapiGetFieldValue('custitem_overcommitted');

    var selectedCustomer = nlapiGetFieldValue('custpage_sf_customer');

    var warehouse = nlapiGetFieldValue('custpage_msf_warehouse'); //jQuery('#team').val() != null ? jQuery('#team').val().join(): '';

    url += "&transactionType=" + selectedTransactionType;
    url += "&productType=" + productType;
    url += "&league=" + league;
    url += "&team=" + team;
    url += "&custitem_custom=" + custitem_custom;
    url += "&custitem_discontinued=" + custitem_discontinued;
    url += "&customer=" + selectedCustomer;
    url += "&warehouse=" + warehouse;
    url += "&custitem_overcommitted=" + custitem_overcommitted;

    if (!!lastInternalId) {
        url += "&last_tran_id=" + lastInternalId;
    }

    if (!!jtParams) {
        url += "&start_index=" + jtParams.page;
        url += "&page_size=" + jtParams.rows;
    }

    return url;
}

function loadData() {
    loadGridData(null);
}

function showMessage(message, type, isHtml) {

    $('#divMessage').removeClass('ui-state-highlight');
    $('#divMessage').removeClass('ui-state-error');

    if (!!message && message.length > 0) {
        $('#divMessage').show();

        if (type == 'success') {
            $('#divMessage').addClass('ui-state-highlight');
        }
        else if (type == 'error') {
            $('#divMessage').addClass('ui-state-error');
        }

        isHtml == false ? $('#lbl_message').text(message) : $('#lbl_message').html(message);
    }
    else {
        $('#divMessage').hide();
    }
}

/**
 * Checks if given input is a valid date.
 * @param input_value
 * @returns {boolean}
 */
function checkDate(inputValue) {
    var validformat = /^\d{2}\/\d{2}\/\d{4}$/; //Basic check for format validity
    var returnval = false;

    if (!inputValue || inputValue.length <= 0) {
        return true;
    }

    if (!validformat.test(inputValue)) {
        return returnval;
    }
    else { //Detailed check for valid date ranges
        var monthfield = inputValue.split("/")[0];
        var dayfield = inputValue.split("/")[1];
        var yearfield = inputValue.split("/")[2];
        var dayobj = new Date(yearfield, monthfield - 1, dayfield);

        if ((dayobj.getMonth() + 1 != monthfield) ||
            (dayobj.getDate() != dayfield) ||
            (dayobj.getFullYear() != yearfield)) {

            returnval = false;
        }
        else {
            returnval = true;
        }
    }

    return returnval;
}

/**
 * Log messages on console if logging is enabled
 * @param message
 */
function log(message) {
    if (wopoCsConstants.Setting.LoggingEnabled && !!window.console) {
        console.log(message);
    }
}

/**
 * Log the name of method called
 * @param calleeName
 */
function logMethodStart(calleeName) {
    log("Method called: " + calleeName);
}

/**
 * show IDs of BOM for the selected item, if this option is enabled
 * @param itemId
 */
function showAssociation(itemId) {
    logMethodStart(arguments.callee.name);

    if (wopoCsConstants.Setting.ShowAssocItem) {
        var div = document.getElementById("assoc_details");
        if (!div) {
            div = document.createElement('div');
            div.id = "assoc_details";
            attachElement(div);
        }
        div.innerText = "";
        var parentItems = getParentBOMItems(itemId);
        parentItems.forEach(function (item) {
            div.innerText += item.getId() + ", ";
        });
    }
}

/**
 * attach an HTML element to div__body or the main body
 * @param elem
 */
function attachElement(elem) {
    logMethodStart(arguments.callee.name);

    var parentElem = document.getElementById("div__body");
    if (!parentElem) {
        parentElem = document.body;
    }

    parentElem.appendChild(elem);
}

/**
 * Loads data in Grid
 * @param pdata
 */
function loadGridData(pdata) {
    var apiUrl = getApiUrlWithFilters(null, pdata);
    if (!apiUrl) {
        return;
    }
    //Show loading records
    progressDownloading(false);

    $.ajax({
        url: apiUrl,
        type: "GET",
        cache: false
    })
        .done(function (data) {
            if (data.indexOf("<!--") >= 0) {
                data = data.substr(data.indexOf("{\"Result"), data.indexOf("<!--"));
            }

            try {

                //let us keep this data saved for next time and debugging
                mainData = JSON.parse(data);

                var final_data = {
                    total: Math.ceil(mainData.TotalRecordCount / 1000),
                    page: mainData.pageNum,
                    records: mainData.TotalRecordCount,
                    rows: mainData.Records
                };

                jQuery("#scrolling")[0].addJSONData(final_data);

                //Hack: Fix for page number input cut into half
                $(".ui-pg-table input").height("auto");
            }
            catch (e) {
                //do nothing here!
                //$('#lbl_message').text('There was an error while fetching data from server.');
                showMessage('There was an error while fetching data from server.', 'error', false);
            }
            finally {

                $('.line-order-date').datepicker({
                    changeMonth: true,
                    changeYear: true
                });
                //hide loading
                progressDownloading(true);
            }
        });
}
/**
 * Initializes Result Grid for Invoices.
 */
function initializeGrid() {
    //Prepare jTable

    jQuery("#scrolling").jqGrid({
        data: [],
        datatype: function (pdata) {
            loadGridData(pdata);
        },
        multiselect: true,
        height: 400,
        shrinkToFit: true,
        rowNum: 1000,
        'cellEdit': true,
        colNames: ['Id', 'Thumbnail', 'Item', 'Description', 'Team', 'On Hand', 'Committed',
            'Available', 'Back Ordered', 'On Order', 'Build Point', 'Pref Stock Lev', 'End Date', 'Qty', 'Comments',
            'Type'],
        colModel: [
            {name: 'internalid', index: 'internalid', width: 1, hidden: true, sorttype: "int"},
            {name: 'custitemthumbnail_image', index: 'custitemthumbnail_image', width: 90, sortable: false, align: "center",
                formatter: function unitsInStockFormatter(cellvalue, options, rowObject) {
                    var final_url = !!cellvalue && cellvalue.length > 0 ? cellvalue : wopoCsConstants.ApiUrls.noImageUrl;

                    return '<img src="' + final_url + '" height="48px" width="70px" align="middle" alt="Product Image" ' +
                        'data-large = "' + (rowObject.custitem_image1 || wopoCsConstants.ApiUrls.noImageUrl) + '" />';
                }},
            {name: 'itemid', index: 'itemid', width: 100, align: "center"},

            {name: 'salesdescription', index: 'salesdescription', width: 80, align: "center",
                formatter: function (cellvalue, options, rowObject) {
                    return '<a href="javascript:;" data-val="' + cellvalue + '"  onclick="onShowDetail(this)" >' + (!!cellvalue ? cellvalue : 'Show Detail') + '</a>';
                }},
            {name: 'custitem2', index: 'custitem2', width: 80, editable: true, align: "center"},

            {name: 'quantityonhand', index: 'quantityonhand', width: 80, align: "center", sorttype: "float"},
            {name: 'quantitycommitted', index: 'quantitycommitted', width: 1, hidden: true, sorttype: "float"},
            {name: 'quantityavailable', index: 'quantityavailable', width: 80, align: "center", sorttype: "float"},
            {name: 'quantitybackordered', index: 'quantitybackordered', width: 80, align: "center", sorttype: "float"},

            {name: 'quantityonorder', index: 'quantityonorder', width: 80, align: "center", sorttype: "float"},
            {name: 'reorderpoint', index: 'reorderpoint', width: 80, align: "center", sorttype: "float"},
            {name: 'preferredstocklevel', index: 'preferredstocklevel', width: 80, align: "center", sorttype: "float"},

            {name: 'orderdate', index: 'orderdate', width: 150, sortable: false, align: "center",
                formatter: function (cellvalue, options, rowObject) {

                    var val = !!cellvalue && cellvalue.length > 0 ? cellvalue : '';

                    return '<input type="text" class="line-order-date"  value="' + val + '" style="width: 80px" />';
                }},
            {name: 'quantity', index: 'quantity', width: 150, sortable: false, align: "center",
                formatter: function (cellvalue, options, rowObject) {

                    var val = !!cellvalue && cellvalue.length > 0 ? cellvalue : '';

                    return '<input type="text" class="line-order-quantity"  onkeypress="return isNumberKey(event)"  style="text-align: right; width: 80px" value="' + val + '" />';
                }},
            {name: 'custitem_workordercomments', index: 'custitem_workordercomments', width: 150, sortable: false, align: "center",
                formatter: function (cellvalue, options, rowObject) {

                    var val = !!cellvalue && cellvalue.length > 0 ? cellvalue : '';
                    return '<textarea rows="2" class="line-order-comments" style="width: 80px" value="' + val + '" />';
                }},
            {name: 'type', index: 'type', width: 1, hidden: true}
        ],
        gridview: true,
        pager: '#pscrolling',
        sortname: 'internalid',
        viewrecords: true,
        sortorder: "asc",
        onSelectRow: function (rowid, status, e) {
            if (status === true && !$(".line-order-date")[rowid - 1].value) {
                //If row is selected / Not deselected
                //And the date is not already selected

                $(".line-order-date")[rowid - 1].value = $("#custpage_txt_order_end_received_by_date").val();
            }
        },
        gridComplete: function () {
            var rowData = $('#scrolling').jqGrid('getRowData');
            if (!!rowData && rowData.length > 0) {
                var qtyBackOrdered = 0, qtyCommitted = 0, qtyOnHand = 0, qtyOnOrder = 0;
                rowData.forEach(function (data, rowId) {

                    qtyBackOrdered = parseInt(data.quantitybackordered);
                    qtyCommitted = parseInt(data.quantitycommitted);
                    qtyOnHand = parseInt(data.quantityonhand);
                    qtyOnOrder = parseInt(data.quantityonorder);

                    qtyBackOrdered = isNaN(qtyBackOrdered) ? 0 : qtyBackOrdered;
                    qtyCommitted = isNaN(qtyCommitted) ? 0 : qtyCommitted;
                    qtyOnHand = isNaN(qtyOnHand) ? 0 : qtyOnHand;
                    qtyOnOrder = isNaN(qtyOnOrder) ? 0 : qtyOnOrder;

                    if ((qtyOnHand - qtyCommitted - qtyBackOrdered + qtyOnOrder) < 0) {
                        $("tr[role=row][id=" + (rowId + 1) + "] td").css("background-color", "#FFB6C1");
                    }
                });
            }
        }
    });
    setGridWidth();
}

function setGridWidth() {
    $('#scrolling').jqGrid('setGridWidth', $(window).width() - 20);
}

/**
 * Gets available image based on data;
 * @param data
 * @returns {*}
 */
function getAvailableImage(data) {

    var thumbnailDiv = data.find('td[aria-describedby="scrolling_custitemthumbnail_image"]').find('img');

    if (!!thumbnailDiv && thumbnailDiv.attr('data-large')) {
        return thumbnailDiv.attr('data-large');
    }

    //if nothing found, return this
    return  thumbnailDiv.attr('src') ? thumbnailDiv.attr('src') : wopoCsConstants.ApiUrls.noImageUrl;
}
function onShowDetail(arg) {

    var row = $(arg).closest('tr');

    $('#dialog-item-detail').dialog({
        title: "Details for: " + $(arg).closest('tr').find('td[aria-describedby="scrolling_itemid"]').text(),
        modal: true,
        draggable: true,
        resizable: false,
        position: ['center', 90],   // 90px is height of netsuite header/menu in new release 2014.2 UI
        show: 'blind',
        hide: 'blind',
        minHeight: '350px',
        width: "50%", //Lets keep it relative
        dialogClass: 'ui-dialog-osx',
        close: function () {
            // commented on demand, values cant be set on closing popup
            //updateDataBackToGrid();
            $(this).dialog('destroy');
        },
        open: function (event, ui) {
            // Hack: Fix the position of close icon on jQuery UI Dialog
            fixPositionOfCloseButton();
        }
    });
    populateData(row);

    // Hack: Modal popup not getting the background to be completely grey-out
    fixLayoutBackgroundForModalDialog();

    // Set focus on quantity textbox
    setTimeout(function () {
        $("#item-qty").focus();
    }, 1000);
}

function updateDataBackToGrid() {
    var row = $("#" + $("#item-qty").attr("data-row-id"));
    if (!!row && row.length !== 0) {
        if (!!$("#item-qty").val() && $("#item-qty").val() !== "0") {
            row.find('td[aria-describedby="scrolling_quantity"] input').val($("#item-qty").val());

            if (!!$("#item-end-date").val()) {
                showItemEndDateError(false);
                row.find('td[aria-describedby="scrolling_orderdate"] input').val($("#item-end-date").val());
                //Select the row if not selected
                if (row.attr("aria-selected") !== "true") {
                    row.find("[role=checkbox]").click();
                }
            } else {
                $("#item-end-date").css("border-color", "red");
                showItemEndDateError(true);
                return false;
            }
        }
        else {
            //if quantity textbox is empty
            resetRow(row);
        }
    }
    return true;
}

function showItemEndDateError(show) {
    if (show) {
        $("#item-end-date-error").html('Please enter an end date before adding an item.');
        $("#item-end-date-error").addClass('item-end-date-error-style');
    }
    else {
        $("#item-end-date-error").html('');
        $("#item-end-date-error").removeClass('item-end-date-error-style');
    }
}

/*
 Reset row to empty state
 Clear textbox values and background highlighting
 */
function resetRow(row) {
    // clear quantity field
    row.find('td[aria-describedby="scrolling_quantity"] input').val('');

    // clear order date field
    row.find('td[aria-describedby="scrolling_orderdate"] input').val('');

    // if row is selected, mark it un-select by clicking row checkbox
    if (row.attr("aria-selected") === "true") {
        row.find("[role=checkbox]").click();
    }
}

/**
 * Fills out the Modal dialog with its data
 * @param data
 */
function populateData(data) {
    var image_url = getAvailableImage(data);

    $('#dialog-item-detail').find('#large_image').attr('src', image_url);

    var itemInternalId = data.find('td[aria-describedby="scrolling_internalid"]').text();

    $('#dialog-item-detail').attr('data-val', itemInternalId);

    // Below is old code for showing Monthly timeline Data, Now this logic has been moved inside 'addMonthlyDataTimeLine' method
    /*
     var monthlySearch = nlapiLoadSearch(null, wopoCsConstants.SavedSearch.ItemMonthlySearch);
     var oldFilters = monthlySearch.getFilters();
     oldFilters[3].values = [substituteItemId];

     monthlySearch.setFilters(oldFilters);

     var resultSet = monthlySearch.runSearch();

     var resultArray = [];

     resultSet.forEachResult(function (searchResult) {

     resultArray.push({
     'quantity_sum': searchResult.getValue('quantity_sum'),
     'year': searchResult.getValue('trandate_group').split('-')[0],
     'month': searchResult.getValue('trandate_group').split('-')[1]
     });   // process the search result
     return true;                // return true to keep iterating
     });

     var grouped = _.groupBy(resultArray, 'year');

     $('.detail-row-data').remove();

     for (var key in grouped) {
     var yearData = grouped[key];

     //here what we are doing is that, we are cloning a sample data row
     var $tr = $('#yearly-detail').find('.detail-row-sample');
     var $clone = $tr.clone();
     $tr.after($clone);

     //remove our identification class, and add a row-data class
     $clone.removeClass('detail-row-sample');
     $clone.addClass('detail-row-data');
     $clone.attr('data-val', data.internalid);
     $clone.show();

     for (var i = 0; i < yearData.length; i++) {
     $clone.find('td')[0].innerHTML =
     (yearData[i].year.toString() == new Date().getFullYear().toString()) ? "This Year" : yearData[i].year.toString();

     var month = parseInt(yearData[i].month);

     $clone.find('td')[month].innerHTML = '<a href="javascript:;" data-year="' +
     yearData[i].year.toString() + '" data-month="' + (month) + '"  onclick="populateMonthlyData(this);" data-val="' +
     yearData[i].quantity_sum + '" data-internalid="' + itemInternalId + '" >' + yearData[i].quantity_sum + '</a>';

     var total = 0;
     var all_td = $clone.find('td');

     for (var j = 1; j < all_td.length - 1; j++) {
     if (isNumeric(parseFloat($(all_td[j]).find('a').attr('data-val')))) {
     total += parseFloat($(all_td[j]).find('a').attr('data-val'));
     }
     }

     //all_td[all_td.length - 1].innerHTML = total;
     all_td[all_td.length - 1].innerHTML = '<a href="javascript:;" data-year="' +
     yearData[i].year.toString() + '"  onclick="populateMonthlyData(this);" data-val="' +
     total + '" data-internalid="' + itemInternalId + '" >' + total + '</a>';
     }
     }
     */

    addMonthlyDataTimeLine(itemInternalId, '.detail-row-sample', data.internalid);
    addOnOrderTimeline(itemInternalId);
    addOpenSalesTimeline(itemInternalId);

    var internalId = data.find('td[aria-describedby="scrolling_internalid"]').text();

    //region BOM Components
    var itemType = data.find('td[aria-describedby="scrolling_type"]').text();
    if (isAssemblyItem(itemType)) {
        showBomComponents(internalId);
    }
    else {
        // Hide BOM Components html table
        $('#bom-components').hide();
    }
    //endregion

    //region Substitute Item
    if (internalId) {
        showSubstituteItems(internalId);
    }
    //endregion


    var qtyCommitted = parseFloat(data.find('td[aria-describedby="scrolling_quantitycommitted"]').text());
    var qtyOnHand = parseFloat(data.find('td[aria-describedby="scrolling_quantityonhand"]').text());
    var qtyBackOrdered = parseFloat(data.find('td[aria-describedby="scrolling_quantitybackordered"]').text());
    var qtyOnOrder = parseFloat(data.find('td[aria-describedby="scrolling_quantityonorder"]').text());
    var qtyAvailable = parseFloat(data.find('td[aria-describedby="scrolling_quantityavailable"]').text());

    qtyBackOrdered = isNaN(qtyBackOrdered) ? 0 : qtyBackOrdered;
    qtyCommitted = isNaN(qtyCommitted) ? 0 : qtyCommitted;
    qtyOnHand = isNaN(qtyOnHand) ? 0 : qtyOnHand;
    qtyOnOrder = isNaN(qtyOnOrder) ? 0 : qtyOnOrder;
    qtyAvailable = isNaN(qtyAvailable) ? 0 : qtyAvailable;


    $('#td-on-hand').html(qtyOnHand);
    $('#td-on-hand').attr('data-val', internalId);

    $('#td-available').html(qtyAvailable);
    $('#td-available').attr('data-val', internalId);

    $('#td-back-ordered').html("<a href='javascript:;' id='td-back-ordered-href' >" + qtyBackOrdered + "</a>");
    $('#td-back-ordered').attr('data-val', internalId);


    $('#td-on-order').html("<a href='javascript:;' id='td-on-order-href' >" + qtyOnOrder + "</a>");
    $('#td-on-order').attr('data-val', internalId);

    $('#td-committed').html("<a href='javascript:;' id='td-committed-href' >" + qtyCommitted + "</a>");
    $('#td-committed').attr('data-val', internalId);

    var currentNeed = qtyOnHand - qtyCommitted - qtyBackOrdered + qtyOnOrder;

    $('#td-current-need').html("<span " + (currentNeed < 0 ? "style='color:red'" : "") + ">" + Math.abs(currentNeed) + "</span>");
    $('#td-current-need').attr('data-val', internalId);


    //bind these items one time only
    $(function () {
        bindMasterPopupEvents();
    });

    //Add the id for previous and next item
    $("#next-item-btn").attr("data-val", parseInt(data.attr("id")) + 1);
    $("#prev-item-btn").attr("data-val", parseInt(data.attr("id")) - 1);

    //Make date selector to be a jQueryUI datepicker
    $('#item-end-date').datepicker({
        changeMonth: true,
        changeYear: true
    });

    //Get values of the line items (if any)

    $("#item-end-date").val(data.find('td[aria-describedby="scrolling_orderdate"] input').val() ||
        $('#custpage_txt_order_end_received_by_date').val()).attr("data-row-id", data.attr("id"))
        .css("border-color", "rgb(153, 153, 153)"); //Since we are changing the color to red if there is an error
    //So default the color on (re-)opening the dialog

    $("#item-qty").val(data.find('td[aria-describedby="scrolling_quantity"] input').val()).attr("data-row-id", data.attr("id"));
}

//region BOM Components related methods

/*
 Show BOM Components of provided assembly Item
 */
function showBomComponents(assemblyItemId) {

    var bomComponentsData = getBomComponents(assemblyItemId);
    if (bomComponentsData && bomComponentsData.length > 0) {
        // Show Hidden Bom Components
        $('#bom-components').show();

        // Remove all row(if exist) of previous bom compoments
        $('.bom-comp-row-data').remove();

        for (var i = 0; i < bomComponentsData.length; i++) {

            //here what we are doing is that, we are cloning a sample data row
            var $tr = $('#bom-components').find('.bom-comp-row-sample');
            var $clone = $tr.clone();
            $tr.after($clone);

            //remove our identification class, and add a row-data class
            $clone.removeClass('bom-comp-row-sample');
            $clone.addClass('bom-comp-row-data');
            $clone.show();

            $clone.find('td')[0].innerHTML = bomComponentsData[i].name;
            $clone.find('td')[1].innerHTML = parseValue(bomComponentsData[i].available);
            $clone.find('td')[2].innerHTML = parseValue(bomComponentsData[i].on_hand);
            $clone.find('td')[3].innerHTML = parseValue(bomComponentsData[i].back_ordered);
            $clone.find('td')[4].innerHTML = parseValue(bomComponentsData[i].on_order);
        }
    }
}

/*
 Get BOM Components of provided assembly Item
 */
function getBomComponents(assemblyItemId) {
    var fils = [];
    var cols = [];

    fils.push(new nlobjSearchFilter('internalid', null, 'is', assemblyItemId));

    cols.push(new nlobjSearchColumn('internalid', 'memberitem'));
    cols.push(new nlobjSearchColumn('name', 'memberitem'));
    cols.push(new nlobjSearchColumn('quantityavailable', 'memberitem'));
    cols.push(new nlobjSearchColumn('quantityonhand', 'memberitem'));
    cols.push(new nlobjSearchColumn('quantitybackordered', 'memberitem'));
    cols.push(new nlobjSearchColumn('quantityonorder', 'memberitem'));

    var res = nlapiSearchRecord('item', null, fils, cols);

    var bomComponents = [];
    if (res && res.length > 0) {
        for (var i = 0; i < res.length; i++) {
            bomComponents.push({
                'internal_id': res[i].getValue('memberitem_internalid'),
                'name': res[i].getValue('memberitem_name'),
                'available': res[i].getValue('memberitem_quantityavailable'),
                'on_hand': res[i].getValue('memberitem_quantityonhand'),
                'back_ordered': res[i].getValue('memberitem_quantitybackordered'),
                'on_order': res[i].getValue('memberitem_quantityonorder')
            });
        }
    }

    return bomComponents;
}

/*
 Is this assembly item??
 */
function isAssemblyItem(itemType) {

    var ASSEMBLY = "Assembly";
    if (itemType.toLowerCase() == ASSEMBLY.toLowerCase()) {
        return true;
    }
    return false;
}

/*
 Filter integer value if required
 */
function parseValue(val) {
    if (val) {
        return val;
    }
    else {
        return '';
    }
}

//endregion

//region Substitute item related method

/*
 Show substitute item(s) details
 */
function showSubstituteItems(currentItemInternalId) {

    var substituteItems = getSubstituteItems(currentItemInternalId);

    if (substituteItems && substituteItems.length > 0) {

        // Show Hidden Substitute Item table
        $('#substitute-item-detail').show();

        // Show Hidden Bom Components
        $('#substitute-items').show();

        // Remove all row(if exist) of previous bom compoments
        $('.substitute-item-row-data').remove();

        for (var i = 0; i < substituteItems.length; i++) {

            //here what we are doing is that, we are cloning a sample data row
            var $tr = $('#substitute-items').find('.substitute-item-row-sample');
            var $clone = $tr.clone();
            $tr.after($clone);

            //remove our identification class, and add a row-data class
            $clone.removeClass('substitute-item-row-sample');
            $clone.addClass('substitute-item-row-data');
            $clone.show();

            var $td = $($clone.find('td')[0]);

            $td.html("<a href='javascript:;' class='td-substitute-item-href substitute-item-main' data-val='" + substituteItems[i].internal_id
                + "' >" + substituteItems[i].name + "</a>");
            $td.attr('data-val', currentItemInternalId);
        }
    }
    else {
        // Hide Substitute Item table
        $('#substitute-item-detail').hide();
    }
}

/*
 Get Substitute item(s) of provided Item
 */
function getSubstituteItems(currentItemInternalId) {
    var fils = [];
    var cols = [];

    fils.push(new nlobjSearchFilter('custitem_substitute', null, 'is', currentItemInternalId));

    cols.push(new nlobjSearchColumn('internalid'));
    cols.push(new nlobjSearchColumn('name'));

    var res = nlapiSearchRecord('item', null, fils, cols);

    var substituteItems = [];
    if (res && res.length > 0) {
        for (var i = 0; i < res.length; i++) {
            substituteItems.push({
                'internal_id': res[i].getValue('internalid'),
                'name': res[i].getValue('name')
            });
        }
    }

    return substituteItems;
}

/*
 Populate Monthly Data for Substitute item
 (Note: 'Open Sales' and 'On Order' information will remain of original item)
 */
function populateMonthlyDataForSubstituteItem(element) {

    var substituteItemId = getIdOfItemToShowMonthlyData(element);
    addMonthlyDataTimeLine(substituteItemId, '.detail-row-data-order', '');
}

/*
 Return Id of appropriate item(either main or substitute) and set styles for substitute items
 */
function getIdOfItemToShowMonthlyData(element) {
    var itemId = null;
    if ($(element).hasClass("substitute-item-main")) {
        resetStyleClassesOfSubstituteItemAnchors();
        $(element).removeClass("substitute-item-main").addClass("substitute-item-sub");
        itemId = $(element).attr('data-val');
    }
    else if ($(element).hasClass("substitute-item-sub")) {
        resetStyleClassesOfSubstituteItemAnchors();
        $(element).removeClass("substitute-item-sub").addClass("substitute-item-main");
        itemId = $(element).parent().attr('data-val');
    }
    return itemId;
}

function resetStyleClassesOfSubstituteItemAnchors() {
    $(".td-substitute-item-href").removeClass("substitute-item-sub").addClass("substitute-item-main");
}

//endregion

function addOpenSalesTimeline(itemId) {
    var monthlySearch = nlapiLoadSearch(null, wopoCsConstants.SavedSearch.OpensalesSearch);
    var currentYear = new Date().getFullYear();

    monthlySearch.addFilter(new nlobjSearchFilter("internalid", "item", "is", itemId));
    monthlySearch.addFilter(new nlobjSearchFilter("shipdate", null, "within", [getDate(new Date(currentYear, 0, 1)),
        getDate(new Date(currentYear, 12, 0))]));

    var resultSet = monthlySearch.runSearch();
    var resultArray = [];

    resultSet.forEachResult(function (searchResult) {
        resultArray.push({
            'quantity_sum': searchResult.getValue('formulanumeric_sum'),
            'month': searchResult.getValue('shipdate_group').split('-')[1]
        });   // process the search result
        return true;                // return true to keep iterating
    });

    var grouped = _.groupBy(resultArray, 'month');
    $('.detail-row-data-sales').remove();

    //here what we are doing is that, we are cloning a sample data row
    var $tr = $('#yearly-detail').find('.detail-row-sample');
    var $clone = $tr.clone();
    $tr.after($clone);

    //remove our identification class, and add a row-data class
    $clone.removeClass('detail-row-sample');
    $clone.addClass('detail-row-data-sales');
    $clone.show();

    $clone.find('td')[0].innerHTML = "Open Sales";
    var yearTotal = 0, monthTotal = 0;
    for (var key in grouped) {
        monthTotal = 0;
        for (var detail in grouped[key]) {
            monthTotal += parseInt(grouped[key][detail].quantity_sum);
        }
        yearTotal += monthTotal;

        $clone.find('td')[parseInt(key)].innerHTML = '<a href="javascript:;" data-year="' +
            currentYear.toString() + '" data-month="' + key + '"  ' +
            'onclick="populateMonthlyData(this, ' + wopoCsConstants.SavedSearch.OpensalesSearchDetail + ');" ' +
            'data-internalid="' + itemId + '" >' + monthTotal + '</a>';
    }

    var all_td = $clone.find('td');
    all_td[all_td.length - 1].innerHTML = '<a href="javascript:;" data-year="' + currentYear.toString() +
        '" onclick="populateMonthlyData(this, ' + wopoCsConstants.SavedSearch.OpensalesSearchDetail + ');" ' +
        'data-internalid="' + itemId + '" >' + yearTotal + '</a>';
}

function addOnOrderTimeline(itemId) {
    var tempMonthlySearch = nlapiLoadSearch(null, wopoCsConstants.SavedSearch.OnOrderSearch);
    var cols = tempMonthlySearch.getColumns();
    var currentYear = new Date().getFullYear();

    //Take first and the third column
    cols = [cols[0], cols[3]];

    //Apply summary and function
    cols[0].summary = "group";
    cols[0].functionid = "month";
    cols[1].summary = "sum";

    var monthlySearch = nlapiCreateSearch("transaction");
    monthlySearch.setColumns(cols);

    var oldFilters = tempMonthlySearch.getFilterExpression();
    oldFilters.push("AND", ["item.internalid", "is", itemId], "AND",
        ["formuladate: Case when {type} IN ('Work Order') then {enddate} else {expectedreceiptdate} end",
            "within", [getDate(new Date(currentYear, 0, 1)), getDate(new Date(currentYear, 12, 0))]]);

    monthlySearch.setFilterExpression(oldFilters);
    var resultSet = monthlySearch.runSearch();

    var resultArray = [];

    resultSet.forEachResult(function (searchResult) {
        resultArray.push({
            'quantity_sum': searchResult.getValue('formulanumeric_sum'),
            'month': searchResult.getValue('formuladate_group').split('-')[1]
        });   // process the search result
        return true;                // return true to keep iterating
    });

    var grouped = _.groupBy(resultArray, 'month');
    $('.detail-row-data-order').remove();

    //here what we are doing is that, we are cloning a sample data row
    var $tr = $('#yearly-detail').find('.detail-row-sample');
    var $clone = $tr.clone();
    $tr.after($clone);

    //remove our identification class, and add a row-data class
    $clone.removeClass('detail-row-sample');
    $clone.addClass('detail-row-data-order');
    $clone.show();


    $clone.find('td')[0].innerHTML = "On Order";
    var yearTotal = 0, monthTotal = 0;
    for (var key in grouped) {
        monthTotal = 0;
        for (var detail in grouped[key]) {
            monthTotal += parseInt(grouped[key][detail].quantity_sum);
        }
        yearTotal += monthTotal;

        $clone.find('td')[parseInt(key)].innerHTML = '<a href="javascript:;" data-year="' +
            currentYear.toString() + '" data-month="' + key + '"  ' +
            'onclick="populateMonthlyData(this, ' + wopoCsConstants.SavedSearch.OnOrderSearch + ');" ' +
            'data-internalid="' + itemId + '" >' + monthTotal + '</a>';

    }

    var all_td = $clone.find('td');
    all_td[all_td.length - 1].innerHTML = '<a href="javascript:;" data-year="' + currentYear.toString() +
        '" onclick="populateMonthlyData(this, ' + wopoCsConstants.SavedSearch.OnOrderSearch + ');" ' +
        'data-internalid="' + itemId + '" >' + yearTotal + '</a>';

}

function addMonthlyDataTimeLine(itemInternalId, appendRowsAfterClass, dataValToBindWithTr) {

    var monthlySearch = nlapiLoadSearch(null, wopoCsConstants.SavedSearch.ItemMonthlySearch);

    var oldFilters = monthlySearch.getFilters();
    oldFilters[3].values = [itemInternalId];

    monthlySearch.setFilters(oldFilters);

    var resultSet = monthlySearch.runSearch();

    var resultArray = [];

    resultSet.forEachResult(function (searchResult) {

        resultArray.push({
            'quantity_sum': searchResult.getValue('quantity_sum'),
            'year': searchResult.getValue('trandate_group').split('-')[0],
            'month': searchResult.getValue('trandate_group').split('-')[1]
        });   // process the search result
        return true;                // return true to keep iterating
    });

    var grouped = _.groupBy(resultArray, 'year');

    $('.detail-row-data').remove();

    for (var key in grouped) {
        var yearData = grouped[key];

        //here what we are doing is that, we are cloning a sample data row
        var $tr = $('#yearly-detail').find('.detail-row-sample');
        var $clone = $tr.clone();

        //find tr after which monthly data is to be appended
        var $appendAfterTr = $('#yearly-detail').find(appendRowsAfterClass);
        $appendAfterTr.after($clone);

        //remove our identification class, and add a row-data class
        $clone.removeClass('detail-row-sample');
        $clone.addClass('detail-row-data');
        $clone.attr('data-val', dataValToBindWithTr);
        $clone.show();


        for (var i = 0; i < yearData.length; i++) {
            $clone.find('td')[0].innerHTML =
                (yearData[i].year.toString() == new Date().getFullYear().toString()) ? "This Year" : yearData[i].year.toString();

            var month = parseInt(yearData[i].month);

            $clone.find('td')[month].innerHTML = '<a href="javascript:;" data-year="' +
                yearData[i].year.toString() + '" data-month="' + (month) + '"  onclick="populateMonthlyData(this);" data-val="' +
                yearData[i].quantity_sum + '" data-internalid="' + itemInternalId + '" >' + yearData[i].quantity_sum + '</a>';

            var total = 0;
            var all_td = $clone.find('td');

            for (var j = 1; j < all_td.length - 1; j++) {
                if (isNumeric(parseFloat($(all_td[j]).find('a').attr('data-val')))) {
                    total += parseFloat($(all_td[j]).find('a').attr('data-val'));
                }
            }

            //all_td[all_td.length - 1].innerHTML = total;
            all_td[all_td.length - 1].innerHTML = '<a href="javascript:;" data-year="' +
                yearData[i].year.toString() + '"  onclick="populateMonthlyData(this);" data-val="' +
                total + '" data-internalid="' + itemInternalId + '" >' + total + '</a>';
        }
    }
}

function showPrevNextItem(elem) {

    if (!updateDataBackToGrid()) {
        return false;
    }

    var rowIdToOpen = $(elem).attr("data-val");

    if (rowIdToOpen > 1000 || rowIdToOpen <= 0) {
        return false;
    }

    /*$('#dialog-item-detail').dialog('destroy');
    //To keep the call identical, pass the first td
    onShowDetail($("#" + rowIdToOpen + "[role=row] td")[0]);*/

    // send call with some delay to hide end date error
    setTimeout(function () {
        $('#dialog-item-detail').dialog('destroy');
        //To keep the call identical, pass the first td
        onShowDetail($("#" + rowIdToOpen + "[role=row] td")[0]);
    }, 100);
}

function getDate(date) {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
}

function populateMonthlyData(item, savedSearchId) {

    console.log(item);

    $('#dialog-item-hover').dialog({
        modal: true,
        draggable: true,
        resizable: false,
        position: ['top', 90],   // 90px is height of netsuite header/menu in new release 2014.2 UI
        show: 'blind',
        hide: 'blind',
        width: "50%", //Lets keep it relative
        dialogClass: 'ui-dialog-osx',

        open: function (event, ui) {

            // Hack: Fix the position of close icon on jQuery UI Dialog
            fixPositionOfCloseButton();

            $('#output').empty();
            $('#imgLoadingTeams').show();

            setTimeout(function () {

                var month = $(item).attr('data-month');
                var year = $(item).attr('data-year');
                var internalid = $(item).attr('data-internalid');

                try {
                    var date = new Date(year, month - 1, 1);
                    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

                    if (!month) {
                        //If month is not specified, get the data of whole year
                        firstDay = new Date(year, 0, 1);
                        lastDay = new Date(year, 12, 0);
                    }
                    var results = null;

                    if (!!savedSearchId) {
                        if (savedSearchId == wopoCsConstants.SavedSearch.OpensalesSearchDetail) {
                            results = nlapiSearchRecord(null, savedSearchId,
                                [new nlobjSearchFilter('internalid', 'item', 'anyOf', internalid),
                                    new nlobjSearchFilter('shipdate', null, 'within', [getDate(firstDay), getDate(lastDay)])]);
                        } else if (savedSearchId == wopoCsConstants.SavedSearch.OnOrderSearch) {
                            var tempSearch = nlapiLoadSearch(null, savedSearchId);
                            var oldFilters = tempSearch.getFilterExpression();
                            oldFilters.push("AND", ["item.internalid", "is", internalid], "AND",
                                ["formuladate: Case when {type} IN ('Work Order') then {enddate} else {expectedreceiptdate} end",
                                    "within", [getDate(firstDay), getDate(lastDay)]]);

                            results = nlapiSearchRecord(null, savedSearchId, oldFilters);
                        }
                    } else {
                        results = nlapiSearchRecord(null, wopoCsConstants.SavedSearch.ItemMonthlySearchDetail,
                            [new nlobjSearchFilter('internalid', 'item', 'anyOf', internalid),
                                new nlobjSearchFilter('trandate', null, 'within', [getDate(firstDay), getDate(lastDay)])]);
                    }

                    $('#dialog-item-hover').parent().css({"top" : "90px"});

                    if (results != null) {
                        //process results here
                        createDetailTable(results);
                    }
                    else {
                        $('#output').html('No Data Found!');
                    }
                } catch (e) {
                    log(e.toString());
                } finally {
                    $('#imgLoadingTeams').hide();
                }
            }, 5000);
        }
    });

    // Hack: Modal popup not getting the background to be completely grey-out
    fixLayoutBackgroundForModalDialog();
}

function bindMasterPopupEvents() {
    $('#td-committed-href').click(function () {
        showTransactionDetail(this);
    });

    $('#td-back-ordered-href').click(function () {
        showTransactionDetail(this);
    });

    $('#td-on-order-href').click(function () {
        showTransactionDetail(this);
    });

    $('#on-order-row').find('td').mouseenter(function () {
        showTransactionDetail(this);
    });

    $('#detail-row-data').find('td').mouseenter(function () {
        showTransactionDetail(this);
    });

    $('.td-substitute-item-href').click(function () {
        populateMonthlyDataForSubstituteItem(this);
    });
}

function getSearchByItemType(identifier) {
    if (identifier == 'td-committed') {
        return wopoCsConstants.SavedSearch.CommittedSearch;
    }
    else if (identifier == 'td-back-ordered') {
        return wopoCsConstants.SavedSearch.BackorderedSearch;
    }
    else if (identifier == 'td-on-order') {
        return wopoCsConstants.SavedSearch.OnOrderSearch;
    }
    return null;
}

function showTransactionDetail(item) {

    //console.log(item);
    $('#dialog-item-hover').dialog({
        modal: true,
        draggable: true,
        resizable: false,
        position: ['center', 90],   // 90px is height of netsuite header/menu in new release 2014.2 UI
        show: 'blind',
        hide: 'blind',
        width: "50%", //Lets keep it relative
        dialogClass: 'ui-dialog-osx',
        open: function (event, ui) {

            // Hack: Fix the position of close icon on jQuery UI Dialog
            fixPositionOfCloseButton();

            $('#output').empty();
            $('#imgLoadingTeams').show();

            setTimeout(function () {

                var elementId = item.id.replace('-href', '');
                var searchId = getSearchByItemType(elementId);

                if (searchId == null) {
                    $('#output').html('Related data could not be searched!');
                    $('#imgLoadingTeams').hide();
                    return;
                }

                var itemId = $('#' + elementId).attr('data-val');

                try {
                    var results = nlapiSearchRecord(null, searchId, new nlobjSearchFilter('internalid', 'item', 'anyOf', itemId));

                    if (results != null) {
                        //process results here
                        createDetailTable(results);
                    }
                    else {
                        $('#output').html('No Data Found!');
                    }
                } catch (e) {
                    log(e.toString());
                } finally {
                    $('#imgLoadingTeams').hide();
                }
            }, 5000);
        }
    });

    // Hack: Modal popup not getting the background to be completely grey-out
    fixLayoutBackgroundForModalDialog();
}

function createDetailTable(results) {

    var len = !!results ? results.length : 0;
    if (len <= 0)
        return null;

    $('#imgLoadingTeams').show();

    var table = $('<table/>');
    table.css('width', '100%');
    table.attr('border', '1');

    var cols = results[0].getAllColumns();
    var tds = '';

    for (var j = 0; j < cols.length; j++) {
        tds += '<td style="text-align: center; vertical-align: middle;">' + cols[j].label + '</td>';
    }

    table.append('<tr>' + tds + '</tr>');

    for (var i = 0; i < len; i++) {
        var cols = results[i].getAllColumns();
        var tds = '';
        for (var j = 0; j < cols.length; j++) {
            tds += '<td style="text-align: center; vertical-align: middle;">' + (results[i].getText(cols[j].name) || results[i].getValue(cols[j].name)) + '</td>';
        }
        table.append('<tr>' + tds + '</tr>');
    }
    $('#output').append(table);
    $('#imgLoadingTeams').hide();
    return 1;

}

function convertDate(inputFormat) {
    function pad(s) {
        return (s < 10) ? '0' + s : s;
    }

    var d = new Date(inputFormat);
    return [pad(d.getMonth() + 1), pad(d.getDate()), d.getFullYear()].join('/');
}

function progressDownloading(isDone) {

    if (!!isDone) {
        $(".ui-widget-overlay.custom-busy").remove();
    }
    else {

        $("body").append("<div class='ui-widget-overlay custom-busy' style='width:2000px;height:2000px'><img " +
            "src='https://3500213.app.netsuite.com/core/media/media.nl?id=328980&c=3500213&h=32302175e46c0a2e4c3f' " +
            "style='left:30%;top:15%;width:5%;position:absolute;' /></div>");
    }
}

var guid = (function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();

/**
 * Validates form and return true or false
 * @returns {boolean}
 */
function validateForm() {

    if (nlapiGetFieldValue('custpage_sf_type') == '-1') {
        showMessage('Please select work order or purchase order.', 'error');
        $('#inpt_custpage_sf_type1').focus();
        return false;
    }

    if (nlapiGetFieldValue('custpage_sf_warehouse').length <= 0) {
        showMessage('Please select warehouse.', 'error');
        $('#inpt_custpage_sf_warehouse2').focus();
        return false;
    }

    //var selectedFromDate = $('#custpage_txt_order_start_ship_date').val();
    var selectedToDate = $('#custpage_txt_order_end_received_by_date').val();

//    if (checkDate(selectedFromDate) == false){
//        showMessage(selectedFromDate + ' is not a valid date!','error', false);
//        $('#custpage_txt_order_start_ship_date').focus();
//        return false;
//    }

    if (checkDate(selectedToDate) == false) {
        showMessage(selectedToDate + ' is not a valid date!', 'error', false);
        $('#custpage_txt_order_end_received_by_date').focus();
        return false;
    }

//    if (new Date(selectedFromDate) > new Date(selectedToDate)){
//        showMessage('From Date should be less than To Date!','error', false);
//        $('#custpage_txt_order_start_ship_date').focus();
//        return false;
//    }

//    if (nlapiGetFieldValue('custpage_sf_customer').length <= 0){
//        showMessage('Please select Customer.', 'error');
//        $('#custpage_sf_customer_display').focus();
//        return false;
//    }

    var value = nlapiGetFieldValue('custpage_sf_type');
    if (value == "1") {
        if (nlapiGetFieldValue('custpage_sf_vendor').length <= 0) {
            showMessage('Please select Vendor.', 'error');
            $('#custpage_sf_vendor_display').focus();
            return false;
        }
    }

    return true;
}

/**
 * Checks if a key is numeric or not
 * @param evt
 * @returns {boolean}
 */
function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    if (charCode != 46 && charCode > 31
        && (charCode < 48 || charCode > 57))
        return false;

    return true;
}

/**
 * Validates a line item value
 * @param orderDate
 * @param qty
 * @returns {boolean}
 */
function validateLineItem(orderDate, dataRow, qty) {

    if (!!orderDate && orderDate.length > 0 && checkDate(orderDate) == false) {
        showMessage(orderDate + ' is not a valid date!', 'error', false);
        dataRow.find('.line-order-date').focus();
        return false;
    }

    if (!qty || qty.length <= 0) {
        showMessage('Please input quantity!', 'error', false);
        dataRow.find('.line-order-quantity').focus();
        return false;
    }

    if (!qty || qty.length <= 0 || isNumeric(qty) == false) {
        showMessage(qty + ' is not a valid quantity!', 'error', false);
        dataRow.find('.line-order-quantity').focus();
        return false;
    }
    else if (parseInt(qty) <= 0 || parseInt(qty) > 9999) {
        showMessage('order quantity in line item should be between 1 and 9999!', 'error', false);
        dataRow.find('.line-order-quantity').focus();
        return false;
    }

    return true;
}

function onSubmitSuccess(response) {

    var type = response.data.type;

    var url = wopoCsConstants.ApiUrls["order_" + type];

    if (type == wopoCsConstants.RecordTypeValues.PurchaseOrder) {
        showMessage('New records have been created successfully.', 'success', false);
    }
    else if (type == wopoCsConstants.RecordTypeValues.WorkOrder) {
        showMessage('New records creation has been scheduled successfully.', 'success', false);
    }


    $('#dialog-transaction-success').dialog({
        title: getSuccessModalDialogTitle(type),
        modal: true,
        draggable: true,
        resizable: false,
        position: ['center', 90],   // 90px is height of netsuite header/menu in new release 2014.2 UI
        show: 'blind',
        hide: 'blind',
        width: "50%", //Lets keep it relative
        dialogClass: 'ui-dialog-osx',
        open: function (event, ui) {

            // Hack: Fix the position of close icon on jQuery UI Dialog
            fixPositionOfCloseButton();

            $('#success-output').empty();
            var dialogHtml = getSuccessModalDialogHtml(type, response.data.idDetailArray);

            $('#success-output').append(dialogHtml);
        }
    });

    // Hack: Modal popup not getting the background to be completely grey-out
    fixLayoutBackgroundForModalDialog();
}

/*
 Return html for success modal dialog based on entity type (WO/PO)
 */
function getSuccessModalDialogHtml(type, idDetailArray) {

    var div = $('<div/>');

    if (type == wopoCsConstants.RecordTypeValues.PurchaseOrder) {

        var url = wopoCsConstants.ApiUrls["order_" + type];

        if (!!idDetailArray) {
            for (var i = 0; i < idDetailArray.length; i++) {
                var a = $('<a/>');
                a.attr('href', url + idDetailArray[i].id);
                a.text(idDetailArray[i].text);
                a.attr("target", "_blank");

                div.append(a);
                div.append("<br/>");
            }
        }
    }
    else if (type == wopoCsConstants.RecordTypeValues.WorkOrder) {
        div.append("<p>" + wopoCsConstants.Message.ScheduleScriptExecutionStarted + "</p>");
    }

    return div;
}

/*
 Return title for success modal dialog based on entity type (WO/PO)
 */
function getSuccessModalDialogTitle(type) {

    var title = '';
    if (type == wopoCsConstants.RecordTypeValues.PurchaseOrder) {
        title = "Newly created " + wopoCsConstants.RecordType[type];
    }
    else if (type == wopoCsConstants.RecordTypeValues.WorkOrder) {
        title = "Work Orders Creation Status";
    }

    return title;
}

/**
 * Save data
 */
function btnSubmit_Click() {
    try {
        showMessage(null);// $('#lbl_message').text('');

        var isValid = validateForm();

        if (isValid == false)
            return;

        var selectedIds = jQuery("#scrolling").jqGrid('getGridParam', 'selarrrow');

        $($('#scrolling tr .line-order-quantity')[0]).val();
        $($('#scrolling tr .line-order-date')[0]).val();
        $($('#scrolling tr .line-order-comments')[0]).val();

        if (selectedIds.length <= 0) {
            alert(wopoCsConstants.Message.SelectionRequired);
            return;
        }

        var dataToSend = [];

        // Show loading
        progressDownloading(false);

        for (var row = 0; row < selectedIds.length; row++) {

            var rowNumber = parseInt(selectedIds[row]);
            var dataRow = $($('#scrolling tr')[rowNumber]);
            var qty = dataRow.find('.line-order-quantity').val();
            var orderDate = dataRow.find('.line-order-date').val();
            var isValidLine = validateLineItem(orderDate, dataRow, qty);

            if (isValidLine == false){
                progressDownloading(true);
                return false;
            }

            dataToSend.push({
                internalid: parseInt(dataRow.find('td[aria-describedby="scrolling_internalid"]').text()),
                quantity: dataRow.find('.line-order-quantity').val(),
                orderdate: dataRow.find('.line-order-date').val(),
                comments: dataRow.find('.line-order-comments').val()
            });
        }

        var formData = getFormData();
        var uuid = guid();

        //send the data to server to process
        $.ajax({
            url: wopoCsConstants.ApiUrls.processItems + '&uuid=' + uuid,
            type: 'POST',
            dataType: 'json',
            data: "items=" + JSON.stringify(dataToSend) + "&formData=" + JSON.stringify(formData),
            success: function (response) {
                // hide message
                progressDownloading(true);

                if (response.Result == "ERROR") {
                    showMessage('Error from server: ' + response.Message, 'error', false);
                }
                else {
                    onSubmitSuccess(response);
                    //showMessage('New records have been created successfully.', 'success', false);
                }
            },
            fail: function (response) {
                // hide message
                progressDownloading(true);

                alert('background process failed.');
            }
        });
    }
    catch (ex) {
        // hide message
        progressDownloading(true);
        showMessage('Error: ' + ex.message, 'error', false);
    }
}

/**
 * Gets form field data from the UI and returns
 */
function getFormData() {

    var result = {};

    result.type = nlapiGetFieldValue('custpage_sf_type');

    result.warehouse = nlapiGetFieldValue('custpage_sf_warehouse');

    //var selectedFromDate = $('#custpage_txt_order_start_ship_date').val();
    var selectedToDate = $('#custpage_txt_order_end_received_by_date').val();

    //result.selectedFromDate = selectedFromDate;
    result.selectedToDate = selectedToDate;

//    result.customer = nlapiGetFieldValue('custpage_sf_customer');

    result.vendor = null;

    var value = nlapiGetFieldValue('custpage_sf_type');
    if (value == "1") {
        result.vendor = nlapiGetFieldValue('custpage_sf_vendor');
    }

    return result;
}

/**
 * Checks if give number is a number or not.
 * @param num
 * @returns {boolean}
 */
function isNumeric(num) {
    return !isNaN(num)
}

/**
 * Called when Cancel button is clicked
 */
function btnCancel_Click() {
    // refresh the page.
    window.location.href = window.location.href;
}

/**
 * Called when Mark All is clicked
 */
function btnMarkAll_Click() {
    $('#cb_scrolling').click();
}

/**
 * Called when UnMark All is clicked
 */
function btnUnmarkAll_Click() {
    jQuery("#scrolling").jqGrid('resetSelection');
}

/**
 * Handles the user event when a user changes the Work order or Purchase order.
 * @param name
 */
function handleTypeChange(name) {
    var value = nlapiGetFieldValue(name);
    if (value == "-1") {
        nlapiSetFieldValue('custpage_sf_vendor', '');
        $('#custpage_sf_vendor_display').attr('disabled', true);
        $('#custpage_sf_vendor_popup_muli').hide();
    }
    else {

        if (value == "0") {
            nlapiSetFieldValue('custpage_sf_vendor', '');
            $('#custpage_sf_vendor_display').attr('disabled', true);
            $('#custpage_sf_vendor_popup_muli').hide();
        }
        else {
            $('#custpage_sf_vendor_display').attr('disabled', false);
            $('#custpage_sf_vendor_popup_muli').show();
        }
    }
}

/**
 * fires when  field has changed
 * @param type
 * @param name
 * @param linenum
 */
function wopoFieldChanged(type, name, linenum) {

    //TODO: Here we can handle field changes, and fill dropdowns accordingly.
    log('myFieldChanged');
    log('type=' + type);
    log('name=' + name);
    log('linenum=' + linenum);

    if (name == 'custpage_sf_type') {
        handleTypeChange(name);
    }
}

/**
 * fires when  page load
 * @param type
 */
function wopoPageInit(type) {

    jQuery("#body").css('min-height', '400px');
}

//region Hacks

/*
 Hack: Fix the position of close icon on jQuery UI Dialog having disposition due to new Release 2014.2
 */
function fixPositionOfCloseButton() {
    jQuery(".ui-icon-closethick").addClass('ui-dialog-close-icon-fixed');
}

/*
 Hack: Modal popup not getting the background to be completely grey-out
 */
function fixLayoutBackgroundForModalDialog() {
    $("div.ui-widget-overlay").css("background", "url('images/ui-bg_flat_0_aaaaaa_40x100.png') repeat-x scroll 50% -100% #AAAAAA");
}


//endregion
