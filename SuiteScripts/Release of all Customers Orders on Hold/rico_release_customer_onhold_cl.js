var redirectToSO = false;
var selectCustomerPage = false;
//var custAlreadySelected = false;

// This is the height of controls other than datatable.
var HEIGHT_OF_CONTROLS = 170;

function pageInit(type) {
    setIframeHeight();
}

function clientFieldChanged(type, name, linenum)
{
    if(type == COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID)
    {
        // remarked code move to the other condition
        //console.log(type);
        //console.log(name);
        /*if(name == COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID && custAlreadySelected == false)
         custAlreadySelected = true;

         // select only one checkbox - behaviour like radio button
         if(custAlreadySelected == true){
         var totalLineItems = nlapiGetLineItemCount(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID);
         var selectedLineNum = linenum;

         for(var i = 1; i<= totalLineItems; i++){
         if(i != selectedLineNum)
         nlapiSetLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID, i, 'F');
         }
         }*/

        if(name == COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID){
            // select only one checkbox - behaviour like radio button
            var totalLineItems = nlapiGetLineItemCount(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID);
            var selectedLineNum = linenum;

            for(var i = 1; i<= totalLineItems; i++){
                if(i != selectedLineNum)
                    nlapiSetLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID, i, 'F');
            }
            // on selection of customer - set the redirectToSO flag to true and hidden flag to false
            if(nlapiGetCurrentLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID) == 'T'){
                redirectToSO = true;
                nlapiSetFieldValue(COMMON.CHKBOX_PAGE_REQUEST_ID,'F', false);
            }else{
                redirectToSO = false;
                nlapiSetFieldValue(COMMON.CHKBOX_PAGE_REQUEST_ID,'T', false);
            }
            //console.log('redirectToSO: ' + redirectToSO);
        }
    }
    // if selection from dropdown list then set selectCustomerPage & hiddden flag to true and redirectToSO to false
    if(name == COMMON.SELECT_SELECTED_CUSTOMER_PAGE_ID){
        selectCustomerPage = true;
        redirectToSO = false;

        //nlapiSetFieldValue('cuspage_hidden','');
        nlapiSetFieldValue(COMMON.CHKBOX_PAGE_REQUEST_ID, 'T', false);

        // submit the form on selection from dropdown
        var submitButton = document.getElementById('secondary' + COMMON.BTN_SUBMITTER_ID);
        submitButton.click();
    }else{
        selectCustomerPage = false;
        //console.log('selectCustomerPage: '+selectCustomerPage);
    }
}

function saveRecord(){

    // user submit the form after select the customer then this will be true
    if(redirectToSO && nlapiGetFieldValue(COMMON.CHKBOX_PAGE_REQUEST_ID)=='F'){
        return true;
    }

    // on selection of dropdown list this will be true
    if(selectCustomerPage && nlapiGetFieldValue(COMMON.CHKBOX_PAGE_REQUEST_ID)=='T')
        return true;

    var totalLineItems = nlapiGetLineItemCount(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID);
    var line;
    for(line=1;line<=totalLineItems;line++){
        if(nlapiGetLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID, line)=='T'){
            return true;
        }
    }
    // for releasing all sos
    nlapiSetFieldValue('releaseallchkbx', 'F');
    // if customered is not select then show the alert.
    alert('Please select a customer');
    return false;
}

// Set height of iframe dynamically according to width of data grid
function setIframeHeight() {
    try {
        var dataRowsHeight = jQuery("#onholdsoenteries_splits").height();
        var totalHeight = dataRowsHeight + HEIGHT_OF_CONTROLS;

        window.frameElement.height = totalHeight;
        window.frameElement.style.height = totalHeight + 'px';
    }
    catch (ex) {
        alert("Error: Problem in setting height of parent iframe.");
    }
}