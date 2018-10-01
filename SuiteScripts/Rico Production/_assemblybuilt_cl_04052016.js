/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       29 Aug 2014     mzohaib
 *
 */

// This script has been applied on Assembly Built Form Level
//check form customization, Custom Code Tab

var Constants = {
    netsuiteUrl: "https://system.na3.netsuite.com",
    bundleUrl: "https://system.na3.netsuite.com/c.3500213/suitebundle707072/",
    transactionBodyFields: {
        //Linked with Work Order
        remainingQty: 'custbody_remainingqty'
    },
    dependencies: {
        jQueryUiCss: "Common/jquery-ui.css",
        jQueryJs: "Common/jquery-1.10.2.js",
        jQueryUiJs: "Common/jquery-ui.js"
    },
    dialogBox: null,
    parentWorkOrderId: null,
    isResponded: false,
    isResponded2: false
};

var HelperMethods = {
    //return complete url for src or href
    getHrefUrl: function (file) {
        return (Constants.bundleUrl + file);
    },
    /**
     * function to load a given css file
     */
    loadCSS: function (href) {
        var cssLink = jQuery("<link rel='stylesheet' type='text/css' href='" + href + "'/>");
        jQuery("head").append(cssLink);
    },
    /**
     * function to load a given js file
     */
    loadJS: function (src) {
        var jsLink = jQuery("<script type='text/javascript' src='" + src + "'/>");
        jQuery("head").append(jsLink);
    }
};

/**
 * It extends the functionality of builtin close_remaining method,
 * equivalent to Workorder UI - Action>Cancel Open Balance
 * @param id
 * @param trantype
 */
function extend_close_remaining(id, trantype) {
    var manager = (trantype === 'trnfrord') ? 'transferordermanager.nl' : 'salesordermanager.nl';
    var myUrl = Constants.netsuiteUrl +
        '/app/accounting/transactions/' + manager + '?type=closeremaining&trantype=' + trantype + '&id=' + id;
    //console.log(myUrl);

    jQuery.ajax({
        url: myUrl,
        type: "GET"
    })
        .done(function (data) {
            try {
                if (navigator.appName !== 'Microsoft Internet Explorer') {
                    jQuery("#btn_multibutton_submitter").click();
                }
            }
            catch (e) {
                //console.log('There was an error while sending data to server.');
            }
        });
}

function implementDialog() {
    Constants.dialogBox = jQuery("#dialog-confirm").dialog({
        autoOpen: false,
        top: '30px',
        height: 250,
        width: 350,
        resizable: false,
        modal: true,
        buttons: {
            "Leave Open": function () {
                Constants.isResponded = true;
                jQuery(this).dialog("close");

                jQuery("#btn_multibutton_submitter").click();
            },
            "Cancel Balance": function () {
                extend_close_remaining(Constants.parentWorkOrderId, 'workord');

                Constants.isResponded = true;
                jQuery(this).dialog("close");
            }
        }/*,
        open: function () {
            console.log("Opening Dialog");
        },
        close: function () {
            console.log("Closing Dialog");
        }*/
    });

    //console.log("Modal Success");
}

/**
 * On Page Load register jQuery UI Events
 * @param type
 */
function clientPageInitForAssemblyBuilt(type) {
    //HelperMethods.loadCSS(HelperMethods.getHrefUrl(Constants.dependencies.jQueryUiCss));
    HelperMethods.loadCSS("https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.0/themes/smoothness/jquery-ui.css");
    HelperMethods.loadJS(HelperMethods.getHrefUrl(Constants.dependencies.jQueryJs));
    HelperMethods.loadJS(HelperMethods.getHrefUrl(Constants.dependencies.jQueryUiJs));

    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://system.na3.netsuite.com/core/media/media.nl?id=274&c=3500213&h=772ea8cf72cd6f459a02&_xt=.js";
    // Use any selector
    jQuery("head").append(s);

    jQuery("body").append(
        '<div id="dialog-confirm" title="Warning!">' +
            '<p>' +
                '<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>' +
                'The quantity you are building is less than the remaining balance of the work order.' +
                'Do you want to cancel the open balance on the work order?' +
            '</p>' +
        '</div>'
    );
    
    jQuery("body").append(
            '<div id="dialog-confirm2" title="Enter Scrap">' +
                '<p>' +
                    '<span class="ui-icon ui-icon-alert" style="margin:0 auto"></span>' +
                    'Would you like to enter scrap?' +
                '</p>' +
            '</div>'
        );      
    
    
     jQuery('head').append('<style>.ui-dialog{ top:100px !important; }</style>');
     
     
     implementDialogScrap();
    implementDialog();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecordForAssemblyBuilt() {
	
	if (Constants.isResponded2 === false ) {    
		
	    Constants.dialogBox2.dialog("open");
	    
	    return Constants.isResponded2;
	    
	}	
	
    if (Constants.isResponded === false) {
        Constants.parentWorkOrderId = nlapiGetFieldValue('createdfrom');

        //if assembly has work order reference
        if (Constants.parentWorkOrderId) {
            var woRecord = nlapiSearchRecord('workorder', null,
                new nlobjSearchFilter('internalid', null, 'is', Constants.parentWorkOrderId),
                new nlobjSearchColumn(Constants.transactionBodyFields.remainingQty));

            var remainingQtyFromWO = woRecord[0].getValue(Constants.transactionBodyFields.remainingQty);

            var quantityToBuiltFromAssembly = nlapiGetFieldValue('quantity');

            if ((parseInt(quantityToBuiltFromAssembly) === parseInt(remainingQtyFromWO))) {
                return true;
            }

            var r;
            if (parseInt(quantityToBuiltFromAssembly) < parseInt(remainingQtyFromWO)) {
                if (navigator.appName !== 'Microsoft Internet Explorer')
                {
                    Constants.dialogBox.dialog("open");
                } else {
                    var txtMsg = "The quantity you are building is less than the remaining balance of the work order." +
                        "Do you want to cancel the open balance on the work order? \n" +
                        "(Note: Press OK to Leave Open and Cancel to Cancel Balance)";
                    r = confirm(txtMsg);
                    if (r === true) {
                        return true;
                    } else {
                        extend_close_remaining(Constants.parentWorkOrderId, 'workord');
                        return true;
                    }
                }
            } else {
                //if quantity to built is greater than WO quantity then just save it
                //return true;

                r = confirm("Built quantity is greater than remaining quantity! Do you want to continue?");
                return r;
            }
        }
    }

    return Constants.isResponded;
}

function implementDialogScrap() {
//	console.log('implementDialog');
  Constants.dialogBox2 =  jQuery("#dialog-confirm2").dialog({
        autoOpen: false,
        top: '30px',
        height: 250,
        width: 350,
        resizable: false,
        modal: true,
        buttons: {
            "Yes": function () {
            	
            	nlapiSetFieldValue('custbody_enter_scrap', 'T');       	
            	
               Constants.isResponded2 = true;           
                          	
                jQuery(this).dialog("close");             
                
                
                //Constants.dialogBox.dialog("close");

                jQuery("#btn_multibutton_submitter").click();
            },
            "No": function () {
              //  extend_close_remaining(Constants.parentWorkOrderId, 'workord');
            	nlapiSetFieldValue('custbody_enter_scrap', 'F');    
                Constants.isResponded2 = true;
                jQuery(this).dialog("close");
                //Constants.dialogBox.dialog("close");
                jQuery("#btn_multibutton_submitter").click();
            }
        }/*,
        open: function () {
            console.log("Opening Dialog");
        },
        close: function () {
            console.log("Closing Dialog");
        }*/
    });

    //console.log("Modal Success");
}
