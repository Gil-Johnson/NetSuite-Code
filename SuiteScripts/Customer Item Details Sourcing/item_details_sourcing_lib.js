// this function returns total estimated commission based on line item hidden commission percent
/*function setTotalEstComm(saleOrderRecord){
    var totalEstimatedComm = 0;
    var lineTotal = 0;
    var commPercent = 0;
    var totalLineItemCount = saleOrderRecord.getLineItemCount('item');
    for(var i = 1; i<=totalLineItemCount ; i++){
        commPercent = saleOrderRecord.getLineItemValue('item', COMMON.HDN_COMM_PERCENT_ID, i) ? parseFloat(saleOrderRecord.getLineItemValue('item', COMMON.HDN_COMM_PERCENT_ID, i))/100 : 0;
        var amount = saleOrderRecord.getLineItemValue('item','amount', i);
        amount = amount ? parseFloat(amount) : 0;
        lineTotal = amount * commPercent;
        totalEstimatedComm += lineTotal;
    }
    nlapiLogExecution('DEBUG', 'f3_logs', 'totalEstimatedComm='+totalEstimatedComm);
    return round_float_with_precision(totalEstimatedComm, 3);
}*/
function setTotalEstComm(salesOrderId){
    var totalEstimatedComm = 0;

    var filters = [new nlobjSearchFilter('internalid', null, 'is', salesOrderId)];
    // search column with a formula that returns the total estimated commission
    var columns = [new nlobjSearchColumn('formulanumeric', null, 'sum').setFormula('{amount} * (TO_NUMBER({' + COMMON.HDN_COMM_PERCENT_ID + '})/100)')];
    // Execute the search
    var results = nlapiSearchRecord('salesorder', null, filters, columns);
    if(results) {
        // Set the totalEstimatedComm with the value returned by the search
        totalEstimatedComm = results[0].getValue(columns[0]);
    }
    //nlapiLogExecution('DEBUG', 'f3_logs_new', 'totalEstimatedComm='+totalEstimatedComm);
    return round_float_with_precision(totalEstimatedComm, 3);
}


// this function retunrs total estimated royalty based on line item hidden royalty percent
/*function setTotalEstRoylty(saleOrderRecord){
    var totalEstRylty = 0;
    var lineTotal;
    var ryltyPercent;
    var totalLineItemCount = saleOrderRecord.getLineItemCount('item');
    for(var i = 1; i<= totalLineItemCount; i++){
        ryltyPercent = saleOrderRecord.getLineItemValue('item', COMMON.RYLTY_HDN_PERCENT_ID, i) ? parseFloat(saleOrderRecord.getLineItemValue('item', COMMON.RYLTY_HDN_PERCENT_ID, i))/100 : 0;
        var amount = saleOrderRecord.getLineItemValue('item','amount', i);
        amount = amount ? parseFloat(amount) : 0;
        lineTotal = amount * ryltyPercent;
        totalEstRylty += lineTotal;
    }
    nlapiLogExecution('DEBUG', 'f3_logs', 'totalEstRylty='+totalEstRylty);
    return round_float_with_precision(totalEstRylty, 3);
}*/
function setTotalEstRoylty(salesOrderId){
    var totalEstRylty = 0;

    var filters = [new nlobjSearchFilter('internalid', null, 'is', salesOrderId)];
    // search column with a formula that returns the total estimated league royalty
    var columns = [new nlobjSearchColumn('formulanumeric', null, 'sum').setFormula('{amount} * (TO_NUMBER({' + COMMON.RYLTY_HDN_PERCENT_ID + '})/100)')];
    // Execute the search
    var results = nlapiSearchRecord('salesorder', null, filters, columns);
    if(results) {
        // Set the totalEstRylty with the value returned by the search
        totalEstRylty = results[0].getValue(columns[0]);
    }
    //nlapiLogExecution('DEBUG', 'f3_logs_new', 'totalEstRylty='+totalEstRylty);
    return round_float_with_precision(totalEstRylty, 3);
}

// check either a value is valid or not
function isValidValue(value) {
    return !(value == '' || value == null || typeof value == 'undefined');
}

function isSameCustomer(customer1, customer2) {
    return (customer1 == customer2)
}

