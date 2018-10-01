/*
* Dependency Files:
*
* rico_release_onhold_customers_dao.js
*
* */

function releaseAllOnholdSos(type){
    var ctx = nlapiGetContext();
    var customers = getOnholdCustomers();
    if (customers.length > 0) {
        // iterate on customers array
        for(var custIndex in customers){
            //var customerId = customers[custIndex].getId();
            var customerId = customers[custIndex];
            var onHoldSalesOrders = getOnHoldSos(customerId);
            nlapiLogExecution('DEBUG', 'remaining usage after loading customers and sos', 'remaining usage: ' + ctx.getRemainingUsage());
            if(onHoldSalesOrders != null){
                // iterate on salesorders array
                for(var soIndex in onHoldSalesOrders){
                    var soId = onHoldSalesOrders[soIndex].getId();
                    // update the SO's checkboxes
                    //nlapiSubmitField('salesorder', soId, [COMMON.SALES_ORDER.FieldName.CHKBOX_ON_HOLD_ID, COMMON.SALES_ORDER.FieldName.CHKBOX_RELEASE_FROM_HOLD_ID], ['F','T']);
                    var soRec = nlapiLoadRecord('salesorder', soId, {disabletriggers: true});
                    soRec.setFieldValue(COMMON.SALES_ORDER.FieldName.CHKBOX_ON_HOLD_ID, 'F');
                    soRec.setFieldValue(COMMON.SALES_ORDER.FieldName.CHKBOX_RELEASE_FROM_HOLD_ID, 'T');
                    nlapiSubmitRecord(soRec, {disabletriggers: true});

                    nlapiLogExecution('DEBUG', 'remaining usage after releasing so: ' + soId, 'remaining usage: ' + ctx.getRemainingUsage());
                    if(ctx.getRemainingUsage() < 6000){
                        nlapiLogExecution('DEBUG', 'remaining usage < 1000', 'remaining usage: ' + ctx.getRemainingUsage());
                        nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId());
                        return;
                    }
                }
            }
            //nlapiSubmitField('customer', customerId, COMMON.TO_BE_RELEASED_ID, 'F');
            ReleaseOnHoldCustomers.updateStatus(customerId, 'F');
        }
        nlapiLogExecution('DEBUG', 'After all customers released', 'remaining usage: ' + ctx.getRemainingUsage());
        // recheck if another customer has been release within the processing of salesorder
        nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId());
        return;
    }
}

function getOnholdCustomers(){
    return  ReleaseOnHoldCustomers.customersInProcess();
    /*return nlapiSearchRecord('customer', null,
        [
        new nlobjSearchFilter(COMMON.TO_BE_RELEASED_ID, null, 'is', 'T')
        ], null);*/
}

function getOnHoldSos(customerId){
    // load search
    var loadSearch = nlapiLoadSearch('transaction',COMMON.SAVED_SEARCH.SYSTEM_ORDERS_ON_HOLD_CUSTOMER_DASHBOARD_ID);
    // add a filter
    loadSearch.addFilter(new nlobjSearchFilter('entity',null,'is', customerId));
    // add a filter to prevent the memorized transactions
    loadSearch.addFilter(new nlobjSearchFilter('memorized', null, 'is', 'F'));

    return loadSearch.runSearch().getResults(0,1000);
}