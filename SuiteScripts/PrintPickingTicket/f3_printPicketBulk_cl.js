var first_id;
var last_id;
var last_date;
var first_date;
var unload_flag = 0;

function pageInit(type) {
    window.onbeforeunload = null;
    if(nlapiGetLineItemCount('custpage_list') > 0) {
        //        jQuery( "tr[id^='custpage_listheader']" ).wrapAll('<div class="new-header-parent"></div>');
        //        jQuery( "tr[id^='custpage_listrow']" ).wrapAll('<div class="new-parent"></div>');
        //        jQuery(".new-parent").css('height','400px').css('overflow','scroll');
        //        jQuery('.listheader, .listtext').css('width','120px');
        //        jQuery('#custpage_listheader').clone().attr('id', 'custpage_listheader_copy').css('display','none').addClass('fixed').appendTo('body');
        //        jQuery("<style type='text/css'> #custpage_listheader_copy.fixed {  position: fixed; margin-left:10px;  top: 0;}</style>").appendTo("head");
        jQuery( "tr[id^='custpage_listheader'], tr[id^='custpage_listrow']" ).wrapAll('<div class="new-parent"></div>');
        jQuery(".new-parent").css('height','400px').css('overflow','scroll');
        var w = jQuery('#custpage_listheader td div').each(function(){
            jQuery( this );
        });
        var heads = new Array();
        var ind = 0;
        jQuery('#custpage_listheader td div').each(function(){
            heads[ind] = (jQuery(w[ind]).html());
            ind++;
        });
        for(var i=0;i<heads.length;i++){
            heads[i] = heads[i].split('&')[0];
        }
        var rows = jQuery( "tr[id^='custpage_listrow']" );
        for(var i= 0; i<rows.length;i++){
            var col = jQuery(rows[i]).children(':visible');
            for(var j = 0; j< col.length;j++){
                if(col[j].style.display != 'none')
                    jQuery(col[j]).attr('title',heads[j]);
            }
        }

    }
    jQuery("#date_to_helper_calendar").attr('title', 'Ship Date To');
    jQuery("#date_from_helper_calendar").attr('title', 'Ship Date From');
    jQuery('#date_from, #date_to').blur(function(){
        var from =nlapiStringToDate(nlapiGetFieldValue('date_from'));
        var to=nlapiStringToDate(nlapiGetFieldValue('date_to'));
        if(!isBlankOrNull(from) && !isBlankOrNull(to)){
            if(from > to){
                alert('Ship Date From cannot be greate than Ship Date To');
                jQuery( this ).val('');
            }
        }
    });
    jQuery( "#inpt_printed_picking_ticket1,#inpt_ready_to_print4_arrow,#inpt_ready_to_print4, #inpt_printed_picking_ticket1_arrow,#inpt_partner2, #inpt_partner2_arrow" ).click(function() {
        var a = jQuery('div.dropdownDiv div');
        if(jQuery(a[1]).html() == "- New -"){
            jQuery(a[1]).remove();
        }
    });
    jQuery( "#inpt_printed_picking_ticket1,#inpt_ready_to_print4_arrow,#inpt_ready_to_print4, #inpt_printed_picking_ticket1_arrow,#inpt_partner2, #inpt_partner2_arrow" ).mouseleave(function(){
        var a = jQuery('div.dropdownDiv div');
        if(jQuery(a[1]).html() == "- New -"){
            jQuery(a[1]).remove();
        }
    });
    var colors = {
        yellow : '#ffff00',
        grey : '#c0c0c0',
        brown : '#800000',
        green : '#008000',
        pink : '#ffcc99'
    };
	
	
	
	var pageId = document.getElementById('custpage_pageno').value;
	var sessionid = document.getElementById('custpage_sessionid').value;
	var selectedRecords = null;
	try{
		var existingRec = getSelectedRecordData(sessionid, pageId);
		if(existingRec){
			var selectedprintingdata = existingRec.getFieldValue('custrecord_selectedprintingdata');
			selectedRecords = JSON.parse(selectedprintingdata);
		}
	}
	catch(ex){
		var err = ex.message;
	}
	
	var selectedItems = new Array();
	if(selectedRecords){
		for(var z=0; z < selectedRecords.items.length; z++){
		
			selectedItems.push(selectedRecords.items[z].order + selectedRecords.items[z].item);
		}
	}
	
	
    for ( var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {
	
        if(!isBlankOrNull(nlapiGetLineItemValue('custpage_list', 'custpage__backorderallowed', i)) 
		&& getVal(nlapiGetLineItemValue('custpage_list','custpage__backorderallowed', i)).trim() == 'No'){
			var elems = document.getElementsByName('spanId' + i);
			for ( var j = 0; j < elems.length; j++) {
				var td = elems[j].parentElement;
				td.style.backgroundColor = colors['pink'];
			}
        }
        if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage_item', i)).trim() == '') {
            var elems = document.getElementsByName('spanId' + i);
            for ( var j = 0; j < elems.length; j++) {
                var td = elems[j].parentElement;
                td.style.backgroundColor = colors['grey'];
			}
        } else {
            if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage__onhold', i)).trim() == 'Yes' || getVal(nlapiGetLineItemValue('custpage_list', 'custpage__onhold', i)).trim() == 'T') {
                var elems = document.getElementsByName('spanId' + i);
                for ( var j = 0; j < elems.length; j++) {
                    var td = elems[j].parentElement;
                    td.style.backgroundColor = colors['yellow'];
                }
            }
            if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage__quantitycommitted', i)).trim() == '0') {
                var elems = document.getElementsByName('spanId' + i);
                for ( var j = 0; j < elems.length; j++) {
                    var td = elems[j].parentElement;
                    td.style.color = colors['brown'];
                }
            } else {
                var remainingQty = getVal(nlapiGetLineItemValue('custpage_list', 'custpage__remainingquantity', i)).trim();
                remainingQty *= 1;
                var shipDate = getVal(
                    nlapiGetLineItemValue('custpage_list', 'custpage_shipdate', i)).trim();
                shipDate = new Date(shipDate);
                if (remainingQty <= 0 && shipDate <= new Date(shipDate)) {
                    var elems = document.getElementsByName('spanId' + i);
                    for ( var j = 0; j < elems.length; j++) {
                        var td = elems[j].parentElement;
                        td.style.color = colors['green'];
                    }
                }
            }
        }
		
		/***************************************************************************************************************************/
		
		if(selectedRecords){
		
			var orderId = nlapiGetLineItemValue('custpage_list', 'custpage_id', i);
			var item = getVal(nlapiGetLineItemValue('custpage_list', 'custpage_item', i)).trim();
			if (item == '') {
				if(selectedRecords.orders.indexOf(orderId) > -1){
					var index = nlapiGetLineItemValue('custpage_list', 'custpage_index', i);
					setCheckBoxStatus(index, 'custpage_cancel_');
					disableLineItems(index);
				}
				
				if(selectedRecords.prints.indexOf(orderId) > -1){
					var index = nlapiGetLineItemValue('custpage_list', 'custpage_index', i);
					setCheckBoxStatus(index, 'custpage_print_');
				}
			}
			else{
			
				if(selectedItems.indexOf(orderId+item) > -1){
					var index = nlapiGetLineItemValue('custpage_list', 'custpage_index', i);
					setCheckBoxStatus(index, 'custpage_cancel_');
				}
			}
		
		}
		
		
		/***************************************************************************************************************************/
		
		
    }
    if(nlapiGetLineItemCount('custpage_list') > 0) {
        //        var num = 1;
        //        while (isNaN(getVal(nlapiGetLineItemValue('custpage_list','custpage_number', num))) && getVal(nlapiGetLineItemValue('custpage_list','custpage_number', num)))
        //        {
        //            if(num == nlapiGetLineItemCount('custpage_list')){}
        //            num++;
        //        }
        first_id = getVal(nlapiGetLineItemValue('custpage_list','custpage_number',1));
        last_id = getVal(nlapiGetLineItemValue('custpage_list','custpage_number', nlapiGetLineItemCount('custpage_list')));
        last_date = getVal(nlapiGetLineItemValue('custpage_list','custpage_date', nlapiGetLineItemCount('custpage_list')));
        first_date = getVal(nlapiGetLineItemValue('custpage_list','custpage_date', 1));
    }
}