// this function will take DECISION to set/unset 'Hold' field on sale order based on calculation
// specific to a customer selected on sale order
function setHoldField(customerId, salesorder) {
    // Field IDs
    var fields = [COMMON.CUST_HOLD_FIELD_ID, 'balance', COMMON.CUST_CREDIT_LIMIT_ID, 'unbilledorders'];
    // use nlapiLookupField to retrieve the values of the fields
    var results = nlapiLookupField('customer', customerId, fields);
    // Declare variables to store the values
    var custHold = '';
    var custBalance = 0;
    var custCreditLimit = 0;
    var custUnbilledOrder = 0;

    // Transfer the values from the results array to the variables
    if(results) {
        custHold = results[COMMON.CUST_HOLD_FIELD_ID];
        custBalance = results['balance'] ? parseFloat(results['balance']) : 0;
        custCreditLimit = results[COMMON.CUST_CREDIT_LIMIT_ID] ? parseFloat(results[COMMON.CUST_CREDIT_LIMIT_ID]) : 0;
        custUnbilledOrder = results['unbilledorders'] ? parseFloat(results['unbilledorders']) : 0;
    }

    var saleOrderTotal = parseFloat(salesorder.getFieldValue('total'));
    //nlapiLogExecution('DEBUG', 'f3_logs_new', 'newSaleOrderTotal='+saleOrderTotal);
    if (salesorder.getFieldValue(COMMON.SALE_HOLD_FIELD_ID) == 'F'){
        //if((custHold == 'AUTO') && ((custBalance + custUnbilledOrder + saleOrderTotal) > custCreditLimit) ){
        if((custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO) && ((custBalance + custUnbilledOrder + saleOrderTotal) > custCreditLimit) ){
            salesorder.setFieldValue(COMMON.SALE_HOLD_FIELD_ID,'T');
        }
    }

}

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

// This function search and set the customer's default sales order in the customer
function setCustomerDefaultSoForm(customerRec){
    var formId = customerRec.getFieldValue(COMMON.DEFAULT_SOFORM_ID);
    if(isValidValue(formId)){
        nlapiSetFieldValue('customform', formId);
    }
}

// select on hold depends on customer
function setHoldFieldImport(custObj) {

    var custHold = custObj.custHold;
    
    //getting required field values used in calculations below
    var custBalance = custObj.custBalance ? parseFloat(custObj.custBalance) : 0;
    var custDaysOverDue = custObj.custDaysOverDue ? parseInt(custObj.custDaysOverDue) : 0;
    var custDepositBalance = custObj.custDepositBalance ? parseFloat(custObj.custDepositBalance) : 0;
    var custCreditLimit = custObj.custCreditLimit ? parseFloat(custObj.custCreditLimit) : 0;
    var custUnbilledOrder = custObj.custUnbilledOrder ? parseFloat(custObj.custUnbilledOrder) : 0;

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
        var saleOrderTotal = parseFloat(nlapiGetFieldValue('total'));
        if((custHold == COMMON.CUSTOMTER_ON_HOLD_ID.AUTO) && ((custBalance + custUnbilledOrder + saleOrderTotal) > custCreditLimit) ){
            nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID,'T');
        }
        else {
            nlapiSetFieldValue(COMMON.SALE_HOLD_FIELD_ID, 'F');
        }
    }
}

// get values from item
function getDefaultValuesOfItem(itemId){
    return nlapiSearchRecord('item', null, 
        [
        new nlobjSearchFilter('internalid', null, 'is', itemId)
        ], 
        [
        new nlobjSearchColumn(COMMON.DEFAULT_INNERPACK_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_CASEPACK_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_RETAILPRICE_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_CUSTOMERSKU_ID),
        new nlobjSearchColumn('upccode'),
        new nlobjSearchColumn('salesdescription')
        ]);
}

// This function source the data from custom record on item change in item subtab in salesorder form
function sourceLineItem(customerId,itemId,line){
    
    // set default item values
    setLineValuesFromItem(itemId, line);
    
    // searching criteria for fliter
    var filters = new Array();
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.CUSTOMER_ID, null, 'is', customerId);
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID, null, 'is', itemId);
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
            nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, casePack);
        //specialPackagingFlag = 'T';
        }
        if(isValidValue(innerPack)){
            nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, innerPack);
        //specialPackagingFlag = 'T';
        }
        if(isValidValue(retailPrice)){
            nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, retailPrice);
        //requiresReprocessingFlag = 'T';
        }
        if(isValidValue(altSalesDesc)){
            nlapiSetLineItemValue('item', 'description', line, altSalesDesc);
        }
        if(isValidValue(altUpc)){
            nlapiSetLineItemValue('item', COMMON.UPC_ID, line, altUpc);
        //requiresReprocessingFlag = 'T';
        }
        if(isValidValue(customerSku)){
            nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, customerSku);
        }

        nlapiSetLineItemValue('item', COMMON.SPECIAL_PACKING_ID, line, specialPackaging(itemId, innerPack, casePack));
      //  nlapiSetLineItemValue('item', COMMON.REQ_REPROCESS_ID, line, requireReprocessing(itemId, retailPrice,altUpc));
    }
    
    var tempSku = nlapiGetLineItemValue('item', 'custcol_custsku', line);
    var tempSkuSearch = nlapiGetLineItemValue('item', 'custcol_sku_item', line);
    if(isValidValue(tempSku) && !isValidValue(tempSkuSearch)){
        nlapiSetLineItemValue('item', 'custcol_sku_item', line, tempSku + ' - ' + nlapiGetLineItemText('item','item',line));
    }
    
    setCommissionPercent_sourcing(line);
    setRyltyPercent_sourcing(line);
}

