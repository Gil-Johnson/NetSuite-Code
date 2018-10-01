
var constants = {
    columns : {
        internal_id  : 'internalid',
        print_list : 'custrecord_custom_ppt_print_list',
        script_status : 'custrecord_custom_ppt_script_status',
        sales_order_not_processed : 'custrecord_custom_ppt_salesorder_errorid',
        pdf_download_link : 'custrecord_custom_ppt_pdf_download_link',
        email_address : 'custrecord_custom_ppt_email_address'
    },

    script_status : {

        pending : 'pending',
        complete : 'complete',
        error : 'error'
    },

    api_response_codes : {

        success : '200'
    },

    custom_record : 'customrecord_custom_ppt_schedule',
    scheduled_script : 'customscript_custom_ppt_scheduled',
    scheduled_script_deployment : 'customdeploy_custom_ppt_scheduled',
    purchase_order_template : 'SuiteScripts/CustomPrintPickingTicket/assets/templates/purchase_order/main.html',
    purchase_order_body_template : 'SuiteScripts/CustomPrintPickingTicket/assets/templates/purchase_order/_body.html',
    output_folder_id : 1389947,
    server_url : 'http://support.sparowatch.com/rico_vendor_html_files_handler/VendorHtmlFilesProcessorCommand.php?methodToCall=getOrderData&orderId=',
    pdf_download_link : 'SuiteScripts/CustomPrintPickingTicket/output_files/',
    base_url : 'https://system.netsuite.com'
};

var ship_code_map = {};

