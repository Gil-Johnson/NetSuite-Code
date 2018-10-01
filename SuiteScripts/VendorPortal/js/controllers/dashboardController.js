/**
 * Created by Hassan on 3/30/14.
 */

// create the controller and inject Angular's $scope
vendorPortalApp.controller('dashboardController', function($scope, portalService) {
    if(portalService.ensureLogin()) {
        $scope.VendorName = portalService.vendorName();

        $scope.pageLoad = function() {

            var newPoGridId = "#searchResultContainerNewPO",
                acceptedPoGridId = "#searchResultContainerAccPO";

            //Initialize New PO Grid
            $(newPoGridId).jtable({
                title: 'New Purchase Orders',
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
                    Date: {
                        title: 'Date',
                        width: '10%'
                    },
                    PONumber: {
                        title: 'Order #',
                        width: '10%'
                    },
                    ShipDate: {
                        title: 'Ship Date',
                        width: '10%'
                    },
                    ExpectedReceiptDate: {
                        title: 'Expected Receipt Date',
                        width: '20%'
                    },
                    AmountUnbilled: {
                        title: 'Amount Unbilled',
                        width: '20%'
                    },
                    OrderStatus: {
                        title: 'Status',
                        width: '20%'
                    },
                    view: {
                        title: 'View',
                        width: '10%',
                        display: function (data) {
                            return '<a href="#/po_detail/'+ data.record.Id +'/po_type/new">View</a>';
                        }
                    }
                }
            });

            //Initialize Accepted PO Grid
            $(acceptedPoGridId).jtable({
                title: 'Accepted / In transit Purchase Orders',
                paging: true,
                pageSize: 100,
                clientBinding : true,
                fields: {
                    Id: {
                        key: true,
                        create: false,
                        edit: false,
                        list: false
                    },
                    Date: {
                        title: 'Date',
                        width: '10%'
                    },
                    PONumber: {
                        title: 'Order #',
                        width: '10%'
                    },
                    ShipDate: {
                        title: 'Ship Date',
                        width: '10%'
                    },
                    ExpectedReceiptDate: {
                        title: 'Expected Receipt Date',
                        width: '20%'
                    },
                    AmountUnreceived: {
                        title: 'Amount Unreceived',
                        width: '20%'
                    },
                    OrderStatus: {
                        title: 'Status',
                        width: '20%'
                    },
                    view: {
                        title: 'View',
                        width: '10%',
                        display: function (data) {
                            return '<a href="#/po_detail/'+ data.record.Id +'/po_type/accepted">View</a>';
                        }
                    }
                }
            });

            //Get Data for new PO
            portalService.NsApi.getNewPurchaseOrdersList()
                .success(function (response) {
                    //if the response is plain string, parse it to JSON
                    if(typeof response == "string")
                        response = JSON.parse(response);

                    if(response.status == "OK") {
                        //Success response

                        //Add new PO List Data
                        $(newPoGridId).jtable('loadClient', response);
                    }
                    else {
                        //Some error from server, lets show it to user
                        handleError(response.message, response.multipleLogin);
                    }
                });


            //Get Data for accepted PO
            portalService.NsApi.getAcceptedPurchaseOrdersList()
                .success(function (response) {
                    //if the response is plain string, parse it to JSON
                    if(typeof response == "string")
                        response = JSON.parse(response);

                    if(response.status == "OK") {
                        //Success response

                        //Add accepted PO List Data
                        $(acceptedPoGridId).jtable('loadClient', response);
                    }
                    else {
                        //Some error from server, lets show it to user
                        handleError(response.message, response.multipleLogin);
                    }
                });
        }

        //Check if we have some response
        if(!!$.cookie(Constants.Cookie.SuccessResponse)) {
            handleError(Constants.Messages.OrderAccepted);

            //Delete that cookie
            $.removeCookie(Constants.Cookie.SuccessResponse, { path: '/' });
        }
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
});
