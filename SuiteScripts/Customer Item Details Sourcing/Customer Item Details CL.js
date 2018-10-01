function clientSaveRecord(){
    var type = '';
    // load customer and item values from current record
    var customer = nlapiGetFieldValue(ITEM_SOURCING.FieldName.CUSTOMER_ID);
    var itemNumber = nlapiGetFieldValue(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID);
    
    /*if(!isValidValue(customer)){
        alert('Related Customer is empty');
        return false;
    }
    else if(!(isValidValue(itemNumber))){
        alert('Related Item is empty');
        return false;
    }*/
    
    if(isValidValue(customer) && isValidValue(itemNumber)){
        // load customer and item text from current record
    var customerTxt = nlapiGetFieldText(ITEM_SOURCING.FieldName.CUSTOMER_ID);
    var itemNumberTxt = nlapiGetFieldText(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID);
    if(isValidValue((nlapiGetRecordId()))) type = 'edit';
    
    return searchCustomerItemCombination(customer, itemNumber, customerTxt,itemNumberTxt,type);
    }
    return true;
}


// search the cutomer and item combination in custom record type
function searchCustomerItemCombination(customer,itemNumber, customerTxt, itemNumberTxt,type){
    // searching criteria for fliter
    var filters = new Array();
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.CUSTOMER_ID, null, 'is', customer);
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID, null, 'is', itemNumber);
    
    // search result
    var searchResult = [];
    searchResult = nlapiSearchRecord(ITEM_SOURCING.INTERNAL_ID, null, filters, null);        
    // if record is already exists, throw the error
    if(searchResult != null  && searchResult.length > 0) {
        if(type=='edit'){
            if(searchResult[0].getId() == nlapiGetRecordId())
                return true;
        }
        var id = searchResult[0].getId();
        showPopup(customerTxt,itemNumberTxt, id);
        return false;
    }
    return true;
}

// custom error thrown to prevent the submitting of current record
function showPopup(customer, item, id){
    var url = '/app/common/custom/custrecordentry.nl?rectype=23&id='+id+'&e=T';
    
    if(!j.home('#mymodal').html()){
        var message = '<span style="font-family: Arial;font-size: 14;">Customer: "'+customer +'" is already associated with Item: "'+ item +'"'+ '.<br/><br/>'
        + 'Please click on the <a href="'+url+'">link</a> to update the existing record.<span><br/><br/>';
        message += "<div align='center'><input class='ui-button-text ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus' id='btnClose' type='button' value='Close' onclick='modalCloseButton();' style='width: 85px;color:black;'></div>";
        j.home('#mymodal').append(message);
    }
    _dialog();
}

function isValidValue(value){
    return !(value == '' || value == null || typeof value == 'undefined');
}