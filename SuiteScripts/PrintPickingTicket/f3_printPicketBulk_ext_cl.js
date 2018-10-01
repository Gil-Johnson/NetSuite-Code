/*
 Client script for RICO Print Picking Ticket in Bulk
 */

var first_id;
var last_id;
var last_date;
var first_date;
var unload_flag = 0;

var SHIPDATE_FIELD_COLUMN_HEADER_TEXT = "Ship Date";

//region Browser types
var CHROME = 'chrome';
var FIREFOX = 'firefox';
var IE = 'ie';
var showingQuickViewFirstTime = true;
//endregion

// Hack: Adding Array.indexOf method for IE browsers, if not exist.
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}


function pageInit(type) {

    window.onbeforeunload = null;

    if (nlapiGetLineItemCount('custpage_list') > 0) {

        //region (Getting Sublist Columns headers text)

        //jQuery("tr[id^='custpage_listheader'], tr[id^='custpage_listrow']").wrapAll('<div class="new-parent"></div>');
        //jQuery(".new-parent").css('height', '400px').css('overflow', 'scroll');

        // parent div was creating on TRs parent, causing DOM element hirarchy in IE. Applied div up to main table.
        jQuery("tr[id^='custpage_listheader']").parent().parent().wrapAll('<div class="new-parent"></div>');
        jQuery(".new-parent").css('height', '600px').css('overflow', 'scroll');

        var w = jQuery('#custpage_listheader td div').each(function () {
            jQuery(this);
        });
        var heads = new Array();
        var ind = 0;
        jQuery('#custpage_listheader td div').each(function () {
            heads[ind] = (jQuery(w[ind]).html());

            if (heads[ind].trim() == SHIPDATE_FIELD_COLUMN_HEADER_TEXT) {
                //  Hack: Fix for ShipDate Field UI For FireFox
                fixShipDateFieldUI(jQuery(w[ind]));
            }

            ind++;
        });

        //endregion


        //region (Filtering/Parsing Sublist Columns headers text)
        for (var i = 0; i < heads.length; i++) {
            heads[i] = heads[i].split('&')[0];

            // Remving <img> tag for item select field column header
            // <img src="/images/hover/icon_hover.png?v=2014.1.0" alt="" border="0" style="margin-left:8px;vertical-align:middle;" title="This column is hoverable">
            var tagStartIndex = heads[i].indexOf('<');
            if (tagStartIndex > -1) {
                heads[i] = heads[i].substring(0, tagStartIndex);
            }

        }
        //endregion

        //region (Assigning Column header text as title of cell(td) for showing tooltip when scrolling down the list)
        var rows = jQuery("tr[id^='custpage_listrow']");
         for (var i = 0; i < rows.length; i++) {
             var col = jQuery(rows[i]).children(':visible');
             for (var j = 0; j < col.length; j++) {
                 if (col[j].style.display != 'none') {
                     jQuery(col[j]).attr('title', heads[j]);
                 }
             }
         }
        //endregion
    }

    jQuery("#date_to_helper_calendar").attr('title', 'Ship Date To');
    jQuery("#date_from_helper_calendar").attr('title', 'Ship Date From');
    jQuery('#date_from, #date_to').blur(function () {
        var from = nlapiStringToDate(nlapiGetFieldValue('date_from'));
        var to = nlapiStringToDate(nlapiGetFieldValue('date_to'));
        if (!isBlankOrNull(from) && !isBlankOrNull(to)) {
            if (from > to) {
                alert('Ship Date From cannot be greate than Ship Date To');
                jQuery(this).val('');
            }
        }
    });

    // Remove 'New' item from all defined select list 'click' event
    jQuery("#inpt_printed_picking_ticket1, #inpt_printed_picking_ticket1_arrow, #inpt_ready_to_print5, #inpt_ready_to_print5_arrow, #inpt_item_discontinued6, #inpt_item_discontinued6_arrow, #inpt_item_isinactive7, #inpt_item_isinactive7_arrow, #inpt_partner2, #inpt_partner2_arrow").click(function () {
        var a = jQuery('div.dropdownDiv div');
        if (jQuery(a[1]).html() == "- New -") {
            jQuery(a[1]).remove();
        }
    });

    // Remove 'New' item from all defined select list 'mouseleave' event
    jQuery("#inpt_printed_picking_ticket1, #inpt_printed_picking_ticket1_arrow, #inpt_ready_to_print5, #inpt_ready_to_print5_arrow, #inpt_item_discontinued6, #inpt_item_discontinued6_arrow, #inpt_item_isinactive7, #inpt_item_isinactive7_arrow, #inpt_partner2, #inpt_partner2_arrow").mouseleave(function () {
        var a = jQuery('div.dropdownDiv div');
        if (jQuery(a[1]).html() == "- New -") {
            jQuery(a[1]).remove();
        }
    });



    //region (Select all records of this session and this page from 'custrecord_selectedprintingdata' custom record
    // to mark respective checkbox as checked)
    var pageId = document.getElementById('custpage_pageno').value;
    var sessionid = document.getElementById('custpage_sessionid').value;
    var selectedRecords = null;
    try {
        var existingRec = getSelectedRecordData(sessionid, pageId);
        if (existingRec) {
            var selectedprintingdata = existingRec.getFieldValue('custrecord_selectedprintingdata');
            selectedRecords = JSON.parse(selectedprintingdata);
        }
    }
    catch (ex) {
        var err = ex.message;
    }

    var selectedItems = new Array();
    if (selectedRecords) {
        for (var z = 0; z < selectedRecords.items.length; z++) {

            selectedItems.push(selectedRecords.items[z].order + selectedRecords.items[z].item);
        }
    }
    //endregion



    var colors = {
        yellow: '#ffff00',
        grey: '#c0c0c0',
        brown: '#800000',
        green: '#008000',
        pink: '#ffcc99'
    };

    //*

    for (var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {

        var elems = document.getElementsByName('spanId' + i);
        var row = elems[0].parentElement.parentElement;
        var cells = row.getElementsByTagName('td');

        var tdStyle = '';

        if (!isBlankOrNull(nlapiGetLineItemValue('custpage_list', 'custpage__backorderallowed', i))
            && getVal(nlapiGetLineItemValue('custpage_list', 'custpage__backorderallowed', i)).trim() == 'No') {

            tdStyle += 'background-color:' + colors['pink'] + ' !important;';
        }
        if (nlapiGetLineItemValue('custpage_list', 'custpage_item', i).trim() == '') {

            // This is mainline
            tdStyle += 'background-color:' + colors['grey'] + ' !important;';

            disableItemSelectListField(i, true);

        } else {
            //bindItemMouseOverQuickViewEvent(i);
            if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage__onhold', i)).trim() == 'Yes' || getVal(nlapiGetLineItemValue('custpage_list', 'custpage__onhold', i)).trim() == 'T') {
                tdStyle += 'background-color:' + colors['yellow'] + ' !important;';
            }
            if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage__quantitycommitted', i)).trim() == '0') {
                tdStyle += 'color:' + colors['brown'] + ' !important;';
            }
            else {
                var remainingQty = getVal(nlapiGetLineItemValue('custpage_list', 'custpage__remainingquantity', i)).trim();
                remainingQty *= 1;
                //var shipDate = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', i)).trim();
                var shipDate = nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', i).trim();
                shipDate = new Date(shipDate);
                if (remainingQty <= 0 && shipDate <= new Date(shipDate)) {

                    tdStyle += 'color:' + colors['green'] + ' !important;';
                }
            }

            // Disable Item Select List Fieldif quantity packed is greater than 0
            var qtyPacked = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_quantitypacked', i)).trim();
            if (parseInt(qtyPacked) > 0) {
                disableItemSelectListField(i, false);
            }
        }

        //region Apply styling on row
        if (!!tdStyle) {
            for (var j = 0; j < cells.length; j++) {
                if (cells[j].getAttribute('title')) {
                    cells[j].setAttribute('style', tdStyle);
                }
            }
        }
        //endregion

        // Hack to set width of ship date textbox
        setWidthOfShipDateTextbox(i);

        if (selectedRecords) {

            var orderId = nlapiGetLineItemValue('custpage_list', 'custpage_id', i);
            //var item = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_item', i)).trim();
            var item = nlapiGetLineItemText('custpage_list', 'custpage_item', i).trim();
            if (item == '') {
                if (selectedRecords.orders.indexOf(orderId) > -1) {
                    var index = nlapiGetLineItemValue('custpage_list', 'custpage_index', i);
                    setCheckBoxStatus(index, 'custpage_cancel_');
                    disableLineItems(index);
                }

                if (selectedRecords.prints.indexOf(orderId) > -1) {
                    var index = nlapiGetLineItemValue('custpage_list', 'custpage_index', i);
                    setCheckBoxStatus(index, 'custpage_print_');
                }
            }
            else {

                if (selectedItems.indexOf(orderId + item) > -1) {
                    var index = nlapiGetLineItemValue('custpage_list', 'custpage_index', i);
                    setCheckBoxStatus(index, 'custpage_cancel_');
                }
            }

        }
    }

    //*/

    if (nlapiGetLineItemCount('custpage_list') > 0) {
        //        var num = 1;
        //        while (isNaN(getVal(nlapiGetLineItemValue('custpage_list','custpage_number', num))) && getVal(nlapiGetLineItemValue('custpage_list','custpage_number', num)))
        //        {
        //            if(num == nlapiGetLineItemCount('custpage_list')){}
        //            num++;
        //        }
        first_id = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', 1));
        last_id = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', nlapiGetLineItemCount('custpage_list')));
        last_date = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_date', nlapiGetLineItemCount('custpage_list')));
        first_date = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_date', 1));
    }


    // Hack to set position of opening calendar control
    setPositionOfOpeningCalenderControl();

    // Hack to set position of opening item list control for chrome browser only
    if (detectBrowser(IE) || detectBrowser(CHROME)) {
        setPositionOfOpeningItemListControl();
    }
}


