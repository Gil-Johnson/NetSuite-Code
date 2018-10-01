/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       17 Apr 2014     Hassan
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
            log("POST request received");
            //hand over the request to the POST handler
            response.write(JSON.stringify(handlePostRequest(request)));
            return;
        }

        var indexPage = nlapiLoadFile(Constant.File.AdminIndexHtml);
        var adminScript = nlapiLoadFile(Constant.File.AdminScript);

        //Create form
        var form = nlapiCreateForm(Constant.AdminPanel.FormName, false);
        form.addField(Constant.AdminPanel.PageTemplateField, "inlinehtml").setDefaultValue(indexPage.getValue().replace("/*admin_script*/", adminScript.getValue()).replace("/* #CSS# */", getJtableCss()));

        //Write the above form on page
        response.writePage(form);
    }
    catch(e) {
        //Error occurred ;(
        log(e.name, e.message, Constant.LogLevel.Error);
        response.write(e.name + ", " + e.message);
    }
}


/**
 * POST requests handler
 * @param request => request object
 */
function handlePostRequest(request) {

    var method = request.getParameter('method');
    log("POST method", method);
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
        else if(method == "getVendorList") {
            outResponse = getVendorList();
        }
        else if(method == "getPoChangesByVendor") {
            outResponse = getPoChangesByVendor(request.getParameter("vendorId"));
        }
        else if(method == "getPoChangesDetail") {
            outResponse = getPoChangesDetail(request.getParameter("changeId"));
        }
        else if(method == "rejectPoChanges") {
            outResponse = rejectPoChanges(request.getParameter("changeId"));
        }
        else if(method == "acceptPoChanges") {
            outResponse = acceptPoChanges(request.getParameter("changeId"));
        }
    }
    catch(e) {
        //Oh crap! it should not be here :(
        outResponse.message = Constant.Response.ErrorMessages.UnexpectedError;
        log(e.name, e.message, Constant.LogLevel.Error);
    }

    //Finally return the response
    return outResponse;
}

/**
 * Reject the particular changes requested by vendor
 * @param changeInternalId
 * @returns {{status: *, message: *}}
 */
function rejectPoChanges(changeInternalId) {

    //Default response
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.UnableToRejectChanges
    };

    //Load the change pending changes record
    var changeDetail = nlapiLoadRecord(Constant.NsRecordType.PendingChanges, changeInternalId);

    //Set the status of changes to Rejected!
    changeDetail.setFieldValue(Constant.NsField.PendingChanges.ChangeAccepted, Constant.OrderStatus.Rejected.Value);

    //Get PO Number for future use
    var poNumber = changeDetail.getFieldValue(Constant.NsField.PendingChanges.PurchaseOrderId);

    //Submit change record
    nlapiSubmitRecord(changeDetail);

    //Set status on main record as well
    nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.VendorOrderStatus,
        Constant.OrderStatus.Rejected.Value);

    //Finally send an email to Vendor about rejection of changes
    var vendorEmail = nlapiSearchRecord(Constant.NsRecordType.PurchaseOrder, null,
        [new nlobjSearchFilter(Constant.NsField.InternalId, null, "is", poNumber),
         new nlobjSearchFilter(Constant.NsField.PurchaseOrder.MainLine, null, "is", Constant.NsValue.True)],
        new nlobjSearchColumn(Constant.NsField.Vendor.Email, Constant.NsRecordType.Vendor));

    log("Have to send email", "email length = " + (!!vendorEmail ? vendorEmail.length : "0") + ", poNumber = " + poNumber);

    if(!!vendorEmail && vendorEmail.length > 0) {
        vendorEmail = vendorEmail[0].getValue(Constant.NsField.Vendor.Email, Constant.NsRecordType.Vendor);
        log("Vendor Email = " + vendorEmail);
        if (!!vendorEmail) {
            log("Going to send email", "Email ID = " + vendorEmail + ", Subject = " +
                Constant.EmailTemplate.ChangesRejectedByAdmin.Subject);

            //Get PO Number.
            var poNum = nlapiLookupField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.PONumber);

            //Send status email on requested changes
            nlapiSendEmail(Constant.EmailTemplate.SenderEmpId, vendorEmail,
                Constant.EmailTemplate.ChangesRejectedByAdmin.Subject,
                Constant.EmailTemplate.ChangesRejectedByAdmin.Body.replace("{0}", poNum || poNumber));
            log("Email sent");
        }
    }

    //Set the response to success
    outResponse.status = Constant.Response.Status.Ok;
    outResponse.message = null;

    //Finally return the response
    return outResponse;
}

