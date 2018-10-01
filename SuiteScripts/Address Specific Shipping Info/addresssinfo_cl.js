function fieldChanged(type,fieldName){
    if(fieldName == ADDR_INFO_RECORD.fields.CUSTOMER){
        populateTempShipTo();
    }
}

function populateTempShipTo(){
    var fieldPosition = 'top:20px;left:-1px;';
    if(navigator.appName == 'Microsoft Internet Explorer')
        fieldPosition = 'top:28px;left:-2px;z-index:9999;';

    var dropDownHTML = '<label class="smallgraytextnolink" style="display:inline-block;width:150px;position:relative;' + fieldPosition + '">Customer Ship To</label>&nbsp;';
    dropDownHTML += '<select id="' + TEMP_SHIPTO_SELECT + '" \n\
                                 style="width:200px;position:relative;' + fieldPosition + '" \n\
                                 onchange="setActualShipToField();"\n\
                                 class="dropdownInput textbox"\n\
                                 ><option></option>';
    
    var company = nlapiGetFieldValue(ADDR_INFO_RECORD.fields.CUSTOMER);
    if(company){
        var rec = nlapiLoadRecord('customer',company);
        var addrCount = rec.getLineItemCount('addressbook');

        for(var i=1; i<= addrCount; i++){
            dropDownHTML +=
            '<option value ="' + rec.getLineItemValue('addressbook','id',i) + '">'
            + rec.getLineItemValue('addressbook','label',i)
            + '</option>';
        }

    }

    dropDownHTML += '</select>';
    
    try{
        document.getElementById(TEMP_SHIPTO_FIELD + '_val').innerHTML = dropDownHTML;
    }catch(exc){
        //alert('unable to set html:' + exc.message);
        nlapiLogExecution("ERROR", 'unable to set html', exc.message);
    }
}

//Get the value from arbitrary field and set it to hidden actual ship to field
function setActualShipToField(){
    try{
        var selectElem = document.getElementById(TEMP_SHIPTO_SELECT);
        var value = selectElem.options[selectElem.selectedIndex].value;
        nlapiSetFieldValue(ADDR_INFO_RECORD.fields.SHIP_TO_LABEL, value);
    }catch(exc){
    //alert('failed in setActualShipToField');
    //alert(exc.message);
    }


    
}
