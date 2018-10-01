/*
 * Dependency Files:
 *
 * rico_release_onhold_customers_dao.js
 *
 * */

// this function release the selected salses order
function releaseSOsFromOnHold(){
    nlapiLogExecution('DEBUG', 'In Release SO', '');
    // get total lines of SO sublist from reqest object
    var totalLines = request.getLineItemCount(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID);

    for(var i=1;i<=totalLines;i++){
        // get the value of checkbox
        var isSelected = request.getLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID, COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_SOS_ID, i);
        if(isSelected == 'T'){
            // get the id of sales order from hidden line item field
            var soId = request.getLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID, COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_ID, i);
            if(isValidVlue(soId)){
                // update the SO's checkboxes
                //try catch block is due to the concurrent release of same sales order from different tabs
                try{
                    //nlapiSubmitField('salesorder', soId, [COMMON.SALES_ORDER.FieldName.CHKBOX_ON_HOLD_ID, COMMON.SALES_ORDER.FieldName.CHKBOX_RELEASE_FROM_HOLD_ID], ['F','T']);
                    var soRec = nlapiLoadRecord('salesorder', soId, {disabletriggers: true});
                    soRec.setFieldValue(COMMON.SALES_ORDER.FieldName.CHKBOX_ON_HOLD_ID, 'F');
                    soRec.setFieldValue(COMMON.SALES_ORDER.FieldName.CHKBOX_RELEASE_FROM_HOLD_ID, 'T');
                    nlapiSubmitRecord(soRec, {disabletriggers: true});
                }catch(exception){
                    nlapiLogExecution('ERROR', 'Release Non Existing Sales Order Having Id: ' + soId, exception.message);
                }
            }
        }
    }
    nlapiLogExecution('DEBUG', 'Berfore response.writePage', 'Remaining Usage: ' + nlapiGetContext().getRemainingUsage());

    // display the message after releasing the selected SOs.
    refreshPortlet('Sales Orders have been released. Page Refresh in 2 seconds');
}

// add the inline script to the form
function addInlineScript(form){
    var inlineField = form.addField(COMMON.INLINEHTML_INLINE_SCRIPT_ID, 'inlinehtml', '');
    var script = '<script type="text/javascript">';
    script += 'var isSetFrameHeight = false;';
    script += 'function isValidValue(value){';
    script += '    return !(value == "" || value == null || typeof value == "undefined")';
    script += '}';
    script += 'var t1 = setInterval(function(){';
    // set frame height

    script += 'var customFrame = window.parent.document.getElementById("snavPortlet");';
    script += 'if (!!customFrame && !isSetFrameHeight) {';
    script += 'setTimeout(function () {';
    script += '    customFrame = window.parent.document.getElementById("snavPortlet");';
    script += '    customFrame.style.height = (customFrame.height * 1 + 6) + "px";';
    script += '    customFrame.height = (customFrame.height * 1 + 6) + "px";';
    script += '}, 10);';

    script += '    isSetFrameHeight = true;';
    script += '}';

    // hide the upper submit button
    script += '    var st1 = document.getElementById("tbl_' + COMMON.BTN_SUBMITTER_ID + '");';
    script += '    if(st1){';
    script += '        st1.style.display = "none";';
    script += '    }';
    // hide form title
    script += '    var st2 = document.getElementById("' + "main_form" + '");';
    script += '    if(st2){';
    script += '        st2.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0].style.display = "none"';
    script += '    }';
    // set the position of Total Found Field
    script += '    var st4 = document.getElementById("' + COMMON.INLINEHTML_INLINE_SCRIPT_ID + '_val");';
    script += '    if(st4){';
    script += '        if(nlapiGetField("'+ COMMON.SELECT_SELECTED_SO_PAGE_ID +'"))';
    script += '            st4.parentElement.parentElement.parentElement.parentElement.parentElement.style.width = 1 + "px";';
    script += '        else';
    script += '            st4.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = "none";';
    script += '    }';
    // set the height of portlet according to the height of COMMON.SERVER_COMMANDS_ID (hidden iframe under secondary submit button)
    script += '    var st6 = document.getElementById("' + COMMON.SERVER_COMMANDS_ID + '");';
    script += '    if(st6){';
    //script += '        window.parent.document.getElementById(frameElement.id).height = st6.offsetTop;';
    script += '    }';
    // remove the onclick event from the column's labels of sublist to prevent sorting
    script += '    var st7 = document.getElementById("' + COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID + 'header");';
    script += '    if(st7){';
    script += '        var getTR = document.getElementById("' + COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID + 'header");';
    script += '        var getTDs = getTR.getElementsByTagName("td");';
    script += '        for(var i in getTDs){';
    script += '            getTDs[i].onclick = null;';
    script += '        }';
    // remove the small arrow fro last column that show sorted order
    script += '        getTDs[getTDs.length-1].getElementsByTagName("div")[0].getElementsByTagName("span")[0].style.display = "none";';
    script += '    }';
    // if all are done then stop the timer
    //script += '    if(isValidValue(st1) && isValidValue(st2) && isValidValue(st4) && isValidValue(st6) && isValidValue(st7)){';
    script += '    if(isValidValue(st1) && isValidValue(st2) && isValidValue(st4) && isValidValue(st7)){';
    script += '        clearInterval(t1);';
    script += '    }';
    script += '},1);';
    script += '</script>';

    inlineField.setDefaultValue(script);
}


