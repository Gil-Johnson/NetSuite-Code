// before submit event

// variable declarations

var defaultLocation = '1';// Niles
var context = nlapiGetContext();
var custBodyField = 'custbody_ids';
var recordTypeSO = 'salesorder';
var recordTypePO = 'purchaseorder';
//var orderId = null;
var baseLocation = null;
var locationsWithLineItems = [];
var lineItemFields = [];
var isEmptyLocationExist = false;
var isDefaultLocationExist = false;
var recordId = null;
var strIds = '';
var bodyFieldsValues = [];
var setBodyFieldsExplicitly = [];
var isCsvImport = false;
var isWebService = false;
var externalIdFlag = true;
var externalId = null;

// functions declarations
function isValidValue(value){
    if(value === null || typeof value === 'undefined' || value === '')
        return false;
    return true;
}
function isNewSOGenerate(locationArray)
{
    var length = locationArray.length;
    if(length==1) return false;
    var isEmptyLoc = false;
    if(locationArray.indexOf('0') != -1)
        isEmptyLoc = true;
    if(length==2){
        if(isEmptyLoc)
            return false;
    }
    return true;
}
function getBaseLocation(linesCount){
    for(var lineNumber=1;lineNumber<=linesCount;lineNumber++){
        var tempLoc = nlapiGetLineItemValue('item', 'location', lineNumber);
        if(isValidValue(tempLoc))
            return tempLoc;
    }
    return null;
}

/*
 Hack:
 This function set location of line item of type 'item' explicitly if execution context is web store
 Locations of line items are coming null in case of webstore :-( We dont know why!!!!
 Its a Chepi.
 */
function setLocationValueForWebStore() {

    try {
        var execContext = context.getExecutionContext();
        if (execContext != 'webstore') {
            return;
        }

        nlapiLogExecution('DEBUG', 'Its_webstore', 'Setting line item location.');

        var loadRecord = nlapiGetNewRecord();
        var lineItemsCount = loadRecord.getLineItemCount('item');

        var itemIds = [];
        for (var lineNumber = 1; lineNumber <= lineItemsCount; lineNumber++) {
            itemIds.push(nlapiGetLineItemValue('item', 'item', lineNumber));
        }

        var filters = new Array();
        filters.push(new nlobjSearchFilter('internalid', null, 'anyof', itemIds));

        var columns = new Array();
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('location'));

        var res = nlapiSearchRecord('item', null, filters, columns);

        var locationData = [];
        for (var i = 0; i < res.length; i++) {
            locationData[res[i].getValue('internalid')] = res[i].getValue('location');
        }

        for (var lineNumber = 1; lineNumber <= lineItemsCount; lineNumber++) {
            var itemId = nlapiGetLineItemValue('item', 'item', lineNumber);
            nlapiSetLineItemValue('item', 'location', lineNumber, locationData[itemId]);
        }
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in Setting line item location fro webstore', ex.message);
    }
}


