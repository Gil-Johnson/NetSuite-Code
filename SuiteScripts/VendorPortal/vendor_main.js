/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       27 Mar 2014     Hassan
 *
 */



/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function main(request, response) {
	try {
        if(request.getMethod() == 'POST') {
            //hand over the request to the POST handler
            response.write(JSON.stringify(handlePostRequest(request)));
            return;
        }

        //Handle  the pdf printing method
        if(request.getParameter('method') == "printPdf") {
            handlePrintPdfRequest(request, response);
            return;
        }

		var indexPage = nlapiLoadFile(Constant.File.IndexHtml);
		
		// <!-- css/bootstrap.min.css -->
		var bootstrap_css = nlapiLoadFile(Constant.File.Bootstrap_css);

        response.write(indexPage.getValue().replace("/* #CSS# */", bootstrap_css.getValue() + getJtableCss()));
	}
	catch(e) {
        log(e.name, e.message, Constant.LogLevel.Error);
	}
}

/**
 * Get jtable css after replacing the image URLs
 */
function getJtableCss() {
    var jtable_css = nlapiLoadFile(Constant.File.Jtable_css);
    return jtable_css.getValue().replace("/*CLOSE-BTN*/", Constant.ImageUrl.Close)
        .replace("/*BG-THEAD*/", Constant.ImageUrl.Bg_thead)
        .replace("/*COL-SORTABLE*/", Constant.ImageUrl.Column_sortable)
        .replace("/*COL-DSC*/", Constant.ImageUrl.Column_dsc)
        .replace("/*COL-ASC*/", Constant.ImageUrl.Column_asc)
        .replace("/*DELETE*/", Constant.ImageUrl.Delete)
        .replace("/*EDIT*/", Constant.ImageUrl.Edit)
        .replace("/*LOADING*/", Constant.ImageUrl.Loading);
}

/**
 * POST requests handler
 * @param request => request object
 */
function handlePostRequest(request) {

    var method = request.getParameter('method');
    log("handlePostRequest, method = " + method);
    //Default response (error) of POST request
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest
    };
    try {
        if(!method) {
            //api_method is not set
            //Do nothing and return the default response
        }
        else if(method == "login") {
            var username = request.getParameter('username');
            var password = request.getParameter('password');

            if(!!username && !!password) { //if username & password is not null
                outResponse = login(username, password); //Overwrite the response
            }
        }
        else if(method == "logout") {
            outResponse = logout();
        }
        else {
            if(sessionExists(request)) {
                //TODO: Merge new and accepted purchase order request
                if(method == "getNewPurchaseOrdersList") {
                    return getNewPurchaseOrdersList(getCookie(request, Constant.Cookie.VendorId));
                }
                else if(method == "getAcceptedPurchaseOrdersList") {
                    return getAcceptedPurchaseOrdersList(getCookie(request, Constant.Cookie.VendorId));
                }
                else if (method == "getPurchaseOrderDetail") {
                    return getPurchaseOrderDetail(request.getParameter("orderNumber"));
                }
                else if (method == "acceptPurchaseOrder") {
                    return acceptPurchaseOrder(request.getParameter("orderNumber"));
                }
                else if(method == "requestChanges") {
                    return requestChanges(request.getParameter("shipDate"), request.getParameter("cancelDate"),
                        request.getParameter("itemDetails"), request.getParameter("orderNumber"), request.getParameter("receiveBy"),
                        getCookie(request, Constant.Cookie.VendorId), request.getParameter("comments"));
                }
                else if(method == "getSpecsSheetData") {
                    return getSpecsSheetData(request.getParameter("orderNumber"));
                }
                else if(method == "getProdFilesData") {
                    return getProdFilesData(request.getParameter("orderNumber"), request.getParameter("selectedItems"));
                }
            }
            else {
                log("Logged-in from another location");
                outResponse.message = Constant.Response.ErrorMessages.LoginFromAnotherLocation;
                outResponse.multipleLogin = true;
            }
        }
    }
    catch(e) {
        outResponse.message = Constant.Response.ErrorMessages.UnexpectedError;
        log(e.name, e.message, Constant.LogLevel.Error);
    }

    return outResponse;
}

/**
 * Handles the Print PDF request
 * @param request => request object
 * @param response => response object
 */
function handlePrintPdfRequest(request, response) {
    //Ensure the request is valid before processing
    if(sessionExists(request)) {
        var poInternalId = request.getParameter("orderNumber");
        log("Print PO # " + poInternalId);

        var pdfFile = nlapiPrintRecord('TRANSACTION', poInternalId, 'PDF', null);
        log("PDF created? = " + !!pdfFile);

        response.setContentType(pdfFile.getType(), Constant.PdfFileName.replace("{0}", poInternalId));
        response.write(pdfFile.getValue());
    }
}

/**
 * Mark the Purchase order as accepted
 * @param orderNumber => Purchase order ID
 * @returns {{status: string, message: string}}
 */
