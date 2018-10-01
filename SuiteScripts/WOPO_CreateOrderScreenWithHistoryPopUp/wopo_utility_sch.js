/**
 * Created by mazhar on 4/7/2016.
 */
/**
 * Created by Ansari on 10/15/14.
 * Scheduled Script to Create Work Orders for submitted items records
 * (Previously WO creation happening in wopo_utility_api.js API just like PO, but for more records , Execution limit of
 * scuitelet script was exceeding in case of WO, Thats why we moved work order creation in scheduled script)
 */

var WOPO_API_Constants = WOPO_API_Constants || {};

WOPO_API_Constants = {
    Netsuite: {
        SavedSearch: {
            CustomTeamSearch: "customsearch1264",
            SearchTransaction: {
                "0": "assemblyitem",
                "1": "assemblyitem"
            }
        },
        ItemField: {
            internalId: "internalid",
            Customer: "entity",
            Vendor: "vendor",
            Location: "location",
            MainLine: "mainline",
            TransactionType: "type",
            TranId: "number",

            League: "customrecord5",
            Team: "customrecord4",
            ProductType: "customrecord_producttypes",
            Custom: "custitem_custom",
            CustomCustomer: "custitem_customer",
            Discontinued: "custitem_discontinued",

            League1: "custitem1",
            ProductType1: "custitem_prodtype",
            Team1: "custitem2"
        },
        WopoDataCustomRecord: {
            CustomRecordInternalId: "customrecord_wopo_data",
            VendorField: "custrecord_wopo_vender",
            TypeField: "custrecord_wopo_type",
            LocationField: "custrecord_wopo_location",
            ItemsDataField: "custrecord_wopo_itemsdata",
            StatusField: "custrecord_wopo_status",
            CreatedWopoIdsField: "custrecord_wopo_created_wopo_ids",
            StatusFieldValues: {
                Pending: "Pending",
                Completed: "Completed"
            }
        },
        ApiUrls: {
            workorder: "https://system.netsuite.com/app/accounting/transactions/workord.nl?id="
        }
    },
    Tracking: {
        Url: 'https://onlinetools.ups.com/webservices/Track'
    },
    Response: {
        api_version: "1.04",
        Result: {
            Ok: "OK",
            Error: "ERROR"
        }
    },
    RecordType: {
        "0": "workorder",
        "1": "purchaseorder"
    }
};

function scheduled(type) {

    try {

        var ctxt = nlapiGetContext();

        var recs = getWopoDataRecords(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.StatusFieldValues.Pending);
        if (!!recs && recs.length > 0) {

            //var cancelList = ctxt.getSetting('SCRIPT', 'custscript_cancellist');
           // nlapiLogExecution('DEBUG', 'Record Length', 'Record length is ' + recs.length);

            for (var i = 0; i < recs.length; i++) {

                //nlapiLogExecution('DEBUG', 'Record', 'Record number is ' + i);

                var itemLen = recs[i].itemsList.length;
                var idArray = [];

                //this is work order
               // nlapiLogExecution('DEBUG', 'Record', 'While Loop Start ' + i);
                while (recs[i].itemsList.length > 0) {

                    var j = 0;

                    var record = nlapiCreateRecord(WOPO_API_Constants.RecordType[recs[i].type], {recordmode: 'dynamic'});

                    record.setFieldValue('enddate', recs[i].itemsList[j].orderdate);
                    record.setFieldValue('assemblyitem', recs[i].itemsList[j].internalid);
                    record.setFieldValue('quantity', recs[i].itemsList[j].quantity);
                    record.setFieldValue('custbody_wocomments', recs[i].itemsList[j].comments);
                    record.setFieldValue('location', recs[i].location);

                    //commit parent record
                    var id = nlapiSubmitRecord(record);
                    //append newly created work order id in Ids list
                    recs[i].wopoIdsList.push(id);
                    // remove top item from items list
                    recs[i].itemsList.splice(0, 1);

                    if (ctxt.getRemainingUsage() < 1000) {

                        // update wopo records back to custom record
                        updateWopoDataList(recs);

                        var status = nlapiScheduleScript(ctxt.getScriptId(), ctxt.getDeploymentId());
                        nlapiLogExecution('DEBUG', 'WOPO_Scheduled_Script', 'Script rescheduled with status: ' + status);
                        return;
                    }
                }
               // nlapiLogExecution('DEBUG', 'Record', 'While Loop End ' + i);
                manageExecutionCompletion(recs[i]);

            }
        }

        nlapiLogExecution('DEBUG', 'WOPO_Scheduled_Script_Status', 'All Executions Completed.');

    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Error in WOPO scheduled script', ex.toString());
    }
}