/**
 * Accept the particular changes requested by vendor
 * @param changeInternalId
 * @returns {{status: *, message: *}}
 */
function acceptPoChanges(changeInternalId) {

    //Default response
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.UnableToAcceptChanges
    };

    //Load the change pending changes record
    var changeDetail = nlapiLoadRecord(Constant.NsRecordType.PendingChanges, changeInternalId);


    var poNumber = changeDetail.getFieldValue(Constant.NsField.PendingChanges.PurchaseOrderId);

    //Make new values the part of existing PO
    var originalPoDetail = nlapiLoadRecord(Constant.NsRecordType.PurchaseOrder, poNumber);

    var changeDetailItems = [];
    for(var i = 1; i <= changeDetail.getLineItemCount(Constant.NsLineItem.PendingChangesDetail); i++) {
        changeDetailItems[changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.Item, i)] = {
            NewRate: changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewRate, i),
            NewQty: changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewQty, i),
            NewReceiptDate: changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewReceiptDate, i)
        };
    }

    //Set rate and quantity to new rate and quantity
    for(var i = 1; i <= originalPoDetail.getLineItemCount(Constant.NsLineItem.Item); i++ ) {
        if(originalPoDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.IsClosed, i) == Constant.NsValue.False
            && !!changeDetailItems[originalPoDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)]) {
            originalPoDetail.setLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Quantity, i, changeDetailItems[originalPoDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)].NewQty);
            originalPoDetail.setLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Rate, i, changeDetailItems[originalPoDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)].NewRate);
            originalPoDetail.setLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.ExpectedReceiptDate, i, changeDetailItems[originalPoDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)].NewReceiptDate);
        }
    }

    //Set ship date
    originalPoDetail.setFieldValue(Constant.NsField.PurchaseOrder.ShipDate, changeDetail.getFieldValue(Constant.NsField.PendingChanges.NewShipDate));
    originalPoDetail.setFieldValue(Constant.NsField.PurchaseOrder.CancelDate, changeDetail.getFieldValue(Constant.NsField.PendingChanges.NewCancelDate));
    originalPoDetail.setFieldValue(Constant.NsField.PurchaseOrder.ReceiveBy, changeDetail.getFieldValue(Constant.NsField.PendingChanges.NewReceiveByDate));

    //Save changes to PO
    nlapiSubmitRecord(originalPoDetail);

    //Set status to unaccepted
    nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.VendorOrderStatus,
        Constant.OrderStatus.ReadUnaccepted.Value);

    //Set pending changes status to accepted as well, here accepted only means accepted by admin :)
    nlapiSubmitField(Constant.NsRecordType.PendingChanges, changeInternalId, Constant.NsField.PendingChanges.ChangeAccepted, Constant.OrderStatus.Accepted.Value);


    //Finally send an email to Vendor about acceptance of changes
    var vendorEmail = nlapiSearchRecord(Constant.NsRecordType.PurchaseOrder, null,
        [new nlobjSearchFilter(Constant.NsField.InternalId, null, "is", poNumber),
            new nlobjSearchFilter(Constant.NsField.PurchaseOrder.MainLine, null, "is", Constant.NsValue.True)],
        new nlobjSearchColumn(Constant.NsField.Vendor.Email, Constant.NsRecordType.Vendor));

    log("Have to send email", "email length = " + (!!vendorEmail ? vendorEmail.length : "0") + ", poNumber (Int ID) = " + poNumber);

    if(!!vendorEmail && vendorEmail.length > 0) {
        vendorEmail = vendorEmail[0].getValue(Constant.NsField.Vendor.Email, Constant.NsRecordType.Vendor);
        log("Vendor Email = " + vendorEmail);
        if (!!vendorEmail) {

            //Get PO Number.
            var poNum = nlapiLookupField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.PONumber);

            log("Going to send email", "Email ID = " + vendorEmail + ", Subject = " +
                Constant.EmailTemplate.ChangesAcceptedByAdmin.Subject);
            //Send status email on requested changes
            nlapiSendEmail(Constant.EmailTemplate.SenderEmpId, vendorEmail,
                Constant.EmailTemplate.ChangesAcceptedByAdmin.Subject,
                Constant.EmailTemplate.ChangesAcceptedByAdmin.Body.replace("{0}", poNum || poNumber));
            log("Email sent");
        }
    }
    //All done, set the response to success
    outResponse.status = Constant.Response.Status.Ok;
    outResponse.message = null;

    //Finally return the response
    return outResponse;
}

