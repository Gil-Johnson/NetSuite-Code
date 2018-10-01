function userEventBeforeLoad(type, form, request){
    var context = nlapiGetContext().getExecutionContext();
    if(context == 'userinterface' || context == 'suitelet'){
        if(type == 'view'){
            return;
        }
        if(type == 'copy'){
            nlapiSetFieldValue(COMMON.UPC_ASSIGNED_ID, 'F');
        }
        var upcAssigned = null; 
        if(type == 'create' || type == 'edit' || type == 'copy'){
            upcAssigned = nlapiGetFieldValue(COMMON.UPC_ASSIGNED_ID);
        }
        /*if(type == 'view'){
            upcAssigned = nlapiLookupField(nlapiGetRecordType(), nlapiGetRecordId(), COMMON.UPC_ASSIGNED_ID);
        }*/
        if(upcAssigned == 'F'){
            form.addButton(COMMON.BTN_GET_UPC_ID, 'Reserve UPC', 'getUpcScript()');
            
            var script = form.addField(COMMON.INLINE_UPC_SCRIPT_ID, 'inlinehtml');
        
            var sc = "<script>";
            sc += "g_type = '" + type + "';";
            sc += getUpcScript.toString();
            sc += getUpcRecord.toString();
            sc += getCommon.toString();
            sc += "</script>";
        
            script.setDefaultValue(sc);
        }
    }
    if(context == 'csvimport'){
        if(type == 'create' || type == 'edit'){
            nlapiSetFieldValue(COMMON.UPC_ASSIGNED_ID, 'T');
        }
    }
}

function getUpcScript() {
    UPC_CODE_RECORDS = getUpcRecord();
    COMMON = getCommon();
    
    var filters = [];
    var columns = [];
    var result = [];
            
    filters[filters.length] = new nlobjSearchFilter(UPC_CODE_RECORDS.FieldName.RESERVERD_ID,null,'is','F');
    columns[columns.length] = new nlobjSearchColumn(UPC_CODE_RECORDS.FieldName.UPC_CODE_ID).setSort(false);
    columns[columns.length] = new nlobjSearchColumn('internalid').setSort(false);
            
    result = nlapiSearchRecord(UPC_CODE_RECORDS.INTERNAL_ID, null, filters, columns);
    
    if(result != null){
        nlapiDisableField(COMMON.BTN_GET_UPC_ID, true);
        var bottomGetUpcNumBtn = document.getElementById('secondary'+COMMON.BTN_GET_UPC_ID);
        var classDisBtn = document.getElementById(COMMON.BTN_GET_UPC_ID).parentElement.parentElement.className;
        bottomGetUpcNumBtn.disabled = true;
        bottomGetUpcNumBtn.parentElement.parentElement.className = classDisBtn;
        
        var upcCode = result[0].getValue('name');
        var recId = result[0].getId();
        nlapiSubmitField(UPC_CODE_RECORDS.INTERNAL_ID, recId, UPC_CODE_RECORDS.FieldName.RESERVERD_ID, 'T');
                
        // set upc in item
        if(g_type == 'create' || g_type == 'edit' || g_type == 'copy'){
            nlapiSetFieldValue(COMMON.UPC_ASSIGNED_ID, 'T');
            nlapiSetFieldValue('upccode', upcCode);
        }
        
        if(g_type == 'edit'){
            nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), COMMON.UPC_ASSIGNED_ID, 'T');
        }
        
    /*if(g_type == 'view'){
            nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), COMMON.UPC_ASSIGNED_ID, 'T');
            nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'upccode', upcCode);
            window.location.reload();
        }*/
    }else{
        alert('UPC code is not found.');
    }
}