function setRyltyPercent_sourcing(line){
    var customerCat = nlapiGetFieldText(COMMON.CUSTOMER_CAT_ID);
    var itemId = nlapiGetLineItemValue('item', 'item',line);
    var columns = [];
    columns[0] = new nlobjSearchColumn(COMMON.TOTAL_DIST_RYLTY_ID);
    columns[1] = new nlobjSearchColumn(COMMON.TOTAL_NON_DIST_RYLTY_ID);
    var filter = new nlobjSearchFilter('internalid', null, 'is', itemId);
    var result = nlapiSearchRecord('item', null, filter, columns);
    var itemRec = result[0];
    
    // if not selected then take 'Non-Distributor' as default
    if (customerCat == 'Distributor'){
        var totalDistRlty = itemRec.getValue(COMMON.TOTAL_DIST_RYLTY_ID) ? parseFloat(itemRec.getValue(COMMON.TOTAL_DIST_RYLTY_ID)) : 0;
        nlapiSetLineItemValue('item', COMMON.RYLTY_HDN_PERCENT_ID, line,totalDistRlty);
    //alert("hidden percent = "+ nlapiGetCurrentLineItemValue('item', royaltyHdnPercentId));
    }
    else{
        var totalNonDistRlty = itemRec.getValue(COMMON.TOTAL_NON_DIST_RYLTY_ID) ? parseFloat(itemRec.getValue(COMMON.TOTAL_NON_DIST_RYLTY_ID)) : 0;
        nlapiSetLineItemValue('item',COMMON.RYLTY_HDN_PERCENT_ID,line,totalNonDistRlty );
    //alert("hidden percent = "+ nlapiGetCurrentLineItemValue('item',royaltyHdnPercentId));
    
    }

}

// this function will set commission percent based on selection in Com Class
function setCommissionPercent_sourcing(line){
    var commClass = nlapiGetLineItemText('item', 'class',line);
    var commission = commClass ? commClass : '0%';
    
    nlapiSetLineItemValue('item', COMMON.HDN_COMM_PERCENT_ID, line, commission);
}

function workOrderDataTransition(soId){
    //nlapiLogExecution('DEBUG', 'Data Transition func - lib','in');
    var woList = nlapiSearchRecord('workorder', null, new nlobjSearchFilter('createdfrom', null, 'is', soId), null);
    //nlapiLogExecution('DEBUG', 'Data Transition func - lib','woList: '+woList);
    if(woList != null){
        //nlapiLogExecution('DEBUG', 'Data Transition func - lib','woList length: ' + woList.length);
        var soRec = nlapiLoadRecord('salesorder', soId);
        var lineTotal = soRec.getLineItemCount('item');
        for(var line=1;line<=lineTotal;line++){
            if(soRec.getLineItemValue('item', 'createwo', line) == 'T'){
                var itemId = soRec.getLineItemValue('item', 'item', line);
                // getting wo id
                for(var key in woList){
                    if(getItemId(woList[key].getId()) == itemId){
                        var woFields = [];
                        var woValues = [];
                        //var woRec = nlapiLoadRecord('workorder', woList[key].getId());
                        var soDescription = soRec.getLineItemValue('item', 'description', line);
                        var soUpc = soRec.getLineItemValue('item', COMMON.UPC_ID, line);
                        var soRetailPrice = soRec.getLineItemValue('item', COMMON.RETAIL_PRICE_ID, line);
                        var soInnerPack = soRec.getLineItemValue('item', COMMON.INNER_PACK_ID, line);
                        var soCasePack = soRec.getLineItemValue('item', COMMON.CASE_PACK_ID, line);
                        var soSku = soRec.getLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line);
                        //nlapiLogExecution('DEBUG', soDescription + ' ' + soUpc + ' ' + soRetailPrice,'');
                        if(soDescription){
                            //woRec.setFieldValue(COMMON.WO_DESCRIPTION_ID, soDescription);
                            woFields.push(COMMON.WO_DESCRIPTION_ID);
                            woValues.push(soDescription);
                        }
                            
                        if(soUpc){
                            //woRec.setFieldValue(COMMON.WO_UPC_CODE_ID, soUpc);
                            woFields.push(COMMON.WO_DESCRIPTION_ID);
                            woValues.push(soDescription);
                        }
                            
                        if(soRetailPrice){
                            //woRec.setFieldValue(COMMON.WO_RETAIL_PRICE_ID, soRetailPrice);
                            woFields.push(COMMON.WO_RETAIL_PRICE_ID);
                            woValues.push(soRetailPrice);
                        }
                            
                        if(soCasePack){
                            //woRec.setFieldValue(COMMON.WO_CASE_PACK_ID, soCasePack);
                            woFields.push(COMMON.WO_CASE_PACK_ID);
                            woValues.push(soCasePack);
                        }
                            
                        if(soInnerPack){
                            //woRec.setFieldValue(COMMON.WO_INNER_PACK_ID, soInnerPack);
                            woFields.push(COMMON.WO_INNER_PACK_ID);
                            woValues.push(soInnerPack);
                        }
                            
                        if(soSku){
                            //woRec.setFieldValue(COMMON.WO_SKU_ID, soSku);
                            woFields.push(COMMON.WO_SKU_ID);
                            woValues.push(soSku);
                        }
                            
                        if(woFields.length>0)
                            nlapiSubmitField('workorder', woList[key].getId(), woFields, woValues);
                        //nlapiSubmitRecord(woRec, true);
                        
                        break;
                    
                    }
                }
            }
        }
    }