function acceptPurchaseOrder(orderNumber) {

    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest
    };

    //First make sure if we have Purchase Order number
    if(!!orderNumber) {
        //Update the purchase order, with a new status
        setPoStatus(orderNumber, Constant.OrderStatus.Acknowledged.Value);

        //Finally send an email to Admin about acceptance of changes
        var poAdmin = nlapiLookupField(Constant.NsRecordType.PurchaseOrder, orderNumber, Constant.NsField.PurchaseOrder.CreatedBy);
        log("PO was createdby ID = " + poAdmin);

        if(!!poAdmin) {
            var adminEmail = nlapiSearchRecord(Constant.NsRecordType.Employee, null,
                new nlobjSearchFilter(Constant.NsField.InternalId, null, "is", poAdmin), new nlobjSearchColumn(Constant.NsField.Employee.Email));

            if(!!adminEmail && adminEmail.length > 0) {
                adminEmail = adminEmail[0].getValue(Constant.NsField.Employee.Email);
                if(!!adminEmail) {
                    var poNum = nlapiLookupField(Constant.NsRecordType.PurchaseOrder, orderNumber, Constant.NsField.PurchaseOrder.PONumber);

                    log("Going to send email", "Email ID = " + adminEmail + ", Subject = " +
                        Constant.EmailTemplate.POAcceptedByVendor.Subject);
                    //Send status email on requested changes
                    nlapiSendEmail(Constant.EmailTemplate.SenderEmpId, adminEmail,
                        Constant.EmailTemplate.POAcceptedByVendor.Subject,
                        Constant.EmailTemplate.POAcceptedByVendor.Body.replace("{0}", poNum || orderNumber));
                    log("Email sent");
                }
            }
        }

        //If it reaches this point, that means the above record is updated!
        outResponse.status = Constant.Response.Status.Ok;
        outResponse.message = null;
    }

    return outResponse;
}

/**
 * Get the details of purchase order
 * @param orderNumber => Purchase order ID
 * @returns {{status: string, message: string, PurchaseOrderDetail: {Records: Array, TotalRecordCount: number}}}
 */
function getPurchaseOrderDetail(orderNumber, requestChanges) {
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest,
        PurchaseOrderDetail: {
            Records: [],
            TotalRecordCount: 0
        }
    };

    //Lets check if we didn't got orderNumber somehow
    if(!!orderNumber) {
        try {
            var purchaseOrderDetail = nlapiLoadRecord(Constant.NsRecordType.PurchaseOrder, orderNumber);

            if(!!purchaseOrderDetail) {
                outResponse.PoNumber = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.PONumber);
                outResponse.Warehouse = purchaseOrderDetail.getFieldText(Constant.NsField.PurchaseOrder.Warehouse);
                outResponse.ShipToAddress = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.ShipToAddress);
                outResponse.ReceiveBy = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.ReceiveBy);
                outResponse.CancelDate = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.CancelDate);
                outResponse.ShipDate = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.ShipDate);
                outResponse.VendorAddress = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.VendorAddress);
                outResponse.OrderStatus = purchaseOrderDetail.getFieldText(Constant.NsField.PurchaseOrder.VendorOrderStatus);
                outResponse.ShippingInstructions = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.ShippingInstruction);

                //Check if the order is in-transit
                outResponse.IsAcceptedOrder = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder
                    .VendorOrderStatus) == Constant.OrderStatus.InTransit.Value;
                outResponse.Date = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.Date);

                var itemIds = [];
                for(var i = 1; i <= purchaseOrderDetail.getLineItemCount(Constant.NsLineItem.Item); i++ ) {
                    log("isClosed = " + purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.IsClosed, i));
                    if(purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.IsClosed, i) == Constant.NsValue.False &&
                        purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.QuantityReceived, i) <
                        purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Quantity, i)) {

                        itemIds.push(purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i));

                        outResponse.PurchaseOrderDetail.Records.push({
                            Id: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.Id, i),
                            Item: purchaseOrderDetail.getLineItemText(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i),
                            ItemId: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i),
                            Quantity: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Quantity, i),
                            Received: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.QuantityReceived, i),
                            Billed: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.QuantityBilled, i),
                            Description: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Description, i),
                            Rate: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Rate, i),
                            ExpectedReceiptDate: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.ExpectedReceiptDate, i),
                            UpcCode: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Upc, i),
                            Sku: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Sku, i),
                            RetailPrice: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.RetailPrice, i)
                        });
                    }
                }


                log("Going to get images, itemIDs on detail", JSON.stringify(itemIds));
                //Get thumbnail images of all item
                var images = [];
                if(itemIds.length > 0)
                    images = nlapiSearchRecord("item", null, new nlobjSearchFilter("internalid", null, "anyof", itemIds),
                        new nlobjSearchColumn(Constant.NsField.Item.ThumbnailImage));

                log("item found with images count = " + images.length);

                for (var i=0; i<outResponse.PurchaseOrderDetail.Records.length; i++) {


                    //TODO: Implement some better solution instead of nested looping
                    images.forEach(function(img) {
                        //log("poDetail ID = " + outResponse.PurchaseOrderDetail.Records[i].ItemId, "image ID = " + img.getId());

                        if(img.getId() == outResponse.PurchaseOrderDetail.Records[i].ItemId) {
                            //log("Image URL successfully set", img.getValue(Constant.NsField.Item.ThumbnailImage));
                            outResponse.PurchaseOrderDetail.Records[i].Thumbnail = !!img.getValue(Constant.NsField.Item.ThumbnailImage) ? img.getValue(Constant.NsField.Item.ThumbnailImage) : Constant.ImageUrl.NoImageFound;
                        }
                    });
                }

                if(!!requestChanges) {

                    var poAdmin = nlapiLookupField(Constant.NsRecordType.PurchaseOrder, orderNumber, Constant.NsField.PurchaseOrder.CreatedBy);
                    log("PO was createdby ID = " + poAdmin);

                    if(!!poAdmin) {
                        var adminEmail = nlapiSearchRecord(Constant.NsRecordType.Employee, null,
                            new nlobjSearchFilter(Constant.NsField.InternalId, null, "is", poAdmin), new nlobjSearchColumn(Constant.NsField.Employee.Email));

                        if(!!adminEmail && adminEmail.length > 0) {
                            outResponse.NotifyEmail = adminEmail[0].getValue(Constant.NsField.Employee.Email);
                        }
                    }
                    else {
                        log("admin not found, poDetail = " + !!purchaseOrderDetail + ", order num = " + orderNumber);
                    }
                }

                outResponse.PurchaseOrderDetail.TotalRecordCount = outResponse.PurchaseOrderDetail.Records.length;
                outResponse.status = Constant.Response.Status.Ok;
                outResponse.message = null;
            }

            //If the request is not internal, set PO status to read
            if(!requestChanges)
                setPoStatus(orderNumber, Constant.OrderStatus.ReadUnacknowledged.Value);
        }
        catch(e) {
            outResponse.message = Constant.Response.ErrorMessages.TroubleLoadingRecords;
            log(e.name, e.message, Constant.LogLevel.Error);
        }
    }

    return outResponse;
}

