/*
 * Dependency Files:
 *
 * rico_release_onhold_customers_dao.js
 *
 * */

var sosPerPage = 50;
var customersPerPage = 50;

function projectMap(req, res) {

    var request = req;
    var response = res;
    
    nlapiLogExecution('DEBUG', 'In suitelet', 'details');
    nlapiLogExecution('DEBUG', 'cuspage_hidden', request.getParameter(COMMON.TEXT_CUSTPAGE_HIDDEN_ID));
    nlapiLogExecution('DEBUG', 'ispagereq', request.getParameter(COMMON.CHKBOX_PAGE_REQUEST_ID));
    nlapiLogExecution('DEBUG', 'selectedcustomerpage', request.getParameter(COMMON.SELECT_SELECTED_CUSTOMER_PAGE_ID));
    
    // this block of code executes when release all button is clicked from sales orders list
    if(request.getParameter(COMMON.CHKBOX_RELEASE_ALL_CUST_DASHBOARD_ID) == 'T'){
        // get the customer id and onHold SO count from submitted sublist
        var customerId = request.getParameter(COMMON.TEXT_SO_CUSTOMERID_ID);
        if(isValidVlue(customerId)){
            // release all sos
            releaseAllOnHoldSOs(customerId);
        }else{
            response.write('Invalid Customer Id');
        }
    }
    else
    // this block of code executes when release all button is clicked from customer list after selecting customer
    if(request.getParameter(COMMON.CHKBOX_RELEASE_ALL_ID) == 'T'){
        // get the customer id and onHold SO count from submitted sublist
        var customerId;
        nlapiLogExecution('DEBUG', 'Find Select Customer', '');
        var sublistCount = request.getLineItemCount(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID);
        for(var i=1;i<=sublistCount;i++){
            nlapiLogExecution('DEBUG', 'Find Select Customer Line: ' + i, '');
            var isSelected = request.getLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID, i);
            if(isSelected == 'T'){
                customerId = request.getLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_CUST_CUSTOMERID_ID, i);
                break;
            }
        }
        if(isValidVlue(customerId)){
            // release all sos
            releaseAllOnHoldSOs(customerId);
        }else{
            response.write('Invalid Customer Id');
        }
    }
    else
    // this block of code execute when the user release the selected SOs
    if(request.getParameter(COMMON.TEXT_CUSTPAGE_HIDDEN_ID) == 'release' 
        && 
        (!isValidVlue(request.getParameter(COMMON.CHKBOX_IS_SO_REQUEST_ID))||request.getParameter(COMMON.CHKBOX_IS_SO_REQUEST_ID)=='F')){
        // this function release the selected salses order
        releaseSOsFromOnHold();
    }
    else
    // this block of code execute when the user select the customer to display his on hold SOs
    if(
        (request.getParameter(COMMON.TEXT_CUSTPAGE_HIDDEN_ID) == 'show' 
            && 
            (!isValidVlue(request.getParameter(COMMON.CHKBOX_PAGE_REQUEST_ID))||request.getParameter(COMMON.CHKBOX_PAGE_REQUEST_ID)=='F'))
        || 
        (request.getParameter(COMMON.CHKBOX_IS_SO_REQUEST_ID)=='T')
        ){
        var customerId;
        var customerOnholdSo;
        var sublistCount = request.getLineItemCount(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID);
        
        // get the customer id and onHold SO count from submitted sublist
        for(var i=1;i<=sublistCount;i++){
            var isSelected = request.getLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID, i);
            if(isSelected == 'T'){
                customerId = request.getLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_CUST_CUSTOMERID_ID, i);    
                customerOnholdSo = request.getLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_TOTAL_ONHOLD_SOS_ID, i);    
                break;
            }
        }
        
        // get the customer id and onHold SO count from submitted sublist - data avaiable here if suitelet is redirected from SO list to SO list in case of pagination
        var custid = request.getParameter(COMMON.TEXT_SO_CUSTOMERID_ID);
        var custTotalOnhold = request.getParameter(COMMON.TEXT_CUSTOMER_ON_HOLD_SOS_ID);
        
        // create a form to display customer's onhold sales order'
        var form = nlapiCreateForm('Customer SOs', true); 
        // for consistancy - create hidden fields to hold the customer id and onhold SO count in case of pagination
        form.addField(COMMON.CHKBOX_IS_SO_REQUEST_ID, 'checkbox', '').setDisplayType('hidden');
        var field2 = form.addField(COMMON.TEXT_SO_CUSTOMERID_ID, 'text', '');
        field2.setDisplayType('hidden');
        var field3 = form.addField(COMMON.TEXT_CUSTOMER_ON_HOLD_SOS_ID, 'text', '');
        field3.setDisplayType('hidden');
        
        // set the id of customer and onhold SO count when page is referred from customer list
        if(isValidVlue(customerId)){
            field2.setDefaultValue(customerId);
            field3.setDefaultValue(customerOnholdSo);
        }else
        // set the id of customer and onhold SO count in case of pagination
        if(isValidVlue(custid))
        {
            customerId = custid;
            customerOnholdSo = custTotalOnhold;
            field2.setDefaultValue(custid);
            field3.setDefaultValue(custTotalOnhold);
        }else{
            response.writePage('Customer Id not found');
            return;
        }
        
        // create sublist for diplaying SO list
        var sublist = form.addSubList(COMMON.SUBLIST.CUSTOMER_SOS.INTERNAL_ID, 'list', COMMON.SUBLIST.CUSTOMER_SOS.TITLE);
        sublist.addMarkAllButtons();
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_SOS_ID, 'checkbox', '');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.URL_CUSTOMER_SO_VIEW_ID, 'url', 'View').setLinkText( "View");
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.URL_CUSTOMER_DASHBOARD_ID, 'url', 'Dashboard').setLinkText('Dashboard');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_CUSTOMER_NAME_ID, 'text', 'Name');
        
        sublist.addField('shipmethod', 'text', 'Name');
        
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_SHIP_DATE_ID, 'text', 'Ship Date');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_NUMBER_ID, 'text', 'SO#');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_PO_NUMBER_ID, 'text', 'PO#');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_TOTAL_ID, 'text', 'Total');
        //sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_ON_HOLD_ID, 'text', 'On Hold');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_ID, 'text', 'SO Id').setDisplayType('hidden');
        
        // add the inline script to the form
        addInlineScript(form);
        
        // get the requested chunk of sos and get columns from saved search
        var sosAndCols = getSosAndColumnsToDisplay(customerId, request)
        // get sos
        var sos = sosAndCols[0];
        // get columns
        var searchColumns = sosAndCols[1];
        // get requested page
        var reqPage = sosAndCols[2];

        if(sos!=null && sos.length>0){
            
            var totalSos = parseInt(customerOnholdSo);
            var totalPages = 0;

            // add select field for pagination
            addSelectFieldForPagination(form, totalSos, reqPage);
            
            // create cutomer dashboard url
            var dashboardUrl = COMMON.CUSTOMER_DASHBOARD_URL_ID + customerId;
            // set lines for the SOs list
            for(var i=0;i<sos.length;i++){
                var viewUrl = nlapiResolveURL('RECORD', 'salesorder', sos[i].getId(), 'VIEW');
                var poNumber = sos[i].getValue(searchColumns[1]);
                var soNumber = sos[i].getValue(searchColumns[2]);
                var shipDate = sos[i].getValue(searchColumns[3]);
                var total = sos[i].getValue(searchColumns[4]);
                if(parseFloat(total)==0){
                    total = "0.00";
                }
                //var onHold = sos[i].getValue(searchColumns[5]);
                var customerName = sos[i].getText(searchColumns[6]);
                var soId = sos[i].getId();
                
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.URL_CUSTOMER_SO_VIEW_ID, i+1, viewUrl);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.URL_CUSTOMER_DASHBOARD_ID, i+1, dashboardUrl);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_CUSTOMER_NAME_ID, i+1, customerName);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_SHIP_DATE_ID, i+1, shipDate);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_NUMBER_ID, i+1, poNumber);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_PO_NUMBER_ID, i+1, soNumber);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_TOTAL_ID, i+1, total);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_ID, i+1, soId);
            // set the value to 'Yes' of onHold is 'T'
            /*var t = 'No';
                if(onHold == 'T'){
                    t = 'Yes';
                }
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_ON_HOLD_ID, i+1, t);*/
            }
            
        }
        
        
        if(parseInt(totalSos)>0){
            // add and set Total Found Field and add client script to the form
            addAndSetTotalFoundAndClientScript(form, totalSos);
        }else{
            // if no onhlod so found
            //response.write('No On Hold SO found.');
            refreshPortlet('No On Hold SO found on this page. Portlet Refresh in 2 seconds.')
            return;
        }
        
        /* Feature: Add release all sos: start */
        // add hidden field for releasing all sos at once
        form.addField(COMMON.CHKBOX_RELEASE_ALL_CUST_DASHBOARD_ID, 'checkbox', '').setDisplayType('hidden');
        
        // submit the form
        var script = '';
        script += "var submitButton = document.getElementById('secondary" + COMMON.BTN_SUBMITTER_ID + "');";
        script += "nlapiSetFieldValue('" + COMMON.CHKBOX_RELEASE_ALL_CUST_DASHBOARD_ID + "', 'T');";
        script += "submitButton.click();";
        
        // add release all salesorders button
        form.addButton(COMMON.BTN_RELEASE_ALL_ID, 'Release All SOs', script);
        /* Feature: Add release all sos: end */
        
        nlapiLogExecution('DEBUG', 'Berfore response.writePage', 'Remaining Usage: ' + nlapiGetContext().getRemainingUsage());
        
        // write the from
        response.writePage(form);
    }
    else{
        // create form to display customer list
        var form = nlapiCreateForm('Customer Map', true);         
        form.addField(COMMON.CHKBOX_PAGE_REQUEST_ID, 'checkbox', '').setDisplayType('hidden');
        var sublist = form.addSubList(COMMON.SUBLIST.ON_HOLD_ENTERIES.INTERNAL_ID, 'list', COMMON.SUBLIST.ON_HOLD_ENTERIES.TITLE);
        sublist.addField(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.CHKBOX_CUSTOMER_SELECT_ID, 'checkbox', '');
        sublist.addField(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_CUST_CUSTOMER_NAME_ID, 'text', 'Name');
        sublist.addField('shippingmethod', 'text', 'Ship Method');
        sublist.addField(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_TOTAL_ONHOLD_SOS_ID, 'text', 'Number on Hold');
        sublist.addField(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_SHIP_DATE_ID, 'text', 'Ship Date(Min)');
        sublist.addField(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_TOTAL_ONHOLD_SOS_AMOUNT_ID, 'text', 'Total on Hold');
        sublist.addField(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_CUST_CUSTOMERID_ID, 'text', 'Customer Id').setDisplayType('hidden');
        
        addInlineScriptForCustomerList(form);
        
        // get all onhold customers that can be more than thousand
        var onHoldCustomers = getAllCustomers(COMMON.SAVED_SEARCH.SYSTEM_ORDERS_ON_HOLD_ID);// System - Orders on Hold
        
        nlapiLogExecution('DEBUG', 'Number of Customers on Hold', onHoldCustomers.length);
    
        if(onHoldCustomers!=null && onHoldCustomers.length>0){
            // get all columns
            var column = onHoldCustomers[0].getAllColumns();
            
            var numberOnhold = 0;
            var totalOnhold = 0;
            // calculate total onHold Sos and its total amount
            for(var i in onHoldCustomers){
                numberOnhold += parseInt(onHoldCustomers[i].getValue(column[1]));
                totalOnhold += parseFloat(onHoldCustomers[i].getValue(column[2]));
            }
            
            // set total customers
            var totalCustomers = parseInt(onHoldCustomers.length);
            var totalPages = 0;
            // get requested page
            var reqPage = request.getParameter(COMMON.SELECT_SELECTED_CUSTOMER_PAGE_ID);
            
            if(reqPage){
                reqPage = parseInt(reqPage);
            }else{
                reqPage = 1;
            }
            if(totalCustomers>customersPerPage){
                // calculated total pages
                totalPages = parseInt(totalCustomers/customersPerPage);
                // add one page into totalPages if remainder is not equal to zero
                if(totalCustomers%customersPerPage != 0){
                    totalPages+=1;
                }
                // create select field on from
                var selectField = form.addField(COMMON.SELECT_SELECTED_CUSTOMER_PAGE_ID, 'select', 'From-To');
                // set the width of select field
                selectField.setDisplaySize(115);
                var selected = false;
                for(var i=0;i<totalPages;i++){
                    //var from = (i*10)+1;
                    //var till = (i*10)+10;
                    var from = (i*customersPerPage);
                    var till = (i*customersPerPage)+ parseInt(customersPerPage) - 1;
                    // select the option for the requested page
                    if(reqPage-1 == i)
                        selected = true;
                    else
                        selected = false;
                    // claculate data the last option
                    if(i+1 >= totalPages && totalCustomers%customersPerPage > 0)
                        till = (i*customersPerPage) + totalCustomers%customersPerPage - 1;
                    selectField.addSelectOption(i+1, getEntityId(onHoldCustomers[from].getText(column[0])) + ' — ' + getEntityId(onHoldCustomers[till].getText(column[0])), selected);
                }
            }
            
            // display request page - pagination
            var from = parseInt((reqPage-1)*customersPerPage);
            var till = parseInt((reqPage*customersPerPage)-1);
            
            // create an array of requested customers to display
            var pageResultArray = [];
            for(var i = from; i <= till && i < onHoldCustomers.length;i++){
                pageResultArray.push(onHoldCustomers[i]);
            }
            onHoldCustomers = pageResultArray;
            
            var label = "Overall Total";
            var lastLine = 0;
            
            // set lines for the SOs list
            for(var i=0; i<onHoldCustomers.length;i++){
                var customerName = onHoldCustomers[i].getText(column[0]);
                var customerId = onHoldCustomers[i].getValue(column[0]);
                var onHoldSO =  onHoldCustomers[i].getValue(column[1]);
                var onHoldSOAmount = onHoldCustomers[i].getValue(column[2]);
                var shipDateMin = onHoldCustomers[i].getValue(column[3]);
                var shipMeth = onHoldCustomers[i].getText(column[4]);               
                

                //nlapiLogExecution('DEBUG', 'Add line number '+i+1, customerName +' '+ onHoldSO +' '+ onHoldSOAmount);
                
                sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_CUST_CUSTOMER_NAME_ID, i+1, customerName);
                sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_TOTAL_ONHOLD_SOS_ID, i+1, onHoldSO);
                sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_TOTAL_ONHOLD_SOS_AMOUNT_ID, i+1, onHoldSOAmount);
                sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_CUST_CUSTOMERID_ID, i+1, customerId);
                sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_SHIP_DATE_ID, i+1, shipDateMin);
                sublist.setLineItemValue('shippingmethod', i+1, shipMeth);
            }
            lastLine = onHoldCustomers.length +1;
            
            nlapiLogExecution('DEBUG', 'LastLine', lastLine);
            // set the values in last line
            sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_CUST_CUSTOMER_NAME_ID, lastLine, label);
            sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_TOTAL_ONHOLD_SOS_ID, lastLine, numberOnhold.toString());
            sublist.setLineItemValue(COMMON.SUBLIST.ON_HOLD_ENTERIES.ColumnFieldName.TEXT_TOTAL_ONHOLD_SOS_AMOUNT_ID, lastLine, round_float_with_precision(totalOnhold, 2));
        }else{
            // if no onhold customer exists
            response.write('There is no onHold Customer.');
            return;
        }
        // add and set the Total Found field with overall onhold Customers
        form.addField(COMMON.TEXT_TOTAL_FOUND_ID, 'text', 'Total Found').setDisplayType('inline').setDefaultValue(totalCustomers.toString());
        form.addField(COMMON.TEXT_CUSTPAGE_HIDDEN_ID, 'text', '').setDisplayType('hidden').setDefaultValue('show');
        form.addSubmitButton('Show Customer SOs');         
        // add client script to the form
        form.setScript(COMMON.SCRIPT.CL_RELEASE_CUSTOMER_ORDER_ID);
        
        /* Feature: Add release all sos: start */
        // add hidden field for releasing all sos at once
        form.addField(COMMON.CHKBOX_RELEASE_ALL_ID, 'checkbox', '').setDisplayType('hidden');
        
        // submit the form
        var script = '';
        script += "var submitButton = document.getElementById('secondary" + COMMON.BTN_SUBMITTER_ID + "');";
        script += "nlapiSetFieldValue('" + COMMON.CHKBOX_RELEASE_ALL_ID + "', 'T');";
        script += "submitButton.click();";
        
        // add release all salesorders button
        form.addButton(COMMON.BTN_RELEASE_ALL_ID, 'Release All SOs', script);
        /* Feature: Add release all sos: end */
        
        nlapiLogExecution('DEBUG', 'Berfore response.writePage', 'Remaining Usage: ' + nlapiGetContext().getRemainingUsage());
        // write the from
        response.writePage(form);     
    }               
  
}  

