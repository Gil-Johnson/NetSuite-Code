function pageInit(type){
    if(type == 'create'){
        try{
            var soId = nlapiGetFieldValue('createdfrom');
            if(soId){
                var res = nlapiSearchRecord('transaction',null, new nlobjSearchFilter('internalid',null,'is',soId),null);
                if(res != null && res[0].getRecordType() == 'salesorder'){
                    var soRec = nlapiLoadRecord('salesorder', soId);
                    var woItemId = nlapiGetFieldValue('assemblyitem');       
                    var soTotalLines = soRec.getLineItemCount('item');
                    for(var line = 1; line <= soTotalLines; line++){
                        var soItemsId = soRec.getLineItemValue('item', 'item', line);
                        if(soItemsId == woItemId){
                            var soDescription = soRec.getLineItemValue('item', 'description', line);
                            var soUpc = soRec.getLineItemValue('item', COMMON.UPC_ID, line);
                            var soRetailPrice = soRec.getLineItemValue('item', COMMON.RETAIL_PRICE_ID, line);
                            var soInnerPack = soRec.getLineItemValue('item', COMMON.INNER_PACK_ID, line);
                            var soCasePack = soRec.getLineItemValue('item', COMMON.CASE_PACK_ID, line);
                            var soSku = soRec.getLineItemValue('item', COMMON.CUSTOMER_SKU_ID, line);
                            if(soDescription)
                                nlapiSetFieldValue(COMMON.WO_DESCRIPTION_ID, soDescription);
                            if(soUpc)
                                nlapiSetFieldValue(COMMON.WO_UPC_CODE_ID, soUpc);
                            if(soRetailPrice)
                                nlapiSetFieldValue(COMMON.WO_RETAIL_PRICE_ID, soRetailPrice);
                            if(soCasePack)
                                nlapiSetFieldValue(COMMON.WO_CASE_PACK_ID, soCasePack);
                            if(soInnerPack)
                                nlapiSetFieldValue(COMMON.WO_INNER_PACK_ID, soInnerPack);
                            if(soSku)
                                nlapiSetFieldValue(COMMON.WO_SKU_ID, soSku);
                            break;
                        }
                    }
                }
            }
        }catch(exception){
            alert('ERROR: Data Transition - ' + exception.message);
        }
    }
}