/**
 * Request Changes to the existing purchase order
 * @param shipDate => New Shipping date
 * @param cancelDate => New Cancel date
 * @param itemDetails => Changes for line items
 * @param poNumber => Purchase order internal ID
 * @param receiveBy => New receive by date
 * @param vendorId => Internal ID of vendor requesting changes
 * @param comments => Any Comments by vendor
 * @returns {{status: string, message: string}}
 */
function requestChanges(shipDate, cancelDate, itemDetails, poNumber, receiveBy, vendorId, comments) {
    log(shipDate + ", poNum = " + poNumber + ", cancelDate = " + cancelDate, JSON.stringify(itemDetails));

    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest
    };

    try {
        if(!!shipDate && !!itemDetails) {
        itemDetails = JSON.parse(itemDetails);
        var poDetails = getPurchaseOrderDetail(poNumber, true);

        //Ensure if successfully got the details
        if(!!poDetails && poDetails.status == Constant.Response.Status.Ok) {

            //Verify if the Purchase order is not changed manually to ensure we get the correct association of changes
            log("Verifying po chng req", poDetails.PurchaseOrderDetail.TotalRecordCount == getObjectSize(itemDetails));
            if(poDetails.PurchaseOrderDetail.TotalRecordCount == getObjectSize(itemDetails)) {
                poDetails.PurchaseOrderDetail.Records.forEach(function(poRecord) {
                    if(!itemDetails[poRecord.Id + "_" + poRecord.ItemId]) {
                        outResponse.message = Constant.Response.ErrorMessages.PurchaseOrderNotBalanced;
                        return outResponse;
                    }
                });
            }

            //Check if we already have pending changes
            var pendingChanges = null, pendingChangesId = hasPendingChanges(poNumber);
            if(!!pendingChangesId) {
                log("Pending changes exists", "Detail ID = " + pendingChangesId);
                //Changes exists, Load it
                pendingChanges = nlapiLoadRecord(Constant.NsRecordType.PendingChanges, pendingChangesId);
                log("Pending changes record loaded", "Now going to remove the associated detail records");

                //Remove all existing line items
                for(var i=pendingChanges.getLineItemCount(Constant.NsLineItem.PendingChangesDetail); i>= 1; i--) {
                    nlapiDeleteRecord(Constant.NsRecordType.PendingChangesDetail, pendingChanges.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.Id, i));
                }
                log("Deleted all pending records");

                pendingChanges = nlapiLoadRecord(Constant.NsRecordType.PendingChanges, pendingChangesId);
                log("Reload the record");

                //Set the change status to unprocessed, so that it may be available to process again
                pendingChanges.setFieldValue(Constant.NsField.PendingChanges.ChangeAccepted, Constant.OrderStatus.Unprocessed.Value);

                //Set the change request date to today
                pendingChanges.setFieldValue(Constant.NsField.PendingChanges.ChangeRequestDate, nlapiDateToString(new Date()));
            }
            else {
                log("Pending changes does not exists");

                //Changes does not exists, create new
                pendingChanges = nlapiCreateRecord(Constant.NsRecordType.PendingChanges);
                pendingChanges.setFieldValue(Constant.NsField.PendingChanges.PurchaseOrderId, poNumber);
                pendingChanges.setFieldValue(Constant.NsField.PendingChanges.VendorId, vendorId);
                pendingChanges.setFieldValue(Constant.NsField.PendingChanges.PoCreationDate, poDetails.Date);
                pendingChanges.setFieldValue(Constant.NsField.PendingChanges.OrderNumber, poDetails.PoNumber);
            }

            pendingChanges.setFieldValue(Constant.NsField.PendingChanges.NewShipDate, shipDate);
            pendingChanges.setFieldValue(Constant.NsField.PendingChanges.NewCancelDate, cancelDate || "");
            pendingChanges.setFieldValue(Constant.NsField.PendingChanges.NewReceiveByDate, receiveBy || "");
            pendingChanges.setFieldValue(Constant.NsField.PendingChanges.Comments, comments);

            var tempDetails = null, i = 1;
            poDetails.PurchaseOrderDetail.Records.forEach(function(poRecord) {
                tempDetails = itemDetails[poRecord.Id + "_" + poRecord.ItemId];

                log("Changes detail", "Quantity " + poRecord.Quantity + " & " + tempDetails.quantity + ", " +
                    "Exp. date = " + poRecord.ExpectedReceiptDate +" & "+ tempDetails.receiptDate + ", " +
                    "Rate = " + poRecord.Rate +" & "+ tempDetails.rate);


                //Check which line have changes, only add those lines
                //If there is a receiveBy date, then all line items need to be refreshed
                if(poRecord.Quantity != tempDetails.quantity ||
                    poRecord.ExpectedReceiptDate != tempDetails.receiptDate
                    || poRecord.Rate != tempDetails.rate || (!!receiveBy && poDetails.ReceiveBy != receiveBy)) {

                    pendingChanges.setLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.Item, i, poRecord.ItemId);
                    pendingChanges.setLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewQty, i, tempDetails.quantity);
                    pendingChanges.setLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewRate, i, tempDetails.rate);
                    pendingChanges.setLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewReceiptDate, i++, (!!receiveBy && poDetails.ReceiveBy != receiveBy) ? (receiveBy || tempDetails.receiptDate) : tempDetails.receiptDate);
                }

            });

            //Finally save the record
            nlapiSubmitRecord(pendingChanges);

            //Set the response to success
            outResponse.status = Constant.Response.Status.Ok;
            outResponse.message = null;

            //set purchase order status to pending changes
            nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.VendorOrderStatus,
                Constant.OrderStatus.ReadPendingChanges.Value);

            if(!!poDetails.NotifyEmail) {
                log("Going to send email", "Email ID = " + poDetails.NotifyEmail + ", Subject = " +
                    Constant.EmailTemplate.ChangesRequestByVendor.Subject);

                var poNum = nlapiLookupField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.PONumber);

                //Send status email on requested changes
                nlapiSendEmail(Constant.EmailTemplate.SenderEmpId, poDetails.NotifyEmail,
                    Constant.EmailTemplate.ChangesRequestByVendor.Subject,
                    Constant.EmailTemplate.ChangesRequestByVendor.Body.replace("{0}", poNum || poNumber));
                log("Email sent");
            }
        }
    }
    }
    catch(e) {
        outResponse.status = Constant.Response.Status.Error;
        outResponse.message = Constant.Response.ErrorMessages.UnexpectedError;
        log(e.name, e.message, Constant.LogLevel.Error);
    }
    return outResponse;
}