ship_code_map["UNSP_SE"] = 			"2nd day (carrier not specified)";
ship_code_map["AITW_G2"] =           "AIT Worldwide Logistics - Basic Service";
ship_code_map["AITW_09"] =           "AIT Worldwide Logistics - Delivery and Install";
ship_code_map["AITW_R1"] =           "AIT Worldwide Logistics - Room Choice";
ship_code_map["AITW_R2"] =           "AIT Worldwide Logistics - Room Choice; Unpack";
ship_code_map["AITW_DS"] =           "AIT Worldwide Logistics - Threshold Service";
ship_code_map["CEVA_G2"] =           "CEVA Logistics - Basic Service";
ship_code_map["CEVA_09"] =           "CEVA Logistics - Delivery and Install";
ship_code_map["CEVA_R2"] =           "CEVA Logistics - Room Choice; Unpack";
ship_code_map["CEVA_R1"] =           "CEVA Logistics - Room of Choice";
ship_code_map["CEVA_DS"] =           "CEVA Logistics - Threshold Service";
ship_code_map["FDE_SD"] =            "FedEx (unspecified); Saturday";
ship_code_map["FDE_SC"] =            "FedEx 2Day";
ship_code_map["FDEG_SE"] =           "FedEx 2Day";
ship_code_map["FEDX_SE"] =           "FedEx 2Day";
ship_code_map["FX2D"] =              "FedEx 2Day";
ship_code_map["FEDX_3D"] =           "FedEx Express Saver";
ship_code_map["FDEG" ] =             "FedEx Ground";
ship_code_map["FDEG_CG"] =           "FedEx Ground";
ship_code_map["FDXG"] =              "FedEx Ground";
ship_code_map["FEDEXG"] =            "FedEx Ground";
ship_code_map["FEDX_CG"] =           "FedEx Ground";
ship_code_map["FEDH"] =              "FedEx Home Delivery";
ship_code_map["FEDX_09"] =           "FedEx Home Delivery";
ship_code_map["FDEG_ND"] =           "FedEx Next Day (Standard)";
ship_code_map["FDEX"] =              "FedEx Next Day (Standard)";
ship_code_map["FEDX_ND"] =           "FedEx Next Day (Standard)";
ship_code_map["FXND"] =              "FedEx Next Day (Standard)";
ship_code_map["FEDX_NM"] =           "FedEx Priority Overnight";
ship_code_map["FXSP"] =              "FedEx SmartPost";
ship_code_map["UNSP_CG"] =           "Ground (carrier not specified)";
ship_code_map["GFXP_DS"] =           "Ground Freight Expeditors - Threshold Service";
ship_code_map["BEKN_G2"] =           "Home Direct USA - Basic Service";
ship_code_map["BEKN_09"] =           "Home Direct USA - Premium (White Glove)";
ship_code_map["BEKN_R1"] =           "Home Direct USA - Room Choice";
ship_code_map["BEKN_R2"] =           "Home Direct USA - Room Choice; Unpack";
ship_code_map["BEKN_DS"] =           "Home Direct USA - Threshold Service";
ship_code_map["LTL_G2"] =            "LTL Basic Service";
ship_code_map["LTL_R2"] =            "LTL Room Choice; Unpack";
ship_code_map["LTL_R1"] =            "LTL Room of Choice";
ship_code_map["LTL_DS"] =            "LTL Threshold Service";
ship_code_map["LTL_09"] =            "LTL White Glove";
ship_code_map["MWDP_GP"] =           "Metropolitan Warehouse & Delivery - Plus";
ship_code_map["MWDP_R1"] =           "Metropolitan Warehouse & Delivery - Room Choice";
ship_code_map["MWDP_DS"] =           "Metropolitan Warehouse & Delivery - Threshold";
ship_code_map["MWDP_09"] =           "Metropolitan Warehouse & Delivery - White Glove";
ship_code_map["ODFL_G2"] =           "Old Dominion - Basic Service";
ship_code_map["ODFL_DS"] =           "Old Dominion - Threshold Service";
ship_code_map["UNSP_ND"] =           "Overnight (carrier not specified)";
ship_code_map["PITD_G2"] =           "PITT Ohio - Basic Service";
ship_code_map["PITD_DS"] =           "PITT Ohio - Threshold Service";
ship_code_map["SUND_09"] =           "Sun Delivery; Inc. - Delivery and Install";
ship_code_map["SUND_R2"] =           "Sun Delivery; Inc. - Room of Choice; Unpack";
ship_code_map["TMP"] =               "Tempurpedic - private carrier";
ship_code_map["UNSP_SC"] =           "Unspecified - 2nd Day; Economy";
ship_code_map["UNSP_PM"] =           "Unspecified - Next Afternoon";
ship_code_map["UNSP_3D"] =           "Unspecified - Third Day";
ship_code_map["UPS"] =               "UPS (service level unspecified)";
ship_code_map["UPSN"] =              "UPS (service level unspecified)";
ship_code_map["UB"] =                "UPS 2nd Day Air";
ship_code_map["UPSN_SC"] =           "UPS 2nd Day Air";
ship_code_map["UPSN_SE"] =           "UPS 2nd Day Air";
ship_code_map["UPS3"] =              "UPS 3 Day Select";
ship_code_map["UPSN_3D"] =           "UPS 3 Day Select";
ship_code_map["UG"] =                "UPS Ground";
ship_code_map["UPSG"] =              "UPS Ground";
ship_code_map["UPSN_CG"] =           "UPS Ground";
ship_code_map["UPND"] =              "UPS Next Day Air";
ship_code_map["UPS1"] =              "UPS Next Day Air";
ship_code_map["UPSN_ND"] =           "UPS Next Day Air";
ship_code_map["UPSN_NM"] =           "UPS Next Day Air";
ship_code_map["UR"] =                "UPS Next Day Air";
ship_code_map["UPSN_SD"] =           "UPS Next Day Air Saturday";
ship_code_map["UPSN_PM"] =           "UPS Next Day Air Saver";
ship_code_map["USPS"] =              "USPS (service level unspecified)";
ship_code_map["USPS_CG"] =           "USPS (service level unspecified)";
ship_code_map["USPSB_FC"] =           "USPS (service level unspecified)";
ship_code_map["USPSB_FC"] =           "USPS First Class Mail";
ship_code_map["USPS_PB"] =           "USPS Priority Mail";
ship_code_map["WTVA_09"] =           "Wilson Trucking -  Delivery and Install";
ship_code_map["WTVA_G2"] =           "Wilson Trucking - Basic Service";
ship_code_map["WTVA_DS"] =           "Wilson Trucking - Threshold Service";
ship_code_map["RDWY_G2"] =           "YRC - Basic Service";
ship_code_map["RDWY_GP"] =           "YRC - Deliver; Install; Haul Away";
ship_code_map["RDWY_09"] =           "YRC - Delivery and Install";
ship_code_map["RDWY_R1"] = 			"YRC - Room of Choice";
ship_code_map["RDWY_DS"] =           "YRC - Threshold Service";
ship_code_map["ZEFL_G2"] =           "Zenith Global Logistics - Basic";
ship_code_map["ZEFL_09"] =           "Zenith Global Logistics - Deliver; Install";
ship_code_map["ZEFL_R1"] =           "Zenith Global Logistics - Room of Choice";
ship_code_map["ZEFL_DS"] =           "Zenith Global Logistics - Threshold";
ship_code_map["ZEFL_GP"] =           "Zenith Global Logistics -Deliver;Install;Haul away";
ship_code_map["backorder_cancel"] = 					"Backorder Cancellation";
ship_code_map["bad_address"] =                       "Bad Address";
ship_code_map["bad_sku"] =                           "Bad SKU";
ship_code_map["merchant_request"] =                  "Cancelled at Merchant's Request";
ship_code_map["fulfill_time_expired"] =              "Cannot fulfill the order in time";
ship_code_map["cannot_meet_all_reqs"] =              "Cannot Ship as Ordered";
ship_code_map["cannot_shipto_POBOX"] =               "Cannot ship to PO Box";
ship_code_map["cannot_ship_USPS"] =                  "Cannot ship USPS";
ship_code_map["customer_request"] =                  "Customer Changed Mind";
ship_code_map["deleted_order"] =                     "Deleted Order";
ship_code_map["invalid_item_cost"] =                 "Invalid Item Cost";
ship_code_map["invalid_ship_method"] =               "Invalid method of shipment";
ship_code_map["merchant_detected_fraud"] =           "Merchant detected fraud";
ship_code_map["other"] =                             "Other";
ship_code_map["out_of_stock"] =                      "Out of Stock";
ship_code_map["SP"] =                                "Arrived too late";
ship_code_map["SD"] =                                "Changed My Mind";
ship_code_map["CO"] =                                "Customer Ordering Error";
ship_code_map["DA"] =                                "Damaged";
ship_code_map["DM"] =                                "Defective";
ship_code_map["EO"] =                                "Mispick";
ship_code_map["LP"] =                                "Other";
ship_code_map["NA"] =                                "Product Not As Expected";
ship_code_map["MD"] =                                "Refused";
ship_code_map["SM"] =                                "Shipped to Wrong Address";
ship_code_map["TE"] =                                "Undeliverable";
ship_code_map["BC"] =                                "Unwanted goods from canceled order";
ship_code_map["DP"] =                                "Unwanted goods from duplicate order";
ship_code_map["PE"] =                                "Unwanted goods from duplicate shipment";
ship_code_map["WG"] =                                "Wrong Item Ordered";
ship_code_map["DI"] =                                "Wrong item ordered because of catalog misprint";
ship_code_map["SR"] =                                "Wrong Quantity Ordered";
ship_code_map["DT"] =                                "Wrong Size Ordered";
ship_code_map["USD"] =                               "US Dollar";

