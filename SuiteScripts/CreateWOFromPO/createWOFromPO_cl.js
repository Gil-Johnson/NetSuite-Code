function clientPageInit() {
	for ( var i = 1; i <= nlapiGetLineItemCount('custpage_items'); i++) {
		var statuses = nlapiGetLineItemValue('custpage_items',
				'custpage_statusarray', i);
		var statusArr = statuses.split(',');
		if (statusArr[0] == 'T') {
			document.getElementById('custpage_check' + i).disabled = true;
		}
		document.getElementById('custpage_items_custpage_description' + i
				+ '_fs').disabled = true;
	}
}

function clientFieldChanged(type, name, linenum) {
	if (name == 'custpage_setenddate') {
		var val = nlapiGetFieldValue(name);
		for ( var i = 1; i <= nlapiGetLineItemCount('custpage_items'); i++) {
			nlapiSetLineItemValue('custpage_items', 'custpage_enddate', i, val);
		}
	}
}

function clientValidateField(type, name, linenum) {
	if (name == 'custpage_quantity') {
		var qty = nlapiGetLineItemValue('custpage_items', 'custpage_qty',
				linenum);
		var val = document.getElementById(name + linenum).value;
		val *= 1;
		if (val <= 0 || qty < val) {
			alert('Please select a value between 1 and ' + qty);
			return false;
		}
	}
	return true;
}

function onChangeAssembly(self) {
	var linenum = self.name.substring('cust_assembly'.length);
	var index = self.selectedIndex;
	var comments = nlapiGetLineItemValue('custpage_items',
			'custpage_commentsarray', linenum);
	var commentsArr = comments.split(',');
	nlapiSetLineItemValue('custpage_items', 'custpage_comments', linenum,
			commentsArr[index]);
	var ids = nlapiGetLineItemValue('custpage_items', 'custpage_idarray',
			linenum);
	var idArr = ids.split(',');
	nlapiSetLineItemValue('custpage_items', 'custpage_id', linenum,
			idArr[index]);
	var statuses = nlapiGetLineItemValue('custpage_items',
			'custpage_statusarray', linenum);
	var statusArr = statuses.split(',');
	var elem = document.getElementById('custpage_itemsrow' + (linenum - 1)).cells
			.item(8);
	var innerHTML = elem.innerHTML;
	var start = innerHTML.indexOf('<font');
	if (statusArr[index] == 'T') {
		nlapiSetLineItemValue('custpage_items', 'custpage_check', linenum, 'F');
		document.getElementById('custpage_check' + linenum).disabled = true;
		if (start < 0) {
			elem.innerHTML = '<font color=\'red\'>' + innerHTML + '</font>';
		}
	} else {
		nlapiSetLineItemValue('custpage_items', 'custpage_check', linenum, 'T');
		document.getElementById('custpage_check' + linenum).disabled = false;
		if (start >= 0) {
			var end = innerHTML.indexOf('</font>');
			elem.innerHTML = innerHTML.substring(start + 18, end);
		}
	}
}
