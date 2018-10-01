/**
 * Created by Hassan on 3/29/14.
 */

var Constants = Constants || {
    Config: {
        cookieExpiry: 1/24, //cookie alive for an hour
        enableLogs: false,
        maxProductionFiles: 15
    },
    URLs: {
        template: {
            login: "https://forms.na3.netsuite.com/core/media/media.nl?id=322963&c=3500213&h=eef88bd3e6b03f1bfa56&_xt=.html",
            home: "https://forms.na3.netsuite.com/core/media/media.nl?id=323064&c=3500213&h=9652a1499da453aca129&_xt=.html",
            dashboard: "https://forms.na3.netsuite.com/core/media/media.nl?id=322965&c=3500213&h=f531f06752bc27c828b1&_xt=.html",
            logout: "https://forms.na3.netsuite.com/core/media/media.nl?id=323062&c=3500213&h=989680c150577ede5229&_xt=.html",
            PurchaseOrderDetails: "https://forms.na3.netsuite.com/core/media/media.nl?id=322962&c=3500213&h=89e124e3a6918e75e86d&_xt=.html",
            RequestChanges: "https://forms.na3.netsuite.com/core/media/media.nl?id=322961&c=3500213&h=52481130b8d576b45f1f&_xt=.html"
        },
        whiteListBase: "https://forms.na3.netsuite.com/**",
        baseURL: "https://forms.na3.netsuite.com/app/site/hosting/scriptlet.nl?script=71&deploy=1&compid=3500213&h=2f72b38807c7dc8b8bd4",
        getPrintPdf: function(poId) {
            return this.baseURL + "&method=printPdf&orderNumber=" + poId;
        },
        printPdfImage: "https://system.na3.netsuite.com/core/media/media.nl?id=329923&c=3500213&h=ad8227c27e1969a7a3b3",
        downloadSpecSheetInitUrl: "https://support.sparowatch.com/pdfgen/init.php",
        downloadSpecSheetStatusUrl: "https://support.sparowatch.com/pdfgen/check_status.php",
        LoadingImg: "https://system.na3.netsuite.com/core/media/media.nl?id=349204&c=3500213&h=8399aa178d087f64807f",
        downloadProdFilesArchive: "https://images.ricoinc.com/folio3/api/productionfile"
    },
    Messages: {
        EmptyCredentials: "Please enter your credentials and resubmit the form",
        LogoutMessage: "Thanks {0} for using Vendor Portal, please wait while we process your logout request.",
        SessionExpire: "Your login session is expired, please login again.",
        OrderAccepted: "Purchase Order has been successfully acknowledged.",
        ChangesRequested: "Changes have been requested and PO creator has been sent an email about the requested changes.",
        ValidationError: "There are some validation errors.",
        MaxSelectionSizeReached: function() {
            return "You can not select more than {0} file(s), please review your selection.".replace("{0}", Constants.Config.maxProductionFiles);
        },
        SelectAtleastOneItem: "Please select at least one item.",
        UnexpectedError: "Some unexpected error has occurred, please try again later.",
        NoProdFiles: "There are no production file(s) associated with your current selection, please review your selection and try again.",
        ErrorProcessingRequest: "An error occurred while processing your request, please try again later."
    },
    Cookie: {
        LoginHash: "NS-LOGIN-HASH",
        VendorId: "NS-VENDOR-ID",
        VendorName: "NS-VENDOR-NAME",
        SessionExpire: "VP-SESSION",
        SuccessResponse: "VP-SUCCESS-RESPONSE",
        NavigationMessage: "VP-NAVIGATION-MESSAGE"
    },
    Location: {
        Dashboard: "/dashboard",
        Login: "/login",
        Root: "/",
        Logout: "/logout",
        PurchaseOrderDetails: "/po_detail/:purchaseOrderId/po_type/:poType",
        RequestChanges: "/po_request_changes/:purchaseOrderId/po_type/:poType"
    },
    PartialStrings: {
        NoValue: "-",
        Empty: "",
        InvalidSelection: "Invalid Selection"
    },
    Status: {
        Ok: "OK",
        Error: "ERROR"
    }
};