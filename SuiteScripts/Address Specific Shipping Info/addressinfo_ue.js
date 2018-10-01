function beforeLoad(type, form){
    nlapiLogExecution('DEBUG', 'in here', type);
    if(type == 'create' || type == 'edit'){
        
        form = addShiptoField(form);
    }
}

function addShiptoField(form){
    form.addField(TEMP_SHIPTO_FIELD, 'inlinehtml').setDefaultValue('');
    return form;
}