/*
 Mark Item Select List disable and hide popup opening anchor
 */
function disableItemSelectListField(lineid, hide) {

    // Mark textbox disabled
    var textboxId = 'custpage_list_custpage_item' + lineid + '_display';
    var textbox = document.getElementById(textboxId);
    if (textbox) {
        //textbox.value = '';
        //textbox.disabled = true;
        textbox.readOnly = true;
        if (hide) {
            textbox.setAttribute("style", "display: none;");

            /*var itemParentElement = textbox.parentElement.parentElement.parentElement;
            if(!!itemParentElement) {
                var customerName = getVal(nlapiGetLineItemValue('custpage_list', 'custpage__name', lineid));
                var customerId = getVal(nlapiGetLineItemValue('custpage_list', 'custpage__customerid', lineid));
                itemParentElement.innerHTML = '<a id="custname_anchor_'+lineid+'" style="width: 164px !important;cursor: pointer !important;" onmouseover="showCustomerQuickView('+customerId+', '+lineid+')">' + customerName + '</a>' + itemParentElement.innerHTML;
            }*/
        }
        // Mark anchor not clickable
        var anchorParentSpanId = 'parent_actionbuttons_custpage_list_custpage_item' + lineid + '_fs';
        var anchorParentSpan = document.getElementById(anchorParentSpanId);
        //var anchor = anchorParentSpan.getElementById('custpage_item_popup_muli');
        var anchor = anchorParentSpan.getElementsByTagName('a')[0];
        //var anchorNext = anchorParentSpan.getElementById('fwpopupsel');
        var anchorNext = anchorParentSpan.getElementsByTagName('a')[1];
        anchor.setAttribute("style", "pointer-events: none !important; cursor: default !important; display: none !important;");
        anchorNext.setAttribute("style", "pointer-events: none !important; cursor: default !important; display: none !important;");
    }
}