/**
 * Get the details of unprocessed changes
 * @param changeInternalId
 * @returns {{status: *, message: *}}
 */
function getPoChangesDetail(changeInternalId) {

    //Default response
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.PoDetailsNotFound
    };

    //Load the change pending changes record
    var changeDetail = nlapiLoadRecord(Constant.NsRecordType.PendingChanges, changeInternalId);

    //Lets see if we got something
    if(!!changeDetail) {
        var poId = changeDetail.getFieldValue(Constant.NsField.PendingChanges.PurchaseOrderId);

        //Get purchase order details
        var purchaseOrderDetail = nlapiLoadRecord(Constant.NsRecordType.PurchaseOrder, poId);


        if(!!purchaseOrderDetail) {
            outResponse.PoNumber = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.PONumber)  || "";
            outResponse.Warehouse = purchaseOrderDetail.getFieldText(Constant.NsField.PurchaseOrder.Warehouse)  || "";
            outResponse.ShipToAddress = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.ShipToAddress)  || "";
            outResponse.ReceiveBy = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.ReceiveBy)  || "";
            outResponse.CancelDate = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.CancelDate)  || "";
            outResponse.ShipDate = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.ShipDate)  || "";
            outResponse.NewShipDate = changeDetail.getFieldValue(Constant.NsField.PendingChanges.NewShipDate)  || "";
            outResponse.NewCancelDate = changeDetail.getFieldValue(Constant.NsField.PendingChanges.NewCancelDate)  || "";
            outResponse.NewReceiveByDate = changeDetail.getFieldValue(Constant.NsField.PendingChanges.NewReceiveByDate)  || "";
            outResponse.VendorAddress = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.VendorAddress)  || "";
            outResponse.OrderStatus = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.VendorOrderStatus)  || "";
            outResponse.PoCreationDate = purchaseOrderDetail.getFieldValue(Constant.NsField.PurchaseOrder.Date)  || "";
            outResponse.Comments = changeDetail.getFieldValue(Constant.NsField.PendingChanges.Comments)  || "";

            var changeDetailItems = [];
            for(var i = 1; i <= changeDetail.getLineItemCount(Constant.NsLineItem.PendingChangesDetail); i++) {
                changeDetailItems[changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.Item, i)] = {
                    NewRate: formatFloat(changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewRate, i)),
                    NewQty: changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewQty, i),
                    NewReceiptDate: changeDetail.getLineItemValue(Constant.NsLineItem.PendingChangesDetail, Constant.NsField.PendingChangesDetail.NewReceiptDate, i)
                };
            }

            outResponse.PurchaseOrderDetail = {
                Records: [],
                TotalRecordCount: 0

            };
            for(var i = 1; i <= purchaseOrderDetail.getLineItemCount(Constant.NsLineItem.Item); i++ ) {
                //Check if we have some changes requested on this record
                if(purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.IsClosed, i) == Constant.NsValue.False
                    && !!changeDetailItems[purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)]) {
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
                        NewRate: changeDetailItems[purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)].NewRate,
                        NewQty: changeDetailItems[purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)].NewQty,
                        NewReceiptDate: changeDetailItems[purchaseOrderDetail.getLineItemValue(Constant.NsLineItem.Item, Constant.NsField.PurchaseOrder.Item, i)].NewReceiptDate
                    });
                }
            }

            outResponse.PurchaseOrderDetail.TotalRecordCount = outResponse.PurchaseOrderDetail.Records.length;
        }
    }


    //Set status to OK
    outResponse.status = Constant.Response.Status.Ok;
    outResponse.message = null;

    return outResponse;
}

