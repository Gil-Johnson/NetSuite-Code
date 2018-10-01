function addButton(type, form, request){
    if(type == 'create' || type == 'edit'){
        var tranId;
        var fulfilId = nlapiGetRecordId();
        var createdFrom = nlapiGetFieldValue('createdfrom');
        
        if(isValidValue(fulfilId)){
            tranId = fulfilId;
        }else 
        if(isValidValue(createdFrom)){
            tranId = createdFrom;
        }
        else{
            tranId = '';
        }
        
        var URL = COMMON.SUITLET_URL + '&' + COMMON.PARAMETER_CUST_TRANID_ID + '=' + tranId;
        var style = 'width=750,height=600,resizable=yes,scrollbars=yes';
        var script = "nlOpenWindow('" + URL + "', 'custompopup_sortedentry','" + style + "');";
        form.addButton(COMMON.BTN_SORTED_ENTRY_ID, 'Sorted Entry', script);
    }
}