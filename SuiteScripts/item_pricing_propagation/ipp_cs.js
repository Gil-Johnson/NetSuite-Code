/**
 * Module Description
 * A client script of utility used to maintain customer item pricing in bulk.
 *
 * Version    Date            Author            Reviewer            Remarks
 * 1.00       11 Mar 2014     hakhtar           wahajahmed
 *
 */


/**
 * Validates if there is any empty field left then ask user to fill that or else show a processing message
 *   
 * @returns {Boolean} True to continue save, false to abort save
 */
function saveRecord() {
	var error = false;

	var message = 'Please wait while we process your request.  This might take some time.';
    var confirmationMessage = 'Are you sure you want to remove all customer propagations?';
	
	//remove any existing message on screen
	jQuery('#div__alert').remove();

	//Check all fields for empty
	var price = nlapiGetFieldValue('custpage_price');
	var customer = nlapiGetFieldValue('custpage_customer');
	var prodType = nlapiGetFieldValue('custpage_prodtype');
	var removeBtn = document.getElementById('remove_btn') || null;
    var removeAllBtn = document.getElementById('remove_all_btn') || null;

    // if "Remove All Customer Propagations" button pressed
    if  (!!removeAllBtn) {

        if (!!prodType) {
            error = true;
            message = "Please don't fill product type when removing all customer propagations.";
        }
        if (!customer) {
            error = true;
            message = "Please fill customer field.";
        }

        // Take confirmation in case of 'removing all propagation' and having no error
        if (!error && !confirm(confirmationMessage)) {
            return false;
        }
    }
    else {
        // if other than "Remove All Customer Propagations" button pressed
        if ((!removeBtn && !price) || !customer || !prodType) {
            error = true;
            message = "Please fill all the fields to continue.";
        }
    }

	//Show user a message
	jQuery('<div id="div__alert"><table cellpadding="0" cellspacing="0" border="0" ' + (!!error ? '' : 'bgcolor="#DAEBD5"') + '><tbody><tr><td><img src="/images/icons/messagebox/msgbox_corner_tl.png" alt="" width="7" height="7" border="0"></td><td width="40"><img src="/images/icons/reporting/x.gif" width="1" height="1" alt="" hspace="20"></td><td width="100%"></td><td><img src="/images/icons/messagebox/msgbox_corner_tr.png" alt="" width="7" height="7" border="0"></td></tr><tr><td></td><td width="100%" valign="top"><table cellpadding="0" cellspacing="0" border="0" width="600" style="font-size: 11px"><tbody><tr><td><img src="/images/icons/reporting/x.gif" width="1" height="8" alt=""></td></tr><tr><td style="font-color: #000000' + (!!error ? ';color:red': '') + '">' + message + '</td></tr><tr><td><img src="/images/icons/reporting/x.gif" width="1" height="8" alt=""></td></tr></tbody></table></td><td></td></tr><tr><td><img src="/images/icons/messagebox/msgbox_corner_bl.png" alt="" width="7" height="7" border="0"></td><td></td><td width="100%"></td><td><img src="/images/icons/messagebox/msgbox_corner_br.png" alt="" width="7" height="7" border="0"></td></tr></tbody></table></div>')
		.insertAfter(document.evaluate('//*[@id="main_form"]/table/tbody/tr[1]/td/table/tbody/tr[1]', document, null, 9, null).singleNodeValue);
		
	//returns the inverse of error and cancelOperation
    return (!error);
    //return false;
}