// get a saved search id and returns all the search result i.e. if 6000 result exists then return array of 6000 objects
function getAllCustomers(savedSearchId){
    var onHoldCustomers;
    try{
        onHoldCustomers = nlapiLoadSearch(null, savedSearchId);
    }catch(ex){
        nlapiLogExecution('ERROR', 'Error in Loading Search Id: ' + savedSearchId, ex.message);
        return null;
    }
    // scheduled script handling, not to show the customer whose sos is being released
    // get customers from customer record which are in release procees.
    var customerArr = ReleaseOnHoldCustomers.customersInProcess();
    if (customerArr.length > 0) {
        onHoldCustomers.addFilter(new nlobjSearchFilter('entity', null, 'noneof', customerArr, null));
    }
    //onHoldCustomers.addFilter(new nlobjSearchFilter(COMMON.TO_BE_RELEASED_ID, 'customer', 'is', 'F'));

    // add a filter to prevent the memorized transactions
    onHoldCustomers.addFilter(new nlobjSearchFilter('memorized', null, 'is', 'F'));
    
    var runSearch = onHoldCustomers.runSearch();
    
    var start = 0, end = 1000;
    
    var chunk = runSearch.getResults(start, end);
    
    var result = [];
    
    if(chunk != null){
        result = result.concat(chunk);

        while(chunk.length == 1000){
            start += 1000;
            end += 1000;
            chunk = runSearch.getResults(start, end);
            if(chunk != null)
                result = result.concat(chunk);
        }
    }
    return result;
}

// get a name of customer and return its first part i.e. '100000 Rico Industries' return '100000'
function getEntityId(cutomerName){
    if(cutomerName){
        return cutomerName.split(' ')[0];
    }
    return '';
}

// funtion to set the digits after decimal
function round_float_with_precision(number,precision){
    var g=number+"";
    if(g.indexOf(".")<0){
        return number;
    }
    if(g.length-g.indexOf(".")-1<=precision){
        return number;
    }
    var c=Math.abs(number);
    c=c+1e-14;
    var f=Math.pow(10,precision);
    c=Math.floor((c*f)+0.5)/f;
    c=c*(number>=0?1:-1);
    if(c==0){
        return 0;
    }
    return c;
}