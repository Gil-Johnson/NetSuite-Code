/*
Handles warehouse assignment in Body and line items
 */

var context = nlapiGetContext();
var NilesWarehouse = '1';// Niles

function SO_Warehouse_Assignment_BeforeSubmit(type) {

    try {

        var execContext = context.getExecutionContext();
        if (type == 'create' || type == 'edit') {
            var lineItemsCount = nlapiGetLineItemCount('item');
            if (type == 'create') {
                // This works only in case of webstore
                setLocationValueForWebStore(lineItemsCount);
            }

            nlapiLogExecution('DEBUG', 'LineItem Warehouse Assignment started', '');
            handleLineItemWarehouseAssignment(lineItemsCount);
            nlapiLogExecution('DEBUG', 'LineItem Warehouse Assignment ended', '');

            nlapiLogExecution('DEBUG', 'Body Warehouse Assignment started', '');
            handleBodyWarehouseAssignment(lineItemsCount);
            nlapiLogExecution('DEBUG', 'Body Warehouse Assignment ended', '');
        }


    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'Error_In_SO_Warehouse_Assignment_BeforeSubmit', ex.message);
    }
}


/*
 Hack:
 This function set location of line item of type 'item' explicitly if execution context is web store
 Locations of line items are coming null in case of webstore :-( We dont know why!!!!
 Its a Chepi.
 */
function setLocationValueForWebStore(lineItemsCount) {

    try {
        var execContext = context.getExecutionContext();
        if (execContext != 'webstore') {
            return;
        }

        nlapiLogExecution('DEBUG', 'Its_webstore', 'Setting line item location.');

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

/*
Handles assignment of warehouse field in "Item" lien items.
If found null,  set "Niles" as warehouse.
 */
function handleLineItemWarehouseAssignment(lineItemsCount) {

    if (!!lineItemsCount && lineItemsCount > 0) {

        for (var i = 1; i <= lineItemsCount; i++) {
            var location = nlapiGetLineItemValue('item', 'location', i);
            if (!location || location == '' || location == '0') {
                nlapiSetLineItemValue('item', 'location', i, NilesWarehouse);
            }
        }
    }
}

/*
Overwrites Body warehouse field with ware house field of first line item
 */
function handleBodyWarehouseAssignment(lineItemsCount) {

    if (!!lineItemsCount && lineItemsCount > 0) {
        var location = nlapiGetLineItemValue('item', 'location', 1);
        if (!!location && location != '' && location != '0') {
            nlapiSetFieldValue('location', location);
        }
    }
}