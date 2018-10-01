/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       01 Jul 2014     hakhtar
 *
 */


var Constants = {
    ExcelApiUrl: "http://support.sparowatch.com/EmailNewImageReport/api.php",
    ExcelFileName: "New_Images_Report.xlsx",
    SavedSearch: {
        NewImageReportItems: "customsearch1601" //customsearch1521
    },
    File: {
        EmailTemplate: 366216,//329615
        EmailRowTemplate: 366416//329616
    },
    CustomLists: {
        EmailReportContacts: "customlist_email_report_cnts"
    },
    Config: {
        IncludeInactiveEmail: false
    },
    FormatString: {
        TableContents: "<!--Table Contents-->",
        TableDetails: {
            Column1: "<!--col-01-->",
            Column2: "<!--col-02-->",
            Column3: "<!--col-03-->",
            Column4: "<!--col-04-->",
            Column5: "<!--col-05-->",
            Column6: "<!--col-06-->"
        }
    },
    SearchColumn: {
        Item: "itemid",
        Upc: "upccode",
        Substitute: "custitem_substitute",
        ImageFrom: "custitemthumbnail_image",
        GetImage: "custitem_highresimage",
        ProductType: "custitem_prodtype",
        RecordType: "type"
    }
};

var substituteIds = {};
var context = null;

/**
 * Main method called by schedule script
 * @param type
 */
function schedule_script(type){
	try {
        nlapiLogExecution("AUDIT", "Schedule script started");
        context = nlapiGetContext();

        //Check if its rescheduled
        var itemsToUpdate = context.getSetting("SCRIPT", "custscript_item_ids_update");
        if(!!itemsToUpdate) {
            nlapiLogExecution("AUDIT", "We got some items to update", "Type = " + typeof itemsToUpdate + ", length = " + itemsToUpdate.length);
            substituteIds = JSON.parse(itemsToUpdate);
            updateItems();
        }
        else {
            nlapiLogExecution("AUDIT", "Parameter is empty");
            var recipientEmails = getEmailIds();
            //Check if we got recipients
            if(!!recipientEmails) {
                var data = getData();
                nlapiLogExecution("AUDIT", "Got data done");

                //Check if we have some data rows, then process it further
                if(!!data.EmailBody && data.EmailBody.length > 0) {
                    var today = new Date();
                    var subject = "{0} - New Rico Images".replace("{0}", today.toDateString());
                    var headers = [];
                    headers['Content-Type'] = "application/x-www-form-urlencoded; charset=UTF-8";

                    var objResponse = nlapiRequestURL(Constants.ExcelApiUrl, data.PostData, headers);

                    nlapiLogExecution("AUDIT", "Request URL Done");

                    if(!!objResponse) {
                        var content = objResponse.getBody();
                        nlapiLogExecution("AUDIT", "Got request body");
                        if(!!content) {
                            var attachments = nlapiCreateFile(Constants.ExcelFileName, "EXCEL", content);

                            /*for(var i=0; i<recipientEmails.length; i++) {
                             nlapiLogExecution("DEBUG", "Sending email to", recipientEmails[i]);
                             try {
                             nlapiSendEmail(14767, 14767, subject, getEmailBody(data.EmailBody), null, recipientEmails[i], null, attachments);
                             nlapiLogExecution("DEBUG", "Email sent to", recipientEmails[i]);
                             }
                             catch (e) {
                             nlapiLogExecution("ERROR", e.name, "Invalid email = " + recipientEmails[i]);
                             }
                             }*/

                            nlapiSendEmail(212, 212, subject, getEmailBody(data.EmailBody), null, recipientEmails, null, attachments);
                            nlapiLogExecution("AUDIT", "Email sent");
                            updateItems();
                        }
                    }
                }
            }
        }
    }
    catch(e) {
        nlapiLogExecution("ERROR", e.name, e.message);
    }
}