//nlapiLogExecution('DEBUG', 'Data Transition func - lib','out');
}
function getItemId(woId){
    return nlapiLoadRecord('workorder', woId).getFieldValue('assemblyitem');
}

function requireReprocessing(itemId, retailPrice,altUpc){
    var columns = [];
    columns[0] = new nlobjSearchColumn(COMMON.DEFAULT_RETAILPRICE_ID);
    columns[1] = new nlobjSearchColumn('upccode');
    var filter = new nlobjSearchFilter('internalid', null, 'is', itemId);
    var result = nlapiSearchRecord('item', null, filter, columns);
    var itemRetailPrice = result[0].getValue(COMMON.DEFAULT_RETAILPRICE_ID);
    var itemUpcCode = result[0].getValue('upccode');
    
    
    itemRetailPrice = isValidValue(itemRetailPrice)? itemRetailPrice:'';
    itemUpcCode = isValidValue(itemUpcCode)? itemUpcCode:'';
    
    retailPrice = isValidValue(retailPrice)? retailPrice:'';
    altUpc = isValidValue(altUpc)? altUpc:'';
    
    if(itemRetailPrice != retailPrice || itemUpcCode != altUpc)
        return 'T';
    else
        return 'F';
}

function specialPackaging(itemId, innerPack, casePack){
    var columns = [];
    columns[0] = new nlobjSearchColumn(COMMON.DEFAULT_INNERPACK_ID);
    columns[1] = new nlobjSearchColumn(COMMON.DEFAULT_CASEPACK_ID);
    var filter = new nlobjSearchFilter('internalid', null, 'is', itemId);
    var result = nlapiSearchRecord('item', null, filter, columns);
    var itemInnerPack = result[0].getValue(COMMON.DEFAULT_INNERPACK_ID);
    var itemCasePack = result[0].getValue(COMMON.DEFAULT_CASEPACK_ID);
    
    if(itemInnerPack != innerPack || itemCasePack != casePack)
        return 'T';
    else
        return 'F';
}

