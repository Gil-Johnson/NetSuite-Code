/**
 * Created by Hassan on 3/29/14.
 */

// create the controller and inject Angular's $location
vendorPortalApp.controller('mainController', function(portalService) {
    portalService.log("mainController");
    //Send the request to Login, this page is no longer needed
    //$location.path(Constants.Location.Login);
    //Hack: $location was causing memory spikes on firefox
    window.location.hash = Constants.Location.Login;
});