function getEmailBody(rowsData) {
    var emailTemplate = nlapiLoadFile(Constants.File.EmailTemplate).getValue();
    var emailRowTemplate = nlapiLoadFile(Constants.File.EmailRowTemplate).getValue();
    var rowContent = "";
    rowsData.forEach(function(row) {
        rowContent += emailRowTemplate
            .replace(Constants.FormatString.TableDetails.Column1, row.OldItem)
            .replace(Constants.FormatString.TableDetails.Column2, row.OldUpc)
            .replace(Constants.FormatString.TableDetails.Column3, row.NewItem)
            .replace(Constants.FormatString.TableDetails.Column4, row.NewUpc)
            .replace(Constants.FormatString.TableDetails.Column5, row.ImageFrom)
            .replace(Constants.FormatString.TableDetails.Column6, row.GetImage);
    });

    return emailTemplate.replace(Constants.FormatString.TableContents, rowContent);
}

/**
 * Get all Email IDs in custom list
 * @returns {string} Email IDs (comma separated)
 */
function getEmailIds() {
    var emailContactsList = nlapiSearchRecord(Constants.CustomLists.EmailReportContacts, null, null,
        [new nlobjSearchColumn('name'), new nlobjSearchColumn('isinactive')]);

    var emailIds = [];
    if (!!emailContactsList) {
        for (var i = 0; i < emailContactsList.length; i++) {
            //If IncludeInactiveEmail is true then include all, else just include the active emails
            if (!!Constants.Config.IncludeInactiveEmail || (emailContactsList[i].getValue('isinactive') == "F")) {
                emailIds.push(emailContactsList[i].getValue('name'));
            }
        }
    }

    nlapiLogExecution("AUDIT", "Email IDs fetched", "Count = " + emailIds.length);

    return emailIds;
}

function updateItems() {
    var substituteId = null;
    try {

        //Collecting data for displaying % completion of schedule script
        var totalRecords = 0;
        for(var itemType in substituteIds) {
            totalRecords += substituteIds[itemType].length;
        }
        nlapiLogExecution("AUDIT", "Going to update " + totalRecords + " items");
        var percentPerLoop = parseFloat(100/totalRecords), percentDone = 0;


        for(var itemType in substituteIds) {
            nlapiLogExecution("AUDIT", "Updating " + itemType, "Items count = " + substituteIds[itemType].length);
            while (!!substituteIds[itemType] && substituteIds[itemType].length > 0 && context.getRemainingUsage() > 100) {
                substituteId = substituteIds[itemType].pop();
                if(!!substituteId) {
                    nlapiLogExecution("DEBUG", "Updating item", "Item type = " + itemType + ", id = " + substituteId);

                    //Mark as done
                    nlapiSubmitField(itemType, substituteId, "custitem_newimagereport", "T");

                    //Update percentage completion of schedule script
                    context.setPercentComplete(percentDone.toFixed(3));
                    percentDone += percentPerLoop;
                }
            }
        }
        //Check if all items are updated
        var isDone = checkItemsProcessed();
        nlapiLogExecution("AUDIT", "item processed isDone = " + (isDone ? "YES" : "NO"));
        //If isDone is false, this means that the usage limit is exhausted and we need to reschedule the script
        if(!isDone) {
            nlapiLogExecution("AUDIT", "Rescheduling the script", "Remaining usage limit = " + context.getRemainingUsage());
            var statusQueue = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(),
                {custscript_item_ids_update : JSON.stringify(substituteIds)});
            nlapiLogExecution("AUDIT", "Reschedule status = " + statusQueue);
        }
    }
    catch (e) {
        nlapiLogExecution("ERROR", e.name, e.message);
        nlapiLogExecution("AUDIT", "IDs not processed", JSON.stringify(substituteIds));
    }
}

function checkItemsProcessed() {
    for(var itemType in substituteIds) {
        if(!!substituteIds[itemType] && substituteIds[itemType].length > 0)
            return false;
    }
    return true;
}

function getRecordType(typePrefix) {
    switch (typePrefix) {
        case "Assembly":
            return "assemblyitem";
        case "InvtPart":
            return "inventoryitem";
        case "Kit":
            return "kititem";
        case "NonInvtPart":
            return "noninventoryitem";

        default:
            return "item";
    }
}