function scheduled(type) {

    F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // start','');

    var startTime = (new Date()).getTime();
    var minutesAfterReschedule = 50;
    var usageLimit = 200;

    var filters = [];
    var columns = [];
    columns.push((new nlobjSearchColumn(constants.columns.internal_id)).setSort(true));
    columns.push(new nlobjSearchColumn(constants.columns.print_list));
    columns.push(new nlobjSearchColumn(constants.columns.script_status));
    columns.push(new nlobjSearchColumn(constants.columns.email_address));
    filters.push(new nlobjSearchFilter(constants.columns.script_status, null, 'is', 'pending'));

    var rec = nlapiSearchRecord(constants.custom_record, null, filters, columns);

    F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // recs: ', JSON.stringify(rec));

    if (!isBlankOrNull(rec)) {

        var mainPurchaseOrderHtmlFile = nlapiLoadFile(constants.purchase_order_template);
        var mainPurchaseOrderHtmlFileContents = mainPurchaseOrderHtmlFile.getValue();

        for(var i=0;i<rec.length;i++) {

            var printList = rec[i].getValue(constants.columns.print_list);
            var internalId = rec[i].getValue(constants.columns.internal_id);
            var emailId = rec[i].getValue(constants.columns.email_address);
            F3.Util.Utility.logDebug('email address ', emailId);
            var pdfFileName = "sales_order_" + internalId + ".pdf";

            var salesOrderPrintList = JSON.parse(printList);

            F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // print ids: ', JSON.stringify(salesOrderPrintList));

            var htmlContents = '';
            var salesOrderErrorList = new Array();
            var salesPurchaseOrderErrorList = new Array();
            var isFileFounded = false;

            for (var j = 0; j < salesOrderPrintList.length; j++) {

                //Get the sales order record
                var salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderPrintList[j]);
                var poNumber = salesOrderRecord.getFieldValue("otherrefnum");
                var salesOrderNumber = salesOrderRecord.getFieldValue("tranid");

                var url = constants.server_url + poNumber;

                nlapiLogExecution('DEBUG', 'Getting File For Sales Order', salesOrderPrintList[j]);

                //Call to server with sales order file name
                var response = nlapiRequestURL(url);
                var responseResult = response.getBody();
                var jsonResult = JSON.parse(responseResult);

                if(jsonResult.code == constants.api_response_codes.success) {

                    var data = JSON.parse(jsonResult.data);

                    nlapiLogExecution('DEBUG', 'Getting data For Sales Order', jsonResult.data);

                    //Load html template
                    var htmlFile = nlapiLoadFile(constants.purchase_order_body_template);
                    var htmlFileContents = htmlFile.getValue();

                    //Replace the tags in the current html file
                    var stNumber = data.sTStoreNumber;
                    stNumber = stNumber.replace("-",'');

                    nlapiLogExecution('DEBUG', 'Barcode with -', data.sTStoreNumber);
                    nlapiLogExecution('DEBUG', 'Barcode without -', stNumber);

                    htmlFileContents = htmlFileContents.replace('[BAR_CODE_ID]', stNumber);
                    htmlFileContents = htmlFileContents.replace('[BAR_CODE_NUMBER]', data.sTStoreNumber);

                    var shipToAddress = getShipToAddress(salesOrderRecord);
                    nlapiLogExecution('DEBUG', 'shipToAddress', shipToAddress);

                    var billTo = '';

                    if(!!data.billTo) {
                        billTo = data.billTo.replace(/\|/g, '<br />');
                    }

                    nlapiLogExecution('DEBUG', 'billTo', billTo);

                    htmlFileContents = htmlFileContents.replace('[SHIP_TO]', shipToAddress);
                    htmlFileContents = htmlFileContents.replace('[ORDER_NUMBER]', data.pONumber);
                    htmlFileContents = htmlFileContents.replace('[BILL_TO]', billTo);
                    htmlFileContents = htmlFileContents.replace('[RA]', data.pONumber);
                    htmlFileContents = htmlFileContents.replace('[RECEIPT_ID]', data.sTStoreNumber);
                    htmlFileContents = htmlFileContents.replace('[ORDER_DATE]', data.pODate);

                    //Handle line item logic

                    var tempTableRows = '';

                    var tableRowTemplate = '<tr>' +
                        '<td style="height:58px;">[SKU_NUMBER]</td>' +
                        '<td>[UPC_NUMBER]</td>' +
                        '<td><p style="width:80%;">[DESCRIPTION]</p></td>' +
                        '<td style="text-align:center;">[QUANTITY_ORDERED]</td>' +
                        '<td style="text-align:center;">[QUANTITY_SENT]</td>' +
                        '<td style="text-align:right;">[UNIT_PRICE] &nbsp;&nbsp;&nbsp; [UNIT_PRICE_MEASURE]</td> ' +
                        '<td style="border-left:2px solid #000;">[RETURN_QUANTITY]</td>' +
                        '<td style="border-left:2px solid #000;">[RETURN_CODE]</td>' +
                        '</tr>';

                    for(var k=0;k<data.items.length;k++) {

                        var itemRow = tableRowTemplate;

                        var lineItemData = data.items[k];

                        var vendorNumber = lineItemData.vendorNumber;
                        var quantitySent = getSalesOrderLineItemCommittedQuantity(salesOrderRecord,vendorNumber.trim());
                        var skuNo = getSalesOrderLineItemSku(salesOrderRecord,k);
                        var description = lineItemData.description;
                        description = description.replace('&','and');

                        itemRow = itemRow.replace('[SKU_NUMBER]',skuNo);
                        itemRow = itemRow.replace('[UPC_NUMBER]',lineItemData.uPCNumber);
                        itemRow = itemRow.replace('[DESCRIPTION]',description);
                        itemRow = itemRow.replace('[QUANTITY_ORDERED]',lineItemData.quantity);
                        itemRow = itemRow.replace('[QUANTITY_SENT]',lineItemData.quantity);
                        //itemRow = itemRow.replace('[QUANTITY_SENT]',quantitySent);
                        itemRow = itemRow.replace('[UNIT_PRICE]',lineItemData.retailPrice);
                        itemRow = itemRow.replace('[UNIT_PRICE_MEASURE]',lineItemData.unitMeasure);
                        itemRow = itemRow.replace('[RETURN_QUANTITY]',lineItemData.returnQty);
                        itemRow = itemRow.replace('[RETURN_CODE]',lineItemData.returnCode);

                        tempTableRows += itemRow;
                    }

                    nlapiLogExecution('DEBUG', 'HTML tempTableRows',tempTableRows);

                    htmlFileContents = htmlFileContents.replace('[LINE_ITEMS]',tempTableRows);

                    //zz notes
                    htmlFileContents = htmlFileContents.replace('[TRANSACTION_DISCOUNT]',data.zZNotes[0]);
                    htmlFileContents = htmlFileContents.replace('[T1_DETAILS]',data.zZNotes[1]);

                    var shippingDesc = '';

                    if (ship_code_map.hasOwnProperty(data.routing)) {
                        shippingDesc = ship_code_map[data.routing];
                    } else {
                        shippingDesc = data.routing;
                    }
                    nlapiLogExecution('DEBUG', 'shippingDesc',shippingDesc);

                    htmlFileContents = htmlFileContents.replace('[SHIPPING_METHOD]',shippingDesc);

                    htmlFileContents = htmlFileContents.replace('[PAYMENT_TYPE]', data.pQPayeeIdentification);

                    //Append Sale Order Details
                    var salesOrderLineItemsHtml = getSalesOrderLineItemsHtml(salesOrderRecord);
                    htmlFileContents = htmlFileContents.replace('[SALES_ORDER_LINE_ITEMS]', salesOrderLineItemsHtml);
                    htmlFileContents = htmlFileContents.replace('[SALES_ORDER_ID]', salesOrderPrintList[j]);

                    htmlContents += htmlFileContents;

                    isFileFounded = true;

                    // Mark the Print Picking Ticket to True
                    //var file = nlapiPrintRecord('PICKINGTICKET', salesOrderPrintList[j], 'DEFAULT', null);
                    //nlapiLogExecution('DEBUG', 'Picking Ticket Status', file);

                    salesOrderRecord.setFieldValue('custbody_dropship_pt_printed','T');
                    nlapiSubmitRecord(salesOrderRecord);

                } else {

                    nlapiLogExecution('DEBUG', 'Error SalesOrder Id', salesOrderPrintList[j]);

                    //If file not found for the sales order id
                    salesOrderErrorList.push(salesOrderPrintList[j]);

                    //Insert the sales order against which there is not html file founded
                    salesPurchaseOrderErrorList.push({'salesOrderNumber':salesOrderNumber,'purchaseOrderNumber':poNumber});
                }
            }


            if(isFileFounded) {

                //Insert the body template in the main template
                mainPurchaseOrderHtmlFileContents = mainPurchaseOrderHtmlFileContents.replace('[BODY_TEMPLATE]',htmlContents);

                if(createPdf(internalId, pdfFileName,mainPurchaseOrderHtmlFileContents)) {

                    var downloadLink = constants.pdf_download_link + pdfFileName;
                    var file = nlapiLoadFile(downloadLink);
                    var downloadUrl = file.getURL();

                    updateCustomPPTScheduleRecord(internalId, constants.script_status.complete,downloadUrl,salesOrderErrorList);
                    sendEmail(emailId,downloadUrl);

                    if(salesPurchaseOrderErrorList.length > 0) {
                        sendEmailForErrorList(emailId, salesPurchaseOrderErrorList);
                    }
                }

            }  else {
                updateCustomPPTScheduleRecord(internalId, constants.script_status.error,'',salesOrderErrorList);
                sendEmailForErrorList(emailId,salesPurchaseOrderErrorList);
            }
        }
    }

    F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled(); // end','');
}

