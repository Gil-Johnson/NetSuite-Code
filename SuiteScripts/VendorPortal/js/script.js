/**
 * Created by Hassan on 3/29/14.
 */

angular.module('vendorPortalApp.services', []).
  factory('portalService', function ($http) {
        return  {
            NsApi: {
                get: function (apiMethod, apiData) {
                    return $http({
                        method: 'POST',
                        url: Constants.URLs.baseURL +'&method=' + apiMethod,
                        data: $.param(apiData),
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        }
                    });
                },
                login: function(username, password) {
                    return this.get("login", {username: username, password: password});
                },
                logout: function() {
                    return this.get("logout", {});
                },
                getNewPurchaseOrdersList: function() {
                    return this.get("getNewPurchaseOrdersList", {});
                },
                getAcceptedPurchaseOrdersList: function() {
                    return this.get("getAcceptedPurchaseOrdersList", {});
                },
                getPurchaseOrderDetail: function(orderNum) {
                    return this.get("getPurchaseOrderDetail", {orderNumber: orderNum});
                },
                acceptPurchaseOrder: function(orderNum) {
                    return this.get("acceptPurchaseOrder", {orderNumber: orderNum});
                },
                requestChanges: function(postData) {
                    return this.get("requestChanges", postData);
                },
                getSpecsSheetData: function(orderNum) {
                    return this.get("getSpecsSheetData", {orderNumber: orderNum});
                },
                getProdFilesData: function(orderNum, selectedItems) {
                    return this.get("getProdFilesData", {orderNumber: orderNum, selectedItems: JSON.stringify(selectedItems)});
                }
            },
            /**
             * Redirect the control to specified location if the session is authenticated, else to the login screen
             * @param redirectUrl => Location to redirect
             */
            safeRedirect: function(redirectUrl, isHref) {
                var loginHash = $.cookie(Constants.Cookie.LoginHash);
                var vendorId = $.cookie(Constants.Cookie.VendorId);
                this.log("LoginHash (from cookie) = " + loginHash + ", VendorId (from cookie) = " + vendorId);

                //check if we have cookie set
                if(!!loginHash && vendorId) {
                    //Logged-in user, redirect to dashboard
                    if(!!isHref) {
                        window.open(redirectUrl);
                    }
                    else {
                        //$location.path(redirectUrl);
                        //Hack: $location was causing memory spikes on firefox
                        window.location.hash = redirectUrl;
                    }
                }
                else {
                    //Not login, redirect to login page

                    //Before redirecting, tell login page that the session was timed-out
                    $.cookie(Constants.Cookie.SessionExpire, "true", { expires: Constants.Config.cookieExpiry, path: '/' });

                    //Now redirect to login
                    //$location.path(Constants.Location.Login);
                    //Hack: $location was causing memory spikes on firefox
                    window.location.hash = Constants.Location.Login;
                }
            },
            log: function(message) {
                if(Constants.Config.enableLogs) {
                    console.log(message);
                }
            },
            vendorName: function() {
                var vName = $.cookie(Constants.Cookie.VendorName);
                this.log("Vendor Name (from cookie) = " + vName);
                return vName || Constants.PartialStrings.Empty;
            },
            ensureLogin: function() {
                this.log("Ensuring logged-in user.");
                var loginHash = $.cookie(Constants.Cookie.LoginHash);
                this.log("Login hash (from cookie) = " + loginHash);

                if(!!loginHash) {
                    this.log("User is logged-in");
                    this.refreshCookies();
                }
                else {
                    //User is no longer logged-in, redirect to login page
                    this.log("User session is expired!");

                    //Before redirecting, tell login page that the session was timed-out
                    $.cookie(Constants.Cookie.SessionExpire, "true", { expires: Constants.Config.cookieExpiry, path: '/' });

                    //$location.path(Constants.Location.Login);
                    //Hack: $location was causing memory spikes on firefox
                    window.location.hash = Constants.Location.Login;
                }
                return true;
            },
            isLogin: function() {
                this.log("Checking if the user is logged-in");
                var loginHash = $.cookie(Constants.Cookie.LoginHash);
                this.log("Login hash (from cookie) = " + loginHash);

                this.log(!!loginHash ? "User is logged-in" : "User session is expired!");
                return !!loginHash;
            },
            deleteAllCookies: function() {
                for(var cookie in Constants.Cookie) {
                    $.removeCookie(Constants.Cookie[cookie], { path: '/' });
                }
            },
            redirect: function(location) {
                //$location.path(location);
                //Hack: $location was causing memory spikes on firefox
                window.location.hash = location;
            },
            refreshCookies: function() {
                this.log("Refreshing all cookies");
                for(var cookie in Constants.Cookie) {
                    if(!!$.cookie(Constants.Cookie[cookie])) {
                        this.log("Refreshing cookie = " + cookie);
                        $.cookie(Constants.Cookie[cookie], $.cookie(Constants.Cookie[cookie]),
                            { expires: Constants.Config.cookieExpiry, path: '/' });
                    }
                }
            },
            getSpecSheetPdf: function(pdfData) {
                return $http({
                    method: 'POST',
                    url: Constants.URLs.downloadSpecSheetInitUrl,
                    data: pdfData,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                });
            },
            getProdFilesArchive: function(archiveData) {
                return $http({
                    method: 'POST',
                    url: Constants.URLs.downloadProdFilesArchive,
                    data: $.param(archiveData),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                });
            }
        }
  });

// create the module and name it vendorPortalApp
var vendorPortalApp = angular.module('vendorPortalApp', ['ngRoute', 'ui.bootstrap', 'vendorPortalApp.services']);

// configure our routes
vendorPortalApp.config(function ($routeProvider, $locationProvider, $sceDelegateProvider) {
	//Whitelist the Url host, or else the templates below wont be loaded
	$sceDelegateProvider.resourceUrlWhitelist(['self', Constants.URLs.whiteListBase]);
    $routeProvider

        // route for the home page
        .when(Constants.Location.Root, {
        	templateUrl: Constants.URLs.template.home, // /pages/home.html
            controller  : 'mainController'
        })

        // route for the login page
        .when(Constants.Location.Login, {
            templateUrl: Constants.URLs.template.login, // /pages/login.html
            controller: 'accountController'
        })

        // route for the logout page
        .when(Constants.Location.Logout, {
            templateUrl: Constants.URLs.template.logout, // /pages/logout.html
            controller: 'accountController'
        })

        // route for the dashboard page
        .when(Constants.Location.Dashboard, {
            templateUrl: Constants.URLs.template.dashboard, // /pages/dashboard.html
            controller  : 'dashboardController'
        })

        // route for the request changes page
        .when(Constants.Location.RequestChanges, {
            templateUrl: Constants.URLs.template.RequestChanges, // /pages/request_changes.html
            controller  : 'poRequestChangesController'
        })

        // route for the dashboard page
        .when(Constants.Location.PurchaseOrderDetails, {
            templateUrl: Constants.URLs.template.PurchaseOrderDetails, // /pages/po_details.html
            controller  : 'poDetailController'
        });
});