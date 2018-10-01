
/*
 Suitlet Script for RICO Print Picking Ticket in Bulk Suitlet
 */

//region (Constants)
var BY_PASS_SO_ID = 'bypasssoid';
//endregion

var parm_item;
var parm_item_discontinued;
var parm_item_isinactive;
var parm_partner;
var parm_warehouse;
var parm_customer;
var parm_ppt;
var parm_date_from;
var parm_date_to;
var parm_print_status;
var parm_so_status;
var parm_ready_to_print;
var parm_next_page;
var parm_prev_page;
var parm_prev_date;
var parm_prev_page_to;
var parm_next_date;
var parm_pag;
var parm_pag_date;

var context = nlapiGetContext();

function suitelet(request, response) {
    var form = nlapiCreateForm('Print Picking Ticket in Bulk');

    if (request.getMethod() == 'GET') {
        //Check if the request is coming from IE
        var userAgent = request.getHeader('User-Agent');
        //nlapiLogExecution("DEBUG", "useragent", userAgent);
        if(isIE(userAgent)) {
            handleIncompatibleBrowserRequest(form);
        }
        else {
            allGetProcess(form, request);
        }
    }
    else {
        var flag_val = request.getParameter('pag_flag');
        if (isBlankOrNull(flag_val)) {

            if (checkModifiedSalesOrdersContainMainline(request)) {
                submitModifiedSalesOrdersFromRequestParam(request);
            }
            else {
                submitModifiedSalesOrdersWithoutMainlineFromRequestParam(request);
            }


            var params = {
                orders: new Array(),
                items: new Array(),
                prints: new Array()
            };
            for (var i = 1; i <= request.getLineItemCount('custpage_list'); i++) {
                if (request.getLineItemValue('custpage_list', 'custpage_cancel_val', i) == 'T') {
                    //var item = getVal(request.getLineItemValue('custpage_list', 'custpage_item', i)).trim();
                    var item = request.getLineItemValue('custpage_list', 'custpage_hd_item_text', i);
                    if (item != null && item != '') {
                        var itemObj = {
                            order: request.getLineItemValue('custpage_list', 'custpage_id', i),
                            item: item
                        };
                        params.items.push(itemObj);
                    } else {
                        params.orders.push(request.getLineItemValue('custpage_list', 'custpage_id', i));
                    }
                }
                if (request.getLineItemValue('custpage_list', 'custpage_print_val', i) == 'T') {
                    params.prints.push(request.getLineItemValue('custpage_list', 'custpage_id', i));
                }
            }

            //region (Select all records of this session from 'custrecord_selectedprintingdata' custom record and merge all)

            var sessionId = request.getParameter('custpage_sessionid');
            var pageId = request.getParameter('custpage_pageno');

            try {
                var filters = new Array();
                var columns = new Array();

                filters.push(new nlobjSearchFilter('custrecord_sessionid', '', 'is', sessionId));

                columns.push(new nlobjSearchColumn('custrecord_sessionid'));
                columns.push(new nlobjSearchColumn('custrecord_pageid'));
                columns.push(new nlobjSearchColumn('custrecord_selectedprintingdata'));

                var result = nlapiSearchRecord('customrecord_pickingticketprintingdata', null, filters, columns);

                if (result != null && result.length > 0) {
                    for (var i = 0; i < result.length; i++) {

                        if (result[i].getValue('custrecord_pageid') != pageId) {

                            var selectedRecords = result[i].getValue('custrecord_selectedprintingdata');
                            var parsedSelectedRecords = JSON.parse(selectedRecords);
                            params.items = params.items.concat(parsedSelectedRecords.items);
                            params.orders = params.orders.concat(parsedSelectedRecords.orders);
                            params.prints = params.prints.concat(parsedSelectedRecords.prints);
                        }

                        nlapiDeleteRecord('customrecord_pickingticketprintingdata', result[i].getId());

                    }
                }
            } catch (ex) {
                var msg = ex.message;
                throw ex;
            }

            //endregion

            params = {
                custscript_cancellist: JSON.stringify(params)
            };

            nlapiLogExecution('DEBUG', 'finalsubmittingdata', JSON.stringify(params));

            var rec = nlapiCreateRecord('customrecord_ppt_schedule');
            rec.setFieldValue('custrecord_cancel_list', JSON.stringify(params));
            rec.setFieldValue('custrecord_script_status', 'pending');
            nlapiSubmitRecord(rec, true);
            var status = nlapiScheduleScript('customscript_pickingbulk_sch', 'customdeploy_pickingbulk_sch');

            nlapiLogExecution('DEBUG', 'schedule_script_status', status);

            //  form.addField('custpage_dummy', 'label',
            //     "Task is scheduled to run with status:" + status);
            form.addField('custpage_script_redirect', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> window.location.href = "/app/common/scripting/scriptstatus.nl?date=TODAY";</script>');//app/common/scripting/scriptstatus.nl

        }
        else {
            allGetProcess(form, request);
        }
    }

    response.writePage(form);
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


/*
 Generated Unique Id
 */
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

/*
 Create Custom Sublist by fetched records from PPT Saved Search
 */
function allGetProcess(form, request) {

    var submitModifiedRecords = request.getParameter('submit_modified_records');
    nlapiLogExecution('DEBUG', 'submitModifiedRecords_value', submitModifiedRecords);
    if (submitModifiedRecords && submitModifiedRecords == 'T') {
        nlapiLogExecution('DEBUG', 'submitModifiedRecordsData', request.getParameter('submit_modified_records_data'));

        if (checkModifiedSalesOrdersContainMainline(request)) {
            submitModifiedSalesOrdersFromJsonData(request.getParameter('submit_modified_records_data'));
        }
        else {
            submitModifiedSalesOrdersWithoutMainlineFromJsonData(request.getParameter('submit_modified_records_data'));
        }


    }

    //region (Getting selected records list from request if any)
    var sessionid = request.getParameter('session_id');
    if (!sessionid || typeof sessionid === "undefined") {
        sessionid = guid();
    }

    var pageno = request.getParameter('page_no');
    if (!pageno || typeof pageno === "undefined") {
        pageno = '1';
    }

    form.addField('custpage_sessionid', 'text', 'pag').setDisplayType('hidden').setDefaultValue(sessionid);
    form.addField('custpage_pageno', 'text', 'pag').setDisplayType('hidden').setDefaultValue(pageno);
    //endregion

    var i = 0;
    var filters = new Array();
    filters[i] = new nlobjSearchFilter('memorized', null, 'is', 'F');
    i++;
    var column = new Array();
    parm_item = request.getParameter('item');
    parm_partner = request.getParameter('partner');
    parm_warehouse = request.getParameter('warehouse');
    parm_customer = request.getParameter('customer');
    parm_ready_to_print = (isBlankOrNull(request.getParameter('ready_to_print')) ? 'No' : request.getParameter('ready_to_print'));//request.getParameter('ready_to_print');
    parm_ppt = (isBlankOrNull(request.getParameter('ppt')) ? 'No' : request.getParameter('ppt'));
    parm_date_from = request.getParameter('date_from');
    parm_date_to = request.getParameter('date_to');
    parm_print_status = request.getParameter('print_status');
    var so_status = decodeURIComponent(request.getParameter('so_status'));
    //nlapiLogExecution('DEBUG', 'so_status', so_status);
    parm_so_status = ((isBlankOrNull(so_status) || so_status == '[]') ? '["SalesOrd:B","SalesOrd:D"]' : so_status);
    parm_next_page = request.getParameter('next_page');
    parm_prev_page = request.getParameter('prev_page');
    parm_prev_page_to = request.getParameter('prev_page_to');
    parm_pag = request.getParameter('pag');
    parm_pag_date = request.getParameter('pag_date');
    parm_next_date = request.getParameter('next_date');
    parm_prev_date = request.getParameter('prev_date');
    parm_item_discontinued = (isBlankOrNull(request.getParameter('inpt_item_discontinued')) ? 'All' : request.getParameter('inpt_item_discontinued'));
    parm_item_isinactive = (isBlankOrNull(request.getParameter('inpt_item_isinactive')) ? 'All' : request.getParameter('inpt_item_isinactive'));

    if (!isBlankOrNull(parm_prev_page)) {
        filters[i] = new nlobjSearchFilter('formulanumeric', null, 'equalto', 1);
        //        filters[i].setFormula('CASE WHEN TO_NUMBER({tranid}) >= ' +parseInt(parm_prev_page,10) + ' AND TO_NUMBER({tranid}) <= ' +parseInt(parm_prev_page_to,10) + '  THEN 1 ELSE 0 END');
        filters[i].setFormula('CASE WHEN TO_NUMBER({tranid}) >= ' + parm_prev_page + '  THEN 1 ELSE 0 END');
        i++;
        filters[i] = new nlobjSearchFilter('trandate', null, 'onorafter', parm_prev_date);
        i++;
    }
    if (!isBlankOrNull(parm_next_page)) {
        filters[i] = new nlobjSearchFilter('formulanumeric', null, 'equalto', 1);
        filters[i].setFormula('CASE WHEN TO_NUMBER({tranid}) > ' + parm_next_page + ' THEN 1 ELSE 0 END');
        i++;
        filters[i] = new nlobjSearchFilter('trandate', null, 'onorafter', parm_next_date);
        i++;
    }
    if (!isBlankOrNull(parm_item)) {
        filters[i] = new nlobjSearchFilter('itemid', 'item', 'contains', parm_item);
        i++;
    }
    if (!isBlankOrNull(parm_partner)) {
        filters[i] = new nlobjSearchFilter('partner', null, 'is', parm_partner);
        i++;
    }
    if (!isBlankOrNull(parm_warehouse)) {
        filters[i] = new nlobjSearchFilter('location', null, 'is', parm_warehouse);
        i++;
    }
    if (!isBlankOrNull(parm_customer)) {
        nlapiLogExecution('DEBUG', 'i', i + parm_customer);

        filters[i] = new nlobjSearchFilter('entity', null, 'anyof', parm_customer);
        i++;
    }
    if (!isBlankOrNull(parm_print_status)) {
        filters[i] = new nlobjSearchFilter('custbody_printstatus', null, 'is', parm_print_status);
        i++;
    }
    if (!isBlankOrNull(parm_so_status) && parm_so_status != '[]') {
        filters[i] = new nlobjSearchFilter('status', null, 'anyof', JSON.parse(parm_so_status));
        i++;
    }
    if (!isBlankOrNull(parm_ppt)) {
        if (parm_ppt == 'Yes') {
            filters[i] = new nlobjSearchFilter('printedpickingticket', null, 'is', 'T');
            i++;
        }
        else if (parm_ppt == 'No') {
            filters[i] = new nlobjSearchFilter('printedpickingticket', null, 'is', 'F');
            i++;
        }
    }
    if (!isBlankOrNull(parm_ready_to_print)) {
        if (parm_ready_to_print == 'Yes') {
            filters[i] = new nlobjSearchFilter('custbody_readyprintpt', null, 'is', 'T');
            i++;
        }
        else if (parm_ready_to_print == 'No') {
            filters[i] = new nlobjSearchFilter('custbody_readyprintpt', null, 'is', 'F');
            i++;
        }
    }
    if (!isBlankOrNull(parm_item_discontinued)) {
        if (parm_item_discontinued == 'Yes') {
            filters[i] = new nlobjSearchFilter('custitem_discontinued', 'item', 'is', 'T');
            i++;
        }
        else if (parm_item_discontinued == 'No') {
            filters[i] = new nlobjSearchFilter('custitem_discontinued', 'item', 'is', 'F');
            i++;
        }
    }
    if (!isBlankOrNull(parm_item_isinactive)) {
        if (parm_item_isinactive == 'Yes') {
            filters[i] = new nlobjSearchFilter('isinactive', 'item', 'is', 'T');
            i++;
        }
        else if (parm_item_isinactive == 'No') {
            filters[i] = new nlobjSearchFilter('isinactive', 'item', 'is', 'F');
            i++;
        }
    }
    if (!isBlankOrNull(parm_date_from) && !isBlankOrNull(parm_date_to)) {
        filters[i] = new nlobjSearchFilter('shipdate', null, 'within', parm_date_from, parm_date_to);
    }
    else if (!isBlankOrNull(parm_date_from) && isBlankOrNull(parm_date_to)) {
        filters[i] = new nlobjSearchFilter('shipdate', null, 'onorafter', parm_date_from);
    }
    else if (isBlankOrNull(parm_date_from) && !isBlankOrNull(parm_date_to)) {
        filters[i] = new nlobjSearchFilter('shipdate', null, 'onorbefore', parm_date_to);
    }

    // new filter consider splitting logic
    filters.push(new nlobjSearchFilter('custbody_to_be_split', null, 'is', 'F', null));

    nlapiLogExecution('DEBUG', 'filters', JSON.stringify(filters));

    var res = nlapiSearchRecord(null, 'customsearch_reopensalesorders_2_2_2___3', filters);

    if (res) {
        nlapiLogExecution('DEBUG', 'length', res.length);
        form.addSubmitButton('Submit Changes');

        addFormFields(form);

        //var list = form.addSubList('custpage_list', 'inlineeditor', 'Sales Order List');
        var list = form.addSubList('custpage_list', 'list', 'Sales Order List');

        list.addField('custpage_print', 'text', 'Print').setDisplaySize(20);
        list.addField('custpage_cancel', 'text', 'Close');
        list.addField('custpage_print_val', 'checkbox', '').setDisplayType(
            'hidden');
        list.addField('custpage_cancel_val', 'checkbox', '')
            .setDisplayType('hidden');
        list.addField('custpage_id', 'text', '').setDisplayType('hidden');
        list.addField('custpage_index', 'text', '').setDisplayType('hidden');
        list.addField('custpage_hd_ismainline', 'text', '').setDisplayType('hidden');
        list.addField('custpage_hd_item', 'text', '').setDisplayType('hidden');
        list.addField('custpage_hd_item_text', 'text', '').setDisplayType('hidden');
        list.addField('custpage_hd_shipdate', 'text', '').setDisplayType('hidden');
        list.addField('custpage_hd_recordmodified', 'text', '').setDisplayType('hidden');
        list.addField('custpage_hd_shipdatemodified', 'text', '').setDisplayType('hidden');
        list.addField('custpage_hd_itemmodified', 'text', '').setDisplayType('hidden');

        var columns = res[0].getAllColumns();
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            var label = column.getLabel();
            var name = label.replace(/\s/g, '').toLowerCase();

            //nlapiLogExecution('DEBUG', 'logging_labels_names', 'label='+label+'   name='+name+'   columntype='+column.type);

            if (name == 'shipdate') {
                var field = list.addField('custpage_' + name, 'date', label);
                field.setDisplayType('entry');
                //field.setDisplaySize(100);
                //var field = list.addField('custpage_' + name, 'text', label);
            }
            else if (name == 'item') {
                var field = list.addField('custpage_' + name, 'select', label, '-10');
                //field.setDisplayType('entry');
            }
            else {
                var field = list.addField('custpage_' + name, 'text', label);
            }


            if (label.indexOf('_') == 0) {
                field.setDisplayType('hidden');
            }
        }
        var values = new Array();
        var itemId = '';
        var itemName = '';
        for (var i = 1; i <= res.length; i++) {

            var rec = res[i - 1];
            var obj = {
                custpage_cancel: '<p name="spanId' + i + '" id="spanId'
                    + i
                    + '"><input type="checkbox" id="custpage_cancel_'
                    + i + '"  onclick="setVal(' + i
                    + ',\'custpage_cancel_\');',
                custpage_id: rec.getId()
            };

            obj['custpage_hd_recordmodified'] = '0';
            obj['custpage_hd_shipdatemodified'] = '0';
            obj['custpage_hd_itemmodified'] = '0';

            for (var j = 0; j < columns.length; j++) {
                var column = columns[j];
                if (column.getName() == 'item' && rec.getValue(column) == '') {
                    obj['custpage_print'] = '<p name="spanId'
                        + i
                        + '" id="spanId'
                        + i
                        + '" class="spanId'
                        + i + j
                        + '"><input type="checkbox" id="custpage_print_'
                        + i + '" onclick="setVal(' + i
                        + ',\'custpage_print_\');"/></p>';

                    obj['custpage_cancel'] += 'disableLineItems(' + i + ');';

                    obj['custpage_hd_ismainline'] = '1';
                }
                else if (column.getName() == 'item' && rec.getValue(column) != '') {
                    obj['custpage_hd_ismainline'] = '0';
                }

                if (column.type == 'select' && column.getName() == 'entity') {
                    //nlapiLogExecution('DEBUG', 'column.getName()', column.getName());
                    var customerId = rec.getValue(column);
                    var customerName = rec.getText(column);
                    obj['custpage_' + column.getLabel().replace(/\s/g, '').toLowerCase()] =
                        '<a id="custname_anchor_'+i+'" style="width: 164px !important;cursor: pointer !important;" onmouseover="showCustomerQuickView('+customerId+', '+i+')">' + customerName + '</a>'

                    //'<p name="spanId' + i + '" id="spanId' + i + '" class="spanId' + i + j + '">' + rec.getText(column) + '</p>';
                }
                else if (column.type == 'select' && column.getName() != 'item') {
                    obj['custpage_'
                        + column.getLabel().replace(/\s/g, '')
                        .toLowerCase()] = '<p name="spanId' + i
                        + '" id="spanId' + i + '" class="spanId' + i + j + '">' + rec.getText(column)
                        + '</p>';
                }
                else if (column.type == 'currency' && !isBlankOrNull(rec.getValue(column))) {
                    obj['custpage_'
                        + column.getLabel().replace(/\s/g, '')
                        .toLowerCase()] = '<p name="spanId' + i
                        + '" id="spanId' + i + '" class="spanId' + i + j + '">' + parseFloat(rec.getValue(column))
                        + '</p>';
                }
                else if (column.getName() == 'shipdate' && column.type == 'date') {
                    obj['custpage_' + column.getLabel().replace(/\s/g, '').toLowerCase()] = rec.getValue(column);
                    obj['custpage_hd_shipdate'] = rec.getValue(column);
                }
                else if (column.getName() == 'item' && column.type == 'select') {
                    itemId = rec.getValue(column);
                    itemName = rec.getText(column);
                    obj['custpage_' + column.getLabel().replace(/\s/g, '').toLowerCase()] = itemId;
                    obj['custpage_hd_item'] = itemId;
                    obj['custpage_hd_item_text'] = itemName;
                }
                else if (column.getName() == 'salesdescription' && column.type == 'text') {
                    obj['custpage_' + column.getLabel().replace(/\s/g, '').toLowerCase()] =
                        '<a id="itemdesc_anchor_'+i+'" style="width: 164px !important;cursor: pointer !important;" onmouseover="showItemQuickView('+itemId+', '+i+', this)">' + rec.getValue(column) + '</a>'
                }
                else if (column.getName() == 'line' && column.type == 'integer') {
                    obj['custpage_' + column.getLabel().replace(/\s/g, '').toLowerCase()] = rec.getValue(column);
                }
                else {
                    //nlapiLogExecution('DEBUG', 'column.getName()  #  column.type  #  column.getLabel()', column.getName() + '  #  ' + column.type+ '  #  ' + column.getLabel().replace(/\s/g, '').toLowerCase());
                    obj['custpage_'
                        + column.getLabel().replace(/\s/g, '')
                        .toLowerCase()] = '<p name="spanId' + i
                        + '" id="spanId' + i + '" class="spanId' + i + j + '">' + rec.getValue(column)
                        + '</p>';
                }
            }
            obj['custpage_cancel'] += '"></p>';

            obj['custpage_index'] = i.toString();

            values.push(obj);
        }
        for (var i = values.length - 1; i >= 0; i--) {
            //nlapiLogExecution('DEBUG', 'test', values[i].custpage_id);
            if (values[i].custpage_print) {
                values.splice(i, values.length - 1);
                break;
            }
        }
        list.setLineItemValues(values);
        //      form.setScript('customscript_pickingbulk_ext_cl');
    } else {
        addFormFields(form);
        form.addFieldGroup('custpage_newfg', ' ', null);
        form.addField('custpage_script15', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> setTimeout(function(){ jQuery("#tbl_prev_page").hide(); jQuery("#tbl_next_page").hide(); jQuery("#tbl_secondaryprev_page").hide(); jQuery("#tbl_secondarynext_page").hide(); }, 1000);  </script>')
        form.addField('custpage_dummy', 'inlinehtml', '', null, 'custpage_newfg').setDefaultValue('<b><h1 style="font-size:20px;">No Records Found</h1></b>');
    }
    form.setScript('customscript_pickingbulk_ext_cl');
}

/*
 Adds Body Fields(Filters for Saved Search) on form
 */
function addFormFields(form) {
    form.addFieldGroup('custpage_newfilters', ' ', null);

    form.addField('printed_picking_ticket', 'select', 'Printed Picking Ticket', 'customlist_printedpickingticketslist', 'custpage_newfilters');
    form.addField('partner', 'select', 'Partner', 'partner', 'custpage_newfilters').setDefaultValue(parm_partner);
    form.addField('warehouse', 'select', 'Warehouse', 'location', 'custpage_newfilters').setDefaultValue(parm_warehouse);
    form.addField('customer', 'select', 'Customer', 'customer', 'custpage_newfilters').setDefaultValue(parm_customer);


    var select = form.addField('so_status', 'multiselect', 'Status', null, 'custpage_newfilters');
    select.addSelectOption('SalesOrd:A', 'Sales Order:Pending Approval');
    select.addSelectOption('SalesOrd:B', 'Sales Order:Pending Fulfillment');
    select.addSelectOption('SalesOrd:C', 'Sales Order:Cancelled');
    select.addSelectOption('SalesOrd:D', 'Sales Order:Partially Fulfilled');
    select.addSelectOption('SalesOrd:E', 'Sales Order:Pending Billing/Partially Fulfilled');
    select.addSelectOption('SalesOrd:F', 'Sales Order:Pending Billing');
    select.addSelectOption('SalesOrd:G', 'Sales Order:Billed');
    select.addSelectOption('SalesOrd:H', 'Sales Order:Closed');
    if (isBlankOrNull(parm_so_status) || parm_so_status == '[]') {
        select.setDefaultValue(['SalesOrd:B', 'SalesOrd:D']);
    }
    else {
        select.setDefaultValue(JSON.parse(parm_so_status));
    }
    select.setDisplaySize(250);

    form.addField('print_status', 'text', 'Print Status', null, 'custpage_newfilters').setDefaultValue(parm_print_status);
    form.addField('ready_to_print', 'select', 'Ready To Print', 'customlist_printedpickingticketslist', 'custpage_newfilters');
    form.addField('date_from', 'date', 'Ship Date From', null, 'custpage_newfilters').setDefaultValue(parm_date_from);
    form.addField('date_to', 'date', 'Ship Date To', null, 'custpage_newfilters').setDefaultValue(parm_date_to);

    form.addField('item', 'text', 'Item', null, 'custpage_newfilters').setDefaultValue(parm_item);
    form.addField('item_discontinued', 'select', 'Item Discontinued?', 'customlist_printedpickingticketslist', 'custpage_newfilters');
    form.addField('item_isinactive', 'select', 'Item Is Inactive?', 'customlist_printedpickingticketslist', 'custpage_newfilters');


    form.addButton('prev_page', 'Previous Page', 'previousPage()');
    form.addButton('next_page', 'Next Page', 'nextPage()');
    form.addButton('apply_filters', 'Apply Filters', 'applyFilter()');

    form.addField('custpage_script', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#ready_to_print_popup_new").hide();  jQuery("#ready_to_print_popup_link").hide();  jQuery("#printed_picking_ticket_popup_new").hide();  jQuery("#printed_picking_ticket_popup_link").hide();  jQuery("#item_discontinued_popup_new").hide();  jQuery("#item_discontinued_popup_link").hide();  jQuery("#item_isinactive_popup_new").hide();  jQuery("#item_isinactive_popup_link").hide();  jQuery("#item_popup_muli").hide();  jQuery("#partner_popup_new").hide();  jQuery("#partner_popup_link").hide();  jQuery("#warehouse_popup_link").hide();  jQuery("#customer_popup_muli").hide(); </script>');

    if (!isBlankOrNull(parm_customer)) {
        var customer_name = nlapiLoadRecord("customer", parm_customer).getFieldValue("altname");
        form.addField('custpage_script2', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#customer_display").val("' + customer_name + '"); </script>');
    }
    if (!isBlankOrNull(parm_ppt)) {
        form.addField('custpage_script3', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#inpt_printed_picking_ticket1").val("' + parm_ppt + '") </script>')
    }
    if (!isBlankOrNull(parm_ready_to_print)) {
        form.addField('custpage_script4', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#inpt_ready_to_print5").val("' + parm_ready_to_print + '") </script>')
    }
    if (!isBlankOrNull(parm_item_discontinued)) {
        form.addField('custpage_script5', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#inpt_item_discontinued6").val("' + parm_item_discontinued + '") </script>')
    }
    if (!isBlankOrNull(parm_item_isinactive)) {
        form.addField('custpage_script6', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#inpt_item_isinactive7").val("' + parm_item_isinactive + '") </script>')
    }

    form.addFieldGroup('custpage_pagination', ' ', null);
    form.addField('pag_details', 'text', 'pag').setDisplayType('hidden').setDefaultValue(parm_pag);
    form.addField('pag_details_date', 'text', 'pag').setDisplayType('hidden').setDefaultValue(parm_pag_date);
}

// Check either Modified SalesOrders Contain Mainline or not
function checkModifiedSalesOrdersContainMainline(request){
    var recordsContainMainLine = true;

    // For item filter
    var param_item = request.getParameter('item');
    //nlapiLogExecution('DEBUG', 'param_item_value', param_item);
    if(!isBlankOrNull(param_item)){
        recordsContainMainLine = false;
    }

    // For item_discontinued=true condition
    var param_item_discontinued = request.getParameter('inpt_item_discontinued');
    nlapiLogExecution('DEBUG', 'param_item_discontinued_value', param_item_discontinued);
    if(!isBlankOrNull(param_item_discontinued) && param_item_discontinued == 'Yes'){
        recordsContainMainLine = false;
    }

    // For item_isinactive=true condition
    var param_item_isinactive = request.getParameter('inpt_item_isinactive');
    nlapiLogExecution('DEBUG', 'param_item_isinactive_value', param_item_isinactive);
    if(!isBlankOrNull(param_item_isinactive) && param_item_isinactive == 'Yes'){
        recordsContainMainLine = false;
    }

    return recordsContainMainLine;
}

/*
 * Submit all modified sales order to server
 */
function submitModifiedSalesOrdersFromJsonData(data) {

    nlapiLogExecution('DEBUG', 'f3_logs', 'entered in submitModifiedSalesOrders method');

    try {

        var modifiedSOsList = JSON.parse(data);

        for (var i = 0; i < modifiedSOsList.length; i++) {
            /*
             Here we applied only ismainline check to get modified Sos contrary to
             submitModifiedSalesOrdersWithItemFilterFromRequestParam and submitModifiedSalesOrdersFromRequestParam methods
             becuase here we have getting already custpage_hd_recordmodified filtered records from client script
             getModifiedSalesOrdersJsonData method.
             */
            if (modifiedSOsList[i].ismainline == '1') {

                nlapiLogExecution('DEBUG', 'f3_logs', 'found a so to modify');

                var mainlineShipDate = modifiedSOsList[i].shipdate;
                var soId = modifiedSOsList[i].soid;

                nlapiLogExecution('DEBUG', 'f3_logs', 'loading so');

                var soRec = nlapiLoadRecord('salesorder', soId);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so loaded');

                soRec.setFieldValue('shipdate', mainlineShipDate);

                for (var j = i + 1; j < modifiedSOsList.length; j++) {
                    if (modifiedSOsList[j].soid == soId) {

                        var lineShipDate = modifiedSOsList[j].shipdate;
                        var lineItem = modifiedSOsList[j].item;
                        var lineId = modifiedSOsList[j].lineid;

                        var lineIndex = soRec.findLineItemValue('item', 'line', lineId);

                        soRec.setLineItemValue('item', 'expectedshipdate', lineIndex, lineShipDate);

                        if (modifiedSOsList[j].itemmodified == '1') {
                            soRec.setLineItemValue('item', 'item', lineIndex, lineItem);
                            var amount = soRec.getLineItemValue('item', 'amount', lineIndex);
                            var rate = soRec.getLineItemValue('item', 'rate', lineIndex);
                            var classField = soRec.getLineItemValue('item', 'class', lineIndex);

                            // Set Price Level to Custom "-1"
                            soRec.setLineItemValue('item', 'price', lineIndex, '-1');
                            soRec.setLineItemValue('item', 'amount', lineIndex, amount);
                            soRec.setLineItemValue('item', 'rate', lineIndex, rate);
                            soRec.setLineItemValue('item', 'class', lineIndex, classField);
                        }

                    } else {
                        break;
                    }
                }

                nlapiLogExecution('DEBUG', 'f3_logs', 'submitting so');

                nlapiLogExecution('DEBUG', 'exec_context', context.getExecutionContext());

                //nlapiLogExecution('DEBUG', 'bypasssoid_value1', context.getSessionObject('bypasssoid'));

                //nlapiLogExecution('DEBUG', 'soId', soId);

                //context.setSessionObject('bypasssoid', soId);
                context.setSessionObject(BY_PASS_SO_ID, soId);

                //nlapiLogExecution('DEBUG', 'bypasssoid_value2', context.getSessionObject('bypasssoid'));


                nlapiSubmitRecord(soRec);

                context.setSessionObject(BY_PASS_SO_ID, null);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so submitted');

            }
        }


    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error_while_submitting_updated_so_from_json_data', ex.message);
        throw ex;
    }
}

/*
 * Submit all modified sales order with item filter to server
 */
function submitModifiedSalesOrdersWithoutMainlineFromJsonData(data) {

    nlapiLogExecution('DEBUG', 'f3_logs', 'entered in submitModifiedSalesOrders method');

    try {

        var modifiedSOsList = JSON.parse(data);

        for (var i = 0; i < modifiedSOsList.length; i++) {
            /*
             Here we applied only ismainline check to get modified Sos contrary to
             submitModifiedSalesOrdersWithItemFilterFromRequestParam and submitModifiedSalesOrdersFromRequestParam methods
             becuase here we have getting already custpage_hd_recordmodified filtered records from client script
             getModifiedSalesOrdersJsonData method.
             */
            if (modifiedSOsList[i].ismainline == '1') {

                nlapiLogExecution('DEBUG', 'f3_logs', 'found a so to modify');

                var mainlineShipDate = modifiedSOsList[i].shipdate;
                var soId = modifiedSOsList[i].soid;

                nlapiLogExecution('DEBUG', 'f3_logs', 'loading so');

                var soRec = nlapiLoadRecord('salesorder', soId);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so loaded');

                var lineShipDate = modifiedSOsList[j].shipdate;
                var lineItem = modifiedSOsList[j].item;
                var lineId = modifiedSOsList[j].lineid;

                var lineIndex = soRec.findLineItemValue('item', 'line', lineId);

                soRec.setLineItemValue('item', 'expectedshipdate', lineIndex, lineShipDate);

                if (modifiedSOsList[j].itemmodified == '1') {
                    soRec.setLineItemValue('item', 'item', lineIndex, lineItem);
                    var amount = soRec.getLineItemValue('item', 'amount', lineIndex);
                    var rate = soRec.getLineItemValue('item', 'rate', lineIndex);
                    var classField = soRec.getLineItemValue('item', 'class', lineIndex);

                    // Set Price Level to Custom "-1"
                    soRec.setLineItemValue('item', 'price', lineIndex, '-1');
                    soRec.setLineItemValue('item', 'amount', lineIndex, amount);
                    soRec.setLineItemValue('item', 'rate', lineIndex, rate);
                    soRec.setLineItemValue('item', 'class', lineIndex, classField);
                }

                nlapiLogExecution('DEBUG', 'f3_logs', 'submitting so');

                nlapiLogExecution('DEBUG', 'exec_context', context.getExecutionContext());

                context.setSessionObject(BY_PASS_SO_ID, soId);

                nlapiSubmitRecord(soRec);

                context.setSessionObject(BY_PASS_SO_ID, null);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so submitted');

            }
        }


    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error_while_submitting_updated_so_with_item_filter_from_json_data', ex.message);
        throw ex;
    }
}


/*
 * Submit all modified sales order to server fetched from submitted final request
 */
function submitModifiedSalesOrdersFromRequestParam(request) {

    try {

        for (var i = 1; i <= request.getLineItemCount('custpage_list'); i++) {

            //nlapiLogExecution('DEBUG', 'f3_logs', i + '  custpage_hd_ismainline=' + request.getLineItemValue('custpage_list', 'custpage_hd_ismainline', i).trim());
            //nlapiLogExecution('DEBUG', 'f3_logs', i + '  custpage_hd_recordmodified=' + request.getLineItemValue('custpage_list', 'custpage_hd_recordmodified', i).trim());
            //nlapiLogExecution('DEBUG', 'f3_logs', i + '  custpage__lineid=' + request.getLineItemValue('custpage_list', 'custpage__lineid', i).trim());


            if (request.getLineItemValue('custpage_list', 'custpage_hd_ismainline', i).trim() == '1'
                && request.getLineItemValue('custpage_list', 'custpage_hd_recordmodified', i).trim() == '1') {

                nlapiLogExecution('DEBUG', 'f3_logs', 'found a so to modify');

                var mainlineShipDate = request.getLineItemValue('custpage_list', 'custpage_shipdate', i);
                var soId = request.getLineItemValue('custpage_list', 'custpage_id', i);

                nlapiLogExecution('DEBUG', 'f3_logs', 'loading so');

                var soRec = nlapiLoadRecord('salesorder', soId);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so loaded');

                soRec.setFieldValue('shipdate', mainlineShipDate);

                for (var j = i + 1; j <= request.getLineItemCount('custpage_list'); j++) {
                    if (request.getLineItemValue('custpage_list', 'custpage_id', j) == soId) {

                        var lineShipDate = request.getLineItemValue('custpage_list', 'custpage_shipdate', j);
                        var lineItem = request.getLineItemValue('custpage_list', 'custpage_item', j);
                        var lineId = request.getLineItemValue('custpage_list', 'custpage__lineid', j);

                        var lineIndex = soRec.findLineItemValue('item', 'line', lineId);

                        soRec.setLineItemValue('item', 'expectedshipdate', lineIndex, lineShipDate);

                        if (request.getLineItemValue('custpage_list', 'custpage_hd_itemmodified', j) == '1') {
                            soRec.setLineItemValue('item', 'item', lineIndex, lineItem);
                            var amount = soRec.getLineItemValue('item', 'amount', lineIndex);
                            var rate = soRec.getLineItemValue('item', 'rate', lineIndex);
                            var classField = soRec.getLineItemValue('item', 'class', lineIndex);

                            // Set Price Level to Custom "-1"
                            soRec.setLineItemValue('item', 'price', lineIndex, '-1');
                            soRec.setLineItemValue('item', 'amount', lineIndex, amount);
                            soRec.setLineItemValue('item', 'rate', lineIndex, rate);
                            soRec.setLineItemValue('item', 'class', lineIndex, classField);
                        }

                    } else {
                        break;
                    }
                }

                nlapiLogExecution('DEBUG', 'f3_logs', 'submitting so');

                nlapiLogExecution('DEBUG', 'exec_context', context.getExecutionContext());

                //nlapiLogExecution('DEBUG', 'bypasssoid_value1', context.getSessionObject('bypasssoid'));

                //nlapiLogExecution('DEBUG', 'soId', soId);

                //context.setSessionObject('bypasssoid', soId);
                context.setSessionObject(BY_PASS_SO_ID, soId);

                //nlapiLogExecution('DEBUG', 'bypasssoid_value2', context.getSessionObject('bypasssoid'));

                nlapiSubmitRecord(soRec, true);

                context.setSessionObject(BY_PASS_SO_ID, null);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so submitted');

            }
        }

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error_while_submitting_updated_so_from_request_param', ex.message);
        throw ex;
    }
}

/*
 * Submit all modified sales order to server fetched from submitted final request with item filter
 */
function submitModifiedSalesOrdersWithoutMainlineFromRequestParam(request) {

    try {

        for (var i = 1; i <= request.getLineItemCount('custpage_list'); i++) {


            if (request.getLineItemValue('custpage_list', 'custpage_hd_recordmodified', i).trim() == '1') {

                nlapiLogExecution('DEBUG', 'f3_logs', 'found a so to modify');

                var mainlineShipDate = request.getLineItemValue('custpage_list', 'custpage_shipdate', i);
                var soId = request.getLineItemValue('custpage_list', 'custpage_id', i);

                nlapiLogExecution('DEBUG', 'f3_logs', 'loading so');

                var soRec = nlapiLoadRecord('salesorder', soId);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so loaded');

                var lineShipDate = request.getLineItemValue('custpage_list', 'custpage_shipdate', i);
                var lineItem = request.getLineItemValue('custpage_list', 'custpage_item', i);
                var lineId = request.getLineItemValue('custpage_list', 'custpage__lineid', i);

                var lineIndex = soRec.findLineItemValue('item', 'line', lineId);

                soRec.setLineItemValue('item', 'expectedshipdate', lineIndex, lineShipDate);

                if (request.getLineItemValue('custpage_list', 'custpage_hd_itemmodified', i) == '1') {
                    soRec.setLineItemValue('item', 'item', lineIndex, lineItem);
                    var amount = soRec.getLineItemValue('item', 'amount', lineIndex);
                    var rate = soRec.getLineItemValue('item', 'rate', lineIndex);
                    var classField = soRec.getLineItemValue('item', 'class', lineIndex);

                    // Set Price Level to Custom "-1"
                    soRec.setLineItemValue('item', 'price', lineIndex, '-1');
                    soRec.setLineItemValue('item', 'amount', lineIndex, amount);
                    soRec.setLineItemValue('item', 'rate', lineIndex, rate);
                    soRec.setLineItemValue('item', 'class', lineIndex, classField);
                }

                nlapiLogExecution('DEBUG', 'f3_logs', 'submitting so');

                nlapiLogExecution('DEBUG', 'exec_context', context.getExecutionContext());

                context.setSessionObject(BY_PASS_SO_ID, soId);

                nlapiSubmitRecord(soRec, true);

                context.setSessionObject(BY_PASS_SO_ID, null);

                nlapiLogExecution('DEBUG', 'f3_logs', 'so submitted');

            }
        }

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error_while_submitting_updated_so_with_item_filter_from_request_param', ex.message);
        throw ex;
    }
}

/*
 Show error message for IE
 */
function handleIncompatibleBrowserRequest(form) {
    form.addField('custpage_script', 'inlinehtml', '').setDefaultValue('<div><img src="https://system.netsuite.com/core/media/media.nl?id=450813&c=3500213&h=2cd3de01537d5d61338e" style="position: absolute; left: 45%;" /><div style="position: absolute; top: 65%; left: 30%; width: 800px;"><label><b>This utility is not supported in Internet Explorer.  Please log in using another browser if you need to use this page.</b></label></div></div>');
}

/*
 Check for IE browser
 */
function isIE(ua){
    var msie = ua.toLowerCase().indexOf("msie ");
    if (msie > 0 || !!ua.match(/Trident.*rv\:11\./))
        return true;
    else
        return false;
}