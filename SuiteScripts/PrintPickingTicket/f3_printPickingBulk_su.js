var parm_item;
var parm_partner;
var parm_warehouse;
var parm_customer;
var parm_ppt;
var parm_date_from;
var parm_date_to;
var parm_print_status;
var parm_ready_to_print;
var parm_next_page;
var parm_prev_page;
var parm_prev_date;
var parm_prev_page_to;
var parm_next_date;
var parm_pag;
var parm_pag_date;

function suitelet(request, response) {
    var form = nlapiCreateForm('Print Picking Ticket in Bulk');
   
    if (request.getMethod() == 'GET') {
        allGetProcess(form, request);
    } else {
        var flag_val = request.getParameter('pag_flag');
        if(isBlankOrNull(flag_val)){
            var params = {
                orders : new Array(),
                items : new Array(),
                prints : new Array()
            };
            for ( var i = 1; i <= request.getLineItemCount('custpage_list'); i++) {
                if (request.getLineItemValue('custpage_list',
                    'custpage_cancel_val', i) == 'T') {
                    var item = getVal(
                        request.getLineItemValue('custpage_list',
                            'custpage_item', i)).trim();
                    if (item != '') {
                        var itemObj = {
                            order : request.getLineItemValue('custpage_list',
                                'custpage_id', i),
                            item : item
                        };
                        params.items.push(itemObj);
                    } else {
                        params.orders.push(request.getLineItemValue(
                            'custpage_list', 'custpage_id', i));
                    }
                }
                if (request.getLineItemValue('custpage_list', 'custpage_print_val',
                    i) == 'T') {
                    params.prints.push(request.getLineItemValue('custpage_list',
                        'custpage_id', i));
                }
            }
			
			/************************************  Get Selected Sublist recods here  **************************************/
			var sessionId = request.getParameter('custpage_sessionid');
			var pageId = request.getParameter('custpage_pageno');
			
			/**************************************************************************************************************/
			
			
			
			/*** Select all records of this session from 'custrecord_selectedprintingdata' custom record and merge all **/
			
			try{
				var filters = new Array();
				var columns = new Array();
				
				filters.push(new nlobjSearchFilter('custrecord_sessionid','','is',sessionId));
				
				columns.push(new nlobjSearchColumn('custrecord_sessionid'));
				columns.push(new nlobjSearchColumn('custrecord_pageid'));
				columns.push(new nlobjSearchColumn('custrecord_selectedprintingdata'));
				
				var result = nlapiSearchRecord('customrecord_pickingticketprintingdata',null,filters,columns);
				
				if(result != null && result.length > 0){
					for(var i = 0; i < result.length; i++){
						
						if(result[i].getValue('custrecord_pageid') != pageId){
						
							var selectedRecords = result[i].getValue('custrecord_selectedprintingdata');
							var parsedSelectedRecords = JSON.parse(selectedRecords);
							params.items = params.items.concat(parsedSelectedRecords.items);
							params.orders = params.orders.concat(parsedSelectedRecords.orders);
							params.prints = params.prints.concat(parsedSelectedRecords.prints);
						}
						
						nlapiDeleteRecord('customrecord_pickingticketprintingdata', result[i].getId());
						
					}
				}
			} catch(ex){
				var msg = ex.message;
			}
			
			/**************************************************************************************************************/
			
			
			
			
            params = {
                custscript_cancellist : JSON.stringify(params)
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
        else{
            allGetProcess(form, request);
        }
    }
    
    response.writePage(form);
}


/*
Return selected record data if exist
*/
function getSelectedRecordData(sessionId, pageId){

	try{
		var filters = new Array();
		var columns = new Array();
		
		filters.push(new nlobjSearchFilter('custrecord_sessionid','','is',sessionId));
		filters.push(new nlobjSearchFilter('custrecord_pageid','','is',pageId));
		
		columns.push(new nlobjSearchColumn('custrecord_sessionid'));
		columns.push(new nlobjSearchColumn('custrecord_pageid'));
		columns.push(new nlobjSearchColumn('custrecord_selectedprintingdata'));
		
		var result = nlapiSearchRecord('customrecord_pickingticketprintingdata',null,filters,columns);
		
		if(result != null && result.length > 0){
			
			return nlapiLoadRecord('customrecord_pickingticketprintingdata',result[0].getId());
		}
		else{
			return null;
		}
	} catch(ex){
		var msg = ex.message;
		return null;
	}
}


// Generated Unique Id
var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();

function allGetProcess(form, request){

	/***************************** getting selected records list from request if any*************************************/
	
	var sessionid = request.getParameter('session_id');
	if(!sessionid || typeof sessionid  === "undefined"){
		sessionid = guid();
	}
	
	var pageno = request.getParameter('page_no');
	if(!pageno || typeof pageno  === "undefined"){
		pageno = '1';
	}
	
	form.addField('custpage_sessionid', 'text', 'pag').setDisplayType('hidden').setDefaultValue(sessionid);
	form.addField('custpage_pageno', 'text', 'pag').setDisplayType('hidden').setDefaultValue(pageno);
	
	/********************************************************************************************************************/

	
	
    var i=0;
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
    parm_next_page = request.getParameter('next_page');
    parm_prev_page = request.getParameter('prev_page');
    parm_prev_page_to = request.getParameter('prev_page_to');
    parm_pag = request.getParameter('pag');
    parm_pag_date = request.getParameter('pag_date');
    parm_next_date = request.getParameter('next_date');
    parm_prev_date = request.getParameter('prev_date');
    if(!isBlankOrNull(parm_prev_page)){
        filters[i] = new nlobjSearchFilter('formulanumeric', null, 'equalto', 1);
        //        filters[i].setFormula('CASE WHEN TO_NUMBER({tranid}) >= ' +parseInt(parm_prev_page,10) + ' AND TO_NUMBER({tranid}) <= ' +parseInt(parm_prev_page_to,10) + '  THEN 1 ELSE 0 END');
        filters[i].setFormula('CASE WHEN TO_NUMBER({tranid}) >= ' +parm_prev_page + '  THEN 1 ELSE 0 END');
        i++;
        filters[i] = new nlobjSearchFilter('trandate', null, 'onorafter', parm_prev_date);
        i++;
    }
    if(!isBlankOrNull(parm_next_page)){
        filters[i] = new nlobjSearchFilter('formulanumeric', null, 'equalto', 1);
        filters[i].setFormula('CASE WHEN TO_NUMBER({tranid}) > ' +parm_next_page + ' THEN 1 ELSE 0 END');
        i++;
        filters[i] = new nlobjSearchFilter('trandate', null, 'onorafter', parm_next_date);
        i++;
    }
    if(!isBlankOrNull(parm_item)){
        filters[i] = new nlobjSearchFilter('itemid','item', 'contains', parm_item);
        i++;
    }
    if(!isBlankOrNull(parm_partner)){
        filters[i] = new nlobjSearchFilter('partner',null, 'is',parm_partner);
        i++;
    }
    if(!isBlankOrNull(parm_warehouse)){
        filters[i] = new nlobjSearchFilter('location',null, 'is', parm_warehouse);
        i++;
    }
    if(!isBlankOrNull(parm_customer)){
        nlapiLogExecution('DEBUG', 'i', i + parm_customer);

        filters[i] = new nlobjSearchFilter('entity',null, 'anyof', parm_customer);
        i++;
    }
    if(!isBlankOrNull(parm_print_status)){
        filters[i] = new nlobjSearchFilter('custbody_printstatus',null, 'is', parm_print_status);
        i++;
    }
    if(!isBlankOrNull(parm_ppt)){
        if(parm_ppt == 'Yes'){
            filters[i] = new nlobjSearchFilter('printedpickingticket',null, 'is', 'T');
            i++;
        }
        else if(parm_ppt == 'No'){
            filters[i] = new nlobjSearchFilter('printedpickingticket',null, 'is', 'F');
            i++;
        }
    }
    if(!isBlankOrNull(parm_ready_to_print)){
        if(parm_ready_to_print == 'Yes'){
            filters[i] = new nlobjSearchFilter('custbody_readyprintpt',null, 'is', 'T');
            i++;
        }
        else if(parm_ready_to_print == 'No'){
            filters[i] = new nlobjSearchFilter('custbody_readyprintpt',null, 'is', 'F');
            i++;
			
			
			
        }
    }
    if(!isBlankOrNull(parm_date_from) && !isBlankOrNull(parm_date_to)){
        filters[i] = new nlobjSearchFilter('shipdate',null, 'within', parm_date_from , parm_date_to);
    }
    else
    if(!isBlankOrNull(parm_date_from) && isBlankOrNull(parm_date_to)){
        filters[i] = new nlobjSearchFilter('shipdate',null, 'onorafter', parm_date_from);
    }
    else if(isBlankOrNull(parm_date_from) && !isBlankOrNull(parm_date_to)){
        filters[i] = new nlobjSearchFilter('shipdate',null, 'onorbefore', parm_date_to);
    }
    //    var column = new Array();
    //    column.push(new nlobjSearchColumn('internalid').setSort(true));
    nlapiLogExecution('DEBUG', 'filters', JSON.stringify(filters))
    var res = nlapiSearchRecord(null, 'customsearch_reopensalesorders_2_2_2___5', filters);
    //        var count_result = nlapiSearchRecord(null, 'customsearch_reopensalesorders_count');
    //        var count = count_result[0].rawValues[0].value;
    //        var pag_start = count_result[0].rawValues[1].value;

    if (res) {
        nlapiLogExecution('DEBUG', 'length', res.length);
        form.addSubmitButton('Submit Changes');
        
        addFormFields(form);
		
        var list = form.addSubList('custpage_list', 'list',
            'Sales Order List');
        list.addField('custpage_print', 'text', 'Print').setDisplaySize(20);
        list.addField('custpage_cancel', 'text', 'Close');
        list.addField('custpage_print_val', 'checkbox', '').setDisplayType(
            'hidden');
        list.addField('custpage_cancel_val', 'checkbox', '')
        .setDisplayType('hidden');
        list.addField('custpage_id', 'text', '').setDisplayType('hidden');
		list.addField('custpage_index', 'text', '').setDisplayType('hidden');
        var columns = res[0].getAllColumns();
        for ( var i = 0; i < columns.length; i++) {
            var column = columns[i];
            var label = column.getLabel();
            var name = label.replace(/\s/g, '').toLowerCase();
            var field = list.addField('custpage_' + name, 'text', label);
            if (label.indexOf('_') == 0) {
                field.setDisplayType('hidden');
            }
        }
        var values = new Array();
        for ( var i = 1; i <= res.length; i++) {
            var rec = res[i - 1];
            var obj = {
                custpage_cancel : '<p name="spanId' + i + '" id="spanId'
                + i
                + '"><input type="checkbox" id="custpage_cancel_'
                + i + '"  onChange="setVal(' + i
                + ',\'custpage_cancel_\');',
                custpage_id : rec.getId()
            };
            for ( var j = 0; j < columns.length; j++) {
                var column = columns[j];
                if (column.getName() == 'item'
                    && rec.getValue(column) == '') {
                    obj['custpage_print'] = '<p name="spanId'
                    + i
                    + '" id="spanId'
                    + i
                    + '" class="spanId'
                    + i+j
                    + '"><input type="checkbox" id="custpage_print_'
                    + i + '" onChange="setVal(' + i
                    + ',\'custpage_print_\');"/></p>';
                    obj['custpage_cancel'] += 'disableLineItems(' + i
                    + ');';
                }
                if(column.type=='select')
                {
                    obj['custpage_'
                    + column.getLabel().replace(/\s/g, '')
                    .toLowerCase()] = '<p name="spanId' + i
                    + '" id="spanId' + i + '" tabindex="'+i+'" class="spanId' + i + j + '">' + rec.getText(column)
                    + '</p>';
                }
                else
                if(column.type=='currency' && !isBlankOrNull(rec.getValue(column)))
                {
                    obj['custpage_'
                    + column.getLabel().replace(/\s/g, '')
                    .toLowerCase()] = '<p name="spanId' + i
                    + '" id="spanId' + i + '" class="spanId' + i + j +'">' + parseFloat(rec.getValue(column))
                    + '</p>';
                }
                else {
                    obj['custpage_'
                    + column.getLabel().replace(/\s/g, '')
                    .toLowerCase()] = '<p name="spanId' + i
                    + '" id="spanId' + i + '" class="spanId' + i + j +'">' + rec.getValue(column)
                    + '</p>';
                }
            }
            obj['custpage_cancel'] += '"></p>';
			
			obj['custpage_index'] = i.toString();
			
            values.push(obj);
        }
        for ( var i = values.length - 1; i >= 0; i--) {
            nlapiLogExecution('DEBUG', 'test', values[i].custpage_id);
            if (values[i].custpage_print) {
                values.splice(i, values.length - 1);
                break;
            }
        }
        list.setLineItemValues(values);
    //      form.setScript('customscript_pickingbulk_cl');
    } else {
        addFormFields(form);
        form.addFieldGroup('custpage_newfg', ' ', null);
        form.addField('custpage_script5', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#tbl_next_page").hide() </script>')
        form.addField('custpage_dummy', 'inlinehtml', '', null, 'custpage_newfg').setDefaultValue('<b><h1 style="font-size:20px;">No Records Found</h1></b>');
    }
    form.setScript('customscript_pickingbulk_cl');
}
function addFormFields(form){
    form.addFieldGroup('custpage_newfilters', ' ', null);
    form.addField('item', 'text', 'Item',null,'custpage_newfilters').setDefaultValue(parm_item);
    form.addField('printed_picking_ticket', 'select', 'Printed Picking Ticket', 'customlist_printedpickingticketslist','custpage_newfilters');
    form.addField('partner', 'select', 'Partner', 'partner','custpage_newfilters').setDefaultValue(parm_partner);
    form.addField('warehouse', 'select', 'Warehouse', 'location','custpage_newfilters').setDefaultValue(parm_warehouse);
    form.addField('customer', 'select', 'Customer','customer','custpage_newfilters').setDefaultValue(parm_customer);
    form.addField('print_status', 'text', 'Print Status',null,'custpage_newfilters').setDefaultValue(parm_print_status);
    form.addField('ready_to_print', 'select', 'Ready To Print', 'customlist_printedpickingticketslist','custpage_newfilters');
    form.addField('date_from', 'date', 'Ship Date From',null,'custpage_newfilters').setDefaultValue(parm_date_from);
    form.addField('date_to', 'date', 'Ship Date To',null,'custpage_newfilters').setDefaultValue(parm_date_to);
    form.addButton('prev_page', 'Previous Page', 'previousPage()');
    form.addButton('next_page', 'Next Page', 'nextPage()');
    form.addButton('apply_filters', 'Apply Filters', 'applyFilter()');
    form.addField('custpage_script', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#ready_to_print_popup_new").hide();  jQuery("#ready_to_print_popup_link").hide(); jQuery("#printed_picking_ticket_popup_new").hide();  jQuery("#item_popup_muli").hide(); jQuery("#printed_picking_ticket_popup_link").hide();    jQuery("#partner_popup_new").hide(); jQuery("#partner_popup_link").hide(); jQuery("#warehouse_popup_link").hide();  jQuery("#customer_popup_muli").hide(); </script>');
    if(!isBlankOrNull(parm_customer)){
        form.addField('custpage_script2', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#customer_display").val("'+ nlapiLoadRecord("customer", parm_customer).getFieldValue("altname") +'"); </script>');
    }
    if(!isBlankOrNull(parm_ppt)){
        form.addField('custpage_script3', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#inpt_printed_picking_ticket1").val("' +parm_ppt +'") </script>')
    }
    if(!isBlankOrNull(parm_ready_to_print)){
        form.addField('custpage_script4', 'inlinehtml', '').setDefaultValue('<script type="text/javascript "> jQuery("#inpt_ready_to_print4").val("' +parm_ready_to_print +'") </script>')
    }
    form.addFieldGroup('custpage_pagination', ' ', null);
    form.addField('pag_details', 'text', 'pag').setDisplayType('hidden').setDefaultValue(parm_pag);
    form.addField('pag_details_date', 'text', 'pag').setDisplayType('hidden').setDefaultValue(parm_pag_date);
}