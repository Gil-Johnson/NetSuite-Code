/**
 * Created by Kaiser on 3/9/16.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var UserEventClass = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        userEventBeforeLoad: function (type, form, request) {
            //TODO: Write Your code here
        },
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit
         *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF)
         *                      markcomplete (Call, Task)
         *                      reassign (Case)
         *                      editforecast (Opp, Estimate)
         * @returns {Void}
         */
        userEventBeforeSubmit: function (type) {
            //TODO: Write Your code here
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit,
         *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF only)
         *                      dropship, specialorder, orderitems (PO only)
         *                      paybills (vendor payments)
         * @returns {Void}
         */
        userEventAfterSubmit: function (type) {
			var context = nlapiGetContext();
			nlapiLogExecution('DEBUG', 'User Event called.', type);
            if (String(type) === "approve") {
				nlapiLogExecution('DEBUG', 'User Event called.', "Here");
				var record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
				var entity = record.getFieldValue('entity');
				var customer = nlapiLoadRecord('customer', entity);
				var po = "";
				if (record.getFieldValue('otherrefnum')) {
					po = record.getFieldValue('otherrefnum');
				}

				var sender = 17842;
		//		if(context.getSetting('SCRIPT', 'custscript_author_id'));
		//			sender = context.getSetting('SCRIPT', 'custscript_author_id');
				
		//		nlapiLogExecution('DEBUG', 'User Event called.', sender);
				
				if (nlapiGetFieldValue('custbody_send_confirmation') == 'F') {
					
					return;
				}			
				
					//var recipient = 10;
					var recipient = customer.getFieldValue('custentity_main_order_conf_email');				
					nlapiLogExecution('DEBUG', 'User Event called.', recipient);
					var subject = "Rico Industries Order Confirmation for PO # " + po;
					var ccAddresses = [];
					
					var order_receipt = nlapiGetFieldValues('custbody_send_confirmation_to'); 
				//	nlapiLogExecution('DEBUG', 'order_receipt', order_receipt.toString());
					
					for (var i = 0; i <= order_receipt.length; i++) {	
						
						nlapiLogExecution('DEBUG', 'order_receipt', order_receipt[i]);
						    if(order_receipt[i] != null && order_receipt[i] != ''){
						 	var emailAddress = nlapiLookupField('entity', order_receipt[i], 'email');							
							nlapiLogExecution('DEBUG', 'emailAddress', emailAddress);							
											
							if(emailAddress != ''){
							ccAddresses.push(emailAddress);
							}
							
						    }
						}
					
					
					if(recipient == null || recipient == ''){
						
						recipient = ccAddresses[0];						
						ccAddresses.shift();						
						
					}
				
					
					var body = this.createEmailBody(record);
					
				 //	nlapiLogExecution('DEBUG', 'cc array', ccAddresses.toString);
					
                                         
				   	 var rec = new Array();
				   	 rec['entity'] = entity;// internal id of the record 
				   	 rec['transaction'] = nlapiGetRecordId();// internal id of the record 
					
			//	   	nlapiLogExecution('DEBUG', 'cc array', ccAddresses.length);
				   	
				     			  
					this.sendEmail(sender, recipient, subject, body, ccAddresses, null, rec);				   
			
				
				
			}
        },
		sendEmail: function (sender, recipient, subject, body, cc, bcc, attach) {
			nlapiSendEmail(sender, recipient, subject, body, cc, bcc, attach);
		},
		createEmailBody: function (record) {
			var backOrdersAllowed = ((record.getFieldValue('custbody_backordersallowed') === "1") ? "Yes" : "No");
			var lineItemCount = record.getLineItemCount('item');
			var thumbNailField = 'custitemthumbnail_image';
			var teamField = 'custitem2';
			var cancelDate = "";
			var po = "";
			
			if (record.getFieldValue('otherrefnum')) {
				po = record.getFieldValue('otherrefnum');
			}

			if (record.getFieldValue('custbody_cncldate')) {
				cancelDate = record.getFieldValue('custbody_cncldate');
			}
			
			var body = "<html xmlns='http://www.w3.org/1999/xhtml'>" +
			 "<head>" + 
			 "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8' />" +
			 "<style>" +
			 ".table_style{" +
				"border-collapse: collapse;}" +
			
			".table_style tr th," + 
			".table_style tr td{" +
				"border:1px solid #e0e0e0;" +
				"padding: 5px;} " +
			
			".table_style tr th{" +
				"background-color: #eeeeee;}" +
			"</style>" +
			 "</head>" +

			 "<body>" +
			 "<p>" + 
			 "Thank you for ordering from Rico Industries! This email is to confirm receipt of your order.  We will do our best to ship the items you have ordered in the timeline provided below.  " +
			 "If you have any question or notice a discrepancy, please reply to this email. Please direct all inquiries to CustomerService@ricoinc.com, or call (855) 808-4618." +
			 "</p>" +
			 "<p>" + 
			 "Date Entered - " + record.getFieldValue('trandate') + "<br><br>" +

			 "Cancel Date -" + cancelDate + "<br><br>" +

			 "PO# " + po + "<br><br>" +

			 "Backorder Allowed - "  + backOrdersAllowed + "<br><br>" +
			 
			 "<div style='width:50%; display:inline-block;'><b>Ship To</b><br>" + 
			  "Addresee: " + record.getFieldValue('shipaddressee') + "<br>" +
			  "Attention: " + record.getFieldValue('shipattention') + "<br>" +
			  "Address 1: " + record.getFieldValue('shipaddr1') + "<br>" +
			  "Addresss 2: " + record.getFieldValue('shipaddr2') + "<br>" +
			  "City: " + record.getFieldValue('shipcity') + "<br>" +
			  "State: " + record.getFieldValue('shipstate') + "<br>" +
			  "Zip: " + record.getFieldValue('shipzip') + "<br>" +
			  "Country: " + record.getFieldValue('shipcountry') + "<br><br></div>" +
			 
			 "<div style='width:50%; display:inline-block;'><b>Bill To</b><br>" + 
			  "Addresee: " + record.getFieldValue('billaddressee') + "<br>" +
			  "Attention: " + record.getFieldValue('billattention') + "<br>" +
			  "Address 1: " + record.getFieldValue('billaddr1') + "<br>" +
			  "Address 2: " + record.getFieldValue('billaddr2') + "<br>" +
			  "City: " + record.getFieldValue('billcity') + "<br>" +
			  "State: " + record.getFieldValue('billstate') + "<br>" +
			  "Zip: " + record.getFieldValue('billzip') + "<br>" +
			  "Country: " + record.getFieldValue('billcountry') + "<br><br></div><br><br>";
			
			
			var itemIds = [];
			for (var i = 1; i <= lineItemCount; i++) {
				itemIds.push(record.getLineItemValue('item', 'item', i));
			}
			
			nlapiLogExecution('DEBUG', 'User Event called.', itemIds);
			var itemRecords = nlapiSearchRecord('item', null, 
			new nlobjSearchFilter('internalid', null, 'anyof', itemIds), 
			[
			new nlobjSearchColumn(thumbNailField), 
			new nlobjSearchColumn(teamField)
			]
			);
			
			nlapiLogExecution('DEBUG', 'User Event called.', itemRecords);
			var itemDetails = [];
			
			if (itemRecords) {
				for (var j = 0; j < itemRecords.length; j++) {
						var obj = {};
						obj.thumbnail = itemRecords[j].getValue(thumbNailField);
						obj.team = itemRecords[j].getValue(teamField);
						itemDetails[itemRecords[j].id] = obj;
				}
			}
			
			body += "</p>" +
					"<table class='table_style' width='100%' border='0' cellpadding='0' cellspacing='0'>" +
						"<tr>" + 
							"<th>Image</th>" +
							"<th>Item</th>" +		
							"<th>Description</th>" +
							"<th>Qty Ordered</th>" +
							"<th>We Will Ship</th>" +
							"<th>In Stock</th>" +
							
							"<th>Price</th>" +
							"<th>UPC</th>" +
							"<th>Shipping From</th>" +
						"</tr>";
						
			var itemsList = this.createAndSortItemsList(record, lineItemCount);
			
			
			for (var i = 0; i < itemsList.length; i++) {
			    var id = itemsList[i].id;			
				var itemName = itemsList[i].name;
				var itemDescription = itemsList[i].description;
				var quantity = itemsList[i].quantity;
				
				
				var price = itemsList[i].price;
				var locationText = itemsList[i].locationText;
				var upc = "";
				var shipDate = "";
				
				if (itemsList[i].shipDate) {
					shipDate = itemsList[i].shipDate;
				}
				
				if (itemsList[i].upc) {
					upc = itemsList[i].upc;
				}
			
				
				//pull item fields needed 
				var fields = ['custitem_invfeednumber', 'custitem_specificsubcomponent', 'quantityonorder', 'custitem_nextrcptdate'];
				var columns = nlapiLookupField('item', id, fields);
				var inv_feed_num = columns.custitem_invfeednumber;
				var item_qty_onroder = columns.quantityonorder;
				var nextrcptdate = 'Back in stock approx.<br>' + columns.custitem_nextrcptdate;
				var	specificsubcomponent = columns.custitem_specificsubcomponent; 				
							
				//nlapiLogExecution('DEBUG', ' specificsubcomponentV1',  Number(specificsubcomponent));
				
				var specificsubcomponent_rec_date = '';
				var specificsubcomponent_onorder = 0;
				
				
				try{
				if(specificsubcomponent){	
					
				nlapiLogExecution('DEBUG', ' sub value2',  Number(specificsubcomponent));
							
				var specificSubFields = nlapiLookupField('item', Number(specificsubcomponent), ['custitem_nextrcptdate', 'quantityonorder']); 
				if(specificSubFields.custitem_nextrcptdate){
				specificsubcomponent_rec_date = nlapiStringToDate(specificSubFields.custitem_nextrcptdate);
		
				specificsubcomponent_rec_date = nlapiAddDays(specificsubcomponent_rec_date, 5);
				specificsubcomponent_rec_date = nlapiDateToString(specificsubcomponent_rec_date);
				}
				specificsubcomponent_rec_date = 'Back in stock approx. <br>' +  specificsubcomponent_rec_date;
				specificsubcomponent_onorder = specificSubFields.quantityonorder;
				
				}
				
				}
				catch ( e )
				{
			   		if ( e instanceof nlobjError )
				    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				   	else
				   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
				} 
			
				
			//	var specificsubcomponent_rec_date = nlapiLookupField('item', Number(specificsubcomponent), 'custitem_nextrcptdate');				
			//	var specificsubcomponent_onorder = nlapiLookupField('item', Number(specificsubcomponent), 'quantityonorder');
				
				nlapiLogExecution('DEBUG', ' specificsubcomponent',  specificsubcomponent_rec_date + ' - ' + specificsubcomponent_onorder);
				
				var committed_to_ship = "0";
				var next_in_stock_date = "";
				
				nlapiLogExecution('DEBUG', 'itemName', "itemName" + itemName); 
		//		nlapiLogExecution('DEBUG', 'Values', inv_feed_num + ' - ' + specificsubcomponent + ' - ' +  specificsubcomponent_rec_date + ' - ' + nextrcptdate);
				//case statements
				if(inv_feed_num == null || inv_feed_num == 0){
					
					nlapiLogExecution('DEBUG', 'inv_feed_num', "inv_feed_num should be 0 or null" + inv_feed_num);
									
						if (specificsubcomponent == 0){
							
							nlapiLogExecution('DEBUG', 'inv_feed_num - specificsubcomponent', "specificsubcomponent should be null");
							next_in_stock_date = nextrcptdate;                    
							
						}
						else{
							
							nlapiLogExecution('DEBUG', 'inv_feed_num - specificsubcomponent', "specificsubcomponent is not null");
							next_in_stock_date = specificsubcomponent_rec_date;
							
						}				
				}
				// case statments
				else if(inv_feed_num - quantity >= 0){					
		
					nlapiLogExecution('DEBUG', 'inv_feed_num V2', " should be less than or equal to 0 - "  + (inv_feed_num - quantity));
					committed_to_ship = quantity + " on </br> " +  shipDate;
									
				}
				
				
				else {
					
					nlapiLogExecution('DEBUG', 'inv_feed_num V3', " should be greater than 0 "  + (inv_feed_num - quantity));
					
					committed_to_ship = (parseInt(quantity) + parseInt((inv_feed_num - quantity))) + " on </br> " +  shipDate;
					
						if(specificsubcomponent == 0){
							nlapiLogExecution('DEBUG', 'inv_feed_num - specificsubcomponent V3', "specificsubcomponent should be null");
							next_in_stock_date =  nextrcptdate;							
						}
						else if(item_qty_onroder > 0){
							nlapiLogExecution('DEBUG', 'item_qty_onroder > 0 V3', "item_qty_onroder should be greater than 0 " + item_qty_onroder);
							next_in_stock_date = nextrcptdate;
							
						}
						else if(item_qty_onroder == null || item_qty_onroder == 0 && specificsubcomponent_onorder > 0){
							nlapiLogExecution('DEBUG', 'inv_feed_num - item_qty_onroder V3', "item_qty_onroder should be 0 " + item_qty_onroder);
							next_in_stock_date = specificsubcomponent_rec_date;
							
						}	
						else{
							
							next_in_stock_date = "";
						}
					
				  } 			
			
//error occurs after here				
				body += "<tr>" +
				"<td><img src='" + itemDetails[id].thumbnail + "' alt='No Image'></td>" + 

				"<td>" + itemName + "</td>" +

				"<td>" + itemDescription + "</td>" +

				"<td>" + quantity + "</td>" +
 
				"<td>" +  committed_to_ship + "</td>" +						
				
				"<td>" + next_in_stock_date + "</td>" +

				"<td>$" + price + "</td>" +
				
				"<td>" + upc + "</td>" +

				"<td>" + locationText + "</td>"  +

				"</tr>" ;
			}		
			
			body += "</table>" +
			"</body>" +
			"</html>";
			return body;
		},
		
		createAndSortItemsList: function(record, lineItemCount) {
			var itemsList = [];
			
			for (var i = 1; i <= lineItemCount; i++) {
				var id = record.getLineItemValue('item', 'item', i);
				var itemName = record.getLineItemValue('item', 'item_display', i);
				var itemDescription = record.getLineItemValue('item', 'description', i);
				var quantity = record.getLineItemValue('item', 'quantity', i);
				var price = record.getLineItemValue('item', 'rate', i);
				var locationText = record.getLineItemText('item', 'location', i);
				var upc = "";
				var shipDate = "";
				
				if (record.getLineItemValue('item', 'expectedshipdate', i)) {
					shipDate = record.getLineItemValue('item', 'expectedshipdate', i);
				}
				
				if (record.getLineItemValue('item', 'custcol_upccode', i)) {
					upc = record.getLineItemValue('item', 'custcol_upccode', i);
				}
				
				var item = {};
				item.id = id;
				item.name = itemName;
				item.description = itemDescription;
				item.quantity = quantity;
				item.price = price;
				item.locationText = locationText;
				item.upc = upc;
				item.shipDate = shipDate;
				item.lineId = i;
				
				itemsList.push(item);
				
			}
			
			itemsList.sort(function(a, b) {
				if (a.locationText > b.locationText) {
					return 1;
				}
				if (a.locationText < b.locationText) {
					return -1;
				}
				if (a.locationText === b.locationText) {
					if (a.lineId > b.lineId) {
						return 1;
					}
					if (a.lineId < b.lineId) {
						return -1;
					}
				}
			});
			
			return itemsList;
		}
		
    };
})();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function UserEventClassUserEventBeforeLoad(type, form, request) {
    return UserEventClass.userEventBeforeLoad(type, form, request);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function UserEventClassUserEventBeforeSubmit(type) {
    return UserEventClass.userEventBeforeSubmit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function UserEventClassUserEventAfterSubmit(type) {
    return UserEventClass.userEventAfterSubmit(type);
}