/*
 manage wopo record ompletion by sending email and deleting wopo record
 */
function manageExecutionCompletion(rec) {

    deleteWopoDataRecord(rec);
    sendEmailOfExecutionCompletion(rec);
}

/*
 Update wopo data list back to custom record
 */
function updateWopoDataList(recs) {
    try {
        for (var i = 0; i < recs.length; i++) {
            updateWopoDataRecord(recs[i]);
        }
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in updateWopoDataList(recs) method', ex.toString());
        throw ex;
    }
}

/*
 Update wopo data record
 */
function updateWopoDataRecord(rec) {

    var rec = nlapiLoadRecord(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CustomRecordInternalId, rec.internalId);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.ItemsDataField, rec.itemsList);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CreatedWopoIdsField, rec.wopoIdsList);
    nlapiSubmitRecord(rec);
}

/*
 Delete wopo data record
 */
function deleteWopoDataRecord(rec) {

    try {
        nlapiDeleteRecord(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CustomRecordInternalId, rec.internalId);
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in deleteWopoDataRecord(rec) method', ex.toString());
        throw ex;
    }
}

/*
 Get WOPO data submitted records for creating Work Orders
 */
function getWopoDataRecords(status) {
    try {
        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.StatusField, '', 'is', status));

        var col = new nlobjSearchColumn('internalid');
        col.setSort(true);
        columns.push(col);
        columns.push(new nlobjSearchColumn(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.VendorField));
        columns.push(new nlobjSearchColumn(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.TypeField));
        columns.push(new nlobjSearchColumn(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.LocationField));
        columns.push(new nlobjSearchColumn(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.ItemsDataField));
        columns.push(new nlobjSearchColumn(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CreatedWopoIdsField));
        columns.push(new nlobjSearchColumn("custrecord_email"));

        var recs = nlapiSearchRecord(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CustomRecordInternalId, null, filters, columns);
        //nlapiLogExecution('AUDIT', 'Recs in getWopoData', JSON.stringify(recs));
        return parseWopoDataRecordsIntoJson(recs);
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in getWopoDataRecords(status) method', ex.toString());
        throw ex;
    }
}

/*
 Parsed Wopo Data nlapiSearchRecord results into json object
 */
function parseWopoDataRecordsIntoJson(recs) {

    var jsonRecs = [];

    if (!!recs && recs.length > 0) {

        //var cancelList = ctxt.getSetting('SCRIPT', 'custscript_cancellist');

        for (var i = 0; i < recs.length; i++) {

            var jsonRec = {};
            jsonRec.internalId = recs[i].getValue('internalid');
            jsonRec.vendor = recs[i].getValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.VendorField);
            jsonRec.type = recs[i].getValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.TypeField);
            jsonRec.location = recs[i].getValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.LocationField);
            var itemsList = recs[i].getValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.ItemsDataField);
            jsonRec.itemsList = !!itemsList ? JSON.parse(itemsList) : [];
            var wopoIdsList = recs[i].getValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CreatedWopoIdsField);
            jsonRec.wopoIdsList = !!wopoIdsList ? JSON.parse(wopoIdsList) : [];
            jsonRec.userEmail = recs[i].getValue('custrecord_email');

            jsonRecs.push(jsonRec);
        }
    }

    return jsonRecs;

}

/*
 Get work orders of all provided ids
 */