/**
 * Get the specs sheet data for PDF
 * @param orderNumber => Purchase order number
 */
function getSpecsSheetData(orderNumber) {
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest
    };

    //Lets check if we didn't got orderNumber somehow
    if(!!orderNumber) {
        try {
            var purchaseOrderDetail = nlapiLoadRecord(Constant.NsRecordType.PurchaseOrder, orderNumber);

            if(!!purchaseOrderDetail) {
                outResponse.PoNumber = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.PONumber);
                outResponse.Memo = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.Memo);
                outResponse.pdfData = [];

                var itemIds = [], qtyRemaining = 0, qtyReceived = 0, qtyBilled = 0, qty = 0, qtyRemaining = 0;
                for(var i = 1; i <= purchaseOrderDetail.getLineItemCount(Constant.NsLineItem.Item); i++ ) {
                    if(purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item,
                        Constant.NsField.PurchaseOrder.ItemType, i) != Constant.NsValue.PurchaseOrder.ItemType.Description
                        && purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item,
                        Constant.NsField.PurchaseOrder.IsClosed, i) == Constant.NsValue.False) {

                        qtyReceived = purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.QuantityReceived, i);
                        qty = purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Quantity, i);
                        qtyBilled = purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.QuantityBilled, i);
                        qtyRemaining = (qtyBilled == null || qtyBilled == undefined || qtyReceived == null ||
                            qtyReceived == undefined) ? qty : (qtyBilled >= qtyReceived ? (qty - qtyBilled) : (qty-qtyReceived));
                        if(qtyRemaining > 0) {
                            itemIds.push(purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i));
                            outResponse.pdfData.push({
                                Item: purchaseOrderDetail.getLineItemText(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i),
                                ItemId: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i),
                                QuantityRemaining: qtyRemaining,
                                UpcCode: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Upc, i),
                                Sku: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Sku, i),
                                RetailPrice: purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.RetailPrice, i)
                            });
                        }

                    }
                }

                log("Going to get item info, itemIDs on detail", JSON.stringify(itemIds));
                //Get details of all items
                var itemDetails = [];
                if(itemIds.length > 0) {
                    itemDetails = nlapiSearchRecord(Constant.NsRecordType.Item, null, new nlobjSearchFilter("internalid", null, "anyof", itemIds),
                        [new nlobjSearchColumn(Constant.NsField.Item.HighResImage), new nlobjSearchColumn(Constant.NsField.Item.RequiresHologram),
                            new nlobjSearchColumn(Constant.NsField.Item.HologramType), new nlobjSearchColumn(Constant.NsField.Item.HologramImage, Constant.NsField.Item.HologramType)]);
                }

                log("item found with itemDetails count = " + itemDetails.length);

                for (var i=0; i<outResponse.pdfData.length; i++) {
                    //TODO: Implement some better solution instead of nested looping
                    itemDetails.forEach(function(detail) {
                        if(detail.getId() == outResponse.pdfData[i].ItemId) {
                            outResponse.pdfData[i].HighResImage = !!detail.getValue(Constant.NsField.Item.HighResImage) ? detail.getValue(Constant.NsField.Item.HighResImage) : Constant.ImageUrl.NoImageFound;
                            if(detail.getValue(Constant.NsField.Item.RequiresHologram) == Constant.NsValue.True &&
                                isNotNullOrEmpty(detail.getValue(Constant.NsField.Item.HologramType))) {
                                var hologramUrl = detail.getText(Constant.NsField.Item.HologramImage, Constant.NsField.Item.HologramType);
                                if(isNotNullOrEmpty(hologramUrl)) {
                                    outResponse.pdfData[i].HologramImage = hologramUrl.indexOf("http") == -1 ? "https://system.na3.netsuite.com/" + hologramUrl : hologramUrl;
                                }
                            }
                        }
                    });
                }
                outResponse.status = Constant.Response.Status.Ok;
                outResponse.message = null;
            }
        }
        catch(e) {
            outResponse.message = Constant.Response.ErrorMessages.TroubleLoadingRecords;
            log(e.name, e.message, Constant.LogLevel.Error);
        }
    }
    return outResponse;
}


