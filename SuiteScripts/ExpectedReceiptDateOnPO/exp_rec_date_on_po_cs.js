/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       12 Jun 2014     hakhtar
 *
 */


var expRecDate_RecType = null, expRecDate_Processing = false;

function expRecDatePageInit(type){
	try {
		expRecDate_RecType = type;
		if(expRecDate_RecType == "edit") {
			//On edit mode, add the 'update all lines' checkbox after the duedate element 
			var dueDateElem =jQuery("#duedate").closest("tr")[0];
			if(!!dueDateElem) {
				jQuery("<tr><td valign=\"middle\" nowrap=\"\" align=\"right\" class=\"smallgraytextnolink\">" +
					"<span style=\"white-space: wrap;\" class=\"labelSpanEdit smallgraytextnolink\"> " +
					"Update all<br />lines on save&nbsp;</span></td>" +
					"<td valign=\"middle\" nowrap=\"\" ><input type='checkbox' id='f3_updateAllFields' /></td></tr>").insertAfter(dueDateElem);
			}
		
		}		
	}
	catch(e){}
}

function expRecDateSaveRecord(){
	try {
        var newDate = nlapiGetFieldValue("duedate");
		//Check if the update all check box is checked, then update all the line items
		if(!!jQuery("#f3_updateAllFields").prop("checked") && !!expRecDate_RecType && expRecDate_RecType == "edit" && 
			!! newDate ) {
			for(var i=1;i<=nlapiGetLineItemCount("item"); i++) {
                nlapiSelectLineItem("item", i);
                if(nlapiGetCurrentLineItemValue("item", "isclosed") == "F" && nlapiGetCurrentLineItemValue("item", "quantity") !=
                nlapiGetCurrentLineItemValue("item", "quantityreceived")){  
				nlapiSetCurrentLineItemValue("item", "expectedreceiptdate", newDate );
                nlapiCommitLineItem("item");
                }
			}
		}
	}
	catch(e){}
	return true;
}

function expRecDateRecalc(type) {
	try {
		if(!expRecDate_Processing) {
			setTimeout(function() {
				updateAllLines(type);
				}, 100);
		};
	}
	catch(e) {}
}

function updateAllLines(type) {
	try {
		expRecDate_Processing = true;
		
		//Check if the record is newly created & item subtab is updated 
		if(type == "item" && expRecDate_RecType == "create") {
			for(var i=1; i <= nlapiGetLineItemCount("item"); i++) {
				if(nlapiGetLineItemValue("item","custcol_po_item_edit_mode", i) == "F") {

					!!nlapiGetFieldValue("duedate") && nlapiSetLineItemValue("item", "expectedreceiptdate", i, nlapiGetFieldValue("duedate"));
					
					//Make it true so that this field is not updated by this chunk
					//And this will be set every time a line is added, no matter if the date was set or not
					nlapiSetLineItemValue("item", "custcol_po_item_edit_mode", i, "T");
				}
			}
			nlapiRefreshLineItems("item");
		}
		expRecDate_Processing = false;
	}
	catch(e) {}
}