function disableLineItems(index) {
    index = index * 1;
    var checked = document.getElementById('custpage_cancel_' + index).checked;
    var print = document.getElementById('custpage_print_' + index);
    if(print.checked){
        unload_flag--;
    } 
	
	print.checked = false;
    print.disabled = checked;
	nlapiSetLineItemValue('custpage_list', 'custpage_print_' + 'val', index, 'F');
    
    var number = getVal(nlapiGetLineItemValue('custpage_list',
        'custpage_number', index));
    for ( var i = index + 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {
        if (getVal(nlapiGetLineItemValue('custpage_list', 'custpage_number', i)) == number) {
            var elem = document.getElementById('custpage_cancel_' + i);
            if(elem.checked && checked){
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
    if(val == 'T'){
        unload_flag++;
    }
    else{
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
    if(val == 'T'){
        unload_flag++;
    }
    else{
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


function applyFilter(){
    var item = nlapiGetFieldValue('item');
    var partner = nlapiGetFieldValue('partner');
    var ppt = document.getElementById('inpt_printed_picking_ticket1').value//nlapiGetFieldText('printed_picking_ticket');
    var warehouse = nlapiGetFieldValue('warehouse');
    var customer = nlapiGetFieldValue('customer');
    var date_from = nlapiGetFieldValue('date_from');
    var date_to = nlapiGetFieldValue('date_to');
    var print_status = nlapiGetFieldValue('print_status');
    var ready_to_print = document.getElementById('inpt_ready_to_print4').value//nlapiGetFieldText('ready_to_print');
    var url = nlapiResolveURL('SUITELET', 'customscript_pickingbulk', 'customdeploy_pickingbulk');
    var query_param = '';
    if(!isBlankOrNull(item))
    {
        query_param += '&item='+item;
    }
    if(!isBlankOrNull(partner))
    {
        query_param += '&partner=' + partner;
    }
    if(!isBlankOrNull(ppt))
    {
        query_param += '&ppt=' + ppt;
    }
    if(!isBlankOrNull(warehouse))
    {
        query_param += '&warehouse=' + warehouse;
    }
    if(!isBlankOrNull(customer))
    {
        query_param += '&customer=' + customer;
    }
    if(!isBlankOrNull(date_from))
    {
        query_param += '&date_from=' + date_from;
    }
    if(!isBlankOrNull(date_to))
    {
        query_param += '&date_to=' + date_to;
    }
    if(!isBlankOrNull(print_status))
    {
        query_param += '&print_status=' + print_status;
    }
    if(!isBlankOrNull(ready_to_print))
    {
        query_param += '&ready_to_print=' + ready_to_print;
    }

	var sessionid = document.getElementById('custpage_sessionid').value;
	var pageId = document.getElementById('custpage_pageno').value;
	query_param+='&session_id=' + sessionid;
	query_param+='&page_no=' + pageId;
	
    //window.location.href = url + query_param;
	
	
	var val = nlapiGetFieldValue('pag_details');
    var val_date = nlapiGetFieldValue('pag_details_date');
	
	var form = jQuery('<form style="display: none;" action="' + url+ query_param + '" method="post">' +
        '<input type="text" name="pag_flag" value="' + 'T' + '" />' + 
        '<input type="text" name="pag" value="' + val + '" />' +
        '<input type="text" name="pag_date" value="' + val_date + '" />' +
        '</form>');
    jQuery('body').append(form);
    jQuery(form).submit();
	
}
function nextPage(){
    var item = nlapiGetFieldValue('item');
    var partner = nlapiGetFieldValue('partner');
    var ppt = document.getElementById('inpt_printed_picking_ticket1').value//nlapiGetFieldText('printed_picking_ticket');
    var warehouse = nlapiGetFieldValue('warehouse');
    var customer = nlapiGetFieldValue('customer');
    var date_from = nlapiGetFieldValue('date_from');
    var date_to = nlapiGetFieldValue('date_to');
    var print_status = nlapiGetFieldValue('print_status');
    var ready_to_print = document.getElementById('inpt_ready_to_print4').value//nlapiGetFieldText('ready_to_print');
    nlapiSetFieldValue('pag_flag','T');
    var val = nlapiGetFieldValue('pag_details');
    var val_date = nlapiGetFieldValue('pag_details_date');
	
	
    if(isBlankOrNull(val)){
        val = first_id;
        val_date = first_date;
    }
    else{
        val +=  ','+first_id;
        val_date += ','+first_date;
    }
    var url = nlapiResolveURL('SUITELET', 'customscript_pickingbulk', 'customdeploy_pickingbulk');
    var query_param = '';
    if(!isBlankOrNull(item))
    {
        query_param += '&item='+item;
    }
    if(!isBlankOrNull(partner))
    {
        query_param += '&partner=' + partner;
    }
    if(!isBlankOrNull(ppt))
    {
        query_param += '&ppt=' + ppt;
    }
    if(!isBlankOrNull(warehouse))
    {
        query_param += '&warehouse=' + warehouse;
    }
    if(!isBlankOrNull(customer))
    {
        query_param += '&customer=' + customer;
    }
    if(!isBlankOrNull(date_from))
    {
        query_param += '&date_from=' + date_from;
    }
    if(!isBlankOrNull(date_to))
    {
        query_param += '&date_to=' + date_to;
    }
    if(!isBlankOrNull(print_status))
    {
        query_param += '&print_status=' + print_status;
    }
    if(!isBlankOrNull(ready_to_print))
    {
        query_param += '&ready_to_print=' + ready_to_print;
    }
    //    var from = getVal(nlapiGetLineItemValue('custpage_list','custpage_internalid', nlapiGetLineItemCount('custpage_list')));
    query_param += '&next_page=' + last_id + '&next_date=' +last_date;
	
	
	
	
	
	/*********************************  Get Selected Sublist recods here  ********************************/
		
		var pageId = document.getElementById('custpage_pageno').value;
		var sessionid = document.getElementById('custpage_sessionid').value;
		
		
		
		var params = {
                orders : new Array(),
                items : new Array(),
                prints : new Array()
            };
		
		
		for ( var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {
			
			if (nlapiGetLineItemValue('custpage_list',
				'custpage_cancel_val', i) == 'T') {
				var item = getVal(
					nlapiGetLineItemValue('custpage_list',
						'custpage_item', i)).trim();
				if (item != '') {
					var itemObj = {
						order : nlapiGetLineItemValue('custpage_list',
							'custpage_id', i),
						item : item
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
		
		
		
		
		
		
		
		try{
			var existingRec = getSelectedRecordData(sessionid, pageId);
			if(existingRec){
				existingRec.setFieldValue('custrecord_selectedprintingdata',JSON.stringify(params));
				nlapiSubmitRecord(existingRec);
			}
			else{
				
				var newRec = nlapiCreateRecord('customrecord_pickingticketprintingdata');
				newRec.setFieldValue('custrecord_sessionid',sessionid);
				newRec.setFieldValue('custrecord_pageid',pageId);
				newRec.setFieldValue('custrecord_selectedprintingdata',JSON.stringify(params));
				
				nlapiSubmitRecord(newRec);
			}
		
		
		
		}
		catch(ex){
			var err = ex.message;
		}
		
		
		

	/*****************************************************************************************************/
	
	
	
	
	
	var page_no = parseInt(pageId);
	page_no += 1;
	
	query_param+='&session_id=' + sessionid;
	query_param+='&page_no=' + page_no.toString();
	
    var form = jQuery('<form style="display: none;" action="' + url+ query_param + '" method="post">' +
        '<input type="text" name="pag_flag" value="' + 'T' + '" />' + 
        '<input type="text" name="pag" value="' + val + '" />' +
        '<input type="text" name="pag_date" value="' + val_date + '" />' +
        '</form>');
    jQuery('body').append(form);
    jQuery(form).submit();
//  window.location.href = url + query_param;
}
function previousPage(){
    var item = nlapiGetFieldValue('item');
    var partner = nlapiGetFieldValue('partner');
    var ppt = document.getElementById('inpt_printed_picking_ticket1').value//nlapiGetFieldText('printed_picking_ticket');
    var warehouse = nlapiGetFieldValue('warehouse');
    var customer = nlapiGetFieldValue('customer');
    var date_from = nlapiGetFieldValue('date_from');
    var date_to = nlapiGetFieldValue('date_to');
    var print_status = nlapiGetFieldValue('print_status');
    var ready_to_print = document.getElementById('inpt_ready_to_print4').value//nlapiGetFieldText('ready_to_print');
    nlapiSetFieldValue('pag_flag','T');
	
	
    if(isBlankOrNull(nlapiGetFieldValue('pag_details'))){
        alert('Already on first page');
    }
    else{
        var _val = nlapiGetFieldValue('pag_details').split(',');
        var _val_date = nlapiGetFieldValue('pag_details_date').split(',');
        first_id = _val[_val.length-1];
        first_date = _val_date[_val_date.length-1];
        if(nlapiGetLineItemCount('custpage_list') > 0)
            var first_id_to = getVal(nlapiGetLineItemValue('custpage_list','custpage_number', 1));
        var url = nlapiResolveURL('SUITELET', 'customscript_pickingbulk', 'customdeploy_pickingbulk');
        var val = '';
        var val_date = '';
        for(var i=0;i<_val.length-1;i++){
            val += _val[i] + ',';
            val_date += _val_date[i] + ',';
        }
		
		// Remove last ',' from val and val_date
		val[val.length-1] = '';
		val_date[val_date.length-1] = '';
		
        val_date = val_date.replace(/,$/, "");
        val = val.replace(/,$/, "");
        var query_param = '';
        if(!isBlankOrNull(item))
        {
            query_param += '&item='+item;
        }
        if(!isBlankOrNull(partner))
        {
            query_param += '&partner=' + partner;
        }
        if(!isBlankOrNull(ppt))
        {
            query_param += '&ppt=' + ppt;
        }
        if(!isBlankOrNull(warehouse))
        {
            query_param += '&warehouse=' + warehouse;
        }
        if(!isBlankOrNull(customer))
        {
            query_param += '&customer=' + customer;
        }
        if(!isBlankOrNull(date_from))
        {
            query_param += '&date_from=' + date_from;
        }
        if(!isBlankOrNull(date_to))
        {
            query_param += '&date_to=' + date_to;
        }
        if(!isBlankOrNull(print_status))
        {
            query_param += '&print_status=' + print_status;
        }
        if(!isBlankOrNull(ready_to_print))
        {
            query_param += '&ready_to_print=' + ready_to_print;
        }
		
		
		
		
		/*********************************  Get Selected Sublist recods here  ********************************/
		
		var sessionid = document.getElementById('custpage_sessionid').value;
		var pageId = document.getElementById('custpage_pageno').value;
		
		var params = {
                orders : new Array(),
                items : new Array(),
                prints : new Array()
            };
		
		
		
		for ( var i = 1; i <= nlapiGetLineItemCount('custpage_list'); i++) {
			
			if (nlapiGetLineItemValue('custpage_list',
				'custpage_cancel_val', i) == 'T') {
				var item = getVal(
					nlapiGetLineItemValue('custpage_list',
						'custpage_item', i)).trim();
				if (item != '') {
					var itemObj = {
						order : nlapiGetLineItemValue('custpage_list',
							'custpage_id', i),
						item : item
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
		
		
		
		
		
		
		
		try{
			var existingRec = getSelectedRecordData(sessionid, pageId);
			if(existingRec){
				existingRec.setFieldValue('custrecord_selectedprintingdata',JSON.stringify(params));
				nlapiSubmitRecord(existingRec);
			}
			else{
				
				var newRec = nlapiCreateRecord('customrecord_pickingticketprintingdata');
				newRec.setFieldValue('custrecord_sessionid',sessionid);
				newRec.setFieldValue('custrecord_pageid',pageId);
				newRec.setFieldValue('custrecord_selectedprintingdata',JSON.stringify(params));
				
				nlapiSubmitRecord(newRec);
			}
		
		
		
		}
		catch(ex){
			var err = ex.message;
		}
		
		
		

	/*****************************************************************************************************/
		
		
		var page_no = parseInt(pageId);
		if(page_no > 0){
			page_no -= 1;
		}
		
	
		query_param+='&session_id=' + sessionid;
		query_param+='&page_no=' + page_no.toString();
		
		
        var extra_param = '';
        if(!isBlankOrNull(val)){
            // query_param += '&prev_page=' + first_id + '&prev_page_to=' + first_id_to+ '&prev_date=' + first_date;
            query_param += '&prev_page=' + first_id+ '&prev_date=' + first_date;
            extra_param += '<input type="text" name="pag" value="' + val + '" />';
			extra_param += '<input type="text" name="pag_date" value="' + val_date + '" />';
        }
		
        var form = jQuery('<form style="display: none;" action="' + url + query_param + '" method="post">' +
            '<input type="text" name="pag_flag" value="' + 'T' + '" />' +
            extra_param +
            '</form>');
        jQuery('body').append(form);
        jQuery(form).submit();
    //window.location.href = url + query_param;
    }
}
//if(nlapiGetLineItemCount('custpage_list') > 0) {
//    jQuery(document).ready(function () {
//        var top = jQuery('#custpage_listheader').offset().top - parseFloat(jQuery('#custpage_listheader').css('marginTop').replace(/auto/,0));
//        jQuery(window).scroll(function (event) {
//            // what the y position of the scroll is
//            var y = jQuery(this).scrollTop();
//
//            // whether that's below the form
//            if (y >= top) {
//                // if so, ad the fixed class
//                jQuery('#custpage_listheader_copy').show();
//
//            } else {
//                // otherwise remove it
//                jQuery('#custpage_listheader_copy').hide();
//            }
//        });
//    });
//    jQuery(window).scroll(function () {
//        jQuery('#custpage_listheader_copy').css('left', -(jQuery(window).scrollLeft()));
//    });
//}
jQuery('#submitter').click(function(){
    window.onbeforeunload = null;
});