function bindItemMouseOverQuickViewEvent(lineid) {

    /*var itemId = nlapiGetLineItemValue('custpage_list', 'custpage_hd_item', lineid);
    var parentSpanId = 'custpage_list_custpage_item' + lineid + '_fs';
    var parentSpan = document.getElementById(parentSpanId);
    parentSpan.setAttribute("style", "white-space: nowrap;cursor: pointer !important;" );
    parentSpan.addEventListener("mouseover", function(){
        showItemQuickView(itemId, lineid, this);
    }, false);*/
}

function showCustomerQuickView(customerId, lineid) {
    if(showingQuickViewFirstTime) {
        //console.log('first time showing customer tooltip');

        showingQuickViewFirstTime = false;
        //console.log('showing customer tooltip 1');
        try { displayCustomerQuickView(customerId, lineid); } catch (ex) {}
        //displayCustomerQuickView(customerId, lineid);
        setTimeout(function() {
            //console.log('showing customer tooltip 2');
            displayCustomerQuickView(customerId, lineid);
        }, 5000);
    }
    else {
        displayCustomerQuickView(customerId, lineid);
    }
}

function displayCustomerQuickView(customerId, lineid) {
    //alert(customerId);

    //var controlId = 'custpage_list_custpage_item' + lineid + '_fs';
    var controlId = 'custname_anchor_' + lineid;

    //alert('customerId=' + customerId + '    >>    lineid=' + lineid+ '    >>    controlId=' + controlId);
    var win = (typeof parent.getExtTooltip != 'undefined' && parent.getExtTooltip) ? parent : window;
    if (typeof win.getExtTooltip != 'undefined') {
        //alert('controlId=' + controlId);
        var tip = win.getExtTooltip(controlId, 'entity', 'DEFAULT_TEMPLATE', customerId, null);
        if (tip != undefined) {
            //console.log('showing customer tooltip');
            tip.show();
        }
    }

}

function showItemQuickView(itemid, lineid, event) {
    if(showingQuickViewFirstTime) {
        //console.log('first time showing item tooltip');

        showingQuickViewFirstTime = false;
        try { displayItemQuickView(itemid, lineid, event); } catch (ex) {}
        //displayItemQuickView(itemid, lineid);
        setTimeout(function() {
            displayItemQuickView(itemid, lineid, event);
        }, 5000);
    }
    else {
        displayItemQuickView(itemid, lineid, event);
    }
}

function displayItemQuickView(itemid, lineid, event) {
    //alert('itemid=' + itemid + '    >>    lineid=' + lineid);

    var controlId = 'itemdesc_anchor_' + lineid;
    var win = (typeof parent.getExtTooltip != 'undefined' && parent.getExtTooltip) ? parent : window;
    if (typeof win.getExtTooltip != 'undefined') {
        var tip = win.getExtTooltip(controlId, 'ITEM', 'CONTACT_TEMPLATE', itemid, null);
        if (tip != undefined) {
            console.log('showing item tooltip');
            tip.onTargetOver(event);
        }
    }
}

function disableLineItems(index) {

    index = index * 1;
    var checked = document.getElementById('custpage_cancel_' + index).checked;
    var print = document.getElementById('custpage_print_' + index);
    if (print.checked) {
        unload_flag--;
    }

    print.checked = false;
    print.disabled = checked;
    nlapiSetLineItemValue('custpage_list', 'custpage_print_' + 'val', index, 'F');

    var number = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', index));

    for (var i = index + 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {
        if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', i)) == number) {
            var elem = document.getElementById('custpage_cancel_' + i);
            if (elem.checked && checked) {
                unload_flag--;
            }

            elem.checked = checked;
            elem.disabled = checked;
            nlapiSetLineItemValue('custpage_list', 'custpage_cancel_val', i, 'F');
        } else {
            break;
        }
    }
}

//This function calls at the time of pageload to mark checked to all previously checked records
function setCheckBoxStatus(index, id) {
    var checked = true;
    document.getElementById('' + id + index).checked = checked;
    nlapiSetLineItemValue('custpage_list', id + 'val', index, (checked ? 'T'
        : 'F'));
    var val = nlapiGetLineItemValue('custpage_list', id + 'val', index);
    if (val == 'T') {
        unload_flag++;
    }
    else {
        unload_flag--;
    }
    /*
     if(unload_flag != 0){
     window.onbeforeunload = function () {
     return  "You have some unsubmitted data.";
     };
     }
     else{
     window.onbeforeunload = null;
     }
     */

}


function setVal(index, id) {

    var checked = document.getElementById('' + id + index).checked;
    nlapiSetLineItemValue('custpage_list', id + 'val', index, (checked ? 'T'
        : 'F'));
    var val = nlapiGetLineItemValue('custpage_list', id + 'val', index);
    if (val == 'T') {
        unload_flag++;
    }
    else {
        unload_flag--;
    }
    /*
     if(unload_flag != 0){
     window.onbeforeunload = function () {
     return  "You have some unsubmitted data.";
     };
     }
     else{
     window.onbeforeunload = null;
     }
     */

}