function getData() {

    var savedSearchResult = [];
    var lastId = 0, lastRecord = null;
    var filter = [new nlobjSearchFilter("custitem_newimagereport", "custitem_substitute", "is", "F")];

    do {
        filter[1] = new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId);
        lastRecord = nlapiSearchRecord(null, Constants.SavedSearch.NewImageReportItems, filter,
            [new nlobjSearchColumn(Constants.SearchColumn.ImageFrom, Constants.SearchColumn.Substitute),
                new nlobjSearchColumn(Constants.SearchColumn.RecordType, Constants.SearchColumn.Substitute)]);

        if(lastRecord != null){
            lastId = lastRecord[lastRecord.length-1].getId();
            savedSearchResult = savedSearchResult.concat(lastRecord);
        }
    }
    while(!!lastRecord && context.getRemainingUsage() > 100);

    nlapiLogExecution("AUDIT", "Saved Search Loaded", "Records found = " + savedSearchResult.length + ", Usage limit remaining = " +
                    context.getRemainingUsage());

    //Sort records by Product Type, then by Old Item #
    savedSearchResult.sort(function(a, b) {
        var prodType1 = a.getText(Constants.SearchColumn.ProductType, Constants.SearchColumn.Substitute).toUpperCase();
        var prodType2 = b.getText(Constants.SearchColumn.ProductType, Constants.SearchColumn.Substitute).toUpperCase();

        var OldItemId1 = (a.getText(Constants.SearchColumn.Item) || a.getValue(Constants.SearchColumn.Item)).toUpperCase();
        var OldItemId2 = (b.getText(Constants.SearchColumn.Item) || b.getValue(Constants.SearchColumn.Item)).toUpperCase();

        if (prodType1 != prodType2) {
            if (prodType1 < prodType2) return -1;
            if (prodType1 > prodType2) return 1;
            return 0;
        }
        if (OldItemId1 < OldItemId2) return -1;
        if (OldItemId1 > OldItemId2) return 1;
        return 0;
    });

    nlapiLogExecution("AUDIT", "Sorting Done");

    var postRows = [], postHeading = {}, emailBody = [];
    if(!!savedSearchResult) {
        for(var i=0; i < savedSearchResult.length; i++) {
            var arrTempItem = [], recordType = null;
            var cols = savedSearchResult[i].getAllColumns();
            cols.forEach(function(c) {
                if(c.getName() != Constants.SearchColumn.ImageFrom)
                    arrTempItem.push(savedSearchResult[i].getText(c) || savedSearchResult[i].getValue(c));
            });

            postRows.push(arrTempItem);
            emailBody.push({
                OldItem: savedSearchResult[i].getText(Constants.SearchColumn.Item) || savedSearchResult[i].getValue(Constants.SearchColumn.Item),
                OldUpc: savedSearchResult[i].getValue(Constants.SearchColumn.Upc),
                NewItem: savedSearchResult[i].getText(Constants.SearchColumn.Substitute) || savedSearchResult[i].getValue(Constants.SearchColumn.Substitute),
                NewUpc: savedSearchResult[i].getValue(Constants.SearchColumn.Upc, Constants.SearchColumn.Substitute),
                ImageFrom: savedSearchResult[i].getValue(Constants.SearchColumn.ImageFrom, Constants.SearchColumn.Substitute),
                GetImage: savedSearchResult[i].getValue(Constants.SearchColumn.GetImage, Constants.SearchColumn.Substitute)
            });

            recordType = getRecordType(savedSearchResult[i].getValue(Constants.SearchColumn.RecordType,
                Constants.SearchColumn.Substitute));

            if(!substituteIds[recordType]) {
                substituteIds[recordType] = [];
            }
            substituteIds[recordType].push(savedSearchResult[i].getValue(Constants.SearchColumn.Substitute));
        }

        var columnName = savedSearchResult[0].getAllColumns();
        columnName.forEach(function(c) {
            if(c.getName() != Constants.SearchColumn.ImageFrom) {
                //Set data type to string for all columns
                postHeading[c.getLabel() || c.getName()] = "string";
            }
        });
    }

    return {PostData: {rows: JSON.stringify(postRows), heading: JSON.stringify(postHeading)},
            EmailBody: emailBody};
}