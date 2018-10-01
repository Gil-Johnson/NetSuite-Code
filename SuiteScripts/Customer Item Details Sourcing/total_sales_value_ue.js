function usereventBeforeSubmit(type){
    if(type == 'create' || type == 'edit'){
        var totalSalesVaue = 0;
        var itemCount = nlapiGetLineItemCount('item');
        for(var line = 1; line <= itemCount; line++){
            var isFulFill = nlapiGetLineItemValue('item','itemreceive',line);
            if(isFulFill == 'T'){
                var quantity = nlapiGetLineItemValue('item', 'quantity', line);
                var rate = nlapiGetLineItemValue('item', COMMON.ITEM_RATE_ID, line);
                
                quantity = isValidValue(quantity) ? parseFloat(quantity) : 0;
                rate = isValidValue(rate) ? parseFloat(rate) : 0;
                totalSalesVaue += rate * quantity;
            }
        }
        nlapiSetFieldValue(COMMON.TOTAL_SALES_VALUE_ID, totalSalesVaue);
    }
}

function isValidValue(value){
    return !(value == '' || value == null || typeof value == 'undefined');
}