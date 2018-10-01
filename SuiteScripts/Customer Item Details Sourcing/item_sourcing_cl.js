/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Feb 2013     szaka/zeeshan
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 * @returns {Void}
 */

var initCustomerId = ''; // handling if customer is not changed. OR change customer zee to zee (no form reload)
var custType = '';
var customerChangeInEdit = false;
var reCalcFlag = true;
var lineInsertFlag = false;
var lineInsertIndex = 0;
var insertSkip = false;

var countPopupSo = 0;
var countPopupItemDup = 0;
var insertFlag = false;

var isAddMultiple = false;

var timer = null;

var oldItem = null;
var oldItemChange = null;

var isSkipSourcing = false; // when adding line, prevent sourcing from custom record in reCalc function

function clientPageInit(type) {
    custType = type;
    if(type == 'edit'){
        var previousCustomer = nlapiGetFieldValue(COMMON.PREVIOUS_CUSTOMER_ID);
      var currentCustomer = nlapiGetFieldValue('entity');
        //if(isValidValue(previousCustomer))
        if (!isSameCustomer(previousCustomer, currentCustomer) && !!previousCustomer){
            customerChangeInEdit = true;
            nlapiSetFieldValue('entity', previousCustomer);
        }
    }
    if(type == 'create' || type == 'edit'){
        
        timer = setInterval('setStandardFields()', 1); // for commission
        
        initCustomerId = nlapiGetFieldValue('entity');

        // Commented on on Jay demand
        //https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/87033621/comments#comment_297127460
        /*if(isValidValue(initCustomerId)){
            nlapiSetLineItemDisplay('item', true);
        }
        else
            nlapiSetLineItemDisplay('item', false);*/
        
        if (type == 'create' && isValidValue(initCustomerId)) {
            try {
                // Commented on on Jay demand
                //https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/87033621/comments#comment_297127460
                //setHoldFieldOnCustomerChange(initCustomerId);
            } catch (ex) {
                nlapiLogExecution('ERROR', 'Error in Setting Credit Hold', "Customer id =" + initCustomerId + "exeception =" + ex);
                alert("Please select the customer again");
            }
            
            // fixing - create SO from customer : start
            var ref = document.referrer.toString();
            
            ref = ref.substring(ref.indexOf('/app'),ref.indexOf('?'));
            
            if(ref == '/app/common/entity/custjob.nl'){
                
                var searchResult = [];
                searchResult = customerSearch(initCustomerId);
                
                if (searchResult != null && searchResult.length > 0) {
                    var formId = searchResult[0].getValue(COMMON.DEFAULT_SOFORM_ID);
                    if (isValidValue(formId)) {
                        if(formId != nlapiGetFieldValue('customform')){
                            nlapiSetFieldValue('customform', formId);
                        }
                    }
                }
            
            }
        // fixing SO from customer : end
        
        }
    }
    setTotalLineItems();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @returns {Boolean} True to continue save, false to abort save
 */
function clientSaveRecord() {
    if(isValidValue(timer))
        clearInterval(timer);
    
    nlapiSetFieldValue(COMMON.PREVIOUS_CUSTOMER_ID, '');
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort
 *          value change
 */
function clientValidateField(type, name, linenum) {
    
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
    if (name == 'entity' && countPopupSo == 0) {
        //if (name == 'entity') {
        // by zahmed:
        if(!customerChangeInEdit)
        {
            var customer = nlapiGetFieldValue('entity');
            if(type != 'edit'){
            	loadCustomerDefaultSoForm(customer);
            }
        }
        customerChangeInEdit = false;
        // by szaka:
        var customerId = nlapiGetFieldValue('entity');
        // if the customer is selected
        if (isValidValue(customerId)) {
            try {
                // Commented on on Jay demand
                //https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/87033621/comments#comment_297127460
                //setHoldFieldOnCustomerChange(customerId);
            } catch (ex) {
                nlapiLogExecution('ERROR', 'Error in Setting Credit Hold', "Customer id =" + customerId + "exeception =" + ex);
                alert("Please select the customer again");
            }
        }
        // if no customer is selected
        else {
            nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID,'F')
        }
    }
    
    //countPopupSo++;// by zahmed: for handling the SO popup displaying 3 times 
    //if(countPopupSo==3) countPopupSo = 0;
    
    // by szaka: setting hidden commission percent
    if (type == 'item' && name == 'class'){
        try {
            setCommissionPercent();
        }
        catch (ex){
            nlapiLogExecution('ERROR', 'Error in Setting Hidden Commsion Percent', "Exception =" + ex);
            alert("Please select the commsion class again");
        }
    }
    if (type == 'item' && name == 'item'){
        oldItemChange = nlapiGetCurrentLineItemValue('item', 'item');
    }
}

// this function will set com class based on the price level selected
function setCommClass() {
    var priceLevel = nlapiGetCurrentLineItemText('item','price');
    
    // setting the text in select list, selects the value as well therefore using Text instead of Value for better understanding
    if(priceLevel == 'Level 1'){
        nlapiSetCurrentLineItemText('item', 'class', '10%');
    }
    else if(priceLevel == 'Level 2'){
        nlapiSetCurrentLineItemText('item', 'class', '8%');
    
    }
    else if(priceLevel == 'Level 3'){
        nlapiSetCurrentLineItemText('item', 'class', '6%');
    
    }
    else if(priceLevel == 'Custom'){
        nlapiSetCurrentLineItemText('item', 'class', '10%');
    
    }
}

// this function will set commission percent based on selection in Com Class
function setCommissionPercent(){
    var commClass = nlapiGetCurrentLineItemText('item','class');
    var commission = commClass ? commClass : '0%';
    
    nlapiSetCurrentLineItemValue('item', COMMON.HDN_COMM_PERCENT_ID, commission);

}

// this function will take DECISION to set/unset 'Hold' field on sale order based on calculation
// specific to a customer selected on sale order
function setHoldFieldOnCustomerChange(customerId) {

    /*
     Ubaid: 2014-Oct-28: Uploading changes suggested by NetSuite team to use nlapiLookupField instead of nlapiLoadRecord for customer.
     */

    var custHold = nlapiLookupField('customer',customerId,COMMON.CUST_HOLD_FIELD_ID);
    //getting required field values used in calculations below
    var custBalance = nlapiLookupField('customer',customerId,'balance') ? parseFloat(nlapiLookupField('customer',customerId,'balance')) : 0;
    var custDaysOverDue = nlapiLookupField('customer',customerId,'daysoverdue') ? parseInt(nlapiLookupField('customer',customerId,'daysoverdue')) : 0;
    var custDepositBalance = nlapiLookupField('customer',customerId,'depositbalance') ? parseFloat(nlapiLookupField('customer',customerId,'depositbalance')) : 0;
    var custCreditLimit = nlapiLookupField('customer',customerId,COMMON.CUST_CREDIT_LIMIT_ID) ? parseFloat(nlapiLookupField('customer',customerId,COMMON.CUST_CREDIT_LIMIT_ID)) : 0;
    var custUnbilledOrder = nlapiLookupField('customer',customerId,'unbilledorders') ? parseFloat(nlapiLookupField('customer',customerId,'unbilledorders')) : 0;

    /*
     var custObj = nlapiLoadRecord('customer', customerId);
     var custHold = custObj.getFieldValue(COMMON.CUST_HOLD_FIELD_ID);

     //getting required field values used in calculations below
     var custBalance = custObj.getFieldValue('balance') ? parseFloat(custObj.getFieldValue('balance')) : 0;
     var custDaysOverDue = custObj.getFieldValue('daysoverdue') ? parseInt(custObj.getFieldValue('daysoverdue')) : 0;
     var custDepositBalance = custObj.getFieldValue('depositbalance') ? parseFloat(custObj.getFieldValue('depositbalance')) : 0;
     var custCreditLimit = custObj.getFieldValue(COMMON.CUST_CREDIT_LIMIT_ID) ? parseFloat(custObj.getFieldValue(COMMON.CUST_CREDIT_LIMIT_ID)) : 0;
     var custUnbilledOrder = custObj.getFieldValue('unbilledorders') ? parseFloat(custObj.getFieldValue('unbilledorders')) : 0;

     */
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

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @returns {Void}
 */
function clientPostSourcing(type, name) {
    if(type == 'item'){
        if(name == 'item'){
            var customerId = nlapiGetFieldValue('entity');
            if(isValidValue(customerId)){
                var currentItemId = nlapiGetCurrentLineItemValue('item', 'item');
                try{
                    if(isValidValue(currentItemId)){
                        // default sourcing
                        setCurrentLineValuesFromItem(currentItemId);
                        // source from custom record
                        sourceCurrentLineItem(customerId,currentItemId);
                    
                    
                        // set commssion in csv/webservice: csv start
                        var commision = nlapiGetFieldText(COMMON.COMMISSION_PERCENT_ID); // tab status -> commission percent
                        commision = commision ? parseInt(commision) : 0;
                        var tempCom = nlapiGetCurrentLineItemValue('item', 'class');
                        if(!isValidValue(tempCom)){
                            var tmpcm = nlapiGetFieldValue(COMMON.COMMISSION_PERCENT_ID);
                            if(isValidValue(tmpcm))
                                nlapiSetCurrentLineItemValue('item', 'class', tmpcm); //  set commission
                            nlapiSetCurrentLineItemValue('item', COMMON.HDN_COMM_PERCENT_ID, commision); // set hidden field
                        }
                        // set commssion in csv/webservice: end
                    
                        // by szaka : setting commission class on item price level sourcing
                        //setCommClass();
                        // by szaka : setting hidden commission percent on item price level sourcing
                        //setCommissionPercent();
                        // by szaka : setting the royal percent on item sourcing
                        setRyltyPercent();
                    }
                }
                catch(ex){
                    nlapiLogExecution('ERROR', 'Post Sourcing', ex.message);
                    //alert('Please select the item again');
                }
            }
        }
    }

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientLineInit(type) {
    if(type == 'item')
    {
        //alert('line init | index '+nlapiGetCurrentLineItemIndex('item'));
        setTotalLineItems();
        
        /*if(nlapiGetCurrentLineItemIndex('item')-1 == parseInt(nlapiGetLineItemCount('item'))){
            alert('line init last line');
            lineInsertFlag = false;
            insertSkip = false;
            return;
        }*/
        if(!insertFlag){
            lineInsertIndex = parseInt(nlapiGetCurrentLineItemIndex('item'));
        //alert('skip = false lineInsertIndex in line init'+lineInsertIndex);
        }
        
        lineInsertFlag = true;
        //insertSkip = true;
        
        //alert('line init');
        oldItem = nlapiGetCurrentLineItemValue('item', 'item');
    
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function clientValidateLine(type) {
    overwriteGovernanceLimit();

    // line redundency check 
    if (type == 'item' && countPopupItemDup == 0) {
        var lineItemId = nlapiGetCurrentLineItemValue('item', 'item');
        var lineInnerPack = nlapiGetCurrentLineItemValue('item', COMMON.INNER_PACK_ID);
        var lineCasePack = nlapiGetCurrentLineItemValue('item', COMMON.CASE_PACK_ID);
        var lineRetailPrice = nlapiGetCurrentLineItemValue('item', COMMON.RETAIL_PRICE_ID);
        var lineUpcCode = nlapiGetCurrentLineItemValue('item', COMMON.UPC_ID);
        
        if(isValidValue(lineItemId)){
            nlapiSetCurrentLineItemValue('item', COMMON.REQ_REPROCESS_ID, requireReprocessing(lineItemId, lineRetailPrice,lineUpcCode));
            nlapiSetCurrentLineItemValue('item', COMMON.SPECIAL_PACKING_ID, specialPackaging(lineItemId, lineInnerPack, lineCasePack));
        }
        //alert('line validate');
        lineInsertFlag = false;
        insertSkip = false;
        insertFlag = false;
        isSkipSourcing = true;
        setTotalLineItems();
        
        var currentItem = nlapiGetCurrentLineItemValue('item', 'item');
        var lineCount = nlapiGetLineItemCount('item');
        for ( var i = 1; i <= lineCount; i++) {
            if(i == nlapiGetCurrentLineItemIndex('item'))// if line is edit then continue
                continue;
            var previosItem = nlapiGetLineItemValue('item', 'item', i);
            if ((currentItem == previosItem && nlapiGetCurrentLineItemIndex('item')>lineCount) || (oldItem != oldItemChange && currentItem == previosItem && nlapiGetCurrentLineItemIndex('item')<=lineCount)) {
                lineCount = 0;
                var conf = confirm("This item is already on the order. Do you want to keep the line?");
                if (conf == true) {
                } 
                else {
                    nlapiCancelLineItem('item');
                    return false;
                }
            
            }
        
        }
    }
    //countPopupItemDup++;
    //if(countPopupItemDup==2) countPopupItemDup=0;
    return true;
}

function overwriteGovernanceLimit(){
    nlapiGetContext().getRemainingUsage = function () {
        return 1000;
    };
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Void}
 */
function clientRecalc(type){
    //if(type=='item')alert('recalc');
    var totalCount = parseInt(nlapiGetFieldValue(COMMON.TOTAL_LINEITEMS_ID));
    var totalLines = parseInt(nlapiGetLineItemCount('item'));
    var difference = totalLines - totalCount;
    if(insertSkip == true){
        insertSkip = false;
        insertFlag = true;
        return;
    }
    insertFlag = false;
    if(difference>0 && reCalcFlag){
        reCalcFlag = false;
        if(lineInsertFlag ==  true){
            //alert('lineInsertIndex in recalc'+lineInsertIndex);
            totalCount = (parseInt(lineInsertIndex) - 1);
            totalLines =  parseInt(lineInsertIndex) + difference - 1;
            lineInsertFlag = false;
        }
        
        if(type == 'item'){
            var customerId = nlapiGetFieldValue('entity');
            //            for(var i= totalCount+1;i<=totalLines;i++)
            //            {
            //                try{
            //                    //alert('source line '+i);
            //                    var item = nlapiGetLineItemValue('item', 'item', i);
            //                    if(!isSkipSourcing)
            //                        sourceLineItem(customerId, item, i)
            //                }
            //                catch(ex)
            //                {
            //                    alert('error line num '+i + ' ERROR: ' + ex.message);
            //                }
            //  
            //                      }
            if(!isSkipSourcing){
                var itemArr = [];
                for(var i = totalCount+1;i<=totalLines;i++){
                    try{
                        var item = nlapiGetLineItemValue('item', 'item', i);
                        itemArr.push(item);
                    }
                    catch(ex)
                    {
                        alert('error line num '+i + ' ERROR: ' + ex.message);
                    }
                }
                sourceLineItemRelcalc(customerId, itemArr, totalCount+1, totalLines);
            }

            setTotalLineItems();
            nlapiRefreshLineItems('item');
            lineInsertFlag = false;
            insertSkip = false;
            reCalcFlag = true;
            isAddMultiple = true;// set for timer: handling commission percent on line item
            isSkipSourcing = false;
        }
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function clientValidateInsert(type) {
    if(type == 'item')
    {
        lineInsertIndex = parseInt(nlapiGetCurrentLineItemIndex('item'));
        //alert('lineInsertIndex in line insert'+lineInsertIndex);
        lineInsertFlag = true;
        insertSkip = true;
    }
    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function clientValidateDelete(type) {
    if(type == 'item'){
        lineInsertFlag = false;
        insertSkip = false;
        insertFlag = false;
        setTotalLineItems();
    }
    return true;
}

// other functions
// by zahmed:

// This function load the customer default sales order form
function loadCustomerDefaultSoForm(customerId){
    if (isValidValue(customerId)) {
        if(custType == 'edit')
            nlapiSetFieldValue(COMMON.PREVIOUS_CUSTOMER_ID, customerId);
        
        //itemSublistVisible(true);
        // Commented on on Jay demand
        //https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/87033621/comments#comment_297127460
        //nlapiSetLineItemDisplay('item', true);
        
        if(initCustomerId == customerId) 
            return;
        
        var searchResult = [];
        searchResult = customerSearch(customerId);
        
        if (searchResult != null && searchResult.length > 0) {
            var formId = searchResult[0].getValue(COMMON.DEFAULT_SOFORM_ID);
            if (isValidValue(formId)) {
                if(formId != nlapiGetFieldValue('customform')){
                    //var isConfirm = confirm('Entered information will be lost. Continue?');
                    //if(isConfirm == true){
                        if(custType == 'edit')
                            nlapiSubmitField('salesorder', nlapiGetRecordId(), COMMON.PREVIOUS_CUSTOMER_ID, customerId);
                        nlapiSetFieldValue('customform', formId);
                    //}
                    //else
                        //nlapiSetFieldValue('entity', initCustomerId);
                }
            }
        }
    }else{
        //itemSublistVisible(false);
        // Commented on on Jay demand
        //https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/87033621/comments#comment_297127460
        //nlapiSetLineItemDisplay('item', false);
    }
}

// This function search the customer's default sales order in the customer and return the search result
function customerSearch(customerId){
    var filters = new Array();
    filters[filters.length] = new nlobjSearchFilter('internalid', null, 'is',customerId);
    var columns = new Array();
    columns[columns.length] = new nlobjSearchColumn(COMMON.DEFAULT_SOFORM_ID);
    var searchResult = [];
    searchResult = nlapiSearchRecord('customer', null, filters,columns);
    return searchResult;
}

// This function source the data from custom record on item change in item subtab in salesorder form
function sourceCurrentLineItem(customerId,currentItemId){
    // searching criteria for fliter
    var filters = new Array();
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.CUSTOMER_ID, null, 'is', customerId);
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID, null, 'is', currentItemId);
    filters[filters.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
    // returning columns
    var columns = [];
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.CASE_PACK_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.INNER_PACK_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.RETAIL_PRICE_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.ALT_SALES_DESC_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.ALT_UPC_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.CUSTOMER_SKU_ID);
    
    // search result
    var searchResult = [];
    searchResult = nlapiSearchRecord(ITEM_SOURCING.INTERNAL_ID, null, filters, columns);
    // if record is already exists, set line items
    if(searchResult != null  && searchResult.length > 0) {
        var casePack = searchResult[0].getValue(ITEM_SOURCING.FieldName.CASE_PACK_ID);
        var innerPack = searchResult[0].getValue(ITEM_SOURCING.FieldName.INNER_PACK_ID);
        var retailPrice = searchResult[0].getValue(ITEM_SOURCING.FieldName.RETAIL_PRICE_ID);
        var altSalesDesc = searchResult[0].getValue(ITEM_SOURCING.FieldName.ALT_SALES_DESC_ID);
        var altUpc = searchResult[0].getValue(ITEM_SOURCING.FieldName.ALT_UPC_ID);
        var customerSku = searchResult[0].getValue(ITEM_SOURCING.FieldName.CUSTOMER_SKU_ID);
        
        //var specialPackagingFlag = 'F';
        //var requiresReprocessingFlag = 'F';
        
        if(isValidValue(casePack)){
            nlapiSetCurrentLineItemValue('item', COMMON.CASE_PACK_ID, casePack);
        //specialPackagingFlag = 'T';
        }
        if(isValidValue(innerPack)){
            nlapiSetCurrentLineItemValue('item', COMMON.INNER_PACK_ID, innerPack);
        //specialPackagingFlag = 'T';
        }
        if(isValidValue(retailPrice)){
            nlapiSetCurrentLineItemValue('item', COMMON.RETAIL_PRICE_ID, retailPrice);
        //requiresReprocessingFlag = 'T';
        }
        if(isValidValue(altSalesDesc)){
            nlapiSetCurrentLineItemValue('item', 'description', altSalesDesc);
        }
        if(isValidValue(altUpc)){
            nlapiSetCurrentLineItemValue('item', COMMON.UPC_ID, altUpc);
        //requiresReprocessingFlag = 'T';
        }
        if(isValidValue(customerSku)){
            nlapiSetCurrentLineItemValue('item', COMMON.CUSTOMER_SKU_ID, customerSku);
        }
    
    //nlapiSetCurrentLineItemValue('item', COMMON.SPECIAL_PACKING_ID, specialPackagingFlag);
    //nlapiSetCurrentLineItemValue('item', COMMON.REQ_REPROCESS_ID, requiresReprocessingFlag);
    }
    
    var tempSku = nlapiGetCurrentLineItemValue('item', 'custcol_custsku');
    var tempSkuSearch = nlapiGetCurrentLineItemValue('item', 'custcol_sku_item');
    if(isValidValue(tempSku) && !isValidValue(tempSkuSearch)){
        nlapiSetCurrentLineItemValue('item', 'custcol_sku_item', tempSku + ' - ' + nlapiGetCurrentLineItemText('item','item'));
    }
}

// set line items count in hidden field for handling item sourcing on add multiple button
function setTotalLineItems(){
    var count = nlapiGetLineItemCount('item');
    nlapiSetFieldValue(COMMON.TOTAL_LINEITEMS_ID, isValidValue(count)?count:0);
}

function setRyltyPercent(){
    var customerCat = nlapiGetFieldText(COMMON.CUSTOMER_CAT_ID);
    var itemId = nlapiGetCurrentLineItemValue('item', 'item');
    var columns = [];
    columns[0] = new nlobjSearchColumn(COMMON.TOTAL_DIST_RYLTY_ID);
    columns[1] = new nlobjSearchColumn(COMMON.TOTAL_NON_DIST_RYLTY_ID);
    var filter = new nlobjSearchFilter('internalid', null, 'is', itemId);
    var result = nlapiSearchRecord('item', null, filter, columns);
    var itemRec = result[0];
    
    // if not selected then take 'Non-Distributor' as default
    if (customerCat == 'Distributor'){
        var totalDistRlty = itemRec.getValue(COMMON.TOTAL_DIST_RYLTY_ID) ? parseFloat(itemRec.getValue(COMMON.TOTAL_DIST_RYLTY_ID)) : 0;
        nlapiSetCurrentLineItemValue('item', COMMON.RYLTY_HDN_PERCENT_ID, totalDistRlty);
    }
    else{
        var totalNonDistRlty = itemRec.getValue(COMMON.TOTAL_NON_DIST_RYLTY_ID) ? parseFloat(itemRec.getValue(COMMON.TOTAL_NON_DIST_RYLTY_ID)) : 0;
        nlapiSetCurrentLineItemValue('item',COMMON.RYLTY_HDN_PERCENT_ID,totalNonDistRlty );
    }
}

// this function will set com class based on the price level selected
function setCommClass_sourcing(line) {
    var priceLevel = nlapiGetLineItemText('item','price',line);
    
    // setting the text in select list, selects the value as well therefore using Text instead of Value for better understanding
    if(priceLevel == 'Level 1'){
        nlapiSetLineItemText('item', 'class', line, '10%');
    }
    else if(priceLevel == 'Level 2'){
        nlapiSetLineItemText('item', 'class', line, '8%');
    }
    else if(priceLevel == 'Level 3'){
        nlapiSetLineItemText('item', 'class', line, '6%');
    }
    else if(priceLevel == 'Custom'){
        nlapiSetLineItemText('item', 'class', line, '10%');
    
    }
}

// this function set the commission value of line items from the commsision percent
// this function calls in timer
function setStandardFields(){
    if(isAddMultiple){
        var commision = nlapiGetFieldText(COMMON.COMMISSION_PERCENT_ID); // tab status -> commission percent
        commision = commision ? parseInt(commision) : 0;
        var length = nlapiGetLineItemCount('item');
        for(var line = 1; line <= length; line++){
            var tempCom = nlapiGetLineItemValue('item', 'class', line);
            if(!isValidValue(tempCom)){
                var tmpcm = nlapiGetFieldValue(COMMON.COMMISSION_PERCENT_ID);
                if(isValidValue(tmpcm))
                    nlapiSetLineItemValue('item', 'class', line, tmpcm); //  set commission
                nlapiSetLineItemValue('item', COMMON.HDN_COMM_PERCENT_ID, line, commision); // set hidden field
            }
        }
        isAddMultiple = false;
        nlapiRefreshLineItems('item');
    }
}

// set the values of current line item from item
function setCurrentLineValuesFromItem(itemId){
    var result = getDefaultValuesOfItem(itemId);
        
    if(result != null){
        
        var innerPack = result[0].getValue(COMMON.DEFAULT_INNERPACK_ID);
        var casePack = result[0].getValue(COMMON.DEFAULT_CASEPACK_ID);
        var retailPrice = result[0].getValue(COMMON.DEFAULT_RETAILPRICE_ID);
        var customerSku = result[0].getValue(COMMON.DEFAULT_CUSTOMERSKU_ID);
        var altUpc = result[0].getValue('upccode');
        var altSalesDesc = result[0].getValue('salesdescription');
        
        if(isValidValue(casePack)){
            nlapiSetCurrentLineItemValue('item', COMMON.CASE_PACK_ID, casePack);
        }
        if(isValidValue(innerPack)){
            nlapiSetCurrentLineItemValue('item', COMMON.INNER_PACK_ID, innerPack);
        }
        if(isValidValue(retailPrice)){
            nlapiSetCurrentLineItemValue('item', COMMON.RETAIL_PRICE_ID, retailPrice);
        }
        if(isValidValue(altSalesDesc)){
            nlapiSetCurrentLineItemValue('item', 'description', altSalesDesc);
        }
        if(isValidValue(altUpc)){
            nlapiSetCurrentLineItemValue('item', COMMON.UPC_ID, altUpc);
        }
        if(isValidValue(customerSku)){
            nlapiSetCurrentLineItemValue('item', COMMON.CUSTOMER_SKU_ID, customerSku);
        }
    }
}