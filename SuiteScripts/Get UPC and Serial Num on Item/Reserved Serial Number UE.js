function userEventBeforeLoad(type, form, request){
    var context = nlapiGetContext().getExecutionContext();
    if(context == 'userinterface'){
        var isEmployeeExist = false;
        if(type == 'create' || type == 'copy'){
            var currentLoginUser = nlapiGetContext().getUser();
            var employeeIds = [];
            employeeIds = nlapiSearchRecord('employee', 'customsearch_system_emp_search');
        
            if(employeeIds != null){
                for(var i in employeeIds){
                    var empId = employeeIds[i].getId();
                    if(empId == currentLoginUser){
                        isEmployeeExist = true;
                        break;
                    }
                }
            }
        }
        
        if(type == 'view'){
            return;
        }
        if(type == 'copy'){
            nlapiSetFieldValue(COMMON.SERIAL_NUMBER_ASSIGNED_ID, 'F');
        }
        var serialNumberAssigned = null;
        var isCustomCheckbox = null;
        
        if(type == 'create' || type == 'edit' || type == 'copy'){
            serialNumberAssigned = nlapiGetFieldValue(COMMON.SERIAL_NUMBER_ASSIGNED_ID);
            isCustomCheckbox = nlapiGetFieldValue(COMMON.CHKBOX_CUSTOM_ID);
        }

        if(serialNumberAssigned == 'F' && isCustomCheckbox){
            if(type == 'create' || type == 'copy' || type == 'edit'){
                var script = form.addField(COMMON.INLINE_SERIAL_NUMBER_SCRIPT_ID, 'inlinehtml');
                
                var sc = "<script>";
                sc += "g_type = '" + type + "';";
                var objFld = form.addButton(COMMON.BTN_SERIAL_NUMBER_ID, 'Reserve Serial Number', 'getSerialNumberScript()');
                sc += getSerialNumberScript.toString();
                sc += getSerialNumberRecord.toString();
                sc += getCommon.toString();
                sc += "</script>";
                
                script.setDefaultValue(sc);
            
                if(type == 'edit'){
                    if(isCustomCheckbox == 'F')
                        objFld.setDisabled(true);
                }
                else 
                if(!isEmployeeExist){
                    if(type == 'create')
                        objFld.setDisabled(true);
                    if(type == 'copy' && isCustomCheckbox == 'F')
                        objFld.setDisabled(true);
                }
                else{
                    nlapiSetFieldValue(COMMON.CHKBOX_CUSTOM_ID, 'T');
                }
            }
        }
    }
    if(context == 'csvimport'){
        if(type == 'create' || type == 'edit'){
            nlapiSetFieldValue(COMMON.SERIAL_NUMBER_ASSIGNED_ID, 'T');
        }
    }
}

function getSerialNumberScript() {
    SERIAL_NUMBER_RECORDS = getSerialNumberRecord();
    COMMON = getCommon();

    var filters = [];
    var columns = [];
    var result = [];
            
    filters[filters.length] = new nlobjSearchFilter(SERIAL_NUMBER_RECORDS.FieldName.RESERVERD_ID,null,'is','F');
    columns[columns.length] = new nlobjSearchColumn(SERIAL_NUMBER_RECORDS.FieldName.SERIAL_NUMBER_ID).setSort(false);
    columns[columns.length] = new nlobjSearchColumn('internalid').setSort(false);
            
    result = nlapiSearchRecord(SERIAL_NUMBER_RECORDS.INTERNAL_ID, null, filters, columns);
    
    if(result != null){
        nlapiDisableField(COMMON.BTN_SERIAL_NUMBER_ID, true);
        var bottomReserveSerialNumBtn = document.getElementById('secondary'+COMMON.BTN_SERIAL_NUMBER_ID);
        var classDisBtn = document.getElementById(COMMON.BTN_SERIAL_NUMBER_ID).parentElement.parentElement.className;
        bottomReserveSerialNumBtn.disabled = true;
        bottomReserveSerialNumBtn.parentElement.parentElement.className = classDisBtn;
        
        var serialNumber = result[0].getValue('name');
        var recId = result[0].getId();
        nlapiSubmitField(SERIAL_NUMBER_RECORDS.INTERNAL_ID, recId, SERIAL_NUMBER_RECORDS.FieldName.RESERVERD_ID, 'T');
                
        // set upc in item
        if(g_type == 'create' || g_type == 'edit' || g_type == 'copy'){
            nlapiSetFieldValue(COMMON.SERIAL_NUMBER_ASSIGNED_ID, 'T'); // set hidden field in item record
            serialNumber = nlapiGetFieldValue('itemid') + serialNumber; // append serial number in item name
            nlapiSetFieldValue('itemid', serialNumber); 
        }
        if(g_type == 'edit'){
            nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), COMMON.SERIAL_NUMBER_ASSIGNED_ID, 'T');
        }
    }else{
        alert('Serial Number is not found.');
    }
}