// add select field for pagination

function addSelectFieldForPagination(form, totalSos, reqPage){
    var totalPages = 0;
    if(totalSos>sosPerPage){
        // calculated total pages
        totalPages = parseInt(totalSos/sosPerPage);
        // add one page into totalPages if remainder is not equal to zero
        if(totalSos%sosPerPage != 0){
            totalPages+=1;
        }

        // create select field on from
        var selectField = form.addField(COMMON.SELECT_SELECTED_SO_PAGE_ID, 'select', 'From-To');
        var selected = false;
        for(var i=0;i<totalPages;i++){
            var from = (i*sosPerPage)+1;
            var till = (i*sosPerPage)+sosPerPage;
            // set the option for the requested page
            if(reqPage-1 == i)
                selected = true;
            else
                selected = false;
            // claculate data the last option
            if(i+1 >= totalPages && totalSos%sosPerPage > 0)
                till = (i*sosPerPage) + totalSos%sosPerPage;
            selectField.addSelectOption(i+1, from + '-' + till, selected);
        }
    }
}

// return sos to display and columns
function getSosAndColumnsToDisplay(customerId, request){
    // load search
    var loadSearch = nlapiLoadSearch('transaction',COMMON.SAVED_SEARCH.SYSTEM_ORDERS_ON_HOLD_CUSTOMER_DASHBOARD_ID);

    // add filters and a column
    loadSearch.addFilter(new nlobjSearchFilter('entity',null,'is', customerId));
    // scheduled script handling, not to show the customer whose sos is being released
    var customerArr = ReleaseOnHoldCustomers.customersInProcess();
    if(customerArr.length > 0) {
        loadSearch.addFilter(new nlobjSearchFilter('entity', null, 'noneof', customerArr, null));
    }
    //loadSearch.addFilter(new nlobjSearchFilter(COMMON.TO_BE_RELEASED_ID, 'customer', 'is', 'F'));
    // add a filter to prevent the memorized transactions
    loadSearch.addFilter(new nlobjSearchFilter('memorized', null, 'is', 'F'));

    loadSearch.addColumn(new nlobjSearchColumn('entity'))

    var searchColumns = new Array();
    var searchColumns = loadSearch.getColumns();

    // get requested page
    var reqPage = request.getParameter(COMMON.SELECT_SELECTED_SO_PAGE_ID);

    if(reqPage){
        reqPage = parseInt(reqPage);
    }else{
        reqPage = 1;
    }

    // display request page - pagination
    var from = parseInt((reqPage-1)*sosPerPage);
    var till = parseInt(reqPage*sosPerPage);

    // get the requested chunk from saved search
    return [loadSearch.runSearch().getResults(from,till), searchColumns, reqPage];
}

// add and set Total Found Field and add client script to the form
function addAndSetTotalFoundAndClientScript(form, totalSos){
    // add and set the Total Found field with overall onhold SOs
    form.addField(COMMON.TEXT_TOTAL_FOUND_ID, 'text', 'Total Found').setDisplayType('inline').setDefaultValue(totalSos.toString());
    form.addField(COMMON.TEXT_CUSTPAGE_HIDDEN_ID, 'text', '').setDisplayType('hidden').setDefaultValue('release');
    form.addSubmitButton('Release Selected SOs');

    // add client script to the form
    form.setScript(COMMON.SCRIPT.CL_RELEASE_CUSTOMER_ORDER_SO_ID);
}

function isValidVlue(value){
    return !(value == '' || value == null || typeof value == 'undefined');
}

// this function release the all salses orders of a customer
function releaseAllOnHoldSOs(customerId){
    nlapiLogExecution('DEBUG', 'In Release All OnHold SO', '');
    //nlapiSubmitField('customer', customerId, COMMON.TO_BE_RELEASED_ID, 'T');
    ReleaseOnHoldCustomers.updateStatus(customerId, 'T');
    var status = nlapiScheduleScript(COMMON.SCRIPT.SS_RELEASE_ALL_ON_HOLD_SOS_ID, COMMON.SCRIPT.SS_DEPLOYMENT_RELEASE_ALL_ON_HOLD_SOS_ID);
    nlapiLogExecution('DEBUG', 'status: ', status);
    refreshPortlet('All SOs will be released in few minutes. Page Refresh in 2 seconds');
}

