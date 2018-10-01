/**
 * Created by Hassan on 4/17/14.
 */

var Constants = {
    PageUrl: "https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=80&deploy=1",
    Messages: {
        AcceptChanges: "Are you sure you want to accept changes?",
        RejectChanges: "Are you sure you want to reject changes?",
        SuccessfullyAcceptChanges: "Your changes are successfully accepted.",
        FailureAcceptChanges: "There was an error accepting your changes, please try again later.",
        SuccessfullyRejectChanges: "Your changes are successfully rejected.",
        FailureRejectChanges: "There was an error rejecting your changes, please try again later.",
        LineItemsNotChanged: "There were no changes in line items."
    },
    QueryStringParam: {
        RejectChanges: "reject-changes",
        AcceptChanges:"accept-changes",
        Method: "method",
        Value: {
            Success: "success",
            Failure: "failure",
            GetPoChangesDetail: "getPoChangesDetail"
        }
    }
}

//On DOM ready
$(function() {
    //Check if we are on detail or listing screen
    if(!!getQueryStringParam(Constants.QueryStringParam.Method) &&
        getQueryStringParam(Constants.QueryStringParam.Method) == Constants.QueryStringParam.Value.GetPoChangesDetail) {

        $("#panelListingPage").hide();
        $("#panelDetailsPage").show();
        handleChangesDetailScreen();
    }
    else {
        $("#panelDetailsPage").hide();
        $("#panelListingPage").show();
        handleChangesListingScreen();
    }

    //Hack: Make the grid container width same as window width
    $(".gridContainer").width($(window).width() - 20);
});

/**
 * Handler for PO Changes listing screen
 */
function handleChangesListingScreen() {
    //Initialize PO Detail Grid
    $("#searchResultContainerItemList").jtable({
        title: 'Purchase Order Details',
        paging: true,
        pageSize: 5,
        clientBinding : true,
        fields: {
            Id: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            OrderNumber: {
                title: 'PO Number',
                width: '25%'
            },
            PoCreationDate: {
                title: 'Created Date',
                width: '25%'
            },
            ChangeRequestDate: {
                title: 'Change Request Date',
                width: '25%'
            },
            ViewChanges: {
                title: 'View Changes',
                width: '25%',
                display: function(data) {
                    return "<a href='" + Constants.PageUrl + "&method=getPoChangesDetail&changeId=" + data.record.Id + "'>View</a>";
                }
            }
        }
    });

    //Check if we have a success or failure on accept/reject changes
    var acceptChanges = getQueryStringParam(Constants.QueryStringParam.AcceptChanges);
    var rejectChanges = getQueryStringParam(Constants.QueryStringParam.RejectChanges);
    if(!!acceptChanges || !!rejectChanges) {

        //Start setting a message
        var message = "";

        //Lets see if it was an error or success, and show the div style accordingly
        if(acceptChanges == Constants.QueryStringParam.Value.Failure || rejectChanges == Constants.QueryStringParam.Value.Failure) {
            //Arrgghhh!!! Why you come here :(
            message = !!acceptChanges ? Constants.Messages.FailureAcceptChanges : Constants.Messages.FailureRejectChanges;
            message = "<b>ERROR: </b>" + message;
            $("#divMessageBox").addClass("ui-state-error");
        }
        else {
            //Great! No errors!! :)
            message = !!acceptChanges ? Constants.Messages.SuccessfullyAcceptChanges : Constants.Messages.SuccessfullyRejectChanges;
            message = "<b>SUCCESS: </b>" + message;
            $("#divMessageBox").addClass("ui-state-highlight");
        }
        $("#divMessageBox span").html(message);

        //Ready to be displayed!
        $("#divMessageBox").show();
    }

    //Call it on first go, to get all vendors by default
    evtVendorChange();

    $.ajax({
        url: Constants.PageUrl,
        data: {method:"getVendorList"},
        type: "POST"
    }).done(function( data ) {
            if(typeof data == "string")
                data = JSON.parse(data);

            if(!!data && data.status == "OK") {
                data.vendors.forEach(function(vendor) {
                    $("#selectVendorList")
                        .append($("<option></option>")
                            .attr("value", vendor.VendorId)
                            .text(vendor.VendorName));
                });
            }
        });

}

/**
 * On change event listener for vendors select list
 */