/**
 * Get Purchase order change requests by Vendor's ID
 * @param vendorId
 * @returns response
 */
function getPoChangesByVendor(vendorId) {

    //Default response
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.VendorsNotFound,
        purchaseOrders: {
            Records: [],
            TotalRecordCount: 0
        }
    };

    //Get all pending changes of particular vendor
    var pendingChanges = nlapiSearchRecord(Constant.NsRecordType.PendingChanges, null,
        [[Constant.NsField.PendingChanges.VendorId, vendorId == "-1" ? "isnotempty" : "is", vendorId], "and",
            [[Constant.NsField.PendingChanges.ChangeAccepted, "is", Constant.OrderStatus.Unprocessed.Value], "or",
            [Constant.NsField.PendingChanges.ChangeAccepted, "is", Constant.OrderStatus.Unassigned.Value]]],
        [new nlobjSearchColumn(Constant.NsField.PendingChanges.ChangeRequestDate),
            new nlobjSearchColumn(Constant.NsField.PendingChanges.PurchaseOrderId),
            new nlobjSearchColumn(Constant.NsField.PendingChanges.PoCreationDate),
            new nlobjSearchColumn(Constant.NsField.PendingChanges.OrderNumber)]);

    //Lets check if we found some changes
    if(!!pendingChanges && pendingChanges.length > 0) {

        pendingChanges.forEach(function(chng) {
            outResponse.purchaseOrders.Records.push({
                Id: chng.getId(),
                PoNumber: chng.getValue(Constant.NsField.PendingChanges.PurchaseOrderId),
                PoCreationDate: chng.getValue(Constant.NsField.PendingChanges.PoCreationDate),
                ChangeRequestDate: chng.getValue(Constant.NsField.PendingChanges.ChangeRequestDate),
                OrderNumber: chng.getValue(Constant.NsField.PendingChanges.OrderNumber)
            });
        });

        outResponse.purchaseOrders.TotalRecordCount = outResponse.purchaseOrders.Records.length;
    }

    //Set status to OK
    outResponse.status = Constant.Response.Status.Ok;
    outResponse.message = null;

    return outResponse;
}

/**
 * Get all vendors list
 * @returns list of vendors
 */