/*
 Return selected record data if exist
 */
function getSelectedRecordData(sessionId, pageId) {

    try {
        var filters = new Array();
        var columns = new Array();

        filters.push(new nlobjSearchFilter('custrecord_sessionid', '', 'is', sessionId));
        filters.push(new nlobjSearchFilter('custrecord_pageid', '', 'is', pageId));

        columns.push(new nlobjSearchColumn('custrecord_sessionid'));
        columns.push(new nlobjSearchColumn('custrecord_pageid'));
        columns.push(new nlobjSearchColumn('custrecord_selectedprintingdata'));

        var result = nlapiSearchRecord('customrecord_pickingticketprintingdata', null, filters, columns);

        if (result != null && result.length > 0) {

            return nlapiLoadRecord('customrecord_pickingticketprintingdata', result[0].getId());
        }
        else {
            return null;
        }
    } catch (ex) {
        var msg = ex.message;
        return null;
    }
}


function applyFilter() {
    var item = nlapiGetFieldValue('item');
    var partner = nlapiGetFieldValue('partner');
    var ppt = document.getElementById('inpt_printed_picking_ticket1').value;//nlapiGetFieldText('printed_picking_ticket');
    var warehouse = nlapiGetFieldValue('warehouse');
    var customer = nlapiGetFieldValue('customer');
    var date_from = nlapiGetFieldValue('date_from');
    var date_to = nlapiGetFieldValue('date_to');
    var print_status = nlapiGetFieldValue('print_status');
    var so_status = nlapiGetFieldValues('so_status');
    var ready_to_print = document.getElementById('inpt_ready_to_print5').value;//nlapiGetFieldText('ready_to_print');
    var item_discontinued = document.getElementById('inpt_item_discontinued6').value;
    var item_isinactive = document.getElementById('inpt_item_isinactive7').value;
    var url = nlapiResolveURL('SUITELET', 'customscript_pickingbulk_ext', 'customdeploy_pickingbulk_ext');
    var query_param = '';
    if (!isBlankOrNull(item)) {
        query_param += '&item=' + item;
    }
    if (!isBlankOrNull(partner)) {
        query_param += '&partner=' + partner;
    }
    if (!isBlankOrNull(ppt)) {
        query_param += '&ppt=' + ppt;
    }
    if (!isBlankOrNull(warehouse)) {
        query_param += '&warehouse=' + warehouse;
    }
    if (!isBlankOrNull(customer)) {
        query_param += '&customer=' + customer;
    }
    if (!isBlankOrNull(date_from)) {
        query_param += '&date_from=' + date_from;
    }
    if (!isBlankOrNull(date_to)) {
        query_param += '&date_to=' + date_to;
    }
    if (!isBlankOrNull(print_status)) {
        query_param += '&print_status=' + print_status;
    }
    if (so_status != null) {
        //query_param += '&so_status=' + JSON.stringify(so_status);
        query_param += '&so_status=' + encodeURIComponent(JSON.stringify(so_status));
    }
    if (!isBlankOrNull(ready_to_print)) {
        query_param += '&ready_to_print=' + ready_to_print;
    }
    if (!isBlankOrNull(item_discontinued)) {
        query_param += '&inpt_item_discontinued=' + item_discontinued;
    }
    if (!isBlankOrNull(item_isinactive)) {
        query_param += '&inpt_item_isinactive=' + item_isinactive;
    }

    var sessionid = document.getElementById('custpage_sessionid').value;
    var pageId = document.getElementById('custpage_pageno').value;
    query_param += '&session_id=' + sessionid;
    query_param += '&page_no=' + pageId;

    //window.location.href = url + query_param;


    var val = nlapiGetFieldValue('pag_details');
    var val_date = nlapiGetFieldValue('pag_details_date');

    var form = jQuery('<form style="display: none;" action="' + url + query_param + '" method="post">' +
        '<input type="text" name="pag_flag" value="' + 'T' + '" />' +
        '<input type="text" name="pag" value="' + val + '" />' +
        '<input type="text" name="pag_date" value="' + val_date + '" />' +
        '</form>');
    jQuery('body').append(form);
    jQuery(form).submit();

}

