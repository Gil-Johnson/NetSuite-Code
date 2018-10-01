/**
 * Created by Hassan on 4/02/14.
 */

// create the controller and inject Angular's $scope, $routeParams and portalService
vendorPortalApp.controller('poDetailController', function($scope, portalService, $routeParams) {
    if(portalService.ensureLogin()) {
        $scope.VendorName = portalService.vendorName();
        $scope.isNewOrder = $routeParams.poType == "new"? true : false;
        $scope.PoDetailHeading = $scope.isNewOrder ? "Unacknowledged Purchase Orders" : "Acknowledged Purchase Order Details";
        $scope.PdfImage = Constants.URLs.printPdfImage;

        //Set confirm changes div as a modal popup (jQuery UI)
        $("#dialog-confirm-accept").dialog({
            modal: true,
            autoOpen: false,
            buttons: {
                No: function() {
                    $(this).dialog("close");
                },
                Yes: function() {
                    portalService.NsApi.acceptPurchaseOrder($routeParams.purchaseOrderId)
                        .success(function(response) {
                            //if the response is plain string, parse it to JSON
                            if(typeof response == "string")
                                response = JSON.parse(response);

                            //Now close the dialog
                            $("#dialog-confirm-accept").dialog("close");

                            if(response.status == Constants.Status.Ok) {
                                //Success response

                                //Set the success response cookie
                                $.cookie(Constants.Cookie.SuccessResponse, Constants.Messages.OrderAccepted, { expires: Constants.Config.cookieExpiry, path: '/' });

                                //Send the request to Dashboard
                                portalService.safeRedirect(Constants.Location.Dashboard);
                            }
                            else {
                                //Some error from server, lets show it to user
                                handleError(response.message, response.multipleLogin);
                            }
                        });
                }
            }
        });

        $("#dialog-custom-message").dialog({
            modal: true,
            autoOpen: false
        });


        /**
         * Event handler for page load
         */
        $scope.pageLoad = function() {

            //Check if we have some message available
            if(!!$.cookie(Constants.Cookie.NavigationMessage)) {
                handleError($.cookie(Constants.Cookie.NavigationMessage));

                //Delete that cookie
                $.removeCookie(Constants.Cookie.NavigationMessage, { path: '/' });
            }

            $("img.progressDownloading").attr("src", Constants.URLs.LoadingImg);
            $("img.progressDownloadingProdFiles").attr("src", Constants.URLs.LoadingImg);

            window.prodFilesSelection = []; window.updateInternal = false; window.isClearingSelection = false;

            //Initialize PO Detail Grid
            $("#searchResultContainerItemList").jtable({
                title: 'Items',
                paging: true,
                pageSize: 1000,
                clientBinding: true,
                selecting: true, //Enable selecting
                multiselect: true, //Allow multiple selecting
                selectingCheckboxes: true, //Show checkboxes on first column
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
                        width: '30%'
                    },
                    UpcCode: {
                        title: 'UPC',
                        width: '8%'
                    },
                    Sku: {
                        title: 'SKU',
                        width: '8%'
                    },
                    RetailPrice: {
                        title: 'Retail $',
                        width: '8%'
                    },
                    ExpectedReceiptDate: {
                        title: 'Expctd Rcpt Date',
                        width: '15%'
                    },
                    Quantity: {
                        title: 'Quantity',
                        width: '8%'
                    },
                    Received: {
                        title: 'Received',
                        width: '8%'
                    },
                    Billed: {
                        title: 'Billed',
                        width: '8%'
                    },
                    Rate: {
                        title: 'Rate',
                        width: '13%'
                    }
                },
                selectionChanged: onItemSelectionChange
            });

            //Disable the select all checkbox
            $(".jtable thead input").attr("disabled", "disabled");

            //Get Data for PO Details
            portalService.NsApi.getPurchaseOrderDetail($routeParams.purchaseOrderId)
                .success(function (response) {
                    //if the response is plain string, parse it to JSON
                    if(typeof response == "string")
                        response = JSON.parse(response);

                    if(response.status == Constants.Status.Ok) {
                        //Success response
                        portalService.log(response);

                        //Add PO Detail Data
                        $("#searchResultContainerItemList").jtable('loadClient', response.PurchaseOrderDetail);
                        $scope.PurchaseOrderNumber = response.PoNumber || Constants.PartialStrings.NoValue;
                        $scope.ReceiveBy = response.ReceiveBy || Constants.PartialStrings.NoValue;
                        $scope.ShipDate = response.ShipDate || Constants.PartialStrings.NoValue;
                        $scope.ShipToAddress = response.ShipToAddress || Constants.PartialStrings.NoValue;
                        $scope.VendorAddress = response.VendorAddress || Constants.PartialStrings.NoValue;
                        $scope.Warehouse = response.Warehouse || Constants.PartialStrings.NoValue;
                        $scope.CancelDate = response.CancelDate || Constants.PartialStrings.NoValue;
                        $scope.isAcceptedOrder = response.IsAcceptedOrder;
                        $scope.ShippingInstructions = response.ShippingInstructions;

                        fadeOutFulfilledLines();
                    }
                    else {
                        //Some error from server, lets show it to user
                        handleError(response.message, response.multipleLogin);
                    }
                });

        };

        /**
         * Click event handler for request changes button
         */
        $scope.requestChanges = function() {
            portalService.log("Request Changes clicked");
            portalService.safeRedirect(Constants.Location.RequestChanges.replace(":purchaseOrderId", $routeParams.purchaseOrderId).replace(":poType", $routeParams.poType));
        };

        /**
         * Click event handler for accept order button
         */
        $scope.acceptOrder = function() {
            portalService.log("Acknowledge order clicked");
            //Are you sure you want to accept?
            $("#dialog-confirm-accept").dialog('open');
        };

        /**
         * Click event handler for download specs sheet button
         */
        $scope.downloadSpecsSheet = function() {
            portalService.log("Download specs sheet clicked");

            //Show the download progress
            $(".downloadSpecsSheetSpan").hide();
            $(".progressDownloading").show();
            $(".btnDownloadSpecsSheet").attr("disabled", "disabled");

            portalService.NsApi.getSpecsSheetData($routeParams.purchaseOrderId)
                .success(function(response) {
                    //if the response is plain string, parse it to JSON
                    if(typeof response == "string")
                        response = JSON.parse(response);


                    portalService.log(response);
                    if(response.status == Constants.Status.Ok) {
                        //Success response

                        //We have got the data to send to php server, lets do it!
                        portalService.getSpecSheetPdf(response)
                            .success(function(pdfResponse) {
                                //if the response is plain string, parse it to JSON
                                if(typeof pdfResponse == "string")
                                    pdfResponse = JSON.parse(pdfResponse);

                                portalService.log("Response from php received");
                                portalService.log(pdfResponse);


                                if(pdfResponse.status == Constants.Status.Ok) {
                                    checkDownloadStatus(pdfResponse);
                                }
                                else {
                                    handleDownloadFail();
                                }
                            });
                    }
                    else {
                        //Hide the download progress
                        downloadSpecsSheetDone();

                        //Some error from server, lets show it to user
                        handleError(response.message, response.multipleLogin);
                    }
                });
        };

        /**
         * Click event handler for download production files button
         */
        $scope.downloadProdFiles = function() {
            portalService.log("Download production files clicked");

            //Get the selected items and ensure if its less than max allowed files
            if(!!prodFilesSelection && prodFilesSelection.length > 0) {

                if(prodFilesSelection.length <= Constants.Config.maxProductionFiles) {
                    //Show the download progress
                    $(".downloadProdFilesSpan").hide();
                    $(".progressDownloadingProdFiles").show();
                    $(".btnDownloadProdFiles").attr("disabled", "disabled");

                    var selectedItems = [];
                    for (var i=0;i<prodFilesSelection.length;i++) {
                        selectedItems[i] = $(prodFilesSelection[i]).data('record').ItemId;
                    }

                    portalService.NsApi.getProdFilesData($routeParams.purchaseOrderId, selectedItems)
                        .success(function(response) {
                            //if the response is plain string, parse it to JSON
                            if(typeof response == "string")
                                response = JSON.parse(response);


                            portalService.log(response);
                            if(response.status == Constants.Status.Ok) {
                                //Success response

                                if(!!response.prodFiles && response.prodFiles.length > 0) {

                                }
                                else {
                                    //Hide the download progress
                                    hideDownloadProgressProdFiles();

                                    //Some error from server, lets show it to user
                                    handleError(Constants.Messages.NoProdFiles);
                                }

                                //We have got the data to send to iis server, lets do it!
                                portalService.getProdFilesArchive(response)
                                    .success(function(zipResponse) {
                                        //if the response is plain string, parse it to JSON
                                        if(typeof zipResponse == "string")
                                            zipResponse = JSON.parse(zipResponse);

                                        portalService.log("Response from web api received");
                                        portalService.log(zipResponse);


                                        if(zipResponse.status == Constants.Status.Ok) {
                                            portalService.log("Prod Files download URL = " + zipResponse.prodFileURL);
                                            //window.location.href = zipResponse.prodFileURL;

                                            //Hack: Since we have concatenated the virtual directory from the actual URL,
                                            //so appending it here until the next server release
                                            window.open(zipResponse.prodFileURL.replace(".com/ZipArchive", ".com/folio3/ZipArchive"));

                                            downloadProdFilesComplete();
                                        }
                                        else if (zipResponse.status == Constants.Status.Error) {
                                            //Some error from server, lets show it to user
                                            handleError(zipResponse.message || Constants.Messages.UnexpectedError);
                                        }

                                        //Hide the download progress
                                        hideDownloadProgressProdFiles();
                                    });
                            }
                            else {

                                //Hide the download progress
                                hideDownloadProgressProdFiles();

                                //Some error from server, lets show it to user
                                handleError(response.message, response.multipleLogin);
                            }
                        });
                }
                else {
                    //Please review your selection
                    showDialog(Constants.PartialStrings.InvalidSelection, Constants.Messages.MaxSelectionSizeReached());
                }

            }
            else {
                //No item selected
                showDialog(Constants.PartialStrings.InvalidSelection, Constants.Messages.SelectAtleastOneItem);
            }

        };

        /**
         * Click event handler for back button
         */
        $scope.backButtonClick = function() {
            portalService.log("Back button clicked");
            portalService.safeRedirect(Constants.Location.Dashboard);
        };

        /**
         * Click event handler for PDF print
         */
        $scope.printPDF = function() {
            portalService.log("Print button clicked, URL = " + Constants.URLs.getPrintPdf($routeParams.purchaseOrderId));
            portalService.safeRedirect(Constants.URLs.getPrintPdf($routeParams.purchaseOrderId), true);
        }
    }

    /**
     * Check if any of the item row's received quantity is greater or equal to quantity (fulfilled), fade out that line
     */
    function fadeOutFulfilledLines() {
        portalService.log("fading out fulfilled lines");

        //Find item rows
        var itemRows = $("#searchResultContainerItemList").find('.jtable-data-row');
        if(!!itemRows && itemRows.length > 0) {
            itemRows.each(function(row) {
                //Get data from each row
                var data = $(itemRows[row]).data('record');
                if(!!data) {
                    //Where original qty - amount rec'd is > 0 AND amount billed is > amount rec'd then make line grey color
                    if((parseInt(data.Quantity) - parseInt(data.Received) > 0) && parseInt(data.Billed) > parseInt(data.Received) ) {
                        //Fade the row to lightgray color
                        $(itemRows[row]).css("color", "lightgray");
                    }
                }
            });

        }
    }

    /**
     * Actions to perform on production files download completion
     */
    function downloadProdFilesComplete() {
        onItemSelectionChange(null, null, true);
    }

    /**
     * Event handler for item selection change on grid
     * @param event
     * @param data
     * @param disableSelected
     */
    function onItemSelectionChange(event, data, disableSelected) {
        var selectedRows = $('#searchResultContainerItemList').jtable('selectedRows');
        if(!!disableSelected) {
            isClearingSelection = true;
            for(var i=0; i < selectedRows.length; i++) {
                $(selectedRows[i]).find("input[type=checkbox]").click();
            }

            isClearingSelection = false;
        }
        else {
            if(selectedRows.length > Constants.Config.maxProductionFiles && !isClearingSelection) {
                portalService.log("Selected files are more than allowed!");

                //Please review your selection
                showDialog(Constants.PartialStrings.InvalidSelection, Constants.Messages.MaxSelectionSizeReached());
                updateInternal = true;
                for(var i=0; i < selectedRows.length; i++) {
                    //selectedRows[i].click();
                    $(selectedRows[i]).find("input[type=checkbox]").click();
                }
                updateInternal = false;

                portalService.log("prodFiles = " + prodFilesSelection.length);
                $('#searchResultContainerItemList').jtable('selectRows', prodFilesSelection);
            }
            else {
                if(!updateInternal)
                    prodFilesSelection = selectedRows;
            }
        }
    }

    /**
     * Handler for specs sheet download failure
     */
    function handleDownloadFail() {
        handleError(Constants.Messages.ErrorProcessingRequest);
        //Hide the download progress
        downloadSpecsSheetDone();
    }

    /**
     * Hide the downloading progress of download production files
     */
    function hideDownloadProgressProdFiles() {
        $(".downloadProdFilesSpan").show();
        $(".progressDownloadingProdFiles").hide();
        $(".btnDownloadProdFiles").removeAttr("disabled");
    }

    /**
     * Check download status of specs sheet
     * @param postData
     */
    function checkDownloadStatus(postData) {
        //Already checked, its an object and status = OK

        var eta = postData.ETA;
        var uid = postData.UID;

        if(eta == "0") {
            var isWindowOpen = false;
            //Ready to download
            var url = postData.url;
            if(!!url && url.indexOf('.pdf') >= 0) {
                //ensure if this contains .pdf, then open it

                isWindowOpen = true;
                setTimeout(function(){
                    window.open(url);
                    //Finished downloading
                    downloadSpecsSheetDone();
                }, 1000);
            }
            if(!isWindowOpen){
                //Finished downloading
                downloadSpecsSheetDone();
            }
        }
        else if(eta > "0") {
            setTimeout(function() {
                $.support.cors = true; //Enable CORS
                $.ajax({
                    //Hack: Added reqid to make every response unique, or else IE will consider it a 304
                    url: Constants.URLs.downloadSpecSheetStatusUrl + "?reqid=" + Math.floor((Math.random()*1000)+1),
                    type: "GET",
                    data: {
                        folderName: uid,
                        poNumber: $scope.PurchaseOrderNumber
                    }})
                    .fail(function(err) {
                        handleDownloadFail();
                    })
                    .done(function(data){
                        if(typeof data != "object")
                            data = JSON.parse(data);
                        if(!!data && data.status == Constants.Status.Ok) {
                            checkDownloadStatus(data);
                        }
                        else {
                            handleDownloadFail();
                        }
                    });
            }, eta);
        }
        else {
            //Some error occurred
            handleDownloadFail();
        }
    }

    /**
     * Handler for specs sheet download complete
     */
    function downloadSpecsSheetDone() {
        $(".downloadSpecsSheetSpan").show();
        $(".progressDownloading").hide();
        $(".btnDownloadSpecsSheet").removeAttr("disabled");
    }

    /**
     * Set the summary error message on page
     * @param message => Message to display
     * @param multipleLogin => check if this request was affected by multiple login issue
     */
    function handleError(message, multipleLogin) {
        $scope.errorMessage = message;
        if(!!multipleLogin) {
            //Delete all cookies
            portalService.deleteAllCookies();

            //keep the error message as navigation message to show on next page
            $.cookie(Constants.Cookie.NavigationMessage, message, { expires: Constants.Config.cookieExpiry, path: '/' });

            //Redirect to login page
            portalService.redirect(Constants.Location.Login);
        }
    }

    /**
     * Displays the jQuery UI dialog box
     * @param title         Title of the box
     * @param message       Message to display
     * @param isNotInfoOnly If the dialog box is to have YES & NO events
     * @param onYesClick    Event call on YES click
     */
    function showDialog(title, message, isNotInfoOnly, onYesClick) {

        $("#dialog-custom-message").dialog("option", "buttons", !!isNotInfoOnly ? [{ text: "No",
            click: function() { $("#dialog-custom-message").dialog("close"); } }, { text: "Yes", click: onYesClick }] :
            [ { text: "Ok", click: function() { $("#dialog-custom-message").dialog("close"); } }]);

        $("#dialog-custom-message").dialog("option", "title", title);
        $("#dialog-custom-message p").text(message);
        $("#dialog-custom-message").dialog('open');
    }
});
