/*
Set On hold Field in Sales order
 */

var context = nlapiGetContext();

/*
Checks for valid value
 */
function isValidValue(value){
    if(value === null || typeof value === 'undefined' || value === '')
        return false;
    return true;
}

function SO_Set_OnHold_Field_BeforeSubmit(type) {

    try {

//        var startTime;
//        var endTime;
//        var minutes;
//        startTime = (new Date()).getTime();

        var execContext = context.getExecutionContext();
        if (type == 'create' && execContext == 'userinterface') {

            var customerId = nlapiGetFieldValue('entity');
            if (isValidValue(customerId)) {

                //nlapiLogExecution('DEBUG', 'customerId', customerId);

                nlapiLogExecution('DEBUG', 'OnHold field Assignment started', '');

                setHoldFieldOnCustomerChange(customerId);

                nlapiLogExecution('DEBUG', 'OnHold field Assignment ended', '');
            }
        }

//        endTime = (new Date()).getTime();
//        minutes = (endTime - startTime);
//
//        nlapiLogExecution('DEBUG', 'Diff', minutes);

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Error_In_SO_Set_OnHold_Field_BeforeSubmit', ex.message);
    }
}

/*
this function will take DECISION to set/unset 'Hold' field on sale order based on calculation
specific to a customer selected on sale order
*/

function setHoldFieldOnCustomerChange(customerId) {

    var custHold = nlapiLookupField('customer',customerId,COMMON.CUST_HOLD_FIELD_ID);
    //getting required field values used in calculations below

    var custHold = null;
    var balance = null;
    var daysoverdue = null;
    var depositbalance = null;
    var custentity_credlim = null;
    var unbilledorders = null;

    var filters = [];
    filters.push(new nlobjSearchFilter('internalid', null, 'is', customerId));
    var columns = [];
    columns.push(new nlobjSearchColumn(COMMON.CUST_HOLD_FIELD_ID));
    columns.push(new nlobjSearchColumn('balance'));
    columns.push(new nlobjSearchColumn('daysoverdue'));
    columns.push(new nlobjSearchColumn('depositbalance'));
    columns.push(new nlobjSearchColumn(COMMON.CUST_CREDIT_LIMIT_ID));
    columns.push(new nlobjSearchColumn('unbilledorders'));
    var res = nlapiSearchRecord('customer', null, filters, columns);
    if (!!res && res.length > 0) {

        custHold = res[0].getValue(COMMON.CUST_HOLD_FIELD_ID);
        balance = res[0].getValue('balance');
        daysoverdue = res[0].getValue('daysoverdue');
        depositbalance = res[0].getValue('depositbalance');
        custentity_credlim = res[0].getValue(COMMON.CUST_CREDIT_LIMIT_ID);
        unbilledorders = res[0].getValue('unbilledorders');
    }


    var custBalance = balance ? parseFloat(balance) : 0;
    var custDaysOverDue = daysoverdue ? parseInt(daysoverdue) : 0;
    var custDepositBalance = depositbalance ? parseFloat(depositbalance) : 0;
    var custCreditLimit = custentity_credlim ? parseFloat(custentity_credlim) : 0;
    var custUnbilledOrder = unbilledorders ? parseFloat(unbilledorders) : 0;

    // if the customer is on hold. 'ON' means YES
    if (custHold == COMMON.CUSTOMTER_ON_HOLD_ID.ON) {
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID, 'T');
    }
    else if (custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO && custDaysOverDue > 15) {
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID, 'T');
    }
    else if ((custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO) && ((custBalance - custDepositBalance) > custCreditLimit)) {
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID, 'T');
    }
    else if ((custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO) && ((custBalance + custUnbilledOrder) > custCreditLimit)) {
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID, 'T');
    }
    else {
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID, 'F');
    }

}




/*
function setHoldFieldOnCustomerChange(customerId) {

    var custHold = nlapiLookupField('customer',customerId,COMMON.CUST_HOLD_FIELD_ID);
    //getting required field values used in calculations below

    var balance = nlapiLookupField('customer', customerId,'balance');
    var daysoverdue = nlapiLookupField('customer', customerId,'daysoverdue');
    var depositbalance = nlapiLookupField('customer', customerId,'depositbalance');
    var custentity_credlim = nlapiLookupField('customer', customerId, COMMON.CUST_CREDIT_LIMIT_ID);
    var unbilledorders = nlapiLookupField('customer',customerId,'unbilledorders');

    var custBalance = balance ? parseFloat(balance) : 0;
    var custDaysOverDue = daysoverdue ? parseInt(daysoverdue) : 0;
    var custDepositBalance = depositbalance ? parseFloat(depositbalance) : 0;
    var custCreditLimit = custentity_credlim ? parseFloat(custentity_credlim) : 0;
    var custUnbilledOrder = unbilledorders ? parseFloat(unbilledorders) : 0;

    // if the customer is on hold. 'ON' means YES
    if (custHold == COMMON.CUSTOMTER_ON_HOLD_ID.ON) {
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID,'T');
    }
    else if(custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO && custDaysOverDue > 15){
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID,'T');
    }
    else if((custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO) && ((custBalance - custDepositBalance) > custCreditLimit) ){
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID,'T');
    }
    else if((custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO) && ((custBalance + custUnbilledOrder) > custCreditLimit) ){
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID,'T');
    }
    else {
        nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID,'F');
    }

}
*/