function getProdFilesData(orderNumber, selectedItems) {
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest
    };

    //Lets check if we didn't got orderNumber somehow
    if(!!orderNumber) {
        try {
            var purchaseOrderDetail = nlapiLoadRecord(Constant.NsRecordType.PurchaseOrder, orderNumber);

            if(!!purchaseOrderDetail) {
                outResponse.PoNumber = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.PONumber);
                outResponse.prodFiles = [];

                var itemIds = [], qtyRemaining = 0, qtyReceived = 0, qtyBilled = 0, qty = 0, qtyRemaining = 0;
                for(var i = 1; i <= purchaseOrderDetail.getLineItemCount(Constant.NsLineItem.Item); i++ ) {
                    if(purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item,
                        Constant.NsField.PurchaseOrder.ItemType, i) != Constant.NsValue.PurchaseOrder.ItemType.Description
                        && purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item,
                        Constant.NsField.PurchaseOrder.IsClosed, i) == Constant.NsValue.False) {

                        qtyReceived = purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.QuantityReceived, i);
                        qty = purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Quantity, i);
                        qtyBilled = purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.QuantityBilled, i);
                        qtyRemaining = (qtyBilled == null || qtyBilled == undefined || qtyReceived == null ||
                            qtyReceived == undefined) ? qty : (qtyBilled >= qtyReceived ? (qty - qtyBilled) : (qty-qtyReceived));
                        if(qtyRemaining > 0) {
                            itemIds.push(purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i));
                        }

                    }
                }

                log("Item IDs", JSON.stringify(itemIds));
                log("Selected Items", JSON.stringify(selectedItems));
                log("typeof Selected Items", typeof selectedItems);

                //Final item IDs to get prod files
                var itemIdsFinal = [];
                selectedItems = JSON.parse(selectedItems);
                if(!!selectedItems && selectedItems.length > 0) {
                    selectedItems.forEach(function(item) {
                        if(itemIds.indexOf(item) != -1) {
                            itemIdsFinal.push(item);
                        }
                    });
                }

                log("Going to get item prod files, itemIDs on detail", JSON.stringify(itemIdsFinal));
                //Get production files of all item
                var tempSearchResult = null;
                if(itemIdsFinal.length > 0) {
                    tempSearchResult = nlapiSearchRecord(Constant.NsRecordType.Item, null, new nlobjSearchFilter("internalid", null, "anyof", itemIdsFinal),
                        new nlobjSearchColumn(Constant.NsField.Item.ProductionFile));
                }


                log("item found with production files count = " + tempSearchResult.length);

                tempSearchResult.forEach(function(res) {
                    if(!!res.getValue(Constant.NsField.Item.ProductionFile)) {
                        outResponse.prodFiles.push(res.getValue(Constant.NsField.Item.ProductionFile));
                    }
                });

                outResponse.status = Constant.Response.Status.Ok;
                outResponse.message = null;
            }
        }
        catch(e) {
            outResponse.message = Constant.Response.ErrorMessages.TroubleLoadingRecords;
            log(e.name, e.message, Constant.LogLevel.Error);
        }
    }
    return outResponse;
}


/**
 * Set purchase order status
 * @param poNumber => Purchase order internal ID
 * @param status => status to set
 */
function setPoStatus(poNumber, status) {

    //Get current PO status, and decide if we need to changes the status
    try {

        if(status == Constant.OrderStatus.ReadUnacknowledged.Value) {
            var currentStatus = nlapiLookupField(Constant.NsRecordType.PurchaseOrder, poNumber,
                Constant.NsField.PurchaseOrder.VendorOrderStatus);
            if(!!currentStatus && currentStatus == Constant.OrderStatus.New.Value) {
                nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.VendorOrderStatus, status);
            }

        }
        else {
            nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.VendorOrderStatus, status);
        }

/*        var poRecord = nlapiLoadRecord(Constant.NsRecordType.PurchaseOrder, poNumber);
        var currentStatus = null;
        if(!!poRecord) {
            currentStatus = poRecord.getFieldValue(Constant.NsField.PurchaseOrder.VendorOrderStatus);
            log("Current PO status = " + currentStatus, "New Status = " + status);

            if(status == currentStatus ||
                (currentStatus == Constant.OrderStatus.ReadPendingChanges.Value &&
                    (status == Constant.OrderStatus.ReadUnaccepted.Value || status == Constant.OrderStatus.New.Value)) ||
                (currentStatus == Constant.OrderStatus.Accepted.Value && (status != Constant.OrderStatus.InTransit.Value
                    || status == Constant.OrderStatus.ReadUnaccepted.Value || status == Constant.OrderStatus.ReadUnaccepted.Value)) ||
                (currentStatus == Constant.OrderStatus.Rejected.Value && status == Constant.OrderStatus.ReadUnaccepted.Value))
            return;

            if(status == Constant.OrderStatus.Accepted.Value) {
                //Add to parent record as well
                nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber,
                    Constant.NsField.PurchaseOrder.VendorOrderStatusParent, Constant.OrderStatusParent.Accepted.Value);
            }
            else if(status == Constant.OrderStatus.InTransit.Value) {
                //Add to parent record as well
                nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber,
                    Constant.NsField.PurchaseOrder.VendorOrderStatusParent, Constant.OrderStatusParent.Accepted.Value);
            }

            //Set child status, we can submit both at once, but the parent updation is rare
            nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.VendorOrderStatus, status);
        }*/
    }
    catch(e) {
        log(e.name, e.message, Constant.LogLevel.Error);
    }
}

