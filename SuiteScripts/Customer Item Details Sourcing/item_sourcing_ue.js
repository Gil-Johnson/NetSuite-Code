/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Feb 2013     szaka/zeeshan
 *
 */


function userEventBeforeLoad(type, form, request){}

function userEventBeforeSubmit(type){

    //nlapiLogExecution('AUDIT', 'ItemFieldSourcingBeforeSubmit__type=' + type + '__BeforeSubmit_StartTime=', getDateTime());
    //nlapiLogExecution('DEBUG', 'Before Submit UserEvent item_sourcing_ue.js', type);
    nlapiLogExecution('DEBUG', 'Step-0' , nlapiGetContext().getRemainingUsage());
    var isCsvImportOrWebService = false;
    var context = nlapiGetContext().getExecutionContext();

    if(context == 'webservices' || context == 'csvimport' || context == 'webstore')
        isCsvImportOrWebService = true;

    if(type == 'create' || type == 'edit') {
        var customerId = nlapiGetFieldValue('entity');

        var fields = [COMMON.CUST_HOLD_FIELD_ID, 'balance', 'daysoverdue', 'depositbalance', COMMON.CUST_CREDIT_LIMIT_ID, 'unbilledorders', COMMON.DEFAULT_SOFORM_ID, COMMON.CUST_COMMISSION_PERCENT];
        var results = nlapiLookupField('customer', customerId, fields);

        nlapiLogExecution('DEBUG', 'Step-1' , nlapiGetContext().getRemainingUsage());

        var customerFields = {};
        customerFields.custHold = results[COMMON.CUST_HOLD_FIELD_ID];
        customerFields.custBalance = results['balance'];
        customerFields.custDaysOverDue = results['daysoverdue'];
        customerFields.custDepositBalance = results['depositbalance'];
        customerFields.custCreditLimit = results[COMMON.CUST_CREDIT_LIMIT_ID];
        customerFields.custUnbilledOrder = results['unbilledorders'];

        if(type == 'create'){
            try {
                setHoldFieldImport(customerFields);
                nlapiLogExecution('DEBUG', 'Step-2' , nlapiGetContext().getRemainingUsage());
            } catch (ex) {
                nlapiLogExecution('DEBUG', 'Error in Setting Credit Hold', "Customer id =" + customerId + "exeception =" + ex);
            }
        }
        if(isCsvImportOrWebService){
            // feature: set default form: start
            var formId = results[COMMON.DEFAULT_SOFORM_ID];
            if(isValidValue(formId) && type == 'create'){
                nlapiSetFieldValue('customform', formId);
            }
            // feature: set default form: end

            // feature: sourcing line item: start

            var commisionTxt;
            var commisionVal;

            commisionTxt = nlapiLookupField('customer',customerId,COMMON.CUST_COMMISSION_PERCENT,true); // tab status -> commission percent
            commisionVal = results[COMMON.CUST_COMMISSION_PERCENT];
            commisionTxt = commisionTxt ? parseInt(commisionTxt) : 0;
            commisionVal = commisionVal ? parseInt(commisionVal) : '';
            nlapiLogExecution('DEBUG', 'Step-3' , nlapiGetContext().getRemainingUsage());
            var itemIdArray = getItemIdArrayAndSetCommission(commisionTxt,commisionVal);
            nlapiLogExecution('DEBUG', 'Step-4' , nlapiGetContext().getRemainingUsage());
            sourceLineItemCsvOrWebservice(customerId, itemIdArray);
            nlapiLogExecution('DEBUG', 'Step-5' + nlapiGetContext().getRemainingUsage());
        // feature: sourcing line item: end
        }
    }
    nlapiLogExecution('DEBUG', 'Item Sourcing UE - Before Submit', 'Remaining Usage: ' + nlapiGetContext().getRemainingUsage());
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
    // setting total estimated commission based on line item hidden commission percent
    
    try {
        /*var saleOrderRecord = nlapiLoadRecord('salesorder', nlapiGetRecordId());
        var totalEstimatedComm = setTotalEstComm(saleOrderRecord);
        var totalEstRltyComm = setTotalEstRoylty(saleOrderRecord);
        saleOrderRecord.setFieldValue(COMMON.TOTAL_EST_COMM_ID, totalEstimatedComm);
        saleOrderRecord.setFieldValue(COMMON.TOTAL_EST_LEG_RYLTY_ID, totalEstRltyComm);
        nlapiSubmitRecord(saleOrderRecord);*/

        //var salesOrderId = nlapiGetRecordId();
        //var totalEstimatedComm = setTotalEstComm(salesOrderId);
        //var totalEstRltyComm = setTotalEstRoylty(salesOrderId);
        //
        //// Array containing the field IDs that will be updated
        //var fields = [COMMON.TOTAL_EST_COMM_ID, COMMON.TOTAL_EST_LEG_RYLTY_ID];
        //// Array containing the new values of the fields that will be updated
        //var values = [totalEstimatedComm, totalEstRltyComm];
        //// Update the fields using nlapiSubmitField
        //nlapiSubmitField('salesorder', salesOrderId, fields, values);
    }
    catch (ex){
        nlapiLogExecution('DEBUG', 'unexpected error', ex);
    }
}

function getItemIdArrayAndSetCommission(commisionTxt,commisionVal){
    var totalLines = nlapiGetLineItemCount('item');
    var tempArr = new Array();
    for(var line=1; line<=totalLines; line++){
        var itemId = nlapiGetLineItemValue('item', 'item', line);
        if(tempArr.indexOf(itemId)==-1)
            tempArr.push(itemId);
        
        // set commssion in csv/webservice: csv start
        var tempCom = nlapiGetLineItemValue('item', 'class', line);
        if(!isValidValue(tempCom)){
            nlapiSetLineItemValue('item', 'class', line, commisionVal); //  set commission   // commetted out 8/23/2018
            nlapiSetLineItemValue('item', COMMON.HDN_COMM_PERCENT_ID, line, commisionTxt); // set hidden field
        }
    // set commssion in csv/webservice: end
    }
    return tempArr;
}

function getDateTime()
{
    try
    {
        var dt = new Date();
        var date = dt.getDate();
        var month = dt.getMonth()+1;
        var year = dt.getFullYear();
        var hrs = dt.getHours();
        var min = dt.getMinutes();
        var sec = dt.getSeconds();
        var datestring = month + '/' + date + '/' + year + ' ' + hrs + ':' + min + ':' + sec;
        return new Date(datestring);
    }
    catch(ex)
    {
        nlapiLogExecution('ERROR','error in func getDateTime',ex.toString());
    }
}