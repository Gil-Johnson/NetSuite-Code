/**
 * Created by Hassan on 3/29/14.
 */


vendorPortalApp.controller('accountController', function($scope, portalService) {

    /**
     * Login function to check if the username and password matches some vendor then Login the user
     */
    $scope.login = function () {
        var username = $scope.username;
        var password = $scope.password;

        if (!!username && !!password) {
            //set error summary to null if its already there
            errorsSummary(Constants.PartialStrings.Empty, true);

            portalService.NsApi.login(username, password)
                .success(function (response) {
                    //if the response is plain string, parse it to JSON
                    if(typeof response == "string")
                        response = JSON.parse(response);

                    if(response.status == "OK") {
                        //Success response
                        var arrCookie = response.cookies;
                        if(!!arrCookie) {
                            arrCookie.forEach(function(cookie) {
                                //Set the cookies: loginHash & vendorID
                                $.cookie(cookie.name, cookie.value, { expires: Constants.Config.cookieExpiry, path: '/' });
                            });
                        }

                        //Send the request to Dashboard
                        portalService.safeRedirect(Constants.Location.Dashboard);
                    }
                    else {
                        //Some error from server, lets show it to user
                        errorsSummary(response.message, true);
                    }
                });

        } else {
            //Empty credentials
            errorsSummary(Constants.Messages.EmptyCredentials);
        }
    }

    /**
     * Logout function to check if we have some stored session, then forcefully expire it
     */
    $scope.logout = function() {
        portalService.NsApi.logout()
            .success(function (response) {
                //if the response is plain string, parse it to JSON
                if(typeof response == "string")
                    response = JSON.parse(response);

                if(response.status == "OK") {
                    //Success response
                    if(!!response.cookies) {
                        response.cookies.forEach(function(cookie) {
                            //Delete the cookies: loginHash & vendorID
                            $.removeCookie(cookie, { path: '/' });
                        });
                    }
                    //Send the request to Login page
                    //$location.path(Constants.Location.Login);
                    //Hack: $location was causing memory spikes on firefox
                    window.location.hash = Constants.Location.Login;
                }
                else {
                    //Some error from server, lets show it to user
                    errorsSummary(response.message);
                }
            });
    }

    $scope.logoutMessage = Constants.Messages.LogoutMessage.replace("{0}", portalService.vendorName());

    //Check if we have some navigation message
    if(!!$.cookie(Constants.Cookie.NavigationMessage)) {
        errorsSummary($.cookie(Constants.Cookie.NavigationMessage));

        //Delete that cookie
        $.removeCookie(Constants.Cookie.NavigationMessage, { path: '/' });
    }

    //Check if we have session expired cookie set
    else if(!!$.cookie(Constants.Cookie.SessionExpire)) {
        errorsSummary(Constants.Messages.SessionExpire);

        //Delete that cookie
        $.removeCookie(Constants.Cookie.SessionExpire, { path: '/' });
    }

    $scope.pageLoad = function() {
        if(!!portalService.isLogin()) {
            //Send the request to Dashboard
            portalService.safeRedirect(Constants.Location.Dashboard);
        }
    }


    /**
     * Set the summary error message on Login page
     * @param message => Message to display
     */
    function errorsSummary(message, forceError) {
        $scope.errorsSummary = message;
        if(!!forceError) {
            $("#errorsSummary").text(message).removeClass("ng-hide");
        }
    }
});