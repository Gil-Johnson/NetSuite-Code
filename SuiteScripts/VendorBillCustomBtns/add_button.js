/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       25 Mar 2014     hakhtar
 *
 */

/**
 * To add custom buttons on create and edit view of vendor bill
 *   
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function beforeLoad(type, form, request) {

	//Check if we are on create/edit mode
	if(type == "create" || type == "edit") {
		
		//Client script to zero all line items
		var zeroAllLines = "for(var i=1; i<= nlapiGetLineItemCount('item'); i++) {" +
				"nlapiSetLineItemValue('item','quantity', i, '0');" +
				"nlapiSetLineItemValue('item','amount', i, '0.00')" +
				"} nlapiRefreshLineItems('item');";
		
		//Client script to remove all zero lines
		var removeZeroLines = "for(var i=nlapiGetLineItemCount('item'); i>= 1; i--) {" +
				"if(nlapiGetLineItemValue('item','quantity',i) == '0')" +
				"nlapiRemoveLineItem('item', i);" +
				"} nlapiRefreshLineItems('item');" +
				"nlapiCancelLineItem('item');" +
		
		//Add buttons
		form.addButton("custpage_zero_line_items", "Zero All Lines", zeroAllLines);
		form.addButton("custpage_remove_zero_line_items", "Remove Zero Lines", removeZeroLines);
	}
	
}