function sourceLineItemCsvOrWebservice(customerId, itemIdArray){

    var context = nlapiGetContext().getExecutionContext();

    // searching criteria for fliter
    var filters = new Array();
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.CUSTOMER_ID, null, 'is', customerId);
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID, null, 'anyof', itemIdArray);
    filters[filters.length] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
    // returning columns
    var columns = [];
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.CASE_PACK_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.INNER_PACK_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.RETAIL_PRICE_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.ALT_SALES_DESC_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.ALT_UPC_ID);
    columns[columns.length] = new nlobjSearchColumn(ITEM_SOURCING.FieldName.CUSTOMER_SKU_ID);
    
    // search result of customer item details
    var searchResult = [];
    searchResult = nlapiSearchRecord(ITEM_SOURCING.INTERNAL_ID, null, filters, columns);
    
    // get vales from item record
    var result = nlapiSearchRecord('item', null, 
        [
        new nlobjSearchFilter('internalid', null, 'anyof', itemIdArray)
        ], 
        [
        new nlobjSearchColumn(COMMON.DEFAULT_INNERPACK_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_CASEPACK_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_RETAILPRICE_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_CUSTOMERSKU_ID),
        new nlobjSearchColumn('upccode'),
        new nlobjSearchColumn('salesdescription'),
        new nlobjSearchColumn(COMMON.TOTAL_DIST_RYLTY_ID),
        new nlobjSearchColumn(COMMON.TOTAL_NON_DIST_RYLTY_ID)
        ]);

    var customerCat = nlapiLookupField('customer',customerId, 'category', true);

    var totalLines = nlapiGetLineItemCount('item');
    for(var line=1; line<=totalLines; line++){
        nlapiLogExecution('DEBUG', 'Line Item: '+line, line);
        // current line item fields data
        var lineItemId = nlapiGetLineItemValue('item', 'item', line);
        var lineInnerPack = nlapiGetLineItemValue('item', COMMON.INNER_PACK_ID, line);
        var lineCasePack = nlapiGetLineItemValue('item', COMMON.CASE_PACK_ID, line);
        var lineRetailPrice = nlapiGetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line);
        var lineSku = nlapiGetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line);
        var lineUpcCode = nlapiGetLineItemValue('item', COMMON.UPC_ID, line);
        var lineDescription = nlapiGetLineItemValue('item', 'description', line);
        
        
        var itemIndex = getItemRecIndex(lineItemId, result);

        var itemInnerPack;
        var itemCasePack;
        var itemRetailPrice;
        var itemSku;
        var itemUpcCode;
        var itemDescription;

        if (itemIndex != -1) {
            itemInnerPack = result[itemIndex].getValue(COMMON.DEFAULT_INNERPACK_ID);
            itemInnerPack = itemInnerPack ? parseInt(itemInnerPack) : 0;
            itemCasePack = result[itemIndex].getValue(COMMON.DEFAULT_CASEPACK_ID);
            itemCasePack = itemCasePack ? parseInt(itemCasePack) : 0;
            itemRetailPrice = result[itemIndex].getValue(COMMON.DEFAULT_RETAILPRICE_ID);
            itemRetailPrice = itemRetailPrice ? parseFloat(itemRetailPrice) : 0;
            itemSku = returnEmptyForNull(result[itemIndex].getValue(COMMON.DEFAULT_CUSTOMERSKU_ID));
            itemUpcCode = returnEmptyForNull(result[itemIndex].getValue('upccode'));
            itemDescription = returnEmptyForNull(result[itemIndex].getValue('salesdescription'));
        }
    
        var custItemIndex = getCustRecIndex(lineItemId, searchResult);
        
        var custInnerPack;
        var custCasePack;
        var custRetailPrice;
        var custAltSalesDesc;
        var custAltUpc;
        var custSku;
        
        if(custItemIndex != -1){
            custInnerPack = searchResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.INNER_PACK_ID);
            custInnerPack = custInnerPack?parseInt(custInnerPack):0;
            custCasePack = searchResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.CASE_PACK_ID);
            custCasePack = custCasePack?parseInt(custCasePack):0;
            custRetailPrice = searchResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.RETAIL_PRICE_ID);
            custRetailPrice = custRetailPrice?parseFloat(custRetailPrice):0;
            custAltSalesDesc = searchResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.ALT_SALES_DESC_ID);
            custAltUpc = searchResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.ALT_UPC_ID);
            custSku = searchResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.CUSTOMER_SKU_ID);
        }
        if(context == 'webservices' || context == 'webstore'){
            if(custItemIndex != -1){
                if(!isValidValue(lineInnerPack)){
                    if(isValidValue(custInnerPack))
                        nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, custInnerPack);
                    else
                    if(isValidValue(itemInnerPack)){
                        nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, itemInnerPack);
                    }
                }
            
                if(!isValidValue(lineCasePack)){
                    if(isValidValue(custCasePack))
                        nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, custCasePack);
                    else
                    if(isValidValue(itemCasePack)){
                        nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, itemCasePack);
                    }
                }
            
                if(!isValidValue(lineRetailPrice)){
                    if(isValidValue(custRetailPrice))
                        nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, custRetailPrice);
                    else
                    if(isValidValue(itemRetailPrice)){
                        nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, itemRetailPrice);
                    }
                }
            
                if(!isValidValue(lineSku)){
                    if(isValidValue(custSku))
                        nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, custSku);
                    else
                    if(isValidValue(itemSku)){
                        nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, itemSku);
                    }
                }
            
                if(!isValidValue(lineUpcCode)){
                    if(isValidValue(custAltUpc))
                        nlapiSetLineItemValue('item', COMMON.UPC_ID, line, custAltUpc);
                    else
                    if(isValidValue(itemUpcCode)){
                        nlapiSetLineItemValue('item', COMMON.UPC_ID, line, itemUpcCode);
                    }
                }

                if(!isValidValue(lineDescription)){
                    if(isValidValue(custAltSalesDesc))
                        nlapiSetLineItemValue('item', 'description', line, custAltSalesDesc);
                    else
                    if(isValidValue(itemDescription)){
                        nlapiSetLineItemValue('item', 'description', line, itemDescription);
                    }
                }
            }else{
                // if customer item details do not exist and in csv import fields are empty then set values from item
                if(!isValidValue(lineCasePack) && isValidValue(itemCasePack))
                    nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, itemCasePack);
            
                if(!isValidValue(lineInnerPack) && isValidValue(itemInnerPack))
                    nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, itemInnerPack);
            
                if(!isValidValue(lineRetailPrice) && isValidValue(itemRetailPrice))
                    nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, itemRetailPrice);
            
                if(!isValidValue(lineSku) && isValidValue(itemSku))
                    nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, itemSku);
            
                if(!isValidValue(lineUpcCode) && isValidValue(itemUpcCode))
                    nlapiSetLineItemValue('item', COMMON.UPC_ID, line, itemUpcCode);
            
                if(!isValidValue(lineDescription) && isValidValue(itemDescription))
                    nlapiSetLineItemValue('item', 'description', line, itemDescription);
            }
        }
        else
        if(context == 'csvimport'){
            // set values for csv
            if(isValidValue(lineInnerPack) && lineInnerPack == -1){
                if(isValidValue(custInnerPack))
                    nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, custInnerPack);
                else
                if(isValidValue(itemInnerPack)){
                    nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, itemInnerPack);
                }
                else{
                    nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, '');
                }
            }
            
            if(isValidValue(lineCasePack) && lineCasePack == -1){
                if(isValidValue(custCasePack))
                    nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, custCasePack);
                else
                if(isValidValue(itemCasePack)){
                    nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, itemCasePack);
                }
                else{
                    nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, '');
                }
            }
            
            nlapiLogExecution('DEBUG', 'csv retail: ' + lineRetailPrice + ' item retail: ' + itemRetailPrice + ' cust item retail: ' + custRetailPrice , '');
            
            if(isValidValue(lineRetailPrice) && lineRetailPrice == -1){
                if(isValidValue(custRetailPrice))
                    nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, custRetailPrice);
                else
                if(isValidValue(itemRetailPrice)){
                    nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, itemRetailPrice);
                }
                else{
                    nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, '');
                }
            }
            
            if(isValidValue(lineSku) && lineSku == 'NONE'){
                if(isValidValue(custSku))
                    nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, custSku);
                else
                if(isValidValue(itemSku)){
                    nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, itemSku);
                }
                else{
                    nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, '');
                }
            }
            
            nlapiLogExecution('DEBUG', 'csv upc: ' + lineUpcCode + ' item upc: ' + itemUpcCode + ' cust item upc: ' + custAltUpc , '');
            
            if(isValidValue(lineUpcCode) && lineUpcCode == 'NONE'){
                if(isValidValue(custAltUpc))
                    nlapiSetLineItemValue('item', COMMON.UPC_ID, line, custAltUpc);
                else
                if(isValidValue(itemUpcCode)){
                    nlapiSetLineItemValue('item', COMMON.UPC_ID, line, itemUpcCode);
                }
                else{
                    nlapiSetLineItemValue('item', COMMON.UPC_ID, line, '');
                }
            }

            nlapiLogExecution('DEBUG', 'csv description: ' + lineDescription + ' item description: ' + itemDescription + ' cust item description: ' + custAltSalesDesc , '');

            if(isValidValue(lineDescription) && lineDescription == 'NONE'){
                if(isValidValue(custAltSalesDesc))
                    nlapiSetLineItemValue('item', 'description', line, custAltSalesDesc);
                else
                if(isValidValue(itemDescription)){
                    nlapiSetLineItemValue('item', 'description', line, itemDescription);
                }
                else{
                    nlapiSetLineItemValue('item', 'description', line, '');
                }
            }
        }

        // get the values after changing
        lineInnerPack = returnEmptyForNull(nlapiGetLineItemValue('item', COMMON.INNER_PACK_ID, line));
        lineCasePack = returnEmptyForNull(nlapiGetLineItemValue('item', COMMON.CASE_PACK_ID, line));
        lineRetailPrice = nlapiGetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line)?parseFloat(nlapiGetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line)):0;
        lineUpcCode = returnEmptyForNull(nlapiGetLineItemValue('item', COMMON.UPC_ID, line));
        
        var sp = (itemInnerPack!=lineInnerPack || itemCasePack!=lineCasePack)?'T':'F';
        var rr = (itemRetailPrice!=lineRetailPrice || itemUpcCode!=lineUpcCode)?'T':'F';
        nlapiSetLineItemValue('item', COMMON.SPECIAL_PACKING_ID, line, sp);
        nlapiSetLineItemValue('item', COMMON.REQ_REPROCESS_ID, line, rr);
    
        setCommissionPercent_sourcing(line);
        setRyltyPercent_webOrCsv(customerId, result[itemIndex], line, customerCat);// passing item object
    }
}