// refresh the portlet
function refreshPortlet(msg){
    var form = nlapiCreateForm('');
    form.addSubmitButton('Return to main page');
    // TO DO: id to common dao
    var inlinehtmlField = form.addField('custpage_redirect', 'inlinehtml');
    var reloadPageScript = '';

    // set the customer id for home dashboard portlet
    var field2 = form.addField(COMMON.CUSTOMER_ID, 'text', '');
    field2.setDisplayType('hidden');
    var custId = request.getParameter(COMMON.TEXT_SO_CUSTOMERID_ID);
    if(custId){
        field2.setDefaultValue(custId);
    }

    reloadPageScript += "<script type = 'text/javascript'>";

    reloadPageScript += 'var t1 = setInterval(function(){';

    reloadPageScript += '    var st1 = document.getElementById("tbl_' + COMMON.BTN_SUBMITTER_ID + '");';
    reloadPageScript += '    if(st1){';
    reloadPageScript += '        st1.style.display = "none";';
    reloadPageScript += '    }';
    // if "hide the button" is done then stop the timer
    reloadPageScript += '    if(st1){';
    reloadPageScript += '        clearInterval(t1);';
    reloadPageScript += '    }';
    reloadPageScript += '},1);';
    // diplay message
    reloadPageScript += "document.write('" + msg + "');";

    // refersh portlet after 2 seconds
    reloadPageScript += "setTimeout(function(){";
    // TO DO: id to common dao - make general sumbitter
    reloadPageScript += "var submitButton = document.getElementById('" + COMMON.BTN_SUBMITTER_ID + "');";
    reloadPageScript += "submitButton.click();";
    reloadPageScript += "}, 3000);";

    reloadPageScript += "</script>";

    inlinehtmlField.setDefaultValue(reloadPageScript);
    response.writePage(form);
}


// add the inline script to the form for cutomers list
function addInlineScriptForCustomerList(form){
    var inlineField = form.addField(COMMON.INLINEHTML_INLINE_SCRIPT_ID, 'inlinehtml', '');
    var script = '<script type="text/javascript">';
    script += 'var lastRow = null;';
    script += 'function isValidValue(value){';
    script += '    return !(value == "" || value == null || typeof value == "undefined");';
    script += '}';
    script += 'var t1 = setInterval(function(){';
    // hide the upper submit button
    script += '    var st1 = document.getElementById("tbl_' + COMMON.BTN_SUBMITTER_ID + '");';
    script += '    if(st1){';
    script += '        st1.style.display = "none";';
    script += '    }';
    // hide form title
    script += '    var st2 = document.getElementById("' + "main_form" + '");';
    script += '    if(st2){';
    script += '        st2.getElementsByTagName("table")[0].getElementsByTagName("tbody")[0].getElementsByTagName("tr")[0].style.display = "none";';
    script += '    }';
    // set the position of Total Found Field
    script += '    var st4 = document.getElementById("' + COMMON.INLINEHTML_INLINE_SCRIPT_ID + '_val");';
    script += '    if(st4){';
    script += '        if(nlapiGetField("' + COMMON.SELECT_SELECTED_CUSTOMER_PAGE_ID + '"))';
    script += '            st4.parentElement.parentElement.parentElement.parentElement.parentElement.style.width = 1 + "px";';
    script += '        else';
    script += '            st4.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = "none";';
    script += '    }';
    // set the height of portlet according to the height of COMMON.SERVER_COMMANDS_ID (hidden iframe under secondary submit button)
    script += '    var st6 = document.getElementById("' + COMMON.SERVER_COMMANDS_ID + '");';
    script += '    if(st6){';
    //script += '        window.parent.document.getElementById(frameElement.id).height = st6.offsetTop;';
    script += '    }';
    // remove the onclick event from the column's labels of sublist to prevent sorting
    script += '    var st7 = document.getElementById("' + COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID + '_splits");';
    script += '    if(st7){';
    script += '        var getTR = document.getElementById("' + COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID + 'header");';
    script += '        var getTDs = getTR.getElementsByTagName("td");';
    script += '        for(var i in getTDs){';
    script += '            getTDs[i].onclick = null;';
    script += '        }';
    // remove the small arrow from last column that show sorted order
    script += '        getTDs[getTDs.length-1].getElementsByTagName("div")[0].getElementsByTagName("span")[0].style.display = "none";';
    script += '    }';
    // bold the last line and hide checkbox
    script += 'var lineCount = nlapiGetLineItemCount("' + COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID + '");';
    script += 'if(isValidValue(lineCount)){';
    script += '    var lastRowId = "' + COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID + 'row" + (lineCount - 1).toString();';
    script += '    lastRow = document.getElementById(lastRowId);';
    script += '    if(lastRow){';
    script += '        lastRow.style.fontWeight = "bold";';
    script += '        var getCheckBox = lastRow.getElementsByTagName("td")[0];';
    script += '        getCheckBox.style.visibility = "hidden";';
    script += '    }';
    script += '}';

    // if all are done then stop the timer
    //script += '    if(isValidValue(st1) && isValidValue(st2) && isValidValue(st4) && isValidValue(st6) && isValidValue(st7) && isValidValue(lastRow)){';
    script += '    if(isValidValue(st1) && isValidValue(st2) && isValidValue(st4) && isValidValue(st7) && isValidValue(lastRow)){';
    script += '        clearInterval(t1);';
    script += '    }';
    script += '},1);';
    script += '</script>';

    inlineField.setDefaultValue(script);
}