/**
 * Check if the Purchase Order already have pending changes
 * @param poNumber => Purchase order internal ID
 * @returns {boolean} => Internal ID of pending changes record if the changes are already requested, false otherwise
 */
function hasPendingChanges(poNumber) {
    var existingChanges = nlapiSearchRecord(Constant.NsRecordType.PendingChanges, null, new nlobjSearchFilter(Constant.NsField.PendingChanges.PurchaseOrderId, null, "is", poNumber));
    return !!existingChanges && existingChanges.length > 0 ? existingChanges[0].getId() : false;
}

/**
 * Get the count of keys on root level of the object
 * @param obj => the object to check size
 * @returns {number} => size of object
 */
function getObjectSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
}

/**
 * Get new purchase orders (PO) list
 * @param vendorId => Vendor ID of vendor to get list of POs
 * @returns {{status: string, message: string, Records: Array, TotalRecordCount: number}}
 */
function getNewPurchaseOrdersList(vendorId) {

    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest,
        Records: [],
        TotalRecordCount: 0
    };

    //Get purchase orders main line data - New
    var purchaseOrdersNew = nlapiSearchRecord(Constant.NsRecordType.PurchaseOrder, null,

        [[Constant.NsField.PurchaseOrder.MainLine,"is", Constant.NsValue.True], "and",
            [Constant.NsField.PurchaseOrder.Entity, "is", vendorId], "and",
            [[Constant.NsField.PurchaseOrder.Status, "anyof", [Constant.NsValue.PurchaseOrder.Status.PendingReceipt,
                Constant.NsValue.PurchaseOrder.Status.PartiallyReceived,
                Constant.NsValue.PurchaseOrder.Status.PendingBillingPartiallyReceived]]], "and",
            [[Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.New.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.ReadPendingChanges.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.ReadUnaccepted.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Rejected.Value], "or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.ReadUnacknowledged.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Unprocessed.Value]]],
        [new nlobjSearchColumn(Constant.NsField.PurchaseOrder.PONumber),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.VendorOrderStatus),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.ShipDate),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.Date),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.AmountUnbilled)
        ]);

    //Get purchase orders detail line data - New
    var purchaseOrdersNewDetail = nlapiSearchRecord(Constant.NsRecordType.PurchaseOrder, null,
        [[Constant.NsField.PurchaseOrder.MainLine,"is", Constant.NsValue.False], "and",
            [Constant.NsField.PurchaseOrder.Entity, "is", vendorId], "and",
            [[Constant.NsField.PurchaseOrder.Status, "anyof", [Constant.NsValue.PurchaseOrder.Status.PendingReceipt,
                Constant.NsValue.PurchaseOrder.Status.PartiallyReceived,
                Constant.NsValue.PurchaseOrder.Status.PendingBillingPartiallyReceived]]], "and",
            [[Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.New.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.ReadPendingChanges.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.ReadUnaccepted.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Rejected.Value], "or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.ReadUnacknowledged.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Unprocessed.Value]]],
        [new nlobjSearchColumn(Constant.NsField.PurchaseOrder.ExpectedReceiptDate)]);

    outResponse.status = Constant.Response.Status.Ok;
    outResponse.message = null;

    if(!!purchaseOrdersNew) {
        var amountUnbilled = null, expRecptDate = null;
        purchaseOrdersNew.forEach(function(PO) {
            amountUnbilled = Math.abs(parseFloat(PO.getValue(Constant.NsField.PurchaseOrder.AmountUnbilled)));
            amountUnbilled = !!amountUnbilled && amountUnbilled != NaN ? amountUnbilled.toFixed(2) : "0.00";

            expRecptDate = [];
            if(!!purchaseOrdersNewDetail) {
                purchaseOrdersNewDetail.forEach(function(PoDetail) {
                    if(PoDetail.getId() == PO.getId()) {
                        if(!!PoDetail.getValue(Constant.NsField.PurchaseOrder.ExpectedReceiptDate))
                            expRecptDate.push(PoDetail.getValue(Constant.NsField.PurchaseOrder.ExpectedReceiptDate));
                    }
                });
            }

            expRecptDate.sort(function(a, b) {
                return new Date(a) - new Date(b);
            });

            outResponse.Records.push({
                "Id": PO.getId(),
                "PONumber": PO.getValue(Constant.NsField.PurchaseOrder.PONumber),
                "OrderStatus": PO.getText(Constant.NsField.PurchaseOrder.VendorOrderStatus),
                "ShipDate": PO.getValue(Constant.NsField.PurchaseOrder.ShipDate),
                "Date": PO.getValue(Constant.NsField.PurchaseOrder.Date),
                "ExpectedReceiptDate": expRecptDate[0] || "",
                "AmountUnbilled": amountUnbilled
            });
        });

        //Set the total record length to be displayed on grid
        outResponse.TotalRecordCount = outResponse.Records.length;
    }

    return outResponse;
}

/**
 * Get accepted purchase orders (PO) list
 * @param vendorId => Vendor ID of vendor to get list of POs
 * @returns {{status: string, message: string, Records: Array, TotalRecordCount: number}}
 */
function getAcceptedPurchaseOrdersList(vendorId) {

    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest,
        Records: [],
        TotalRecordCount: 0
    };


    //Get purchase orders main line data - Accepted
    var purchaseOrdersAccepted = nlapiSearchRecord(Constant.NsRecordType.PurchaseOrder, null,
        [[Constant.NsField.PurchaseOrder.MainLine,"is", Constant.NsValue.True], "and",
            [Constant.NsField.PurchaseOrder.Entity, "is", vendorId], "and",
            [[Constant.NsField.PurchaseOrder.Status, "anyof", [Constant.NsValue.PurchaseOrder.Status.PendingReceipt,
                Constant.NsValue.PurchaseOrder.Status.PartiallyReceived,
                Constant.NsValue.PurchaseOrder.Status.PendingBillingPartiallyReceived]]], "and",
            [[Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Acknowledged.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.InTransit.Value], "or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "anyof", "@NONE@"],"or", //Existing PO, no status set
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Unassigned.Value]]],
        [new nlobjSearchColumn(Constant.NsField.PurchaseOrder.PONumber),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.VendorOrderStatus),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.ShipDate),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.Date),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.AmountUnbilled)
        ]);

    //Get purchase orders detail line data - Accepted
    var purchaseOrdersAcceptedDetail = nlapiSearchRecord(Constant.NsRecordType.PurchaseOrder, null,
        [[Constant.NsField.PurchaseOrder.MainLine,"is", Constant.NsValue.False], "and",
            [Constant.NsField.PurchaseOrder.Entity, "is", vendorId], "and",
            [[Constant.NsField.PurchaseOrder.Status, "anyof", [Constant.NsValue.PurchaseOrder.Status.PendingReceipt,
                Constant.NsValue.PurchaseOrder.Status.PartiallyReceived,
                Constant.NsValue.PurchaseOrder.Status.PendingBillingPartiallyReceived]]], "and",
            [[Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Acknowledged.Value],"or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.InTransit.Value], "or",
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "anyof", "@NONE@"],"or", //Existing PO, no status set
                [Constant.NsField.PurchaseOrder.VendorOrderStatus, "is", Constant.OrderStatus.Unassigned.Value]]],
        [new nlobjSearchColumn(Constant.NsField.PurchaseOrder.ExpectedReceiptDate),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.Quantity),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.Rate),
            new nlobjSearchColumn(Constant.NsField.PurchaseOrder.ShipQuantityReceived)
        ]);


    outResponse.status = Constant.Response.Status.Ok;
    outResponse.message = null;

    log("accepted: ", JSON.stringify(purchaseOrdersAccepted));
    log("accepted detail: ", JSON.stringify(purchaseOrdersAcceptedDetail));


    if(!!purchaseOrdersAccepted) {
        var expRecptDate = null, amountUnreceived = null;
        purchaseOrdersAccepted.forEach(function(PO) {


            expRecptDate = [];
            amountUnreceived = 0;
            purchaseOrdersAcceptedDetail.forEach(function(PoDetail) {
                if(PoDetail.getId() == PO.getId()) {
                    if(!!PoDetail.getValue(Constant.NsField.PurchaseOrder.ExpectedReceiptDate)) {
                        expRecptDate.push(PoDetail.getValue(Constant.NsField.PurchaseOrder.ExpectedReceiptDate));
                    }

                    // Amount_Unreceived = (Qty - QtyReceived) * Rate
                    amountUnreceived += (Math.abs(parseFloat(PoDetail.getValue(Constant.NsField.PurchaseOrder.Quantity))) - Math.abs(parseFloat(PoDetail.getValue(Constant.NsField.PurchaseOrder.ShipQuantityReceived)))) * Math.abs(parseFloat(PoDetail.getValue(Constant.NsField.PurchaseOrder.Rate)));
                }
            });
            expRecptDate.sort(function(a, b) {
                return new Date(a) - new Date(b);
            });

            outResponse.Records.push({
                "Id": PO.getId(),
                "PONumber": PO.getValue(Constant.NsField.PurchaseOrder.PONumber),
                "OrderStatus": PO.getText(Constant.NsField.PurchaseOrder.VendorOrderStatus),
                "ShipDate": PO.getValue(Constant.NsField.PurchaseOrder.ShipDate),
                "Date": PO.getValue(Constant.NsField.PurchaseOrder.Date),
                "ExpectedReceiptDate": expRecptDate[0],
                "AmountUnreceived": amountUnreceived.toFixed(2)
            });
        });

        //Set the total record length to be displayed on grid
        outResponse.TotalRecordCount = outResponse.Records.length;
    }

    return outResponse;
}