function evtVendorChange() {
    //Get value of vendor selection list
    var selectedVendorId = $("#selectVendorList").val();

    //Avoid ajax request if somehow no option is selected
    if(!!selectedVendorId) {
        $.ajax({
            url: Constants.PageUrl,
            data: {method:"getPoChangesByVendor", vendorId: selectedVendorId},
            type: "POST"
        }).done(function(response) {
                if(typeof response == "string")
                    response = JSON.parse(response);

                if(!!response && response.status == "OK") {
                    //Got the purchase orders? lets load them all
                    $("#searchResultContainerItemList").jtable('loadClient', response.purchaseOrders);
                }
            });
    }
}

/**
 * Handler for PO Change detail screen
 */
function handleChangesDetailScreen() {
    //Initialize PO Detail Grid
    $("#searchResultContainerItemList").jtable({
        title: 'Purchase Order Details',
        paging: true,
        pageSize: 5,
        clientBinding : true,
        fields: {
            Id: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            Item: {
                title: 'Item',
                width: '8%'
            },
            Quantity: {
                title: 'Quantity',
                width: '8%'
            },
            NewQty: {
                title: 'New Qty',
                width: '8%',
                display: function(data) {
                    return ((data.record.NewQty !=  data.record.Quantity) ? "<span style='color: red; font-weight: bolder'>" : "<span>") +data.record.NewQty+"</span>";
                }
            },
            Received: {
                title: 'Received',
                width: '10%'
            },
            Billed: {
                title: 'Billed',
                width: '8%'
            },
            Description: {
                title: 'Description',
                width: '20%'
            },
            Rate: {
                title: 'Rate',
                width: '5%'
            },
            NewRate: {
                title: 'New Rate',
                width: '8%',
                display: function(data) {
                    return ((data.record.NewRate !=  data.record.Rate) ? "<span style='color: red; font-weight: bolder'>" : "<span>") +data.record.NewRate+"</span>";
                }
            },
            ExpectedReceiptDate: {
                title: 'Expected Receipt Date',
                width: '15%'
            },
            NewReceiptDate: {
                title: 'New Rec. Date',
                width: '15%',
                display: function(data) {
                    return ((data.record.NewReceiptDate !=  data.record.ExpectedReceiptDate) ? "<span style='color: red; font-weight: bolder'>" : "<span>") +data.record.NewReceiptDate+"</span>";
                }
            }
        }
    });

    //Set accept changes div as a modal popup (jQuery UI)
    $("#dialog-accept-changes p").text(Constants.Messages.AcceptChanges);
    $("#dialog-accept-changes").dialog({
        modal: true,
        autoOpen: false,
        buttons: {
            No: function() {
                $(this).dialog("close");
            },
            Yes: function() {
                $(this).dialog("close");
                acceptChanges();
            }
        }
    });


    //Set accept changes div as a modal popup (jQuery UI)
    $("#dialog-reject-changes p").text(Constants.Messages.RejectChanges);
    $("#dialog-reject-changes").dialog({
        modal: true,
        autoOpen: false,
        buttons: {
            No: function() {
                $(this).dialog("close");
            },
            Yes: function() {
                $(this).dialog("close");
                rejectChanges();
            }
        }
    });


    //Lets tell DOM that the button elements are actually buttons :p
    $("button").button();

    //Get details of purchase order changes
    $.ajax({
        url: Constants.PageUrl,
        data: {method:"getPoChangesDetail", changeId: getQueryStringParam("changeId")},
        type: "POST"
    }).done(function(response) {
            if(typeof response == "string")
                response = JSON.parse(response);

            if(!!response && response.status == "OK") {
                //Populate the grid
                $("#searchResultContainerItemList").jtable('loadClient', response.PurchaseOrderDetail);
                $("#searchResultContainerItemList").find(".jtable-no-data-row td").text(Constants.Messages.LineItemsNotChanged);
                //Populate the header
                $("#txtPurchaseOrderNumber").text(response.PoNumber);
                $("#txtShipToAddress").text(response.ShipToAddress);
                $("#txtWarehouse").text(response.Warehouse);
                $("#txtNewShipDate").text(response.NewShipDate);
                $("#txtShipDate").text(response.ShipDate);
                $("#txtReceiveBy").text(response.ReceiveBy);
                $("#txtNewReceiveBy").text(response.NewReceiveByDate);
                $("#txtVendorAddress").text(response.VendorAddress);
                $("#txtCancelDate").text(response.CancelDate);
                $("#txtNewCancelDate").text(response.NewCancelDate);
                $("#txtComments").text(response.Comments);

                //Highlight if there are changes on ship date & cancel date
                if(response.ShipDate != response.NewShipDate) {
                    $("#txtNewShipDate").css({"color": "red", "font-weight":"bolder"});
                }
                if(!!response.NewCancelDate && (response.CancelDate != response.NewCancelDate)) {
                    $("#txtNewCancelDate").css({"color": "red", "font-weight":"bolder"});
                }
                if(!!response.NewReceiveByDate && (response.ReceiveBy != response.NewReceiveByDate)) {
                    $("#txtNewReceiveBy").css({"color": "red", "font-weight":"bolder"});
                }

                //Hack: Make the grid container width same as window width
                $(".gridContainer").width($(window).width() - 20);
            }
        });

    //Set the onclick event handlers of buttons

    //Click event handler of 'Accept Changes' button
    $("#btnAcceptChanges").click(function(e) {

        //Ask for user's confirmation
        $("#dialog-accept-changes").dialog('open');

        //Hack: Modal popup not getting the background to be grey-out
        $("div.ui-widget-overlay").css("background", "url('images/ui-bg_flat_0_aaaaaa_40x100.png') repeat-x scroll 50% -100% #AAAAAA");

        //Stop any default events
        e.preventDefault();
    });

    //Click event handler of 'Reject Changes' button
    $("#btnRejectChanges").click(function(e) {

        //Ask for user's confirmation
        $("#dialog-reject-changes").dialog('open');

        //Hack: Modal popup not getting the background to be grey-out
        $("div.ui-widget-overlay").css("background", "url('images/ui-bg_flat_0_aaaaaa_40x100.png') repeat-x scroll 50% -100% #AAAAAA");

        //Stop any default events
        e.preventDefault();
    });

    //Click event handler of 'PO Listing' button
    $("#btnPoListing").click(function(e) {
        //Redirect back to main page
        window.location.href = Constants.PageUrl;

        //Stop any default events
        e.preventDefault();
    });

    /**
     * Server communicator for reject changes confirm
     */
    function rejectChanges() {
        $.ajax({
            url: Constants.PageUrl,
            data: {method:"rejectPoChanges", changeId: getQueryStringParam("changeId")},
            type: "POST"
        }).done(function(response) {
                if(typeof response == "string")
                    response = JSON.parse(response);

                if(!!response && response.status == "OK") {
                    //Successfully rejected, Notify user that the changes are successfully rejected
                    window.location.href = Constants.PageUrl + getQueryString(Constants.QueryStringParam.RejectChanges, Constants.QueryStringParam.Value.Success);
                }
                else {
                    //Some error occurred while rejecting changes
                    window.location.href = Constants.PageUrl + getQueryString(Constants.QueryStringParam.RejectChanges, Constants.QueryStringParam.Value.Failure);
                }
            })
            .fail(function(e) {
                //Some error occurred while rejecting changes
                window.location.href = Constants.PageUrl + getQueryString(Constants.QueryStringParam.RejectChanges, Constants.QueryStringParam.Value.Failure);
            });
    }

    /**
     * Server communicator for accept changes confirm
     */
    function acceptChanges() {
        $.ajax({
            url: Constants.PageUrl,
            data: {method:"acceptPoChanges", changeId: getQueryStringParam("changeId")},
            type: "POST"
        }).done(function(response) {
                if(typeof response == "string")
                    response = JSON.parse(response);

                if(!!response && response.status == "OK") {
                    //Successfully accepted, Notify user that the changes are successfully accepted
                    window.location.href = Constants.PageUrl + getQueryString(Constants.QueryStringParam.AcceptChanges, Constants.QueryStringParam.Value.Success);
                }
                else {
                    //Some error occurred while accepting changes
                    window.location.href = Constants.PageUrl + getQueryString(Constants.QueryStringParam.AcceptChanges, Constants.QueryStringParam.Value.Failure);
                }
            })
            .fail(function(e) {
                //Some error occurred while accepting changes
                window.location.href = Constants.PageUrl + getQueryString(Constants.QueryStringParam.AcceptChanges, Constants.QueryStringParam.Value.Failure);
            });
    }

    /**
     * Prepare a query string parameter
     * @param key
     * @param value
     * @returns {string} &key=value
     */
    function getQueryString(key, value) {
        return "&" + key + "=" + value;
    }
}

/**
 * Get value for particular query string key
 * @param name => Name of query string parameter
 * @returns {string} => value for query string parameter
 */
function getQueryStringParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}