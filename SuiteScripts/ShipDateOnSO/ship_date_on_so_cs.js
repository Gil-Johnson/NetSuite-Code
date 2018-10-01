/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       21 Jul 2014     hakhtar
 *
 */


var shoso_RecType = null, shoso_Processing = false;

function shosoPageInit(type) {
	try {
		shoso_RecType = type;
		if(shoso_RecType == "edit") {
			//On edit mode, add the 'update all lines' checkbox after the shipdate element 
			var shipDateElem =jQuery("#shipdate").closest("tr")[0];
			if(!!shipDateElem) {
				jQuery("<tr><td valign=\"middle\" nowrap=\"\" align=\"right\" class=\"smallgraytextnolink\">" +
					"<span style=\"white-space: wrap;\" class=\"labelSpanEdit smallgraytextnolink\"> " +
					"Update all<br />lines on save&nbsp;</span></td>" +
					"<td valign=\"middle\" nowrap=\"\" ><input type='checkbox' id='f3_updateAllFields' /></td></tr>").insertAfter(shipDateElem);
			}
		
		}		
	}
	catch(e){}
}

function shosoSaveRecord() {
	try {
		//Check if the update all check box is checked, then update all the line items
		if(!!jQuery("#f3_updateAllFields").prop("checked") && !!shoso_RecType && shoso_RecType == "edit" && 
			!!nlapiGetFieldValue("shipdate")) {
			for(var i=1;i<=nlapiGetLineItemCount("item"); i++) {
				nlapiSelectLineItem("item", i);
				
				var qtyFulliled = nlapiGetCurrentLineItemValue('item','quantityfulfilled');
				var qty = nlapiGetCurrentLineItemValue('item','quantity');
				var newQty =  qty - qtyFulliled;
				
			//	alert(newQty);
				
								
				if(nlapiGetCurrentLineItemValue('item','isclosed') == 'F' && newQty > 0){        //&& nlapiGetCurrentLineItemValue('item','linked') == 'F' removed per request 					
				nlapiSetCurrentLineItemValue("item", "expectedshipdate", nlapiGetFieldValue("shipdate"));
				nlapiCommitLineItem("item");				
				}
				
			}
		}
	}
	catch(e){}
	return true;
}

function shosoRecalc(type) {
	try {
		if(!shoso_Processing) {
			setTimeout(function() {
				shosoUpdateAllLines(type);
				}, 100);
		};
	}
	catch(e) {}
}


function shosoUpdateAllLines(type) {
	try {
		shoso_Processing = true;
		
		//Check if the record is newly created & item subtab is updated 
		if(type == "item" ) { //removed-   && shoso_RecType == "create"
			for(var i=1; i <= nlapiGetLineItemCount("item"); i++) {
				if(nlapiGetLineItemValue("item","custcol_po_item_edit_mode", i) == "F") {

					!!nlapiGetFieldValue("shipdate") && !nlapiGetLineItemValue("item","expectedshipdate", i) && 
					nlapiSetLineItemValue("item", "expectedshipdate", i, nlapiGetFieldValue("shipdate"));
					
					//Make it true so that this field is not updated by this chunk
					//And this will be set every time a line is added, no matter if the date was set or not
					nlapiSetLineItemValue("item", "custcol_po_item_edit_mode", i, "T");
				}
			}
			nlapiRefreshLineItems("item");
		}
		shoso_Processing = false;
	}
	catch(e) {}
}