function getVendorList() {
    //return the array of all vendors with their IDs
    var outResponse = {
        status: Constant.Response.Status.Error,
        message: Constant.Response.ErrorMessages.VendorsNotFound,
        vendors: []
    };

    var vendors = [], lastRecord = null, context = nlapiGetContext(), lastId = 0;


    var pendingChangesRecords = nlapiSearchRecord(Constant.NsRecordType.PendingChanges, null,
        [[Constant.NsField.PendingChanges.ChangeAccepted, "is", Constant.OrderStatus.Unprocessed.Value], "or",
            [Constant.NsField.PendingChanges.ChangeAccepted, "is", Constant.OrderStatus.Unassigned.Value]],
        new nlobjSearchColumn(Constant.NsField.PendingChanges.VendorId));

    if(!!pendingChangesRecords && pendingChangesRecords.length > 0) {
        var vendorsPendingChanges = [];
        pendingChangesRecords.forEach(function(chngRecord) {
            //get unique vendor IDs only
            if(vendorsPendingChanges.indexOf(chngRecord.getValue(Constant.NsField.PendingChanges.VendorId)) == -1)
                vendorsPendingChanges.push(chngRecord.getValue(Constant.NsField.PendingChanges.VendorId));
        });

        log("unproc. pending chngs record count", vendorsPendingChanges.length);

        //Get vendor records
        do {
            lastRecord = nlapiSearchRecord(Constant.NsRecordType.Vendor, null,
                [new nlobjSearchFilter(Constant.NsField.InternalId, null, "anyof", vendorsPendingChanges), new nlobjSearchFilter(Constant.NsField.InternalIdNumber, null, "greaterthan", lastId)],
                [new nlobjSearchColumn(Constant.NsField.Vendor.VendorName), new nlobjSearchColumn(Constant.NsField.InternalId).setSort()]);

            if(lastRecord != null) {
                lastId = lastRecord[lastRecord.length-1].getId();
                vendors = vendors.concat(lastRecord);
            }
        }
        while(!!lastRecord && context.getRemainingUsage() > 1) //Check if we got more than 1000 vendors, iterate for more

        log("Num. of vendors found to return", vendors.length);

        //Lets keep vendors to send back
        vendors.forEach(function(vendor) {
            outResponse.vendors.push({
                VendorId: vendor.getId(),
                VendorName: vendor.getValue(Constant.NsField.Vendor.VendorName)
            });
        });
    }

    //Set response status to OK
    outResponse.status = Constant.Response.Status.Ok;
    outResponse.message = null;

    //Lets return the final response
    return outResponse;
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
 * Get jtable css after replacing the image URLs
 */
function getJtableCss() {
    var jtable_css = nlapiLoadFile(Constant.File.Jtable_css_blue);
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
 * Set purchase order status
 * @param poNumber => Purchase order internal ID
 * @param status => status to set
 */
function setPoStatus(poNumber, status) {

    //TODO: Lets move this method to shared file between admin & vendor side

    //Get current PO status, and decide if we need to changes the status
    try {
        var poRecord = nlapiLoadRecord(Constant.NsRecordType.PurchaseOrder, poNumber);
        var currentStatus = null;
        if(!!poRecord) {
            currentStatus = poRecord.getFieldValue(Constant.NsField.PurchaseOrder.VendorOrderStatus);
            log("Current PO status = " + currentStatus, "New Status = " + status);

            if(status == currentStatus ||
                (currentStatus == Constant.OrderStatus.ReadPendingChanges.Value && (status == Constant.OrderStatus.ReadUnaccepted.Value || status == Constant.OrderStatus.New.Value)) ||
                (currentStatus == Constant.OrderStatus.Accepted.Value && status != Constant.OrderStatus.InTransit.Value))
                return;

            /*if(status == Constant.OrderStatus.Accepted.Value) {
                //Add to parent record as well
                nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber,
                    Constant.NsField.PurchaseOrder.VendorOrderStatusParent, Constant.OrderStatusParent.ReadUnaccepted.Value);
            }
            else if(status == Constant.OrderStatus.InTransit.Value) {
                //Add to parent record as well
                nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber,
                    Constant.NsField.PurchaseOrder.VendorOrderStatusParent, Constant.OrderStatusParent.Accepted.Value);
            }*/

            //Set child status, we can submit both at once, but the parent updation is rare
            nlapiSubmitField(Constant.NsRecordType.PurchaseOrder, poNumber, Constant.NsField.PurchaseOrder.VendorOrderStatus, status);
        }
    }
    catch(e) {
        log(e.name, e.message, Constant.LogLevel.Error);
    }
}


/**
 * Gets the equivalent parent ID using child ID
 * @param childId
 */
/*function getParentStatusId(childId) {
    var childDisplay = null, parentId = null;

    log("Getting parent status Id");

    //Get the display text of child
    for(var i in Constant.OrderStatus) {
        if(Constant.OrderStatus[i].Value == childId) {
            childDisplay = Constant.OrderStatus[i].Display;
        }
    }

    //using the display text of child, get the parent ID
    for(var i in Constant.OrderStatusParent) {
        if(Constant.OrderStatusParent[i].Display == childDisplay) {
            parentId = Constant.OrderStatusParent[i].Value;

            log("getParentStatusId", "child display = " + childDisplay + ", Parent display = " +
                Constant.OrderStatusParent[i].Display);
        }
    }

    //Return corresponding parent or un-processed
    return parentId || Constant.OrderStatusParent.Unprocessed.Value;
}*/


/**
 * Format the number as #.##
 * @param oldVal any string numeric value
 * @returns #.##
 */
function formatFloat(oldVal) {

    var newVal = oldVal;
    if(oldVal.indexOf(".") == -1) { //Not a decimal number
        newVal = newVal + ".";
    }

    //Add trailing zeros (max 2)
    while(!(newVal.indexOf(".") + 2 < newVal.length)) {
        newVal = newVal + "0";
    }

    //Add leading zero if not already added
    if(newVal.indexOf(".") == 0) {
        newVal = "0" + newVal;
    }

    //Return the final value
    return newVal;
}
