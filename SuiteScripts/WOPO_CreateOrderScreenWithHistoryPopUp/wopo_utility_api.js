/**
 * Created by mazhar on 4/7/2016.
 */
/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       17 April 2014     Ubaid Baig
 *
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
        ScriptId: {
            WopoScheduledScriptId: "customscript_wopo_sch",
            WopoScheduledScriptDeploymentId: "customdeploy_wopo_sch_dep"
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

/**
 * Searches transaction
 * @param request
 * @returns {{records: Array, savedSearchSwap: Array}}
 */
function searchTransactions(request) {
    var status = request.getParameter("transactionType");
    var productType = request.getParameter("productType");
    var team = request.getParameter("team");
    var league = request.getParameter("league");
    var custitem_custom = request.getParameter("custitem_custom");
    var custitem_discontinued = request.getParameter("custitem_discontinued");
    var selectedCustomer = request.getParameter("customer");
    var last_tran_id = request.getParameter("last_tran_id");
    var page_size = request.getParameter("page_size");
    var warehouse = request.getParameter("warehouse");
    var custitem_overcommitted = request.getParameter("custitem_overcommitted");

    if (!page_size || page_size.length <= 0) {
        page_size = 1000;
    }
    else {
        page_size = parseInt(page_size);

        if (page_size > 1000) {
            page_size = 1000;
        }
    }

    var start_index = request.getParameter("start_index");

    if (!start_index || start_index.length <= 0) {
        start_index = 1;
    }
    else {
        start_index = parseInt(start_index);
    }

    var filtersValues = {
        transactionType: !!status && status.length > 0 ? status : "0",
        productType: !!productType && productType !== 'null' && productType.length > 0 ? productType : null,
        team: !!team && team !== 'null' && team.length > 0 ? team : null,
        league: !!league && league !== 'null' && league.length > 0 ? league : null,
        warehouse: !!warehouse && warehouse !== 'null' && warehouse.length > 0 ? warehouse : null,
        custitem_custom: !!custitem_custom && custitem_custom.length > 0 ? custitem_custom : null,
        custitem_discontinued: !!custitem_discontinued && custitem_discontinued.length > 0 ? custitem_discontinued : null,
        custitem_overcommitted: !!custitem_overcommitted && custitem_overcommitted.length > 0 ? custitem_overcommitted : null,
        last_tran_id: !!last_tran_id && last_tran_id.length > 0 ? last_tran_id : null,
        selectedCustomer: !!selectedCustomer && selectedCustomer.length > 0 ? selectedCustomer : null
    };

    var filterExpression = createTransactionFilterExpression(filtersValues);
    var columns = setupTransactionColumns();

    var records = [], lastRecord = null;
    var countCol = setupTransactionColumnsForCount();

    var countRecord = nlapiSearchRecord('item', null, filterExpression, countCol);
    var totalRecords = countRecord[0].getValue('internalid', null, 'count');

    var savedsearch = nlapiCreateSearch('item', filterExpression, columns);
    var resultset = savedsearch.runSearch();

    lastRecord = resultset.getResults((start_index - 1) * page_size, start_index * page_size);


    nlapiLogExecution('DEBUG', 'lastRecord.forEach started', new Date());
    if (!!lastRecord) {
        lastRecord.forEach(function (searchRecord) {
            records.push({
                "internalid": searchRecord.getId(),
                "displayname": searchRecord.getText("displayname"),
                "itemid": searchRecord.getValue("itemid"),
                "custitem_workordercomments": searchRecord.getText("custitem_workordercomments"),
                "salesdescription": searchRecord.getValue("salesdescription"),
                "custitem1": searchRecord.getText("custitem1"),
                "custitem2": searchRecord.getText("custitem2"),
                "baseprice": searchRecord.getValue("baseprice"),
                "reorderpoint": searchRecord.getValue("reorderpoint"),
                "quantityonhand": searchRecord.getValue("quantityonhand"),
                "quantityavailable": searchRecord.getValue("quantityavailable"),
                "quantitybackordered": searchRecord.getValue("quantitybackordered"),
                "quantityonorder": searchRecord.getValue("quantityonorder"),
                "safetystocklevel": searchRecord.getValue("safetystocklevel"),
                "quantitycommitted": searchRecord.getValue("quantitycommitted"),
                "preferredstocklevel": searchRecord.getValue("preferredstocklevel"),
                "custitem_image1": searchRecord.getValue("custitem_image1"),
                "custitem_thumbnail1": searchRecord.getValue("custitem_thumbnail1"),
                "custitemthumbnail_image": searchRecord.getValue("custitemthumbnail_image"),
                "custitemitem_display_image2": searchRecord.getValue("custitemitem_display_image2"),
                "custitemitem_display_image3": searchRecord.getValue("custitemitem_display_image3"),
                "custitemitem_display_image4": searchRecord.getValue("custitemitem_display_image4"),
                "type": searchRecord.getValue("type"),
                "product_type": searchRecord.getText("custitem_prodtype"),
                "league_name": searchRecord.getText('custitem1')
                //"product_type2": searchRecord.getValue("name", 'custbody_woproducttype')
            });
        });
    }
    //nlapiLogExecution('DEBUG', 'lastRecord.forEach ended', new Date());
    return {records: records, count: totalRecords, pageNum: start_index};
}

/**
 *
 * @param arrItem
 * @returns {Array}
 */
function createFilter(arrItem) {

    var filter = [];
    for (key in arrItem) {
        filter [filter.length] = (['number', 'equalto', arrItem[key]]);
        filter [filter.length] = 'or';
    }
    filter.splice(filter.length - 1, 1);
    return filter;

}

/**
 * Setup filter expression for search.
 * @param filtersValues
 * @returns {Array}
 */
function createTransactionFilterExpression(filtersValues) {

    var filterExpression = [];

    if (filtersValues.transactionType === "0") {
        filterExpression.push(['type', 'anyof', 'Assembly']);
    }
    else {
        filterExpression.push(['type', 'anyof', ['Assembly', 'InvtPart']]);
    }

    //isinactive filter
    if (filterExpression.length > 0) {
        filterExpression.push('and');
    }
    filterExpression.push(["isinactive", 'is', "F"]);


    // New filters will come here
    if (!!filtersValues.league) {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        var itemArray = [WOPO_API_Constants.Netsuite.ItemField.League1, 'anyof'];
        var leagueValues = filtersValues.league.split(',');

        itemArray = itemArray.concat(leagueValues);

        filterExpression.push(itemArray);
    }

    if (!!filtersValues.productType) {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        var itemArray = [WOPO_API_Constants.Netsuite.ItemField.ProductType1, 'anyof'];
        var leagueValues = filtersValues.productType.split(',');

        itemArray = itemArray.concat(leagueValues);

        filterExpression.push(itemArray);
    }

    if (!!filtersValues.team) {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        var itemArray = [WOPO_API_Constants.Netsuite.ItemField.Team1, 'anyof'];
        var leagueValues = filtersValues.team.split(',');

        itemArray = itemArray.concat(leagueValues);

        filterExpression.push(itemArray);
    }

    if (!!filtersValues.warehouse) {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        filterExpression.push([WOPO_API_Constants.Netsuite.ItemField.Location, 'is', filtersValues.warehouse]);
    }


    if (!!filtersValues.custitem_custom && filtersValues.custitem_custom !== '-1') {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        filterExpression.push([WOPO_API_Constants.Netsuite.ItemField.Custom, 'is', filtersValues.custitem_custom]);
    }

    if (!!filtersValues.custitem_discontinued && filtersValues.custitem_discontinued !== '-1') {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        filterExpression.push([WOPO_API_Constants.Netsuite.ItemField.Discontinued, 'is', filtersValues.custitem_discontinued]);
    }

    if (!!filtersValues.custitem_overcommitted && filtersValues.custitem_overcommitted !== '-1') {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        if (filtersValues.custitem_overcommitted === 'T') {
            //filterExpression.push(['formulanumeric: TO_NUMBER({quantityonhand})-TO_NUMBER({quantitycommitted})-TO_NUMBER({quantitybackordered})+TO_NUMBER({quantityonorder})', 'lessthan', '0']);
            filterExpression.push(['formulanumeric: nvl({quantityonhand},0)-nvl({quantitycommitted},0)-nvl({quantitybackordered},0)+nvl({quantityonorder},0)', 'lessthan', '0']);
        }
        else if (filtersValues.custitem_overcommitted === 'F') {
            //filterExpression.push(['formulanumeric: TO_NUMBER({quantityonhand})-TO_NUMBER({quantitycommitted})-TO_NUMBER({quantitybackordered})+TO_NUMBER({quantityonorder})', 'greaterthanorequalto', '0']);
            filterExpression.push(['formulanumeric: nvl({quantityonhand},0)-nvl({quantitycommitted},0)-nvl({quantitybackordered},0)+nvl({quantityonorder},0)', 'greaterthanorequalto', '0']);
        }
    }

    if (!!filtersValues.last_tran_id) {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        filterExpression.push(['internalidnumber', 'greaterthan', filtersValues.last_tran_id]);
    }

    if (!!filtersValues.selectedCustomer) {
        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        var itemArray = [WOPO_API_Constants.Netsuite.ItemField.CustomCustomer, 'anyof'];

        var customerValues = filtersValues.selectedCustomer.split(',');

        itemArray = itemArray.concat(customerValues);

        filterExpression.push(itemArray);
    }

    return filterExpression;
}

function setupTransactionColumnsForCount() {
    var columns = new Array();

    var col = new nlobjSearchColumn('internalid', null, 'count');

    col.setSort();

    columns[columns.length] = col;

    return columns;
}

/**
 * Setup column for search result
 * @returns {Array}
 */
function setupTransactionColumns() {
    var columns = new Array();
    columns[columns.length] = (new nlobjSearchColumn('internalid'));//.setSort();
    columns[columns.length] = new nlobjSearchColumn('itemid');

    columns[columns.length] = new nlobjSearchColumn('custitem_workordercomments');
    columns[columns.length] = new nlobjSearchColumn('salesdescription');
    columns[columns.length] = new nlobjSearchColumn('baseprice');

    // apply sorting on following four columns in order as specified.
    columns[columns.length] = new nlobjSearchColumn('custitem_prodtype').setSort(); // product type column
    columns[columns.length] = new nlobjSearchColumn('custitem1').setSort(); // league column
    columns[columns.length] = new nlobjSearchColumn('custitem2').setSort(); // team column
    columns[columns.length] = new nlobjSearchColumn('displayname').setSort(); // item name


    columns[columns.length] = new nlobjSearchColumn('quantityonhand');
    columns[columns.length] = new nlobjSearchColumn('quantityavailable');
    columns[columns.length] = new nlobjSearchColumn('quantitybackordered');
    columns[columns.length] = new nlobjSearchColumn('quantityonorder');
    columns[columns.length] = new nlobjSearchColumn('quantitycommitted');

    columns[columns.length] = new nlobjSearchColumn('reorderpoint');

    columns[columns.length] = new nlobjSearchColumn('preferredstocklevel');

    columns[columns.length] = new nlobjSearchColumn('custitem_image1');
    columns[columns.length] = new nlobjSearchColumn('custitem_thumbnail1');
    columns[columns.length] = new nlobjSearchColumn('custitemthumbnail_image');

    columns[columns.length] = new nlobjSearchColumn('custitemitem_display_image2');
    columns[columns.length] = new nlobjSearchColumn('custitemitem_display_image3');
    columns[columns.length] = new nlobjSearchColumn('custitemitem_display_image4');

    columns[columns.length] = new nlobjSearchColumn('type');


    //columns[columns.length] = new nlobjSearchColumn('name', 'CUSTBODY_WOPRODUCTTYPE');


    return columns;
}

/**
 * Processes items
 * @param request
 * @returns {{}}
 */
function processItems(request) {

    var result = {
        idDetailArray: []
    };
    var idArray = [];
    var formDataString = request.getParameter('formData');
    var itemsString = request.getParameter('items');
    var formData = JSON.parse(formDataString);
    var items = JSON.parse(itemsString);
    var itemLen = items.length;

    //save the type for future use
    result.type = formData.type;

    //if vendor is passed, this is a purchase order
    if (formData.vendor != null) {
        //this is purchase order

        var record = nlapiCreateRecord(WOPO_API_Constants.RecordType[formData.type], {recordmode: 'dynamic'});

        record.setFieldValue('entity', formData.vendor);

        //record.setFieldValue('duedate', formData.selectedFromDate);

        record.setFieldValue('location', formData.warehouse);

        for (var i = 0; i < itemLen; i++) {

            record.selectNewLineItem('item');
            record.setCurrentLineItemValue('item', 'quantity', items[i].quantity);
            record.setCurrentLineItemValue('item', 'item', items[i].internalid);
            record.setCurrentLineItemValue('item', 'location', formData.warehouse);

            //Vendor is not null, then its purchase order
            if (formData.vendor != null) {

                record.setCurrentLineItemValue('item', 'expectedreceiptdate', items[i].orderdate); // formData.selectedToDate);

                //it means this is a purchase order
                //record.setCurrentLineItemValue('item', 'customer', formData.customer);
            }

            //commit changes to the Items sublist to the parent record
            record.commitLineItem('item');
        }
        var id = nlapiSubmitRecord(record);
        idArray.push(id);


        if (!!idArray && idArray.length > 0) {
            //Fetch PO# / WO# instead of just internal IDs
            var OrdDetail = nlapiSearchRecord(formData.vendor != null ? "purchaseorder" : "workorder", null,
                [new nlobjSearchFilter("internalid", null, "anyof", idArray), new nlobjSearchFilter("mainline", null, "is", "T")],
                new nlobjSearchColumn("tranid"));

            if (!!OrdDetail) {
                OrdDetail.forEach(function (detail) {
                    result.idDetailArray.push({id: detail.getId(), text: detail.getValue("tranid")});
                });
            }
        }
    }
    else {
        //this is work order

        saveItemsDataInWopoCustomRecord(!!formData.vendor ? formData.vendor : '',
            formData.type,
            formData.warehouse,
            itemsString);

        //Start wopo scheduled script to create work orders
        var status = nlapiScheduleScript(WOPO_API_Constants.Netsuite.ScriptId.WopoScheduledScriptId, WOPO_API_Constants.Netsuite.ScriptId.WopoScheduledScriptDeploymentId);
        nlapiLogExecution('DEBUG', 'WOPO_Scheduled_Script', 'Scheduled script status: ' + status);
    }

    //return the id of newly created record
    return result;
}

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suite_api(request, response) {
    var outResponse = {};
    try {

        outResponse.Result = WOPO_API_Constants.Response.Result.Ok;
        outResponse.Version = WOPO_API_Constants.Response.api_version;
        var method = request.getParameter("method");

        if (method === 'searchTransactions') {
            var __ret = searchTransactions(request);

            outResponse["TotalRecordCount"] = __ret.count;
            outResponse["Records"] = __ret.records;
        }
        else if (method == 'getTeamsByLeagueIds') {
            var leagueIds = JSON.parse(request.getParameter("leagueIds"));
            outResponse["teams"] = "[]";

            //Check if we have required params
            if (!!leagueIds && leagueIds.length > 0) {
                var teams = nlapiSearchRecord(null, WOPO_API_Constants.Netsuite.SavedSearch.CustomTeamSearch,
                    new nlobjSearchFilter(WOPO_API_Constants.Netsuite.ItemField.League1, null, 'anyof', leagueIds), new nlobjSearchColumn(WOPO_API_Constants.Netsuite.ItemField.Team1, null, 'group'));

                var teamRecords = [];
                if (!!teams) {
                    teams.forEach(function (team) {
                        teamRecords[teamRecords.length] = {
                            value: team.getValue(WOPO_API_Constants.Netsuite.ItemField.Team1, null, 'group'),
                            name: team.getText(WOPO_API_Constants.Netsuite.ItemField.Team1, null, 'group')
                        };
                    });
                }
                outResponse["teams"] = JSON.stringify(teamRecords);
            }
        }
        else if (method == 'processItems') {
            outResponse["data"] = processItems(request);
        }
    }
    catch (e) {
        outResponse["Result"] = WOPO_API_Constants.Response.Result.Error;
        outResponse["Message"] = e.name + ", " + e.message;
        nlapiLogExecution('ERROR', 'error in suite api = ' + e.message, e.stack);
    }
    response.write(JSON.stringify(outResponse));
}

/*
 Save Items data list in Wopo Custom record used by scheduled script to create Wo/PO
 */
function saveItemsDataInWopoCustomRecord(vender, entityType, location, itemsList) {

    var rec = nlapiCreateRecord(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CustomRecordInternalId);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.VendorField, vender);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.TypeField, entityType);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.LocationField, location);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.ItemsDataField, itemsList);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.StatusField,
        WOPO_API_Constants.Netsuite.WopoDataCustomRecord.StatusFieldValues.Pending);
    rec.setFieldValue(WOPO_API_Constants.Netsuite.WopoDataCustomRecord.CreatedWopoIdsField, '');

    var ctxt = nlapiGetContext();
    var email;
    try {
        email = nlapiLookupField('employee', ctxt.getUser(), 'email');
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error in getting email', e.toString());
    }
    rec.setFieldValue('custrecord_email', email);
    nlapiSubmitRecord(rec);
}
