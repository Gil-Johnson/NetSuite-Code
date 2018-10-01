// variable declarations

var defaultLocation = '1';// Niles
var context = nlapiGetContext();
var recordTypeSO = 'salesorder';
var locationsWithLineItems = [];
var lineItemFields = [];
var isDefaultLocationExist = false;
var strIds = '';
var bodyFieldsValues = [];
var setBodyFieldsExplicitly = [];
var isCsvImport = false;
var isWebService = false;
var externalIdFlag = true;
var externalId = null;
var SO_SPLITTING_SCHEDULED_SCRIPT_ID = 'customscript_so_splitting_sch';
var SO_SPLITTING_SCHEDULED_SCRIPT_DEP_ID = 'customdeploy_so_splitting_dep';

var errorEmailReceivingAddress = 'jayc@ricoinc.com';

/**
 * Get sales order screen url
 * @param environment
 */
function getSalesOrderScreenUrl(environment) {
    var salesOrderUrl = 'https://system.netsuite.com/app/accounting/transactions/salesord.nl?id=';
    if(environment === 'SANDBOX') {
        salesOrderUrl = 'https://system.sandbox.netsuite.com/app/accounting/transactions/salesord.nl?id=';
    }
    return salesOrderUrl;
}

/**
 * Decide either need to split current salesorder and generate new ones
 * @param locationArray
 */
function isNewSOGenerate(locationArray) {
    var length = locationArray.length;
    if(length==1) {
        return false;
    }
    return true;
}

function getAllLocation(linesCount){
    var temp = [];
    for(var lineNumber=1;lineNumber<=linesCount;lineNumber++){
        var tempLoc = nlapiGetLineItemValue('item', 'location', lineNumber);
        if(temp.indexOf(tempLoc) == -1){
            temp.push(tempLoc);
        }
    }
    return temp;
}
function setBodyFields(copyRec){
    try {
        var execContext = context.getExecutionContext();
        for(var i in setBodyFieldsExplicitly){
            copyRec.setFieldValue(i,setBodyFieldsExplicitly[i]);
        }
        for(var i in bodyFieldsValues){
            if(i == 'status'){
                nlapiLogExecution("DEBUG", 'value of status',bodyFieldsValues[i]);
            }
            if((execContext != "webstore") || (execContext == "webstore" && bodyFieldsValues[i].indexOf("ERROR:") == -1))
                copyRec.setFieldValue(i,bodyFieldsValues[i]);
        }
    }
    catch(e) {
        nlapiLogExecution("ERROR", e.name, e.message);
    }

    return copyRec;
}
function setPopUpFlag(bool){
    context.setSessionObject('flag', bool.toString());
}
function getPopUpFlag(){
    return context.getSessionObject('flag');
}
function setIds(str){
    context.setSessionObject('ids', str);
}
function getIds(){
    return context.getSessionObject('ids');
}

function insertLineItems(obj, location){
    for(var j in locationsWithLineItems[location]){
        // Insert Line Items
        obj.selectNewLineItem('item');
        for(var k in lineItemFields){
            try{
                var value = locationsWithLineItems[location][j][lineItemFields[k]];
                if(isValidValue(value)){
                    var field = lineItemFields[k];
                    obj.setCurrentLineItemValue('item', field, value);
                }
            }
            catch(e){
                nlapiLogExecution('ERROR', 'Set Line Item', e.message);
            }
        }
        obj.commitLineItem('item');
    }

    if(location==defaultLocation && locationsWithLineItems['0']){
        for(var j in locationsWithLineItems['0']){
            // Insert Line Items
            obj.selectNewLineItem('item');
            for(var k in lineItemFields){
                try{
                    var value = locationsWithLineItems['0'][j][lineItemFields[k]];
                    if(isValidValue(value)){
                        var field = lineItemFields[k];
                        obj.setCurrentLineItemValue('item', field, value);
                    }
                }
                catch(e){
                    nlapiLogExecution('ERROR', 'Set Line Item', e.message);
                }
            }
            obj.commitLineItem('item');
        }
    }

    return obj;
}

