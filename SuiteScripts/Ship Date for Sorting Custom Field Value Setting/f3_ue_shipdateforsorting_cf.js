/********************************
User events for assigning value to Ship Date for Sorting Custom Field
********************************/

//region (Global Variables)
var context = nlapiGetContext();
//endregion

//region (Constants)
var BY_PASS_SO_ID = 'bypasssoid';
//endregion

//region (Events)


function beforeLoad(type, form) {

//    // Add custom controls for Amazon Flag Custom Field only if record is being manipulating through User Interface
//    if (context.getExecutionContext() == 'userinterface') {
//
//        var amazaonFlag = nlapiGetFieldValue('custitem17');
//        //nlapiLogExecution('DEBUG','f3_logs','amazaonFlag='+amazaonFlag);
//
//        if (type == 'create' || type == 'edit') {
//            var select = form.addField('custpage_item_amazon_flag', 'select', 'Amazon Flag');
//            select.addSelectOption('', '');
//            select.addSelectOption('Y', 'Yes');
//            select.addSelectOption('N', 'No');
//            select.setDefaultValue(amazaonFlag);
//        }
//        else if (type == 'view') {
//            form.addField('custpage_item_amazon_flag', 'text', 'Amazon Flag');
//            nlapiSetFieldValue('custpage_item_amazon_flag', amazaonFlag);
//        }
//    }
}


function beforeSubmit(type) {
    // Set value of Ship Date for Sorting Custom Field from built-in ship date field

    var currentSOId = nlapiGetFieldValue('id');
    nlapiLogExecution('DEBUG', 'f3_logs', 'currentSOId=' + currentSOId);

    var bypassSOId = context.getSessionObject(BY_PASS_SO_ID);
    nlapiLogExecution('DEBUG', 'f3_logs', 'bypassSOId=' + bypassSOId);

    //ctx.setSesssionObject('scope', request.getParameter('scope') );

    var oldSORecord = nlapiLoadRecord('salesorder', currentSOId);

    nlapiLogExecution('DEBUG', 'f3_logs', 'oldSORecord.shipdate=' + oldSORecord.getFieldValue('shipdate'));
    nlapiLogExecution('DEBUG', 'f3_logs', 'newSORecord.shipdate=' + nlapiGetFieldValue('shipdate'));
    nlapiLogExecution('DEBUG', 'f3_logs', 'current.custbody_sortingshipdate=' + nlapiGetFieldValue('custbody_sortingshipdate'));


    if (oldSORecord.getFieldValue('shipdate') != nlapiGetFieldValue('custbody_sortingshipdate') && !bypassSOId && bypassSOId != currentSOId) {

        nlapiSetFieldValue('custbody_sortingshipdate', nlapiGetFieldValue('shipdate'));

        nlapiLogExecution('DEBUG', 'f3_logs', 'setting custbody_sortingshipdate value');

        for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
            nlapiSetLineItemValue('item', 'expectedshipdate', i, nlapiGetFieldValue('shipdate'));

            nlapiLogExecution('DEBUG', 'f3_logs', 'setting expectedshipdate value of line=' + i);
        }
    }




}
//endregion