function getWorkOrders(idArray) {
    try {
        var filters = [];
        var columns = [];

        filters.push(new nlobjSearchFilter("internalid", null, "anyof", idArray));
        filters.push(new nlobjSearchFilter("mainline", null, "is", "T"));

        var col = new nlobjSearchColumn('internalid');
        col.setSort(true);
        columns.push(col);
        columns.push(new nlobjSearchColumn("tranid"));
        columns.push(new nlobjSearchColumn("item"));
        columns.push(new nlobjSearchColumn("quantity"));

        var recs = nlapiSearchRecord("workorder", null, filters, columns);

        return parseWorkOrderRecordsIntoJson(recs);
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in getWorkOrders(idArray) method', ex.toString());
        throw ex;
    }
}

/*
 Parsed work orders data nlapiSearchRecord results into json object
 */
function parseWorkOrderRecordsIntoJson(recs) {

    var jsonRecs = [];

    if (!!recs && recs.length > 0) {

        for (var i = 0; i < recs.length; i++) {

            var jsonRec = {};
            jsonRec.internalId = recs[i].getValue('internalid');
            jsonRec.tranid = recs[i].getValue("tranid");
            jsonRec.assemblyitem = recs[i].getText("item");
            jsonRec.quantity = recs[i].getValue("quantity");

            jsonRecs.push(jsonRec);
        }
    }

    return jsonRecs;
}

/*
 Send email about completion of current WOPO creation job of submitted items
 */
function sendEmailOfExecutionCompletion(rec) {
    try {
        var ctxt = nlapiGetContext();
        var workorders = getWorkOrders(rec.wopoIdsList);

        var emailSubject = "Work Orders Created (" + getDateTime() + ")";
        var emailBody = getEmailBody(workorders);
        var authorId = 5; // Here 5 is id of jay's customer

        //nlapiLogExecution('DEBUG','rec',JSON.stringify(rec));
        nlapiLogExecution('DEBUG', 'emailSubject', emailSubject);
        nlapiLogExecution('DEBUG', 'emailBody', emailBody);
        nlapiLogExecution('DEBUG', 'RecipientEmail', rec.userEmail);

        //var email;
        //try{
        //    email = nlapiLookupField('employee', ctxt.getUser(), 'email');
        //}catch(e){
        //    nlapiLogExecution('ERROR', 'Error in getting email', e.toString());
        //}
        nlapiSendEmail(authorId, rec.userEmail, emailSubject, emailBody);

        //nlapiLogExecution('DEBUG', 'Email Sent', 'Sent');
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in sendEmailOfExecutionCompletion(rec) method', ex.toString());
        //throw ex;
    }
}

/*
 Create body of email to be sent after wopo creation job completion
 */
function getEmailBody(workorders) {

    var workOrderUrl = WOPO_API_Constants.Netsuite.ApiUrls.workorder;
    var body = '';

    body += '<table border="1">';
    body += '<tr>';
    body += '   <td>';
    body += '       <b>Work Order Number</b>';
    body += '   </td>';
    body += '   <td>';
    body += '       <b>Item</b>';
    body += '   </td>';
    body += '   <td>';
    body += '       <b>Quantity</b>';
    body += '   </td>';
    body += '</tr>';

    for (var i = 0; i < workorders.length; i++) {
        body += '<tr>';
        body += '   <td>';

        body += '       <a href="' + workOrderUrl + workorders[i].internalId + '" target="_blank">';
        body += workorders[i].tranid;
        body += '       </a>';

        body += '   </td>';
        body += '   <td>';
        body += workorders[i].assemblyitem;
        body += '   </td>';
        body += '   <td>';
        body += workorders[i].quantity;
        body += '   </td>';
        body += '</tr>';
    }

    body += '</table>';

    return body;
}

/*
 Provide current datetime
 */
function getDateTime() {
    try {
        var dt = new Date();
        var date = dt.getDate();
        var month = dt.getMonth() + 1;
        var year = dt.getFullYear();
        var hrs = dt.getHours();
        var min = dt.getMinutes();
        var sec = dt.getSeconds();
        var datestring = month + '/' + date + '/' + year + ' ' + hrs + ':' + min + ':' + sec;
        return new Date(datestring);
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'error in func getDateTime', ex.toString());
    }
}