function nextPage() {

    try {


        var item = nlapiGetFieldValue('item');
        var partner = nlapiGetFieldValue('partner');
        var ppt = document.getElementById('inpt_printed_picking_ticket1').value//nlapiGetFieldText('printed_picking_ticket');
        var warehouse = nlapiGetFieldValue('warehouse');
        var customer = nlapiGetFieldValue('customer');
        var date_from = nlapiGetFieldValue('date_from');
        var date_to = nlapiGetFieldValue('date_to');
        var print_status = nlapiGetFieldValue('print_status');
        var so_status = nlapiGetFieldValues('so_status');
        var ready_to_print = document.getElementById('inpt_ready_to_print5').value//nlapiGetFieldText('ready_to_print');
        var item_discontinued = document.getElementById('inpt_item_discontinued6').value;
        var item_isinactive = document.getElementById('inpt_item_isinactive7').value;
        nlapiSetFieldValue('pag_flag', 'T');
        var val = nlapiGetFieldValue('pag_details');
        var val_date = nlapiGetFieldValue('pag_details_date');


        if (isBlankOrNull(val)) {
            val = first_id;
            val_date = first_date;
        }
        else {
            val += ',' + first_id;
            val_date += ',' + first_date;
        }
        var url = nlapiResolveURL('SUITELET', 'customscript_pickingbulk_ext', 'customdeploy_pickingbulk_ext');
        var query_param = '';
        if (!isBlankOrNull(item)) {
            query_param += '&item=' + item;
        }
        if (!isBlankOrNull(partner)) {
            query_param += '&partner=' + partner;
        }
        if (!isBlankOrNull(ppt)) {
            query_param += '&ppt=' + ppt;
        }
        if (!isBlankOrNull(warehouse)) {
            query_param += '&warehouse=' + warehouse;
        }
        if (!isBlankOrNull(customer)) {
            query_param += '&customer=' + customer;
        }
        if (!isBlankOrNull(date_from)) {
            query_param += '&date_from=' + date_from;
        }
        if (!isBlankOrNull(date_to)) {
            query_param += '&date_to=' + date_to;
        }
        if (!isBlankOrNull(print_status)) {
            query_param += '&print_status=' + print_status;
        }
        if (so_status != null) {
            //query_param += '&so_status=' + JSON.stringify(so_status);
            query_param += '&so_status=' + encodeURIComponent(JSON.stringify(so_status));
        }
        if (!isBlankOrNull(ready_to_print)) {
            query_param += '&ready_to_print=' + ready_to_print;
        }
        if (!isBlankOrNull(item_discontinued)) {
            query_param += '&inpt_item_discontinued=' + item_discontinued;
        }
        if (!isBlankOrNull(item_isinactive)) {
            query_param += '&inpt_item_isinactive=' + item_isinactive;
        }

        //    var from = getVal(nlapiGetLineItemValue('custpage_list','custpage_internalid', nlapiGetLineItemCount('custpage_list')));
        query_param += '&next_page=' + last_id + '&next_date=' + last_date;

        /*********************************  Get Selected Sublist recods here  ********************************/

        var pageId = document.getElementById('custpage_pageno').value;
        var sessionid = document.getElementById('custpage_sessionid').value;

        var params = {
            orders: new Array(),
            items: new Array(),
            prints: new Array()
        };

        for (var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {

            if (nlapiGetLineItemValue('custpage_list', 'custpage_cancel_val', i) == 'T') {

                //var item = getVal(nlapiGetLineItemValue('custpage_list','custpage_item', i)).trim();
                var item = nlapiGetLineItemText('custpage_list', 'custpage_item', i).trim();

                if (item != '') {
                    var itemObj = {
                        order: nlapiGetLineItemValue('custpage_list',
                            'custpage_id', i),
                        item: item
                    };
                    params.items.push(itemObj);
                } else {
                    params.orders.push(nlapiGetLineItemValue(
                        'custpage_list', 'custpage_id', i));
                }
            }
            if (nlapiGetLineItemValue('custpage_list', 'custpage_print_val',
                i) == 'T') {
                params.prints.push(nlapiGetLineItemValue('custpage_list',
                    'custpage_id', i));
            }
        }


        var existingRec = getSelectedRecordData(sessionid, pageId);
        if (existingRec) {
            existingRec.setFieldValue('custrecord_selectedprintingdata', JSON.stringify(params));
            nlapiSubmitRecord(existingRec);
        }
        else {

            var newRec = nlapiCreateRecord('customrecord_pickingticketprintingdata');
            newRec.setFieldValue('custrecord_sessionid', sessionid);
            newRec.setFieldValue('custrecord_pageid', pageId);
            newRec.setFieldValue('custrecord_selectedprintingdata', JSON.stringify(params));

            nlapiSubmitRecord(newRec);
        }

        /*****************************************************************************************************/

        var page_no = parseInt(pageId);
        page_no += 1;

        query_param += '&session_id=' + sessionid;
        query_param += '&page_no=' + page_no.toString();

        var form = jQuery('<form style="display: none;" action="' + url + query_param + '" method="post">' +
            '<input type="text" name="pag_flag" value="' + 'T' + '" />' +
            '<input type="text" name="submit_modified_records" value="' + 'T' + '" />' +
            '<input type="text" name="submit_modified_records_data" value=\'' + getModifiedSalesOrdersJsonData() + '\' />' +
            '<input type="text" name="pag" value="' + val + '" />' +
            '<input type="text" name="pag_date" value="' + val_date + '" />' +
            '</form>');
        jQuery('body').append(form);
        jQuery(form).submit();

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error_next_click', ex.message);
    }
}

function previousPage() {

    try {

        var item = nlapiGetFieldValue('item');
        var partner = nlapiGetFieldValue('partner');
        var ppt = document.getElementById('inpt_printed_picking_ticket1').value//nlapiGetFieldText('printed_picking_ticket');
        var warehouse = nlapiGetFieldValue('warehouse');
        var customer = nlapiGetFieldValue('customer');
        var date_from = nlapiGetFieldValue('date_from');
        var date_to = nlapiGetFieldValue('date_to');
        var print_status = nlapiGetFieldValue('print_status');
        var so_status = nlapiGetFieldValues('so_status');
        var ready_to_print = document.getElementById('inpt_ready_to_print5').value//nlapiGetFieldText('ready_to_print');
        var item_discontinued = document.getElementById('inpt_item_discontinued6').value;
        var item_isinactive = document.getElementById('inpt_item_isinactive7').value;
        nlapiSetFieldValue('pag_flag', 'T');


        if (isBlankOrNull(nlapiGetFieldValue('pag_details'))) {
            alert('Already on first page');
        }
        else {
            var _val = nlapiGetFieldValue('pag_details').split(',');
            var _val_date = nlapiGetFieldValue('pag_details_date').split(',');
            first_id = _val[_val.length - 1];
            first_date = _val_date[_val_date.length - 1];
            if (nlapiGetLineItemCount('custpage_list') > 0)
                var first_id_to = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', 1));
            var url = nlapiResolveURL('SUITELET', 'customscript_pickingbulk_ext', 'customdeploy_pickingbulk_ext');
            var val = '';
            var val_date = '';
            for (var i = 0; i < _val.length - 1; i++) {
                val += _val[i] + ',';
                val_date += _val_date[i] + ',';
            }

            // Remove last ',' from val and val_date
            val[val.length - 1] = '';
            val_date[val_date.length - 1] = '';

            val_date = val_date.replace(/,$/, "");
            val = val.replace(/,$/, "");
            var query_param = '';
            if (!isBlankOrNull(item)) {
                query_param += '&item=' + item;
            }
            if (!isBlankOrNull(partner)) {
                query_param += '&partner=' + partner;
            }
            if (!isBlankOrNull(ppt)) {
                query_param += '&ppt=' + ppt;
            }
            if (!isBlankOrNull(warehouse)) {
                query_param += '&warehouse=' + warehouse;
            }
            if (!isBlankOrNull(customer)) {
                query_param += '&customer=' + customer;
            }
            if (!isBlankOrNull(date_from)) {
                query_param += '&date_from=' + date_from;
            }
            if (!isBlankOrNull(date_to)) {
                query_param += '&date_to=' + date_to;
            }
            if (!isBlankOrNull(print_status)) {
                query_param += '&print_status=' + print_status;
            }
            if (so_status != null) {
                //query_param += '&so_status=' + JSON.stringify(so_status);
                query_param += '&so_status=' + encodeURIComponent(JSON.stringify(so_status));
            }
            if (!isBlankOrNull(ready_to_print)) {
                query_param += '&ready_to_print=' + ready_to_print;
            }
            if (!isBlankOrNull(item_discontinued)) {
                query_param += '&inpt_item_discontinued=' + item_discontinued;
            }
            if (!isBlankOrNull(item_isinactive)) {
                query_param += '&inpt_item_isinactive=' + item_isinactive;
            }

            /*********************************  Get Selected Sublist recods here  ********************************/

            var sessionid = document.getElementById('custpage_sessionid').value;
            var pageId = document.getElementById('custpage_pageno').value;

            var params = {
                orders: new Array(),
                items: new Array(),
                prints: new Array()
            };

            for (var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {

                if (nlapiGetLineItemValue('custpage_list', 'custpage_cancel_val', i) == 'T') {

                    //var item = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_item', i)).trim();
                    var item = nlapiGetLineItemText('custpage_list', 'custpage_item', i).trim();

                    if (item != '') {
                        var itemObj = {
                            order: nlapiGetLineItemValue('custpage_list',
                                'custpage_id', i),
                            item: item
                        };
                        params.items.push(itemObj);
                    } else {
                        params.orders.push(nlapiGetLineItemValue(
                            'custpage_list', 'custpage_id', i));
                    }
                }
                if (nlapiGetLineItemValue('custpage_list', 'custpage_print_val',
                    i) == 'T') {
                    params.prints.push(nlapiGetLineItemValue('custpage_list',
                        'custpage_id', i));
                }

            }

            var existingRec = getSelectedRecordData(sessionid, pageId);
            if (existingRec) {
                existingRec.setFieldValue('custrecord_selectedprintingdata', JSON.stringify(params));
                nlapiSubmitRecord(existingRec);
            }
            else {

                var newRec = nlapiCreateRecord('customrecord_pickingticketprintingdata');
                newRec.setFieldValue('custrecord_sessionid', sessionid);
                newRec.setFieldValue('custrecord_pageid', pageId);
                newRec.setFieldValue('custrecord_selectedprintingdata', JSON.stringify(params));

                nlapiSubmitRecord(newRec);
            }

            /*****************************************************************************************************/


            var page_no = parseInt(pageId);
            if (page_no > 0) {
                page_no -= 1;
            }


            query_param += '&session_id=' + sessionid;
            query_param += '&page_no=' + page_no.toString();


            var extra_param = '';
            if (!isBlankOrNull(val)) {
                // query_param += '&prev_page=' + first_id + '&prev_page_to=' + first_id_to+ '&prev_date=' + first_date;
                query_param += '&prev_page=' + first_id + '&prev_date=' + first_date;
                extra_param += '<input type="text" name="pag" value="' + val + '" />';
                extra_param += '<input type="text" name="pag_date" value="' + val_date + '" />';
            }

            var form = jQuery('<form style="display: none;" action="' + url + query_param + '" method="post">' +
                '<input type="text" name="pag_flag" value="' + 'T' + '" />' +
                '<input type="text" name="submit_modified_records" value="' + 'T' + '" />' +
                '<input type="text" name="submit_modified_records_data" value=\'' + getModifiedSalesOrdersJsonData() + '\' />' +
                extra_param +
                '</form>');
            jQuery('body').append(form);
            jQuery(form).submit();
            //window.location.href = url + query_param;
        }

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error_previous_click', ex.message);
    }
}

/*
 * This method marks current line item Sales Order(main line) as modified
 * */
function markSalesOrderAsModified(isMainLine, linenumber) {

    if (isMainLine) {
        nlapiSetLineItemValue('custpage_list', 'custpage_hd_recordmodified', linenumber, '1');
    }
    else {
        var id = nlapiGetLineItemValue('custpage_list', 'custpage_id', linenumber);

        for (var i = parseInt(linenumber) - 1; i >= 1; i--) {
            if (nlapiGetLineItemValue('custpage_list', 'custpage_hd_ismainline', i).trim() == '1'
                && nlapiGetLineItemValue('custpage_list', 'custpage_id', i) == id) {
                nlapiSetLineItemValue('custpage_list', 'custpage_hd_recordmodified', i, '1');
                break;
            }
        }
    }
}

/*
 * Submit all modified sales order to server
 * */
function submitModifiedSalesOrders() {

    for (var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {

        if (nlapiGetLineItemValue('custpage_list', 'custpage_hd_ismainline', i).trim() == '1'
            && nlapiGetLineItemValue('custpage_list', 'custpage_hd_recordmodified', i).trim() == '1') {

            var mainlineShipDate = nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', i);
            var soId = nlapiGetLineItemValue('custpage_list', 'custpage_id', i);
            var soRec = nlapiLoadRecord('salesorder', soId);
            soRec.setFieldValue('shipdate', mainlineShipDate);

            for (var j = i + 1; j <= nlapiGetLineItemCount('custpage_list'); j++) {
                if (nlapiGetLineItemValue('custpage_list', 'custpage_id', j) == soId) {

                    var lineShipDate = nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', j);
                    var lineItem = nlapiGetLineItemValue('custpage_list', 'custpage_item', j);
                    var lineId = nlapiGetLineItemValue('custpage_list', 'custpage__lineid', j);

                    var lineIndex = soRec.findLineItemValue('item', 'line', lineId);

                    soRec.setLineItemValue('item', 'item', lineIndex, lineItem);
                    soRec.setLineItemValue('item', 'expectedshipdate', lineIndex, lineShipDate);

                } else {
                    break;
                }
            }

            try {
                nlapiSubmitRecord(soRec, true);
                var testt = 'ok';
            }
            catch (ex) {
                var msg = ex.message;
                throw ex;
            }


        }
    }

}

function getModifiedSalesOrdersJsonData() {

    var list = [];

    for (var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {

        if (nlapiGetLineItemValue('custpage_list', 'custpage_hd_ismainline', i).trim() == '1'
            && nlapiGetLineItemValue('custpage_list', 'custpage_hd_recordmodified', i).trim() == '1') {

            var soData = {};
            soData.ismainline = nlapiGetLineItemValue('custpage_list', 'custpage_hd_ismainline', i).trim();
            soData.soid = nlapiGetLineItemValue('custpage_list', 'custpage_id', i);
            soData.lineid = nlapiGetLineItemValue('custpage_list', 'custpage__lineid', i);
            soData.shipdate = nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', i);
            soData.item = nlapiGetLineItemValue('custpage_list', 'custpage_item', i);

            soData.itemmodified = nlapiGetLineItemValue('custpage_list', 'custpage_hd_itemmodified', i);

            list.push(soData);

            var soId = nlapiGetLineItemValue('custpage_list', 'custpage_id', i);


            for (var j = i + 1; j <= nlapiGetLineItemCount('custpage_list'); j++) {
                if (nlapiGetLineItemValue('custpage_list', 'custpage_id', j) == soId) {

                    if (nlapiGetLineItemValue('custpage_list', 'custpage_hd_recordmodified', j) == '1') {

                        var soData = {};
                        soData.ismainline = nlapiGetLineItemValue('custpage_list', 'custpage_hd_ismainline', j).trim();
                        soData.soid = nlapiGetLineItemValue('custpage_list', 'custpage_id', j);
                        soData.lineid = nlapiGetLineItemValue('custpage_list', 'custpage__lineid', j);
                        soData.shipdate = nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', j);
                        soData.item = nlapiGetLineItemValue('custpage_list', 'custpage_item', j);

                        soData.itemmodified = nlapiGetLineItemValue('custpage_list', 'custpage_hd_itemmodified', j);

                        list.push(soData);
                    }

                } else {
                    break;
                }
            }

        }
    }

    //nlapiLogExecution('DEBUG', 'DataToModify', JSON.stringify(list));

    return JSON.stringify(list);

}

//region Events

function fieldChanged(type, name, linenumber) {

    if (type == 'custpage_list') {

        var isMainLine = false;
        if (nlapiGetLineItemValue('custpage_list', 'custpage_hd_ismainline', linenumber).trim() == '1') {
            isMainLine = true;
        }

        if (name == 'custpage_item') {

            var oldItem = nlapiGetLineItemValue('custpage_list', 'custpage_hd_item', linenumber).trim();
            var oldItemText = nlapiGetLineItemValue('custpage_list', 'custpage_hd_item_text', linenumber).trim();

            // Main line check
            if (isMainLine) {

                nlapiSetLineItemValue('custpage_list', 'custpage_item', linenumber, oldItem);
                alert('You cant assign item to a main line.');
                return false;
            }

            // quantity packed greater than 0 check
            var qtyPacked = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_quantitypacked', linenumber)).trim();
            if (parseInt(qtyPacked) > 0) {


                nlapiSetLineItemValue('custpage_list', 'custpage_item', linenumber, oldItem);
                nlapiSetCurrentLineItemValue('custpage_list', 'custpage_item', oldItem, false, false);

                alert('You cant change item of a line whose quantity packed is greater than 0.');
                return false;
            }


            /*
             set 'custpage_hd_item_text' field with new item text as it would be used in to extract selected items
             in final submit call
             */
            var newItemText = nlapiGetLineItemText('custpage_list', 'custpage_item', linenumber).trim();
            nlapiSetLineItemValue('custpage_list', 'custpage_hd_item_text', linenumber, newItemText);

            nlapiSetLineItemValue('custpage_list', 'custpage_hd_recordmodified', linenumber, '1');
            nlapiSetLineItemValue('custpage_list', 'custpage_hd_itemmodified', linenumber, '1');
            markSalesOrderAsModified(isMainLine, linenumber);

            return true;
            //var changedItem = nlapiGetLineItemValue('custpage_list', 'custpage_item', linenumber).trim();
            //var alertText = '\nIsMainLine='+isMainLine+'\nFieldName=custpage_item\nChangedValue='+changedItem;
            //alert(alertText);
        }
        else if (name == 'custpage_shipdate') {
            var changedShipDate = nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', linenumber).trim();

            if (isMainLine) {

                var number = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', linenumber));
                for (var i = parseInt(linenumber) + 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {
                    if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', i)) == number) {

                        nlapiSetLineItemValue('custpage_list', 'custpage_shipdate', i, changedShipDate);

                    } else {
                        break;
                    }
                }
            }

            nlapiSetLineItemValue('custpage_list', 'custpage_hd_recordmodified', linenumber, '1');
            nlapiSetLineItemValue('custpage_list', 'custpage_hd_shipdatemodified', linenumber, '1');
            markSalesOrderAsModified(isMainLine, linenumber);

            return true;

            //var alertText = '\nIsMainLine='+isMainLine+'\nFieldName=custpage_shipdate\nChangedValue='+changedShipDate;
            //alert(alertText);
        }
    }
}

function fieldValidated(type, name, linenumber) {

}

//endregion

//region Hacks

/*
 * Hack: Fix for ShipDate Field UI For FireFox
 */
function fixShipDateFieldUI(div) {

    var td = jQuery(div).parent();
    var cellIndex = jQuery(td).index();

    if(detectBrowser(FIREFOX)){
        /*
         in Firefox 17 is the index of ShipDate cell in next row to header
         Although Index of ShipDate cell in header is 6 but in next data rows, its 17 due to many hidden field cells before.
         */
        cellIndex = 17;
    }

    //var next_td = jQuery(td).closest('tr').next().children().eq(cellIndex);
    var next_td = jQuery(td).closest('tr').next().children().eq(cellIndex);
    jQuery(next_td).css("white-space", "nowrap");
}

/*
 * Hack: To set position of opening calendar control
 */
function setPositionOfOpeningCalenderControl() {

    jQuery(".i_calendar").click(function (e) {

        //alert('tesssting');
        //var offset = $(this).offset();
        //alert('e.clientX='+e.clientX);
        //alert('e.clientY='+e.clientY);
        //alert('offset.left='+offset.left);
        //alert('offset.top='+offset.top);
        //var topPos = e.clientY - offset.top;
        var topPos = e.clientY + 'px';
        //alert(topPos);
        jQuery("#calendar_outerdiv").css("top", topPos);


//        var offset = $(this).offset();
//        alert(e.clientX - offset.left);
//        alert(e.clientY - offset.top);
//        var topPos = e.clientY - offset.top;
//        var strr = topPos + 'px';
//        alert(strr);
//        jQuery("#calendar_outerdiv").css("top", "350px");

    });
}

/*
 * Hack: To set position of opening item list control
 */
function setPositionOfOpeningItemListControl() {

    jQuery(".fwpopupsel").click(function (e) {

        //var target = e.target;
        //var offset = jQuery(target).offset();

        //alert('e.clientX='+e.clientX);
        //alert('e.clientY='+e.clientY);
        //alert('offset.left='+offset.left);
        //alert('offset.top='+offset.top);


        //var topPos = e.clientY - offset.top;
        //var strTopPos = topPos + 'px';


//        var w = jQuery(window);
//
//        var x = offset.left-w.scrollLeft();
//        var y = offset.top-w.scrollTop();
//
//        alert("(x,y): ("+x+","+y+")");

//        var xPos = x + 'px';
//        var yPos = y + 'px';


//        var w = jQuery(window);
//
//        var doc = jQuery(document);
//
//        var x = doc.clientX;
//        var y = doc.clientY;
//
//
//        var xPos = x + 'px';
//        var yPos = y + 'px';

        //alert(strTopPos);
        //jQuery(".dropdownDiv").css("left", xPos);


        //var w = jQuery(window);


        var yScrollPos = jQuery('.new-parent').scrollTop();
        var yPos = '-' + yScrollPos + 'px';

        jQuery(".dropdownDiv").each(function (index, element) {

            var id = jQuery(element).attr('id');
            if (id && id.indexOf('actionbuttons_custpage_list_custpage_item') > -1) {

                jQuery(element).css("top", yPos);
            }

        });
    });
}

/*
 * Hack: To set width of ship date textbox
 */
function setWidthOfShipDateTextbox(index) {

    var textBoxId = 'custpage_shipdate'+index;
    var element = document.getElementById(textBoxId);
    element.setAttribute("style","width:80px !important;");

}

//endregion

/*
 Detect is browser is chrome
 */
function detectChromeBrowser() {
    var ua = window.navigator.userAgent;
    if (ua.toLowerCase().indexOf('chrome') > -1) {
        return true;
    }

    return false;
}

/*
 Detect browser type
 */
function detectBrowser(browserName){
    var ua = window.navigator.userAgent;
    if(browserName == CHROME) {
        if (ua.toLowerCase().indexOf('chrome') > -1) {
            return true;
        }else{
            return false;
        }
    }
    else if(browserName == FIREFOX) {
        if (ua.toLowerCase().indexOf('firefox') > -1) {
            return true;
        }else{
            return false;
        }
    }
    else if(browserName == IE) {
        var msie = ua.toLowerCase().indexOf("msie ");
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
            return true;
        else
            return false;
    }
    else{
        return false;
    }
}

jQuery('#submitter').click(function () {
    window.onbeforeunload = null;
});