function SO_Split_BeforeLoad(type, form, request){

    //nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'type=' + type);
    //nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'ExecutionContext=' + context.getExecutionContext());
    //nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'orderstatus=' + nlapiGetFieldValue('orderstatus'));

    if(context.getExecutionContext() == 'userinterface'){

        /*var flag = getPopUpFlag();
        var ids = getIds();
        if(!isValidValue(flag))
            setPopUpFlag(false);
        if(!isValidValue(ids))
            setIds('');
        var showAllSos = false;

        if(type == 'create') {
            showAllSos = true;
        }

        //nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'outside flag check');
        //nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'flag=' + flag);
        //nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'ids=' + ids);

        if(flag == 'true' && isValidValue(ids)){
            var tempIds = [];
            tempIds = ids.split('|');

            if((showAllSos == false && tempIds.length>1) || (tempIds.length>0 && showAllSos == true)){

                // Get main SO id from 0th index
                var mainSoId = tempIds[0];
                var currentSoId = nlapiGetRecordId();
                // Compare if current SO is same as main SO in ids list
                if(mainSoId == currentSoId) {

                    //if(tempIds.length>0){
                    // jquery 1.7.2.js
                    var jqueryJs = "/core/media/media.nl?id=13&c=3500213&h=7e8bfb617fb0e16e2470&_xt=.js";
                    // jquery UI.css
                    var jqueryUiCss = "/core/media/media.nl?id=14&c=3500213&h=8c9cd4283b52c80f965c&_xt=.css";
                    // jquery UI.js
                    var jqueryUiJs = "/core/media/media.nl?id=15&c=3500213&h=8d1bf2ca46bafb370748&_xt=.js";

                    // include libraries
                    var html = "<script type='text/javascript' src='"+ jqueryJs +"'></script>";
                    html += "<link rel='stylesheet' href='"+ jqueryUiCss +"'/>";
                    html += "<script type='text/javascript' src='"+ jqueryUiJs +"'></script>";

                    html += "<script type='text/javascript'>";
                    html += "var j = {};";
                    html += "j.home = jQuery.noConflict();";
                    html += "j.home(document).ready(function(){";
                    html += "_dialog();";
                    html += "});";

                    html += "function _dialog() {";
                    html += "j.home('#mymodal').show();";
                    html += "j.home('#mymodal').dialog({";
                    html += "minWidth: 200,";
                    html += "width: 'auto',";
                    //html += "minHeight: 150,";
                    //html += "maxHeight: 300,";
                    html += "modal: true,";
                    html += "resizable: false,";
                    html += "draggable: false,";
                    // start hide close button from dialog
                    html += "closeOnEscape: true,";
                    //html += "closeOnEnter: true,";
                    html += "open: function(event, ui) {";
                    html += "j.home('.ui-dialog-titlebar-close').hide();";
                    html += "}";
                    // end hide close button from dialog
                    //html += "});";
                    html += "}).height('auto');";

                    html += "}";

                    html += "function modalCloseButton(){";
                    html += "j.home('#mymodal').dialog('close');";
                    html += "}";

                    html += "</script>";

                    var custField = form.addField('custpage_customfield', 'inlinehtml');
                    html += "<div id='mymodal' title='Sales Orders' style='display:none;'>";
                    /////////////////////////////////
                    html += "<div align='center'>";
                    html += "<table style='text-align:center;border-collapse:collapse;width: auto;min-width: 300px;' border='1px'>";
                    html += "<tr>";
                    html += "<td style='min-width:100px;width:auto'>";
                    html += "Order #";
                    html += "</td>";
                    html += "<td style='min-width:150px;width:auto;'>";
                    html += "Warehouse";
                    html += "</td>";
                    html += "</tr>";

                    for(var i=0;i<tempIds.length;i++){
                        if(!isValidValue(tempIds[i])) {
                            continue;
                        }
                        var orderId = nlapiLookupField('salesorder', tempIds[i], 'tranid');
                        var wareHouse = nlapiLookupField('salesorder', tempIds[i], 'location', true);
                        html += "<tr>";
                        html += "<td>";
                        html += "<a href='/app/accounting/transactions/salesord.nl?id=" + tempIds[i] + "&whence=' target='_blank'>" + orderId + "</a>";
                        html += "</td>";
                        html += "<td>";
                        html += wareHouse;
                        html += "</td>";
                        html += "</tr>";
                    }

                    html += "</table>";
                    html += "</div>";
                    html += "<div align='center' style='margin-top: 5;'>";
                    html += "<input class='ui-button-text ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only ui-state-focus' id='btnClose' type='button' value='Close' onclick='modalCloseButton();' style='width: 85px;color:black;'></div>";
                    ////////////////////////////////
                    html += "</div>";
                    custField.setDefaultValue(html);

                }
            }
        }
        setPopUpFlag(false);
        setIds('');
        //setSoUserInterfaceFlag(true);*/

         var custFieldApproveClickOverride = form.addField('custpage_customfield2', 'inlinehtml');
         var custHtml = "";
         custHtml += "<script type='application/javascript'>";
         custHtml += "var approveButtonClicked = false;";
         custHtml += "var approveButton = document.getElementById('approve');";
         custHtml += "if (approveButton && approveButton != 'undefined') {";
         custHtml += "var curEvent = approveButton['onclick'] || function() {};";
         custHtml += "approveButton['onclick'] = function () {";
         custHtml += "if(!approveButtonClicked) {";
         //custHtml += "alert('approve button clicked');";
         custHtml += "approveButtonClicked = true;";
         //custHtml += "console.log('approve button clicked');";
         custHtml += "curEvent();";
         custHtml += "}";
         //custHtml += "else {console.log('its has been clicked. Stop now.');}";
         custHtml += "}";
         custHtml += "}";
         custHtml += "</script>";
         custFieldApproveClickOverride.setDefaultValue(custHtml);

        disabledFulfillBtn(form);
    }
}