/**
 * Login the vendor using their credentials and set login hash
 * @param username
 * @param password
 * @returns {{status: string, message: string, cookies: array}}
 */
function login(username, password) {
    //check if this user exists, generate a guid, save that guid associate with vendor
    //return the guid to be set in cookie and vendor ID
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidLoginCredentials
    };
    var vendor = nlapiSearchRecord(Constant.NsRecordType.Vendor, null,
        [new nlobjSearchFilter(Constant.NsField.Vendor.VendorUsername, null, 'is', username),
            new nlobjSearchFilter(Constant.NsField.Vendor.VendorPassword, null, 'is', password)],
            new nlobjSearchColumn(Constant.NsField.Vendor.VendorName));

    if(!!vendor && vendor.length > 0) {
        //Login success
        var loginHash = createGUID();

        //set login hash for future use
        nlapiSubmitField(Constant.NsRecordType.Vendor, vendor[0].getId(), Constant.NsField.Vendor.VendorLoginHash, loginHash);

        var currentDate = new Date();

        //set session expire time
        nlapiSubmitField(Constant.NsRecordType.Vendor, vendor[0].getId(), Constant.NsField.Vendor.VendorSessionTime,
            currentDate.getTime() + (Constant.Config.CookieExpiry * 1000 * 60));

        outResponse.status = Constant.Response.Status.Ok;
        outResponse.message = null;
        outResponse.cookies = [
            {
                name: Constant.Cookie.LoginHash,
                value: loginHash
            },
            {
                name: Constant.Cookie.VendorId,
                value: vendor[0].getId()
            },
            {
                name: Constant.Cookie.VendorName,
                value: vendor[0].getValue(Constant.NsField.Vendor.VendorName)
            }
        ];
    }

    return outResponse;
}