function getAllLocation(linesCount){
    var temp = [];
    for(var lineNumber=1;lineNumber<=linesCount;lineNumber++){
        var tempLoc = nlapiGetLineItemValue('item', 'location', lineNumber);
        if(!isValidValue(tempLoc)) tempLoc = '0';

        if(temp.indexOf(tempLoc) == -1){
            temp.push(tempLoc);
        }
    }
    return temp.sort();
}
function setBodyFields(copyRec){
    try {
        var execContext = context.getExecutionContext();
        for(var i in setBodyFieldsExplicitly){
            copyRec.setFieldValue(i,setBodyFieldsExplicitly[i]);
        }
        for(var i in bodyFieldsValues){
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

    nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'type=' + type);
    nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'ExecutionContext=' + context.getExecutionContext());
    nlapiLogExecution('DEBUG', 'BeforeLoad_f3_test_log', 'status=' + nlapiGetFieldValue('status'));

    var date1 = new Date();
    if(context.getExecutionContext() == 'userinterface'){

        var flag = getPopUpFlag();
        var ids = getIds();
        if(!isValidValue(flag))
            setPopUpFlag(false);
        if(!isValidValue(ids))
            setIds('');
        var showAllSos = false;

        if(type == 'create') {
            showAllSos = true;
        }
        if(flag == 'true' && isValidValue(ids)){
            var tempIds = [];
            tempIds = ids.split('|');

            if((showAllSos == false && tempIds.length>1) || (tempIds.length>0 && showAllSos == true)){
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
                    //if(showAllSos==false && i==0) continue; 
                    if(!isValidValue(tempIds[i])) continue;
                    var obj = nlapiLoadRecord('salesorder', tempIds[i]);
                    var orderId = obj.getFieldValue('tranid');
                    var wareHouse = obj.getFieldText('location');
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
        setPopUpFlag(false);
        setIds('');
    }
    var date2 = new Date();
    nlapiLogExecution('DEBUG', 'BeforeLoad', date2-date1);
}

function SO_Split_BeforeSubmit(type){

    nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log', 'type=' + type);
    nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log', 'ExecutionContext=' + context.getExecutionContext());
    nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log', 'status=' + nlapiGetFieldValue('status'));

    var strShipAddress = nlapiGetFieldValue('custbody_hdn_ship_address');
    nlapiLogExecution('DEBUG', 'f3_custbody_hdn_ship_address', strShipAddress);
    var shipAddress = null;
    if(!!strShipAddress){
        shipAddress = JSON.parse(strShipAddress);
    }

    setLocationValueForWebStore();


    try{
        /*
         var loc1 = nlapiGetLineItemValue('item', 'location', 1);
         var loc2 = nlapiGetLineItemValue('item', 'location', 2);

         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location1', 'loc1=' + loc1);
         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location2', 'loc2=' + loc2);

         var soNewRecord = nlapiGetNewRecord();
         var soOldRecord = nlapiGetOldRecord();

         if(soNewRecord==null){
         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soNewRecord', 'soNewRecord is null');
         }
         else{
         var loc1_new = soNewRecord.getLineItemValue('item', 'location', 1);
         var loc2_new = soNewRecord.getLineItemValue('item', 'location', 2);
         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_new', 'loc1_new=' + loc1_new);
         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_new', 'loc2_new=' + loc2_new);
         }

         if(soOldRecord==null){
         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soOldRecord', 'soOldRecord is null');
         }
         else{
         var loc1_old = soOldRecord.getLineItemValue('item', 'location', 1);
         var loc2_old = soOldRecord.getLineItemValue('item', 'location', 2);
         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_old', 'loc1_old=' + loc1_old);
         nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_old', 'loc2_old=' + loc2_old);
         }
         //*/
    }
    catch(ex){
        nlapiLogExecution('ERROR', 'error in location logging', ex.message);
    }





    if(type=='create'){
        checkExternalIdDuplication(nlapiGetFieldValue('externalid'));
    }

    //nlapiLogExecution('DEBUG','params',[type,p2,p3].join(','));
    var date1 = new Date();
    var execContext = context.getExecutionContext();
    if(execContext == 'csvimport')
        isCsvImport = true;
    else
    if(execContext == 'webservices'){
        isWebService = true;
        // workflow fix only for webservice
        var entityId = nlapiGetFieldValue('entity');
        if(isCustomerExist(entityId)){
            // A = Pending Approval
            nlapiSetFieldValue('orderstatus', 'A');
        }
    }
    else if(execContext == 'webstore') {
        isWebService = true;
    }


    if(type == 'create') {
        var firstTimeFlag = true;
        var loadRecord = nlapiGetNewRecord();

        var lineItemsCount = loadRecord.getLineItemCount('item');
        nlapiLogExecution("DEBUG",'linecount',lineItemsCount);

        baseLocation = getBaseLocation(lineItemsCount);
        if(baseLocation==null)
            baseLocation=defaultLocation;

        var locations = [];
        locations = getAllLocation(lineItemsCount);

        nlapiLogExecution("DEBUG",'All locations',JSON.stringify(locations));

        var isNewSOCreate = isNewSOGenerate(locations);

        nlapiLogExecution("DEBUG",'isNewSOCreate',isNewSOCreate);

        if(locations.indexOf(defaultLocation) != -1)
            isDefaultLocationExist = true;
        if(locations.indexOf('0') != -1)
            isEmptyLocationExist = true;

        if(isNewSOCreate){
            lineItemFields = loadRecord.getAllLineItemFields('item');

            var bodyFields = [];
            bodyFields = loadRecord.getAllFields();

            externalId = nlapiGetFieldValue('externalid');

            var exclude =  ["ntype","_button", "_eml_nkey_", "_multibtnstate_", "tranid", "entity", "shipcarrier", "shipmethod", "externalid"];

            for(var i in bodyFields){

                if(execContext == "webstore" && bodyFields[i] == "ccnumber") {
                    //nlapiLogExecution('DEBUG', "ccnumber field ignored");
                }
                else {
                    var temp = loadRecord.getFieldValue(bodyFields[i]);
                    if(exclude.indexOf(bodyFields[i]) != -1) continue;

                    if(isValidValue(temp)){
                        bodyFieldsValues[bodyFields[i]] = temp;
                        //nlapiLogExecution('DEBUG', bodyFields[i], temp);
                    }
                }
            }

            setBodyFieldsExplicitly['entity'] = loadRecord.getFieldValue('entity');
            setBodyFieldsExplicitly['shipcarrier'] = loadRecord.getFieldValue('shipcarrier');
            setBodyFieldsExplicitly['shipmethod'] = loadRecord.getFieldValue('shipmethod');

            for(var line=1; line<= lineItemsCount; line++){
                var tempLocation = loadRecord.getLineItemValue('item','location',line);

                var tempArr = [];
                for(var j in lineItemFields){
                    var field = lineItemFields[j];
                    var value = loadRecord.getLineItemValue('item',field,line);
                    if(isValidValue(value))
                        tempArr[field] = value;
                }
                // if array of location is not created make an array

                if(isValidValue(tempLocation))
                {
                    if(!locationsWithLineItems[tempLocation])
                        locationsWithLineItems[tempLocation] = [];

                    locationsWithLineItems[tempLocation].push(tempArr);
                }else{
                    if(!locationsWithLineItems['0'])
                        locationsWithLineItems['0'] = [];

                    locationsWithLineItems['0'].push(tempArr);
                }
            }// endfor

            // create So

            if(isCsvImport || isWebService)
                firstTimeFlag = false;

            for(var i=0;i<locations.length;i++){
                var location = locations[i];
                if(location == '0' && isDefaultLocationExist){
                    nlapiLogExecution('DEBUG', 'skip location: ', location);
                    continue;
                }
                else{
                    nlapiLogExecution('DEBUG', 'location: ', location);
                    if(firstTimeFlag){
                        firstTimeFlag = false;
                        // remove lines with respect to current location
                        if(location == defaultLocation){
                            for(var line=lineItemsCount;line>=1;line--){
                                var tempLoc = nlapiGetLineItemValue('item', 'location', line);
                                if(tempLoc != location && isValidValue(tempLoc))
                                    nlapiRemoveLineItem('item', line);
                            }
                        }else if(location == '0'){
                            for(var line=lineItemsCount;line>=1;line--){
                                var tempLoc = nlapiGetLineItemValue('item', 'location', line);
                                if(isValidValue(tempLoc))
                                    nlapiRemoveLineItem('item', line);
                            }
                        } else{
                            for(var line=lineItemsCount;line>=1;line--){
                                var tempLoc = nlapiGetLineItemValue('item', 'location', line);
                                if(tempLoc != location){
                                    nlapiLogExecution('DEBUG','remoiving line ' + line,nlapiGetLineItemCount('item'));
                                    nlapiRemoveLineItem('item', line);
                                }

                            }
                        }
                        if(location=='0')
                            location = defaultLocation;
                        nlapiSetFieldValue('location', location);
                    }else{
                        var createRecord = nlapiCreateRecord(recordTypeSO);
                        createRecord = setBodyFields(createRecord);
                        createRecord = insertLineItems(createRecord, location);
                        if(location=='0')
                            location = defaultLocation;
                        createRecord.setFieldValue('location',location);

                        // set hold filed, royalty and commission calculation: start
                        var customerId = nlapiGetFieldValue('entity');
                        setHoldField(customerId);
                        var totalEstimatedComm = setTotalEstComm(createRecord);
                        var totalEstRltyComm = setTotalEstRoylty(createRecord);

                        createRecord.setFieldValue(COMMON.TOTAL_EST_COMM_ID, totalEstimatedComm);
                        createRecord.setFieldValue(COMMON.TOTAL_EST_LEG_RYLTY_ID, totalEstRltyComm);
                        // set hold filed, royalty and commission calculation: end

                        // handling external id preserved to prevent duplicate via webservice
                        if((isCsvImport || isWebService) && externalIdFlag){
                            if(externalId)
                                createRecord.setFieldValue('externalid', externalId);
                            externalIdFlag = false;
                        }

                        var id;

                            setResetFieldValues(createRecord);

                            setCustomShipDate(createRecord, nlapiGetFieldValue('shipdate'));

                            if(execContext == 'userinterface'){
                                setShipAddressFields(createRecord, shipAddress);
                            }

                            id = nlapiSubmitRecord(createRecord, true);

                        
                        //HSN: Save this id to some session
                        if(execContext == "webstore") {
                            var existingSo = context.getSessionObject("so_num");
                            if( existingSo == null || existingSo == "") {
                                existingSo = "";
                            }
                            else {
                                existingSo += ",";
                            }
                            context.setSessionObject("so_num", existingSo + id);
                        }


                        nlapiLogExecution('DEBUG', 'new so created', id);

                        try{
                            workOrderDataTransition(id);
                        }catch(exception){
                            nlapiLogExecution('ERROR', 'Data Transition - SO Split',exception.message);
                        }
                        strIds += '|' + id;
                    }
                }
            }
        }
        else
        {
            if(execContext != "webstore"){
                nlapiSetFieldValue('location', baseLocation);
            }
            else{
                nlapiLogExecution('DEBUG', 'No tSetting Base location', 'No tSetting Base location in body field');
            }
        }

        if(context.getExecutionContext() == 'userinterface'){
            setPopUpFlag(true);
            setIds(strIds);
            nlapiLogExecution('DEBUG', 'IDs', strIds);
        }
    }
    var date2 = new Date();
    nlapiLogExecution('DEBUG', 'BeforeSubmit', date2-date1);
    if(isNewSOCreate && (isCsvImport || isWebService) && execContext != "webstore")
        csvThrowError();
}

function SO_Split_AfterSubmit(type){

    nlapiLogExecution('DEBUG', 'AfterSubmit_f3_test_log', 'type=' + type);
    nlapiLogExecution('DEBUG', 'AfterSubmit_f3_test_log', 'ExecutionContext=' + context.getExecutionContext());
    nlapiLogExecution('DEBUG', 'AfterSubmit_f3_test_log', 'status=' + nlapiGetFieldValue('status'));

    if(context.getExecutionContext() == "webstore") {
        var mainSo = nlapiGetRecordId();
        var soNums = context.getSessionObject("so_num");
        if(!!soNums) {
            soNums = soNums.split(",");
            soNums.forEach(function(so) {
                nlapiSubmitField("salesorder", so, "memo", "web_" + mainSo);
            });
            //Remove session object after using
            context.setSessionObject("so_num", "");
        }
    }

    nlapiLogExecution('DEBUG', 'in so split after submit. type', type);
    if(type == 'create'){
        if(context.getExecutionContext() == 'userinterface'){
            setIds(nlapiGetRecordId() + getIds());
            nlapiLogExecution('DEBUG', 'All SO IDs', getIds());
        }

        try{
            workOrderDataTransition(nlapiGetRecordId());
        }catch(exception){
            nlapiLogExecution('ERROR', 'Data Transition - SO Split',exception.message);
        }
    }
}

function csvThrowError(){
    var err = nlapiCreateError('E666', 'Sales orders imported successfully via CSV or Webservice. Error thrown by the developer.',true);
    throw err;
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
 Set body field values again, probably resetting due to set of any other field
 This issue occurring after Release 2014.2 update.
 Reference:
 https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/87033621/comments#comment_296089795
 */
function setResetFieldValues(record){
    setAddressRelatedFieldValues(record);
}

/*
 Handle Set functionality of address related fields values, probably previously set values are  resetting due to set of any other field
 This issue occurring after Release 2014.2 update.
 Reference:
 https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/87033621/comments#comment_296089795
 */
function setAddressRelatedFieldValues(record){
    record.setFieldValue('billaddresslist', record.getFieldValue('billaddresslist') || '');
    record.setFieldValue('billaddress', record.getFieldValue('billaddress') || '');
    record.setFieldValue('shipaddresslist', record.getFieldValue('shipaddresslist') || '');
    record.setFieldValue('shipaddress', record.getFieldValue('shipaddress') || '');
}

/*
 Set ship address fields into record field
 */
function setShipAddressFields(record, shipAddress){

    if(!!shipAddress) {

        nlapiLogExecution('DEBUG', 'f3_setShipAddressFields', JSON.stringify(shipAddress));

        record.setFieldValue('shipcountry', shipAddress.shipcountry);
        record.setFieldValue('shipattention', shipAddress.shipattention);
        record.setFieldValue('shipaddressee', shipAddress.shipaddressee);
        record.setFieldValue('shipphone', shipAddress.shipphone);
        record.setFieldValue('shipaddr1', shipAddress.shipaddr1);
        record.setFieldValue('shipaddr2', shipAddress.shipaddr2);
        record.setFieldValue('shipcity', shipAddress.shipcity);
        record.setFieldValue('shipstate', shipAddress.shipstate);
        record.setFieldValue('shipzip', shipAddress.shipzip);
    }
}

/*
 Set custom ship date field for newly created SOs used to sort SO records in PPT
 */
function setCustomShipDate(record, shipDate){
    if(!!shipDate){
        nlapiLogExecution('DEBUG', 'f3_custbody_sortingshipdate', shipDate);
        record.setFieldValue('custbody_sortingshipdate', shipDate);
    }
}