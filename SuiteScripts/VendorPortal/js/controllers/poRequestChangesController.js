/**
 * Created by Hassan on 4/6/14.
 */

// create the controller and inject Angular's $scope, $routeParams and portalService
vendorPortalApp.controller('poRequestChangesController', function($scope, portalService, $routeParams) {
    portalService.log("Request Changes Controller");

    //Ensure the request is from logged-in user
    if(portalService.ensureLogin()) {
        var receiveByDate = null;
        $scope.VendorName = portalService.vendorName();

        //Set confirm changes div as a modal popup (jQuery UI)
        $("#dialog-confirm-changes").dialog({
            modal: true,
            autoOpen: false,
            buttons: {
                No: function() {
                    $(this).dialog("close");
                },
                Yes: function() {
                    $(this).dialog("close");
                    requestChanges();
                }
            }
        });

        //
        //Set confirm updateReceiveBy div as a modal popup (jQuery UI)
        $("#dialog-confirm-update-receiveBy").dialog({
            modal: true,
            autoOpen: false,
            buttons: {
                Cancel: function() {
                    $(this).dialog("close");
                    //We do not want this date, reset to default
                    if(receiveByDate != null)
                        $("#receiveByDate").val(receiveByDate);
                },
                Yes: function() {
                    //requestChangesInternal(postDataInternal);
                    $(this).dialog("close");
                }
            }
        });

        /**
         * Event handler for page load
         */
        $scope.pageLoad = function() {

            //Initialize PO Detail Grid
            $("#searchResultContainerItemList").jtable({
                title: 'Items',
                paging: true,
                pageSize: 5, //Temporarily increasing page size to avoid issue while request changes
                clientBinding : true,
                fields: {
                    Id: {
                        key: true,
                        create: false,
                        edit: false,
                        list: false
                    },
                    Thumbnail: {
                        title: 'Thumbnail',
                        width: '8%',
                        display: function (data) {
                            return '<img name="thumbnail" src="'+ data.record.Thumbnail+'" width="65px"  />';
                        }
                    },
                    Item: {
                        title: 'Item',
                        width: '10%'
                    },
                    Description: {
                        title: 'Description',
                        width: '35%'
                    },
                    ExpectedReceiptDate: {
                        title: 'Expected Receipt Date',
                        width: '10%'
                    },
                    NewReceiptDate: {
                        title: "New Rec. Date",
                        width: '10%',
                        display: function (data) {
                            return '<input type="text" id="rec_date_'+data.record.Id+'" name="rec_date_'+data.record.Id + '_' + data.record.ItemId + '" value="'+ data.record.NewReceiptDate +'" onblur="dataUpdate(this)" required />';
                        }
                    },
                    Quantity: {
                        title: 'Qty',
                        width: '10%'
                    },
                    NewQty: {
                        title: "New Qty",
                        width: '10%',
                        display: function (data) {
                            return '<input type="text" id="qty_'+data.record.Id+'" name="qty_'+data.record.Id + '_' + data.record.ItemId + '" value="'+ data.record.NewQty +'" onblur="dataUpdate(this)" required />';
                        }
                    },
                    Rate: {
                        title: 'Rate',
                        width: '15%'
                    },
                    NewRate: {
                        title: "New Rate",
                        width: '10%',
                        display: function (data) {
                            return '<input type="text" id="rate_'+data.record.Id+'" name="rate_'+data.record.Id + '_' + data.record.ItemId + '" value="'+ data.record.NewRate +'" onblur="dataUpdate(this)" required />';
                        }
                    }
                }
            });

            //Get Data for PO Details
            portalService.NsApi.getPurchaseOrderDetail($routeParams.purchaseOrderId)
                .success(function (response) {
                    //if the response is plain string, parse it to JSON
                    if(typeof response == "string")
                        response = JSON.parse(response);

                    if(response.status == "OK") {
                        //Success response


                        //Set NewQty & NewRate variable to response
                        for (var i in response.PurchaseOrderDetail.Records) {
                            response.PurchaseOrderDetail.Records[i].NewQty = response.PurchaseOrderDetail.Records[i].Quantity;
                            response.PurchaseOrderDetail.Records[i].NewRate = response.PurchaseOrderDetail.Records[i].Rate;
                            response.PurchaseOrderDetail.Records[i].NewReceiptDate = response.PurchaseOrderDetail.Records[i].ExpectedReceiptDate;
                        }

                        //Save data for editing
                        $("body").data("poDetailData", response);

                        //save it for future use
                        receiveByDate = response.ReceiveBy || Constants.PartialStrings.Empty;

                        //Add PO Detail Data
                        $("#searchResultContainerItemList").jtable('loadClient', response.PurchaseOrderDetail);
                        $scope.PurchaseOrderNumber = response.PoNumber || Constants.PartialStrings.NoValue;
                        $scope.ReceiveBy = response.ReceiveBy || Constants.PartialStrings.Empty;
                        $scope.ShipDate = response.ShipDate;
                        $scope.ShipToAddress = response.ShipToAddress || Constants.PartialStrings.NoValue;
                        $scope.VendorAddress = response.VendorAddress || Constants.PartialStrings.NoValue;
                        $scope.Warehouse = response.Warehouse || Constants.PartialStrings.NoValue;
                        $scope.CancelDate = response.CancelDate || Constants.PartialStrings.Empty;
                        $scope.OrderStatus = response.OrderStatus;
                        $scope.Comments = response.Comments;
                    }
                    else {
                        //Some error from server, lets show it to user
                        handleError(null, response.message, response.multipleLogin);
                    }
                });

        }

        //Set the date boxes as date picker (jQuery UI)
        $("#shipDate").datepicker({ dateFormat : "m/d/yy" });
        $("#cancelDate").datepicker({ dateFormat : "m/d/yy" });
        $("#receiveByDate").datepicker({ dateFormat : "m/d/yy" });

        /**
         * Click event handler for save changes button
         */
        $scope.saveChanges = function() {
            portalService.log("Save Changes clicked");
            portalService.log("Order status = " + $scope.OrderStatus);
            if(!!$scope.OrderStatus && $scope.OrderStatus.indexOf("PENDING CHANGES") >= 0) {
                //Ask for user's confirmation
                //$("#dialog-confirm-changes").dialog('open');
                requestChanges($scope, true);
            }
            else {
                requestChanges($scope);
            }
        }

        function requestChanges($scope, openDialog) {
            var data = getPostData();
            if(!data.validationError) {
                if(!!openDialog) {
                    //Ask for user's confirmation
                    $("#dialog-confirm-changes").dialog('open');
                }
                else {
                    portalService.NsApi.requestChanges(data)
                        .success(function(response) {
                            //if the response is plain string, parse it to JSON
                            if(typeof response == "string")
                                response = JSON.parse(response);

                            if(response.status == "OK") {
                                //Success response

                                portalService.log("save changes success response received");
                                $.cookie(Constants.Cookie.NavigationMessage, Constants.Messages.ChangesRequested, { expires: Constants.Config.cookieExpiry, path: '/' });
                                //Since we want it to fall under un-accepted category, so PoType should be NEW
                                portalService.safeRedirect(Constants.Location.PurchaseOrderDetails.replace(":purchaseOrderId", $routeParams.purchaseOrderId).replace(":poType", "new"));
                            }
                            else {
                                portalService.log("save changes failure response");
                                //Some error from server, lets show it to user
                                handleError(null, response.message, response.multipleLogin);
                            }
                        });
                }
            }
            else {
                handleError($scope, Constants.Messages.ValidationError);
                portalService.log("validation error occurred!");
            }
        }

        $scope.cancelChanges = function() {
            portalService.log("Cancel Changes clicked");

            //On cancel, redirect back to po detail page
            portalService.safeRedirect(Constants.Location.PurchaseOrderDetails.replace(":purchaseOrderId", $routeParams.purchaseOrderId).replace(":poType", $routeParams.poType));
        }

        /**
         * On change event handler for receiveBy date
         */
        $scope.receiveByChanged = function() {
            //Ask for user's confirmation
            $("#dialog-confirm-update-receiveBy").dialog('open');
        }
    }

    /**
     * Set the summary error message on page
     * @param message => Message to display
     * @param multipleLogin => check if this request was affected by multiple login issue
     */
    function handleError($scope, message, multipleLogin) {
        if(!!multipleLogin) {
            //Delete all cookies
            portalService.deleteAllCookies();

            //keep the error message as navigation message to show on next page
            $.cookie(Constants.Cookie.NavigationMessage, message, { expires: Constants.Config.cookieExpiry, path: '/' });

            //Redirect to login page
            portalService.redirect(Constants.Location.Login);
        }
        else {
            $scope.errorMessage = message;
        }
    }


    /**
     * Get the values of input fields to be used as POST data
     * @returns {object} => postData to POST on API
     */
    function getPostData() {
        var postData = {
            shipDate: $("#shipDate").val(),
            cancelDate: $("#cancelDate").val(),
            orderNumber: $routeParams.purchaseOrderId,
            receiveBy: $("#receiveByDate").val(),
            comments: $("#comments").val(),
            validationError: false
        };

        //Remove any existing validation error
        $(".field-validation-error").removeClass("field-validation-error");


        /**
         * Check if the date is valid
         * @param txtDate the Date
         * @returns {boolean} true if valid, false otherwise
         */
        var isValidDate = function (txtDate)
        {
            var reg = /^([1-9]|1[012])([\/\/])([1-9]|[12][0-9]|3[01])\2(\d{4})$/;
            return reg.test(txtDate);
        };

        //Get data from body
        var mainData = $("body").data("poDetailData").PurchaseOrderDetail.Records;
        if(!!mainData && mainData.length > 0) {
            var tempDetail = {}, index = null;
            mainData.forEach(function(data) {
                index = data.Id + "_" + data.ItemId;

                if(!data.NewRate || !$.isNumeric(data.NewRate)) {
                    postData.validationError = true;
                    //Error occurred
                    $("#rate_" + data.Id).addClass("field-validation-error");
                }
                if(!data.NewQty || !$.isNumeric(data.NewQty) || parseInt(data.NewQty) != data.NewQty) {
                    postData.validationError = true;
                    //Error occurred
                    $("#qty_" + data.Id).addClass("field-validation-error");
                }
                if(!data.NewReceiptDate || !isValidDate(data.NewReceiptDate)) {
                    postData.validationError = true;
                    //Error occurred
                    $("#rec_date_" + data.Id).addClass("field-validation-error");
                }

                tempDetail[index] = {
                    rate: data.NewRate,
                    quantity: data.NewQty,
                    receiptDate: data.NewReceiptDate
                };
            });
            postData.itemDetails = JSON.stringify(tempDetail);
        }

        //Check if user's entered date is valid
        if(!isValidDate($("#shipDate").val())) {
            $("#shipDate").addClass("field-validation-error");
            postData.validationError = true;
        }
        //If cancel date is entered, then validate it else ignore it
        if(!!$("#cancelDate").val() && !isValidDate($("#cancelDate").val())) {
            $("#cancelDate").addClass("field-validation-error");
            postData.validationError = true;
        }
        else if(!!$("#cancelDate").val() && isValidDate($("#cancelDate").val())) {
            //Ship date should be greater than cancel date
            var shipDate = new Date($("#shipDate").val());
            var cancelDate = new Date($("#cancelDate").val());
            if(cancelDate < shipDate) {
                $("#cancelDate").addClass("field-validation-error");
                postData.validationError = true;
            }
        }

        //If receive by date is entered, then validate it else ignore it
        if(!!$("#receiveByDate").val() && !isValidDate($("#receiveByDate").val())) {
            $("#receiveByDate").addClass("field-validation-error");
            postData.validationError = true;
        }

        return postData;
    }

    //On blur update the data
    window.dataUpdate = function (elem) {
        elem = $(elem);

        for(var i in $("body").data("poDetailData").PurchaseOrderDetail.Records) {
            if(elem.attr("name").indexOf("qty_") > -1) {
                if(elem.attr("name").split("qty_")[1].indexOf($("body").data("poDetailData").PurchaseOrderDetail.Records[i].Id + "_") > -1) {
                    $("body").data("poDetailData").PurchaseOrderDetail.Records[i].NewQty = elem.val();
                    //Since this function intended to update the value for a single element, so break the loop
                    return false;
                }
            }
            else if(elem.attr("name").indexOf("rate_") > -1) {
                if(elem.attr("name").split("rate_")[1].indexOf($("body").data("poDetailData").PurchaseOrderDetail.Records[i].Id + "_") > -1) {
                    $("body").data("poDetailData").PurchaseOrderDetail.Records[i].NewRate = elem.val();
                    //Since this function intended to update the value for a single element, so break the loop
                    return false;
                }
            }
            else if(elem.attr("name").indexOf("rec_date_") > -1) {
                if(elem.attr("name").split("rec_date_")[1].indexOf($("body").data("poDetailData").PurchaseOrderDetail.Records[i].Id + "_") > -1) {

                    var date = elem.val();
                    //Check if we have malformed date, correct it
                    if(date.indexOf("/") > 0) {
                        if(date.split("/")[2].length <= 2) {
                            date = date.split("/")[0] + "/" + date.split("/")[1] + "/20" + date.split("/")[2];
                            elem.val(date);
                        }
                    }
                    $("body").data("poDetailData").PurchaseOrderDetail.Records[i].NewReceiptDate = date;
                    //Since this function intended to update the value for a single element, so break the loop
                    return false;
                }
            }
        }
    }
});