function SO_Split_BeforeSubmit(type){

    try{

        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log', 'type=' + type + '  ExecutionContext=' + context.getExecutionContext() + '  orderstatus=' + nlapiGetFieldValue('orderstatus'));

        if(type=='create'){
            checkExternalIdDuplication(nlapiGetFieldValue('externalid'));
        }

        var execContext = context.getExecutionContext();
        if(type == 'create' && execContext == 'webservices'){
            // workflow fix only for webservice
            var entityId = nlapiGetFieldValue('entity');
            if(isCustomerExist(entityId)){
                // A = Pending Approval
                nlapiSetFieldValue('orderstatus', 'A');
            }

            // Set ItemEditMode checkbox Field in case of create/webservice explicitly
            setItemEditModeField('T');
        }

        if (type == 'approve') {
            // check if there is a need to split the order by its location
            var isOrderWillSplit = checkIfOrderWillSplit();

            if (isOrderWillSplit) {
                // mark this field to true
                nlapiSetFieldValue(COMMON.TO_BE_SPLIT, 'T');
            } else {
                nlapiSetFieldValue(COMMON.TO_BE_SPLIT, 'F');
            }
        }

    }
    catch (ex){
        nlapiLogExecution('ERROR', 'Error_In_SO_Split_BeforeSubmit', ex.message);
    }

}

function SO_Split_AfterSubmit(type){

    try{
        var execContext = context.getExecutionContext();
        if(execContext == 'csvimport'){
            isCsvImport = true;
        }
        else if(execContext == 'webservices'){
            isWebService = true;
        }
        else if(execContext == 'webstore') {
            isWebService = true;
        }

        var newRecord = nlapiGetNewRecord();

        var so_order_status = '';
        var loadRecord = null;

        if(type == 'delete'){
            so_order_status = newRecord.getFieldValue('orderstatus');
        }
        else{
            loadRecord = nlapiLoadRecord(recordTypeSO, nlapiGetRecordId());
            so_order_status = loadRecord.getFieldValue('orderstatus');
        }

        var main_SO_Id = nlapiGetRecordId();

        nlapiLogExecution('DEBUG', 'AfterSubmit_f3_test_log', 'main_SO_Id=' + main_SO_Id + '  type=' + type + '  ExecutionContext=' + context.getExecutionContext() + '  orderstatus=' + so_order_status);

        if(type == 'approve'
            || (type == 'edit' && execContext == 'scheduled' && so_order_status == 'B')
            || (execContext == 'csvimport' && so_order_status == 'B')
            || (execContext == 'webstore' && so_order_status == 'B')
            || (execContext == 'webservices' && so_order_status == 'B')) {

            SO_Splitting_Manager.handleSOSplittingCriteria(main_SO_Id, loadRecord, execContext);

            //Schedule the script here
            var status = nlapiScheduleScript(
                SO_SPLITTING_SCHEDULED_SCRIPT_ID,
                SO_SPLITTING_SCHEDULED_SCRIPT_DEP_ID,
                null);

            //log the result so that we know what happened with this script
            nlapiLogExecution('DEBUG', 'Schedule Script Result = ', status);
        }

    }catch(exception){
        nlapiLogExecution('ERROR', 'error-in-splitting-so-after-submit-event' + ' MainSoId=' + main_SO_Id, exception.message);
    }
}