// for string manipulation
function returnEmptyForNull(value){    
    return isValidValue(value)?value:'';
}

function getCustRecIndex(itemId,searchResult){
    if(searchResult!=null){
        for(var i in searchResult){
            if(itemId == searchResult[i].getValue(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID)){
                return i;
            }
        }
    }
    return -1;
}
function getItemRecIndex(itemId,result){
    if(result!=null){
        for(var i in result){
            if(itemId == result[i].getId()){
                return i;
            }
        }
    }
    return -1;
}

function setRyltyPercent_webOrCsv(customerId, item, line, customerCat){
    var itemRec = item;

    // if not selected then take 'Non-Distributor' as default
    try {
        if (customerCat == 'Distributor') {
            var totalDistRlty = itemRec.getValue(COMMON.TOTAL_DIST_RYLTY_ID) ? parseFloat(itemRec.getValue(COMMON.TOTAL_DIST_RYLTY_ID)) : 0;
            nlapiSetLineItemValue('item', COMMON.RYLTY_HDN_PERCENT_ID, line, totalDistRlty);
        }
        else {
            var totalNonDistRlty = itemRec.getValue(COMMON.TOTAL_NON_DIST_RYLTY_ID) ? parseFloat(itemRec.getValue(COMMON.TOTAL_NON_DIST_RYLTY_ID)) : 0;
            nlapiSetLineItemValue('item', COMMON.RYLTY_HDN_PERCENT_ID, line, totalNonDistRlty);

        }
    }catch(ex){
        nlapiLogExecution('ERROR', 'Function setRyltyPercent_webOrCsv', ex);
    }
}

