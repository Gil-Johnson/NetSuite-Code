var redirectToRelease = false;
var selectSOrPage = false;

// This is the height of controls other than datatable.
var HEIGHT_OF_CONTROLS = 210;

function pageInit(type) {

    // Add custom script to add scroll bar and fix height of suitlet content for Release 2014.2 UI fix
    //var styles = {height : "150px", overflow: "auto"};
    //jQuery("#div__body").css(styles);
    /*try {
        window.frameElement.height = 1650;
        window.frameElement.style.height = '1650px';
    }
    catch (ex) {
        alert('Error: Problem in increasing height of iframe.');
    }*/

    setIframeHeight();
}

function clientFieldChanged(type, name, linenum) 
{
    // if selection from dropdown list then set selectSOrPage & hiddden flag to true and redirectToRelease to false
    if(name == COMMON.SELECT_SELECTED_SO_PAGE_ID){
        selectSOrPage = true;
        redirectToRelease = false;
        
        nlapiSetFieldValue(COMMON.CHKBOX_IS_SO_REQUEST_ID, 'T', false);
        
        // submit the form on selection from dropdown
        var submitButton = document.getElementById('secondary' + COMMON.BTN_SUBMITTER_ID); 
        submitButton.click();
    }else{
        selectSOrPage = false;
    //console.log('selectSOrPage: '+selectSOrPage);
    }
    
    if(type == COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID){
        if(name == COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_SOS_ID){
            // on selection of SOs - set the redirectToRelease flag to true and hidden flag to false
            if(nlapiGetCurrentLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID, COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_SOS_ID) == 'T'){
                redirectToRelease = true;
                nlapiSetFieldValue(COMMON.CHKBOX_IS_SO_REQUEST_ID,'F', false);
            }else{
                var totalLines = nlapiGetLineItemCount(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID);
                for(var line = 1; line <= totalLines; line++){
                    var soFlag = nlapiGetLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID, COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_SOS_ID, line);
                    if(soFlag == 'T'){
                        redirectToRelease = true;
                        nlapiSetFieldValue(COMMON.CHKBOX_IS_SO_REQUEST_ID,'F', false);
                        break;
                    }
                    redirectToRelease = false;
                    nlapiSetFieldValue(COMMON.CHKBOX_IS_SO_REQUEST_ID,'T', false);
                }
            }
        //console.log('redirectToRelease: ' + redirectToRelease);
        }
    }
}


function saveRecord(){
    // halding of release all button from customer dashboard, because this client script are bind with home and customer dashboard portlet too.
    if(nlapiGetFieldValue(COMMON.CHKBOX_RELEASE_ALL_CUST_DASHBOARD_ID) == 'T'){
        return true;
    }
    // user submit the form after select the SOs then this will be true
    if(redirectToRelease && nlapiGetFieldValue(COMMON.CHKBOX_IS_SO_REQUEST_ID)=='F'){
        return true;
    }
    // on selection of dropdown list this will be true
    if(selectSOrPage && nlapiGetFieldValue(COMMON.CHKBOX_IS_SO_REQUEST_ID)=='T')
        return true;
    
    var totalLineItems = nlapiGetLineItemCount(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID);
    //console.log('total sos: '+totalLineItems);
    for(var line=1;line<=totalLineItems;line++){
        if(nlapiGetLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID, COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_SOS_ID, line)=='T'){
            return true;
        }
    }
    // if salesorder is not selected then show the alert.
    alert('Please select at least one Sales Order');
    return false;
}

// Set height of iframe dynamically according to width of data grid
function setIframeHeight() {
    try {
        var dataRowsHeight = jQuery("#customersos_splits").height();
        var totalHeight = dataRowsHeight + HEIGHT_OF_CONTROLS;

        window.frameElement.height = totalHeight;
        window.frameElement.style.height = totalHeight + 'px';
    }
    catch (ex) {
        alert("Error: Problem in setting height of parent iframe.");
    }
}