/**
 * Check if order needs to be split by getting its locations from line items
 * If more than one location exist it means that order will be split
 * @return {boolean}
 */
function checkIfOrderWillSplit() {
    var ifOrderSplit = false;
    var locations = [];
    var linesCount = nlapiGetLineItemCount('item');
    for (var lineNumber = 1; lineNumber <= linesCount; lineNumber++) {
        var location = nlapiGetLineItemValue('item', 'location', lineNumber);
        if (locations.indexOf(location) === -1) {
            locations.push(location);
        }
    }

    if (locations.length > 1) {
        ifOrderSplit = true;
    }

    return ifOrderSplit;
}

/**
 * This function disbaled the fulfill button if TO_BE_SPLIT checkbox is on
 * @param {nlobjForm} form
 */
function disabledFulfillBtn(form) {
    try {
        var toBeSplit = nlapiGetFieldValue(COMMON.TO_BE_SPLIT);
        if (toBeSplit == 'T') {
            var fulFillBtn = form.getButton('process');
            if (!!fulFillBtn) {
                fulFillBtn.setDisabled(true);
            }
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'disabledFulfillBtn', e.message);
    }
}

/**
 * Keep the lines of provided location from salesorder and delete all others
 * @param salesOrder
 * @param locationToKeep
 */
function removeLineItems(salesOrder, locationToKeep) {
    for (var line = salesOrder.getLineItemCount('item'); line>=1; line--) {
        var tempLoc = salesOrder.getLineItemValue('item', 'location', line);
        if(tempLoc != locationToKeep) {
            salesOrder.removeLineItem('item', line);
        }

    }
}

/*
 Set value of "Item Edit Mode" column custom field value
 Note: Currently its working only in case of webservice
 */
function setItemEditModeField(val) {

    var lineItemCount = nlapiGetLineItemCount('item');
    if(!!lineItemCount && lineItemCount > 0) {
        for(var i = 1; i <= lineItemCount; i++) {
            nlapiSetLineItemValue('item', 'custcol_po_item_edit_mode', i, val);
        }
    }
}

// return true if customer exist in saved search else false
function isCustomerExist(customerId){
    var result = nlapiSearchRecord('customer', 'customsearch_so_edi_approval');

    if(result != null){
        for(var i in result){
            if(result[i].getId() == customerId){
                return true;
            }
        }
    }
    return false;
}

function throwExternalIdDuplicateError(extId){
    var err = nlapiCreateError('DUP ERR', 'Sales order with externalId "'+ extId +'" already exists.',true);
    throw err;
}

function checkExternalIdDuplication(extId){
    if(extId){
        var soDup = nlapiSearchRecord('salesorder', null, [new nlobjSearchFilter('externalidstring', null, 'is', extId)], []);

        if(soDup != null){
            throwExternalIdDuplicateError(extId);
        }
    }
}

/*
 Set custom ship date field for newly created SOs used to sort SO records in PPT
 */
function setCustomShipDate(record, shipDate){
    if(!!shipDate){
        //nlapiLogExecution('DEBUG', 'f3_custbody_sortingshipdate', shipDate);
        record.setFieldValue('custbody_sortingshipdate', shipDate);
    }
}

/*
 Send email about error occurred during splitting of SO
 */
function sendEmailAboutErrorOccurred(mainSoId, soNumber, error, environment) {
    try {


        var emailSubject = "Error occurred during splitting of SalesOrder: " + soNumber;
        var emailBody = getEmailBody(mainSoId, soNumber, error, environment);
        var authorId = 5; // Here 5 is id of jay's customer

        nlapiSendEmail(authorId, errorEmailReceivingAddress, emailSubject, emailBody);
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in sendEmailAboutErrorOccurred(mainSoId, soNumber, error) method', ex.toString());
        throw ex;
    }
}

/*
 Create body of email to be sent on error occurred during splitting of SO
 */
function getEmailBody(mainSoId, soNumber, error, environment) {


    var body = '';

    body += '<p>';
    body += 'Error occurred during splitting of SalesOrder: ';
    body += '       <a href="' + getSalesOrderScreenUrl(environment) + mainSoId + '" target="_blank">';
    body += '           <b>' + soNumber + '</b>';
    body += '       </a>';
    body += '</p>';

    body += '</br></br></br>';

    body += '<p>';
    body += '   <b>Error Details:</b>  ' + error;
    body += '</p>';

    return body;
}