/**
 * Remove login hash from the vendor record to restrict untrusted login
 */
function logout () {

    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.InvalidRequest
    };

    //Check if we have valid logged-in user, then get the detail object of vendor
    var vendor = ensureValidRequest(request);

    if(!!vendor) {
        //So we got the user with a valid session
        //Delete loginHash from the associated record and redirect the user to relevant page

        nlapiSubmitField(Constant.NsRecordType.Vendor, vendor.getId(), Constant.NsField.Vendor.VendorLoginHash, null);
        nlapiSubmitField(Constant.NsRecordType.Vendor, vendor.getId(), Constant.NsField.Vendor.VendorSessionTime, 0);

        outResponse.status = Constant.Response.Status.Ok;
        outResponse.message = null;
        outResponse.cookies = [Constant.Cookie.LoginHash, Constant.Cookie.VendorId, Constant.Cookie.VendorName]; //Cookies to delete on browser
    }

    return outResponse;
}

/**
 * Check if the request is valid and by some logged-in user, then return it
 * @param request
 * @returns {object} logged-in vendor
 */
function ensureValidRequest(request) {
    //Check cookies => vendor ID & login hash
    var loginHash = getCookie(request, Constant.Cookie.LoginHash),
        vendorId = getCookie(request, Constant.Cookie.VendorId);

    //Check if we've got desired cookies
    if(!!loginHash && !!vendorId) {

        var vendor = nlapiSearchRecord(Constant.NsRecordType.Vendor, null,
            [new nlobjSearchFilter(Constant.NsField.Vendor.VendorLoginHash, null, 'is', loginHash),
                new nlobjSearchFilter(Constant.NsField.InternalId, null, 'is', vendorId)]);

        //Now lets check if this loginHash and vendorId got some vendor record associated
        if(!!vendor && vendor.length > 0) {
            //vendor = nlapiLoadRecord(Constant.NsRecordType.Vendor, vendor[0].getId()); //Get detailed info
            //if(!!vendor)
            return vendor[0];
        }
    }
    return null;
}

/**
 * Creates GUID string
 * @returns {string} unique GUID
 */
function createGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/**
 * Get the value of desired cookie from request object
 * @param req => Request object
 * @param name => Name of cookie to retrieve
 * @returns {string} cookie value
 */
function getCookie(req, name) {
    var cookies = req.getHeader("Cookie");
    var cookieVal = null;
    if(!!cookies && cookies.indexOf(name) >= 0) {
        //Required cookie found

        var allCookies = {}, tempCookie = null;

        //Parse cookies as object
        cookies.split(";").forEach(function(cookie) {
            tempCookie = cookie.split("=");
            allCookies[decodeURIComponent(tempCookie[0]).trim()] = decodeURIComponent(tempCookie[1]).trim();
        });
        cookieVal = allCookies[name];
    }
    //return the value of the desired cookie
    return cookieVal;
}

/**
 * Logs the message
 * @param title => log title
 * @param detail => log detail
 * @param logLevel => log level
 */
function log(title, detail, logLevel) {
    if(!!Constant.Config.EnableLogging) {
        nlapiLogExecution(logLevel || Constant.LogLevel.Debug, title, detail || "");
    }
}

/**
 * Check if the request contains valid user session
 * @param request
 * @returns true if valid session, false otherwise
 */
function sessionExists(request) {
    log("checking session existance");

    //Check cookies => vendor ID & login hash
    var loginHash = getCookie(request, Constant.Cookie.LoginHash),
        vendorId = getCookie(request, Constant.Cookie.VendorId);

    //Check if we've got desired cookies
    if(!!loginHash && !!vendorId) {

        var vendor = nlapiSearchRecord(Constant.NsRecordType.Vendor, null,
            [new nlobjSearchFilter(Constant.NsField.Vendor.VendorLoginHash, null, 'is', loginHash),
                new nlobjSearchFilter(Constant.NsField.InternalId, null, 'is', vendorId)],
            new nlobjSearchColumn(Constant.NsField.Vendor.VendorSessionTime));

        //Now lets check if this loginHash and vendorId got some vendor record associated
        if(!!vendor && vendor.length > 0) {
            log("vendor record found using cookies");
            //Yup we got the vendor, now lets check if the session is not yet expired
            var sessionTime = vendor[0].getValue(Constant.NsField.Vendor.VendorSessionTime);
            var currentDateTime = new Date();
            if(!!sessionTime) {
                log("Session expiry remaining (secs) = " + ((sessionTime - currentDateTime) / 1000));

                //Lets return the status, if session exists
                var sessionExists = (sessionTime - currentDateTime) > 0;

                if(!!sessionExists) {
                    //Refresh the session expiry time
                    nlapiSubmitField(Constant.NsRecordType.Vendor, vendorId, Constant.NsField.Vendor.VendorSessionTime,
                            currentDateTime.getTime() + (Constant.Config.CookieExpiry * 1000 * 60));
                }

                return sessionExists;
            }
        }
        else {
            log("Vendor record not found while checking session");
        }
    }
    return false;
}

/**
 * Check if the given string is not null or empty
 * @param str   => String to check
 * @return true if not empty, false otherwise
 */
function isNotNullOrEmpty(str) {
    return !!str && str != "" && str != null && str != undefined;
}