function getSalesOrderLineItemsHtml(salesOrderRecord) {

    var tableRowsTemplate = '';
    var rowTemplate = '<tr>'+
    '<td>[ITEM_NUMBER]</td>' +
    '<td><p>[DESCRIPTION]</p></td>' +
    '<td>[BIN_LOC]</td>' +
    '<td style="text-align:center;">[QTY]</td>' +
    '</tr>';

    var lineItemCount = salesOrderRecord.getLineItemCount('item');

    for (var index = 1; index <= lineItemCount; index++) {

        var itemRow = rowTemplate;

        var itemName = salesOrderRecord.getLineItemValue('item', 'item_display', index);
        var description = salesOrderRecord.getLineItemValue('item', 'description', index);
        var binLoc = salesOrderRecord.getLineItemValue('item', 'custcol_bin', index);
        var quantity = salesOrderRecord.getLineItemValue('item', 'quantity', index);

        if(isBlankOrNull(binLoc))
            binLoc= '';

        itemRow = itemRow.replace('[ITEM_NUMBER]',itemName);
        itemRow = itemRow.replace('[DESCRIPTION]',description);
        itemRow = itemRow.replace('[BIN_LOC]',binLoc);
        itemRow = itemRow.replace('[QTY]',quantity);

        tableRowsTemplate  += itemRow;
    }

    return tableRowsTemplate;
}

