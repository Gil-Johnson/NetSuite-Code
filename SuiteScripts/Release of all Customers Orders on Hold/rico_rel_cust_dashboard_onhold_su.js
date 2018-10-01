/*
 * Dependency Files:
 *
 * rico_release_onhold_customers_dao.js
 *
 * */

var sosPerPage = 50;

function customerDashboardPortlet(req, res) {

    var request = req;
    var response = res;

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
    if(request.getParameter(COMMON.TEXT_CUSTPAGE_HIDDEN_ID) == 'release'
        &&
        (!isValidVlue(request.getParameter(COMMON.CHKBOX_IS_SO_REQUEST_ID))||request.getParameter(COMMON.CHKBOX_IS_SO_REQUEST_ID)=='F')){
        // this function release the selected salses order
        releaseSOsFromOnHold();
    }
    else
    // this block of code execute when the user select the customer to display his on hold SOs
    if(
        (!isValidVlue(request.getParameter(COMMON.CHKBOX_PAGE_REQUEST_ID))||request.getParameter(COMMON.CHKBOX_PAGE_REQUEST_ID)=='F')
            ||
            (request.getParameter(COMMON.CHKBOX_IS_SO_REQUEST_ID)=='T')
        ){

        nlapiLogExecution('DEBUG', 'In display on hold SO', '');
        var customerId;
        var customerOnholdSo;

        // get the customer id and onHold SO count from url parameter
        customerId = request.getParameter(COMMON.CUSTOMER_ID);

        nlapiLogExecution('DEBUG', 'Customer Id: ' + customerId, '');

        // get the customer id and onHold SO count from submitted sublist - data avaiable here if suitelet is redirected from SO list to SO list in case of pagination
        var custid = request.getParameter(COMMON.TEXT_SO_CUSTOMERID_ID);
        var custTotalOnhold = request.getParameter(COMMON.TEXT_CUSTOMER_ON_HOLD_SOS_ID);

        nlapiLogExecution('DEBUG', 'custid: ' + custid, '');

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
            // get the count of onhold SOs of customer
            nlapiLogExecution('DEBUG', 'Customer Id: ' + customerId, '');
            customerOnholdSo = getonHoldSOCount(customerId);
            if(customerOnholdSo == 0){
                // if no onhlod so found
                response.write('No On Hold SO found.');
                return;
            }
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
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_TRAN_DATE_ID, 'text', 'Date');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_NUMBER_ID, 'text', 'Number');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_PO_NUMBER_ID, 'text', 'PO#');
        sublist.addField('shipmeth', 'text', 'Ship Method');
        sublist.addField(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_SHIP_DATE_ID, 'text', 'Ship Date');
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

            // add select field for pagination
            addSelectFieldForPagination(form, totalSos, reqPage);

            // set lines for the SOs list
            for(var i=0;i<sos.length;i++){
                var viewUrl = nlapiResolveURL('RECORD', 'salesorder', sos[i].getId(), 'VIEW');
                var date = sos[i].getValue(searchColumns[0]);
                var poNumber = sos[i].getValue(searchColumns[1]);
                var soNumber = sos[i].getValue(searchColumns[2]);
                var shipDate = sos[i].getValue(searchColumns[3]);
                var total = sos[i].getValue(searchColumns[4]);
                var shipMethod = sos[i].getText(searchColumns[7]);
                if(parseFloat(total)==0){
                    total = "0.00";
                }
                //var onHold = sos[i].getValue(searchColumns[5]);
                var soId = sos[i].getId();

                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.URL_CUSTOMER_SO_VIEW_ID, i+1, viewUrl);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_TRAN_DATE_ID, i+1, date);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_PO_NUMBER_ID, i+1, soNumber);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_NUMBER_ID, i+1, poNumber);
                sublist.setLineItemValue('shipmeth', i+1, shipMethod);
                sublist.setLineItemValue(COMMON.SUBLIST.CUSTOMER_SOS.ColumnFieldName.TEXT_SO_SHIP_DATE_ID, i+1, shipDate);
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
        response.write('UNEXPECTED ERROR OCCURED!');
    }
}

// this function takes customer id and return its total onhold so
function getonHoldSOCount(customerId){
    var onHoldCustomers = nlapiLoadSearch(null, COMMON.SAVED_SEARCH.SYSTEM_ORDERS_ON_HOLD_ID);
    var columns = onHoldCustomers.getColumns();
    onHoldCustomers.addFilter(new nlobjSearchFilter('entity', null, 'is', customerId));
    // scheduled script handling, not to show the customer whose sos is being released
    // get customers from customer record which are in release procees.
    var customerArr = (function () {
        var customerIds = [];
        var fils = [];
        fils.push(new nlobjSearchFilter(ReleaseOnHoldCustomers.FieldName.Status, null, 'is', 'T', null));
        var result = ReleaseOnHoldCustomers.lookup(fils);
        if (result.length > 0) {
            for (var i in result) {
                var custId = result[i].getValue(ReleaseOnHoldCustomers.FieldName.CustomerId);
                if (customerIds.indexOf(custId) === -1) {
                    customerIds.push(custId);
                }
            }
        }
        return customerIds;
    })();
    if (customerArr.length > 0) {
        onHoldCustomers.addFilter(new nlobjSearchFilter('entity', null, 'noneof', customerArr, null));
    }
    //onHoldCustomers.addFilter(new nlobjSearchFilter(COMMON.TO_BE_RELEASED_ID, 'customer', 'is', 'F'));

    // add a filter to prevent the memorized transactions
    onHoldCustomers.addFilter(new nlobjSearchFilter('memorized', null, 'is', 'F'));

    var runSearch = onHoldCustomers.runSearch();
    var start = 0, end = 1000;
    var chunk = runSearch.getResults(start, end);
    nlapiLogExecution('DEBUG', 'chunk.length' + chunk.length, chunk.toSource());
    if(chunk != null && chunk.length>0){
        return chunk[0].getValue(columns[1]);
    }else{
        return 0;
    }
}