// set the values of current line item from item
function setLineValuesFromItem(itemId, line){
    var result = getDefaultValuesOfItem(itemId);
        
    if(result != null){
        
        var innerPack = result[0].getValue(COMMON.DEFAULT_INNERPACK_ID);
        var casePack = result[0].getValue(COMMON.DEFAULT_CASEPACK_ID);
        var retailPrice = result[0].getValue(COMMON.DEFAULT_RETAILPRICE_ID);
        var customerSku = result[0].getValue(COMMON.DEFAULT_CUSTOMERSKU_ID);
        var altUpc = result[0].getValue('upccode');
        var altSalesDesc = result[0].getValue('salesdescription');
        
        if(isValidValue(casePack)){
            nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, casePack);
        }
        if(isValidValue(innerPack)){
            nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, innerPack);
        }
        if(isValidValue(retailPrice)){
            nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, retailPrice);
        }
        if(isValidValue(altSalesDesc)){
            nlapiSetLineItemValue('item', 'description', line, altSalesDesc);
        }
        if(isValidValue(altUpc)){
            nlapiSetLineItemValue('item', COMMON.UPC_ID, line, altUpc);
        }
        if(isValidValue(customerSku)){
            nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, customerSku);
        }
    }
}

// source line items with bulk search
function sourceLineItemRelcalc(custId,itemIdArray, startingLine, totalLines){
    // get vales from item record
    var itemResult = nlapiSearchRecord('item', null, 
        [
        new nlobjSearchFilter('internalid', null, 'anyof', itemIdArray)
        ], 
        [
        new nlobjSearchColumn(COMMON.DEFAULT_INNERPACK_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_CASEPACK_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_RETAILPRICE_ID),
        new nlobjSearchColumn(COMMON.DEFAULT_CUSTOMERSKU_ID),
        new nlobjSearchColumn('upccode'),
        new nlobjSearchColumn('salesdescription'),
        new nlobjSearchColumn(COMMON.TOTAL_DIST_RYLTY_ID),
        new nlobjSearchColumn(COMMON.TOTAL_NON_DIST_RYLTY_ID)
        ]);
        
    var filters = [];
    filters.push(new nlobjSearchFilter(ITEM_SOURCING.FieldName.CUSTOMER_ID, null, 'is', custId));
    filters.push(new nlobjSearchFilter(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID, null, 'anyof', itemIdArray));
    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    // returning columns
    var columns = [];
    columns.push(new nlobjSearchColumn(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID));
    columns.push(new nlobjSearchColumn(ITEM_SOURCING.FieldName.CASE_PACK_ID));
    columns.push(new nlobjSearchColumn(ITEM_SOURCING.FieldName.INNER_PACK_ID));
    columns.push(new nlobjSearchColumn(ITEM_SOURCING.FieldName.RETAIL_PRICE_ID));
    columns.push(new nlobjSearchColumn(ITEM_SOURCING.FieldName.ALT_SALES_DESC_ID));
    columns.push(new nlobjSearchColumn(ITEM_SOURCING.FieldName.ALT_UPC_ID));
    columns.push(new nlobjSearchColumn(ITEM_SOURCING.FieldName.CUSTOMER_SKU_ID));
    
    // search result of customer item details
    var custItemResult = [];
    custItemResult = nlapiSearchRecord(ITEM_SOURCING.INTERNAL_ID, null, filters, columns);
        
    for(var line = startingLine;line<=totalLines;line++){
        var item = nlapiGetLineItemValue('item', 'item', line);
        var itemIndex = getItemRecIndex(item, itemResult);
        if(itemIndex != -1){
            // get and set the dufault value of item
            var innerPack = itemResult[itemIndex].getValue(COMMON.DEFAULT_INNERPACK_ID);
            var casePack = itemResult[itemIndex].getValue(COMMON.DEFAULT_CASEPACK_ID);
            var retailPrice = itemResult[itemIndex].getValue(COMMON.DEFAULT_RETAILPRICE_ID);
            var customerSku = itemResult[itemIndex].getValue(COMMON.DEFAULT_CUSTOMERSKU_ID);
            var altUpc = itemResult[itemIndex].getValue('upccode');
            var altSalesDesc = itemResult[itemIndex].getValue('salesdescription');
        
            if(isValidValue(casePack)){
                nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, casePack);
            }
            if(isValidValue(innerPack)){
                nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, innerPack);
            }
            if(isValidValue(retailPrice)){
                nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, retailPrice);
            }
            if(isValidValue(altSalesDesc)){
                nlapiSetLineItemValue('item', 'description', line, altSalesDesc);
            }
            if(isValidValue(altUpc)){
                nlapiSetLineItemValue('item', COMMON.UPC_ID, line, altUpc);
            }
            if(isValidValue(customerSku)){
                nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, customerSku);
            }
            
            // get and set values from custom record
            var custItemIndex = getCustRecIndex(item, custItemResult);
            if(custItemIndex != -1){
                var custInnerPack = custItemResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.INNER_PACK_ID);
                custInnerPack = custInnerPack?parseInt(custInnerPack):0;
                var custCasePack = custItemResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.CASE_PACK_ID);
                custCasePack = custCasePack?parseInt(custCasePack):0;
                var custRetailPrice = custItemResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.RETAIL_PRICE_ID);
                custRetailPrice = custRetailPrice?parseFloat(custRetailPrice):0;
                var custAltSalesDesc = custItemResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.ALT_SALES_DESC_ID);
                var custAltUpc = custItemResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.ALT_UPC_ID);
                var custSku = custItemResult[custItemIndex].getValue(ITEM_SOURCING.FieldName.CUSTOMER_SKU_ID);
                
                if(isValidValue(custInnerPack))
                    nlapiSetLineItemValue('item', COMMON.INNER_PACK_ID, line, custInnerPack);

                if(isValidValue(custCasePack))
                    nlapiSetLineItemValue('item', COMMON.CASE_PACK_ID, line, custCasePack);
  
                if(isValidValue(custRetailPrice))
                    nlapiSetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line, custRetailPrice);

                if(isValidValue(custSku))
                    nlapiSetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line, custSku);
            
                if(isValidValue(custAltUpc))
                    nlapiSetLineItemValue('item', COMMON.UPC_ID, line, custAltUpc);

                if(isValidValue(custAltSalesDesc))
                    nlapiSetLineItemValue('item', 'description', line, custAltSalesDesc);
            }
            
            var lineInnerPack = nlapiGetLineItemValue('item', COMMON.INNER_PACK_ID, line);
            var lineCasePack = nlapiGetLineItemValue('item', COMMON.CASE_PACK_ID, line);
            var lineRetailPrice = nlapiGetLineItemValue('item', COMMON.RETAIL_PRICE_ID, line);
            var lineAltUpc = nlapiGetLineItemValue('item', COMMON.UPC_ID, line);
            
            if(lineInnerPack != innerPack || lineCasePack != casePack)
                nlapiSetLineItemValue('item', COMMON.SPECIAL_PACKING_ID, line, 'T');
            
            if(lineRetailPrice != retailPrice || lineAltUpc != altUpc)
                nlapiSetLineItemValue('item', COMMON.REQ_REPROCESS_ID, line, 'T');
        }
        
        var tempSku = nlapiGetLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line);
        var tempSkuSearch = nlapiGetLineItemValue('item', COMMON.SKU_ITEM_ID, line);
        if(isValidValue(tempSku) && !isValidValue(tempSkuSearch)){
            nlapiSetLineItemValue('item', COMMON.SKU_ITEM_ID, line, tempSku + ' - ' + nlapiGetLineItemText('item','item',line));
        }
    
        setCommissionPercent_sourcing(line);
        setRyltyPercent_sourcing(line);
    }
}