/**
 * Description of method getShipToAddress
 * @param salesOrderRecord
 */
function getShipToAddress(salesOrderRecord) {

    try {

        var completeAddress = '';

        var attention = salesOrderRecord.getFieldValue("shipattention");
        completeAddress += isBlankOrNull(attention) ? '' : attention + ",";

        var addressee = salesOrderRecord.getFieldValue("shipaddressee");
        completeAddress += isBlankOrNull(addressee) ? '' : addressee + ",<br />";

        var address1 = salesOrderRecord.getFieldValue("shipaddr1");
        completeAddress += isBlankOrNull(address1) ? '' : address1 + ",<br />";

        var address2 = salesOrderRecord.getFieldValue("shipaddr2");
        completeAddress += isBlankOrNull(address2) ? '' : address2 + ",<br />";

        var address3 = salesOrderRecord.getFieldValue("shipaddr3");
        completeAddress += isBlankOrNull(address3) ? '' : address3 + ",<br />";

        var shipCity = salesOrderRecord.getFieldValue("shipcity");
        completeAddress += isBlankOrNull(shipCity) ? '' : shipCity + ",";

        var shipState = salesOrderRecord.getFieldValue("shipstate");
        completeAddress += isBlankOrNull(shipState) ? '' : shipState + ",";

        var shipZip = salesOrderRecord.getFieldValue("shipzip");
        completeAddress += isBlankOrNull(shipZip) ? '' : shipZip + ",";

        var shipPhone = salesOrderRecord.getFieldValue("shipphone");
        completeAddress += isBlankOrNull(shipPhone) ? '' : shipPhone + ",";

        var shipCountry = salesOrderRecord.getFieldValue("shipcountry");
        completeAddress += isBlankOrNull(shipCountry) ? '' : shipCountry;

        F3.Util.Utility.logDebug('completeAddress',completeAddress);

        return completeAddress;

    } catch (e) {
        F3.Util.Utility.logException('error in func getDateTime',ex.toString());
        return "";
    }
}

function getSalesOrderLineItemCommittedQuantity(salesOrderRecord,vendorNumber) {

    try {

        //Load sales order
       // var salesOrderRecord = nlapiLoadRecord('salesorder', salesOrderId);

        var lineItemCount = salesOrderRecord.getLineItemCount('item');

        for (var index = 1; index <= lineItemCount; index++) {
            var itemName = salesOrderRecord.getLineItemValue('item', 'item_display', index);

            if (itemName == vendorNumber) {
                var committedQuantity = salesOrderRecord.getLineItemValue('item', 'quantitycommitted', index);

                if (isBlankOrNull(committedQuantity))
                    return "";
                else
                    return committedQuantity;
            }
        }

    } catch (ex) {
        F3.Util.Utility.logException('error in func getDateTime',ex.toString());
        return "";
    }
}

function getSalesOrderLineItemSku(salesOrderRecord,index) {

    try {

        var skuNumber = '';

        var lineItemCount = salesOrderRecord.getLineItemCount('item');

        if(lineItemCount > 0) {
            skuNumber = salesOrderRecord.getLineItemValue('item', 'custcol_custsku', (index + 1));

            if(isBlankOrNull(skuNumber)) {
                skuNumber = '';
            }
        }

        return skuNumber;

    } catch (ex) {
        F3.Util.Utility.logException('error in func getDateTime',ex.toString());
        return "";
    }
}

function createPdf(internalId,pdfFileName,htmlContents) {

    try {

        //Make Pdf
        var pdfFile = nlapiXMLToPDF((htmlContents));

        F3.Util.Utility.logDebug('f3_ppt_scheduled.scheduled()', 'convertingxml to pdf');

        pdfFile.setFolder(constants.output_folder_id);
        pdfFile.setName(pdfFileName);

        var fileId = nlapiSubmitFile(pdfFile);

        return fileId;

    } catch (ex) {
        F3.Util.Utility.logException('error in func create Pdf for id > ' + internalId,ex.toString());
        var arr = [];
        updateCustomPPTScheduleRecord(internalId,constants.script_status.error,'',arr);
        return "";
    }
}

/**
 * Update 'PPT Schedule' custom record at the time of rescheduling
 * @param id
 * @param cancelList
 */
function updateCustomPPTScheduleRecord(id, scriptStatus,downloadUrl,salesOrderErrorList) {

    nlapiLogExecution('DEBUG', 'salesOrderErrorList', salesOrderErrorList);

    var rec = nlapiLoadRecord(constants.custom_record, id);

    if(salesOrderErrorList.length > 0) {
        rec.setFieldValue(constants.columns.sales_order_not_processed, JSON.stringify(salesOrderErrorList));
    }

    if(scriptStatus == constants.script_status.complete) {
        rec.setFieldValue(constants.columns.pdf_download_link, downloadUrl);
    }

    rec.setFieldValue(constants.columns.script_status, scriptStatus);

    nlapiSubmitRecord(rec, true);
}

function sendEmail(emailId,downloadUrl) {

    try {

        // SEND SUCCESS EMAIL:
        // ------------------

        nlapiLogExecution('DEBUG', 'sendEmail', emailId);

        if (!!emailId ) {

            //var ctxt = nlapiGetContext();
            emailId = emailId.trim();
            var completeDownloadUrl = constants.base_url + downloadUrl;
            var body = "Your request to generate pdf for the sales orders has been completed. To download your pdf file please, click on the following link," + completeDownloadUrl;

            //Send email
            nlapiSendEmail(5, emailId, 'Custom Print Picking Ticket Pdf', body);

            nlapiLogExecution('DEBUG', 'sendEmail', 'email sent');
        }
    } catch (e) {
        F3.Util.Utility.logException('Error in getting email', e.toString());
    }
}

function sendEmailForErrorList(emailId,salesPurchaseOrderErrorList) {

    try {

        // SEND SUCCESS EMAIL:
        // ------------------

        nlapiLogExecution('DEBUG', 'sendEmailForErrorList', emailId);

        if (!!emailId ) {

            var tableBody = "<table border='1'> <tr><td>SO Number</td><td>PO Number</td></tr></thead>";
            for (var i = 0; i < salesPurchaseOrderErrorList.length; i++) {

                tableBody += "<tr><td>" + salesPurchaseOrderErrorList[i].salesOrderNumber + "</td><td>"+ salesPurchaseOrderErrorList[i].purchaseOrderNumber +"</td></tr>"
            }

            tableBody += "</table>";

            //var ctxt = nlapiGetContext();
            emailId = emailId.trim();

            var currentDateTime = getDateTime();

            var userFirstName = getUserFirstName(emailId);
            var subject = "Missing Drop Ship HTML Files for " + currentDateTime;
            var emailBody = "Dear "+ userFirstName + ", <br/><br/> HTML files were missing for the following orders: <br/><br/>";
            emailBody += tableBody + "<br/> Picking tickets were not generated.";

            //Send email
            nlapiSendEmail(5, emailId, subject, emailBody);

            nlapiLogExecution('DEBUG', 'sendEmailForErrorList', 'email sent');
        }
    } catch (e) {
        F3.Util.Utility.logException('Error in getting error list email', e.toString());
    }
}

function getUserFirstName(emailId) {

    var filters = [];
    var columns = [];

    columns.push(new nlobjSearchColumn('firstname'));
    filters.push(new nlobjSearchFilter('email', null, 'is', emailId));

    var rec = nlapiSearchRecord('employee', null, filters, columns);

    var firstname = '';

    if(!isBlankOrNull(rec)) {
        firstname = rec[0].getValue('firstname');
    }

    return firstname;
}

function getDateTime()
{
	try
	{
		var dt = new Date();
		var date = dt.getDate();
		var month = dt.getMonth()+1;
		var year = dt.getFullYear();
                var hrs = dt.getHours();
		var min = dt.getMinutes();
		var sec = dt.getSeconds();
		var datestring = month + '/' + date + '/' + year + ' ' + hrs + ':' + min + ':' + sec;
		return new Date(datestring);
	}	
	catch(ex)
	{
        F3.Util.Utility.logException('error in func getDateTime',ex.toString());
	}
}

function isBlankOrNull(str) {
    if (str == undefined || typeof(str) == 'undefined' || str == 'undefined' || str == null || str == '' || str == 'null' || str == '- None -') {
        return true;
    }
    else {
        return false;
    }
}