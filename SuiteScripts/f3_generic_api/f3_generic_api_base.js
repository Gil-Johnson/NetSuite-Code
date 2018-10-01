/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 September 2014     Ubaid Baig
 *
 */

var WsmUtilityApiConstants = WsmUtilityApiConstants || {};

WsmUtilityApiConstants = {
    HttpMethod: {
        GET: 'GET',
        POST: 'POST'
    },
    SearchType: {
        Record: 'record',
        Saved: 'saved'
    },
    Response: {
        ApiVersion: "1.04",
        Result: {
            Ok: "OK",
            Error: "ERROR",
            Unknown: "Unknown"
        }
    },
    Paging: {
        DefaultPageSize: 10,
        DefaultStartIndex: 1
    }
};

function fetchData(request) {
    var context = nlapiGetContext();
    var loc = request.getParameter("location");
    var customer = request.getParameter("customer");
    var queueItems = request.getParameter("queueItems");
    var status = request.getParameter("status");

    var fromDate = request.getParameter("fromDate");
    var toDate = request.getParameter("toDate");

    var data = {};

    data.Rows = [];
    data.Columns = [];
    data.Title = "Google Charts API";
    data.Width = 400;
    data.Height = 500;


    data.Rows = [];

    var searchResult = nlapiSearchRecord(null, WsmUtilityCommon.SavedSearches.MainProductSearch, null, null);
    var colTypes = {};
    colTypes[0] = 'string';
    colTypes[1] = 'number';

    if (!!searchResult) {
        var cols = searchResult[0].getAllColumns();
        for (var i = 0; i < cols.length; i++) {
            var column = cols[i];
            data.Columns.push({type: colTypes[i], value: column.name});
        }

        for (var j = 0; j < 5; j++) {
            var result = searchResult[j];

            var colArray = [];
            for (var c = 0; c < cols.length; c++) {
                var colObject = cols[c];
                if (c === 0) {
                    colArray.push(result.getValue(colObject.name));
                } else {
                    colArray.push(Math.abs(result.getValue(colObject.name)));
                }

            }
            data.Rows.push(colArray);
        }
    }

    return data;
}

function getCategories(request) {
    var context = nlapiGetContext();
    var loc = request.getParameter("location");
    var customer = request.getParameter("customer");
    var queueItems = request.getParameter("queueItems");
    var status = request.getParameter("status");

    var fromDate = request.getParameter("fromDate");
    var toDate = request.getParameter("toDate");

    var data = {};

    data.Rows = [];
    data.Columns = [];
    data.Title = "Google Charts API";
    data.Width = 400;
    data.Height = 500;


    data.Rows = [];

    var searchResult = nlapiSearchRecord(null, WsmUtilityCommon.SavedSearches.MainProductSearch, null, null);
    var colTypes = {};
    colTypes[0] = 'string';
    colTypes[1] = 'number';

    if (!!searchResult) {
        var cols = searchResult[0].getAllColumns();
        for (var i = 0; i < cols.length; i++) {
            var column = cols[i];
            data.Columns.push({type: colTypes[i], value: column.name});
        }

        for (var j = 0; j < 5; j++) {
            var result = searchResult[j];

            var colArray = [];
            for (var c = 0; c < cols.length; c++) {
                var colObject = cols[c];
                if (c === 0) {
                    colArray.push(result.getValue(colObject.name));
                } else {
                    colArray.push(Math.abs(result.getValue(colObject.name)));
                }

            }
            data.Rows.push(colArray);
        }
    }

    return data;
}

function processRequest(request, response) {
    var methodResponse = {};
    var internalReply = {};

    var apiMethod = null;
    var dataIn = null;

    if (!!request.getParameter) {
        apiMethod = request.getParameter("method");
    } else {
        dataIn = request;
        apiMethod = dataIn.apiMethod;
    }


    try {

        if (!dataIn) {
            if (request.getMethod() === 'GET') {
                dataIn= JSON.parse(request.getParameter("dataIn"));
            } else if (request.getMethod() === 'POST') {
                var body = request.getBody();
                nlapiLogExecution('DEBUG', 'value of body', body);
                dataIn = JSON.parse(body);
            }
        }

        nlapiLogExecution('DEBUG', 'value of final dataIn', dataIn);
        if (!!dataIn && !!apiMethod) {
            if (typeof this[apiMethod] === "function") {
                internalReply = this[apiMethod](dataIn);

                methodResponse = {
                    data: internalReply,
                    code: WsmUtilityApiConstants.Response.Result.Ok,
                    errorMessage: "None"
                };
            } else {
                //No relevant function found
                methodResponse = {
                    code: WsmUtilityApiConstants.Response.Result.Error,
                    errorMessage: "Unknown apiMethod called"
                };
            }
        } else {
            //apiMethod not defined
            methodResponse = {
                code: WsmUtilityApiConstants.Response.Result.Error,
                errorMessage: "apiMethod not defined"
            };
        }
    } catch (e) {
        methodResponse = {
            "code": WsmUtilityApiConstants.Response.Result.Error,
            "errorMessage":  e.message + ", stack = " + e.stack
        };
    }

    return {
        "apiVersion": WsmUtilityApiConstants.Response.ApiVersion,
        "code": !!methodResponse.code ? methodResponse.code : WsmUtilityApiConstants.Response.Result.Unknown,
        "errorMessage": methodResponse.errorMessage,
        "data": methodResponse.data
    };
}

/**
 * Get a standard NetSuite record
 * @param dataIn
 * @returns {nlobjRecord}
 */
function getRecord(dataIn) {
    nlapiLogExecution('DEBUG', 'Inside getRecord input = ', !dataIn ? "NULL" : JSON.stringify(dataIn));

    var result = nlapiLoadRecord(dataIn.recordType, dataIn.id); // e.g recordType="customer", id="769"

    //nlapiLogExecution('DEBUG', 'get Record, result =  ', !result ? "NULL" : JSON.stringify(result));

    return result;
}

/**
 * Delete a standard NetSuite record
 * @param dataIn
 * @returns {*}
 */
function deleteRecord(dataIn) {
    nlapiDeleteRecord(dataIn.recordType, dataIn.id); // e.g recordType="customer", id="769"

    dataIn.deleted = true;

    return dataIn;
}

/**
 * Create a standard NetSuite record via POST method
 Request Payload:
 {"recordType":"customer","entityid":"John Doe","companyname":"ABCTools, Inc", "subsidiary":"1","email":jdoe@email.com}
 * @param dataIn
 * @returns {*}
 */
function createRecord(dataIn) {
    var err = {};

    // Validate if mandatory record type is set in the request
    if (!dataIn.recordType) {
        err.status = "failed";
        err.message = "missing recordType";
        return err;
    }

    var record = nlapiCreateRecord(dataIn.recordType);

    for (var fieldName in dataIn) {
        if (dataIn.hasOwnProperty(fieldName)) {
            if (fieldName != 'recordType' && fieldName != 'id') {
                var value = dataIn[fieldName];
                nlapiLogExecution('DEBUG', 'fieldname=' + fieldName, 'value=' + value + ' typeof=' + typeof value);
                if (value && typeof value != 'object') // ignore other type of parameters
                {
                    record.setFieldValue(fieldName, value);
                } else if (fieldName == 'member') {
                    for (var fieldname2 in value) {
                        var value2 = value[fieldname2];
                        nlapiLogExecution('DEBUG', '**fieldname=' + fieldname2, '**value2=' + value2 + ' typeof=' + typeof value2);

                        if (value2 && typeof value2 != 'object') {
                            record.setFieldValue(fieldname2, value2);
                        } else {
                            record.selectNewLineItem(fieldName);

                            for (var fieldname3 in value2) {
                                var value3 = value2[fieldname3];
                                nlapiLogExecution('DEBUG', '@fieldname=' + fieldname3, '**value3=' + value3 + ' typeof=' + typeof value3);

                                if (value3 && typeof value3 != 'object') {
                                    record.setCurrentLineItemValue(fieldName, fieldname3, value3);
                                }
                            }
                            record.commitLineItem(fieldName);
                        }
                    }
                }
            }
        }
    }
    var recordId = nlapiSubmitRecord(record);
    nlapiLogExecution('DEBUG', 'id=' + recordId);

    var nlobj = nlapiLoadRecord(dataIn.recordType, recordId);
    return nlobj;
}

/**
 * Update a standard NetSuite record via POST method
 Request Payload:
 {"recordType":"customer","entityid":"John Doe","companyname":"ABCTools, Inc", "subsidiary":"1","email":jdoe@email.com}
 * @param dataIn
 * @returns {*}
 */
function updateRecord(dataIn) {
    var err = {};

    // Validate if mandatory record type is set in the request
    if (!dataIn.recordType) {
        err.status = "failed";
        err.message = "missing recordType";
        return err;
    }

    var record = nlapiLoadRecord(dataIn.recordType, dataIn.id);

    for (var fieldName in dataIn) {
        if (dataIn.hasOwnProperty(fieldName)) {
            if (fieldName != 'recordType' && fieldName != 'id') {
                var value = dataIn[fieldName];
                nlapiLogExecution('DEBUG', 'fieldname=' + fieldName, 'value=' + value + ' typeof=' + typeof value);
                if (value && typeof value != 'object') { // ignore other type of parameters
                    record.setFieldValue(fieldName, value);
                } else if (fieldName == 'member') {
                    for (var fieldname2 in value) {
                        var value2 = value[fieldname2];
                        nlapiLogExecution('DEBUG', '**fieldname=' + fieldname2, '**value2=' + value2 + ' typeof=' + typeof value2);

                        if (value2 && typeof value2 != 'object') {
                            record.setFieldValue(fieldname2, value2);
                        } else {
                            record.selectNewLineItem(fieldName);

                            for (var fieldname3 in value2) {
                                var value3 = value2[fieldname3];
                                nlapiLogExecution('DEBUG', '@fieldname=' + fieldname3, '**value3=' + value3 + ' typeof=' + typeof value3);

                                if (value3 && typeof value3 != 'object') {
                                    record.setCurrentLineItemValue(fieldName, fieldname3, value3);
                                }
                            }
                            record.commitLineItem(fieldName);
                        }
                    }
                } else if (fieldName == 'subList') {
                    for (var fieldname2 in value) {
                        var value2 = value[fieldname2];
                        nlapiLogExecution('DEBUG', '**fieldname=' + fieldname2, '**value2=' + value2 + ' typeof=' + typeof value2);

						for (var i = 0; i < value2.length; i++) {
							
							var subListItem = value2[i];
							
							nlapiLogExecution('DEBUG', 'subListItem = ', JSON.stringify(subListItem));
							if (subListItem.lineNumber) {
								record.selectLineItem(fieldname2, subListItem.lineNumber);
							} else {
								record.selectNewLineItem(fieldname2);
							}
							
							for (var subListItemKey in subListItem) {
								var subListObjectValue = subListItem[subListItemKey];
								if (subListItemKey !== 'lineNumber') {
									record.setCurrentLineItemValue(fieldname2, subListItemKey, subListObjectValue);
								}
							}
							
							record.commitLineItem(fieldname2);
						}
                    }
                }
            }
        }
    }
    var recordId = nlapiSubmitRecord(record);
    nlapiLogExecution('DEBUG', 'id=' + recordId);

    var nlobj = nlapiLoadRecord(dataIn.recordType, recordId);
    return nlobj;
}

function listRecord(dataIn) {
    var context = nlapiGetContext();

    var status = dataIn.recordType;

    var loc = null;
    var startShipDate = null;
    var endReceivedByDate = null;
    var customer = null;
    var vendor = null;

    var productType = null;
    var team = null;
    var league = null;

    if (!status || status == '-1') {
        throw new Error("Record type is required.");
    }

    var filtersValues = {
        location: !!loc && loc.length > 0 ? loc : null,
        customer: !!customer && customer.length > 0 ? customer : null,
        vendor: !!vendor && vendor.length > 0 ? vendor : null,
        transactionType: !!status && status.length > 0 ? status : null,

        startShipDate: !!startShipDate && startShipDate.length > 0 ? startShipDate : null,
        endReceivedByDate: !!endReceivedByDate && endReceivedByDate.length > 0 ? endReceivedByDate : null,

        productType: !!productType && productType.length > 0 ? productType : null,
        team: !!team && team.length > 0 ? team : null,
        league: !!league && league.length > 0 ? league : null

    };

    var filterExpression = []; //createTransactionFilterExpression(filtersValues);

    var columns = setupSearchColumns();

    var lastId = 0;
    var records = [];
    var internalIdFilterIndex = !!filterExpression ? filterExpression.length : 0;// filters.length;

    //Fetch records for swap list
    var savedSearchSwap = [];

    var internalIdFilterAdded = false;
    //endorsed by ZAS
    var lastRecord = null;
    //set this here for getting more than 1000 record
    do {

        nlapiLogExecution('DEBUG', 'filter Expression = ', JSON.stringify(filterExpression));
        //set the last filter to this.
        lastRecord = nlapiSearchRecord(status, null, filterExpression, columns);

        if (lastRecord !== null) {
            lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record
            savedSearchSwap = savedSearchSwap.concat(lastRecord);
        }
        if (internalIdFilterAdded === false) {
            if (filterExpression.length > 0) {
                filterExpression[internalIdFilterIndex] = 'and';
            }
            internalIdFilterIndex = filterExpression.length;
            internalIdFilterAdded = true;
        }
        filterExpression[internalIdFilterIndex] = ['internalidnumber', 'greaterthan', lastId];
    }
    while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

    return savedSearchSwap;
}

/**
 * Lists record based on Filters, columns, record Type etc passed to it
 * @param dataIn
 * @returns {Array}
 */
function listRecordExtended(dataIn) {
    var context = nlapiGetContext();

    var status = dataIn.recordType;
    var startIndex = dataIn.startIndex || 0;
    var pageSize = dataIn.pageSize || 10;

    if (!status || status == '-1') {
        throw new Error("Record type is required.");
    }

    var filterExpression = createTransactionFilterExpressionFromData(dataIn.filterData);

    var columns = setupSearchColumns(dataIn.columnData);

    var hasSummary = hasSummaryColumns(dataIn.columnData);

    var lastId = 0;
    var records = [];
    var internalIdFilterIndex = !!filterExpression ? filterExpression.length : 0;// filters.length;

    //Fetch records for swap list
    var savedSearchSwap = [];

    var internalIdFilterAdded = false;
    //endorsed by ZAS

    //set this here for getting more than 1000 record
    do {

        nlapiLogExecution('DEBUG', 'filter Expression = ', JSON.stringify(filterExpression));
        //set the last filter to this.
        var lastRecord = nlapiSearchRecord(status, null, filterExpression, columns);

        if (lastRecord !== null && lastRecord.length > 0) {
            var cols = lastRecord[0].getAllColumns();
            lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record

            for (var x = 0; x < lastRecord.length; x++) {
                savedSearchSwap.push(WsmUtilityCommon.getObject(lastRecord[x], cols));
            }
        }

        if (hasSummary === false) {
            //if we don't have any summary col specified only then add this itnernal id number.
            if (internalIdFilterAdded == false) {
                if (filterExpression.length > 0) {
                    filterExpression[internalIdFilterIndex] = 'and';
                }
                internalIdFilterIndex = filterExpression.length;
                internalIdFilterAdded = true;
            }
            filterExpression[internalIdFilterIndex] = ['internalidnumber', 'greaterthan', lastId];
        }
    }
    while (!!lastRecord && lastRecord.length >= 1000 && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

    return savedSearchSwap;
}

/**
 * Setup filter expression for search.
 * @param filtersValues
 * @returns {Array}
 */
function createTransactionFilterExpressionFromData(filterData) {

    var filterExpression = [];

    if (!filterData)
        return filterExpression;

    if (filterExpression.length > 0) {
        filterExpression.push('and');
    }

    // filterExpression.push(["isinactive", "is", "F"]);

    for (var i = 0; i < filterData.length; i++) {

        if (filterExpression.length > 0) {
            filterExpression.push('and');
        }

        filterExpression.push([filterData[i].name, filterData[i].operator, filterData[i].value]);
    }

    return filterExpression;
}

/**
 * Main search for searching records based on record types
 * @param filterExpression Expression
 * @param recordType Type of record to search on
 * @param columns columns sent by user
 * @param hasSummary decides if we can go deeper in search
 * @returns {Array} Search Results JSON array
 */
function searchProfessionalMain(filterExpression, recordType, columns, hasSummary) {

    var context = nlapiGetContext();
    var lastId = 0;
    var searchResult = [];
    var internalIdFilterAdded = false;
    var internalIdFilterIndex = !!filterExpression ? filterExpression.length : 0;

    //set this here for getting more than 1000 record
    do {

        nlapiLogExecution('DEBUG', 'filter Expression = ', JSON.stringify(filterExpression));
        //set the last filter to this.
        var lastRecord = nlapiSearchRecord(recordType, null, filterExpression, columns);

        if (lastRecord !== null && lastRecord.length > 0) {
            var cols = lastRecord[0].getAllColumns();
            lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record

            for (var x = 0; x < lastRecord.length; x++) {
                searchResult.push(WsmUtilityCommon.getObject(lastRecord[x], cols));
            }
        }

        if (hasSummary === false) {
            //if we don't have any summary col specified only then add this internal id number.
            if (internalIdFilterAdded == false) {
                if (filterExpression.length > 0) {
                    filterExpression[internalIdFilterIndex] = 'and';
                }
                internalIdFilterIndex = filterExpression.length;
                internalIdFilterAdded = true;
            }
            filterExpression[internalIdFilterIndex] = ['internalidnumber', 'greaterthan', lastId];
        }
    }
    while (!!lastRecord && lastRecord.length >= 1000 && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

    return searchResult;
}

/**
 * Searches for records in database with paging
 * @param filterExpression
 * @param recordType
 * @param columns
 * @param hasSummary
 * @param pageSize
 * @param startIndex
 * @returns {Array}
 */
function searchRecordsWithPaging(filterExpression, recordType, columns, hasSummary, pageSize, startIndex, rawColumnData) {

    var context = nlapiGetContext();
    var result = {};
    var searchResult = [];
    var totalRecordsFound;

    var countSearch = nlapiCreateSearch(recordType, filterExpression, [new nlobjSearchColumn('internalid', null, 'count')]);
    var countSearchRan = countSearch.runSearch();
    totalRecordsFound = parseInt(countSearchRan.getResults(0, 1)[0].getValue('internalid', null, 'count'), 10);

    var rangeStart = (startIndex * pageSize) - pageSize;
    var rangeEnd = startIndex * pageSize;
    var records = [];

    if (totalRecordsFound > 0 && totalRecordsFound > rangeStart) {
        var mainSearch = nlapiCreateSearch(recordType, filterExpression, columns);
        var mainSearchRan = mainSearch.runSearch();
        records = mainSearchRan.getResults(rangeStart, rangeEnd);
    }

    if (records !== null && records.length > 0) {
        var cols = records[0].getAllColumns();
        for (var counter = 0; counter < records.length; counter++) {
            searchResult.push(WsmUtilityCommon.getObject(records[counter], cols, rawColumnData));
        }
    }

    result.searchResult = searchResult;
    result.count = totalRecordsFound;

    return result;
}

/**
 * Gets results from database based on the Saved Search specified by savedSearchId parameter
 * @param filterExpression
 * @param savedSearchId
 * @param columns
 * @param hasSummary
 * @returns {Array}
 */
function getResultsBySavedSearch(filterExpression, savedSearchId, columns, hasSummary, rawColumnData) {
    var searchResult = [];
    //TODO: Need to add support for additional Filters and Columns that user might want to return
    var lastRecord = nlapiSearchRecord(null, savedSearchId, null, null);

    if (lastRecord !== null && lastRecord.length > 0) {
        var cols = lastRecord[0].getAllColumns();

        for (var x = 0; x < lastRecord.length; x++) {
            searchResult.push(WsmUtilityCommon.getObject(lastRecord[x], cols));
        }
    }

    return searchResult;
}

function listRecordProfessional(dataIn) {
    var context = nlapiGetContext();
    var response = {};

    var searchType = (!dataIn.searchType || dataIn.searchType.length <= 0) ?
                        WsmUtilityApiConstants.SearchType.Record : WsmUtilityApiConstants.SearchType.Saved;
    // This will either be a record type or Saved Search Id
    var recordType = dataIn.recordType;
    var startIndex = (!dataIn.startIndex || dataIn.startIndex <= 0) ?
                        WsmUtilityApiConstants.Paging.DefaultStartIndex : dataIn.startIndex;
    var pageSize = (!dataIn.pageSize || dataIn.pageSize <= 0 || dataIn.pageSize > 1000) ?
                        WsmUtilityApiConstants.Paging.DefaultPageSize : dataIn.pageSize;

    if (searchType === WsmUtilityApiConstants.SearchType.Record  && (!recordType || recordType == '-1')) {
        throw new Error("Record type is required.");
    }

    var filterExpression = createTransactionFilterExpressionFromData(dataIn.filterData);
    var columns = setupSearchColumns(dataIn.columnData);
    var hasSummary = hasSummaryColumns(dataIn.columnData);
    var searchResult = [];


    if (searchType === WsmUtilityApiConstants.SearchType.Record) {
        searchResult = searchRecordsWithPaging(filterExpression, recordType, columns, hasSummary, pageSize, startIndex, dataIn.columnData);
        response.searchResult = searchResult.searchResult;
        response.count = searchResult.count;

    } else if (searchType === WsmUtilityApiConstants.SearchType.Saved) {
        searchResult = getResultsBySavedSearch(filterExpression, recordType, columns, hasSummary, dataIn.columnData);
        response.searchResult = searchResult;
        response.count = searchResult ? searchResult.length : 0;

    }



    return response;
}

/**
 * Setup column for search result
 * @returns {Array}
 */
function setupSearchColumns(columnData) {
    var columns = [];
    var removedInternalId = false;
	var sortSpecified = false;
    columns[columns.length] = (new nlobjSearchColumn('internalid')); //.setSort();

    if (!!columnData && columnData.length > 0) {
        //We came here because it seems that user has provided us information about columns

        for (var i = 0; i < columnData.length; i++) {
            var col = new nlobjSearchColumn(columnData[i].name,
                        columnData[i].join != null && columnData[i].join.length > 0 ? columnData[i].join : null,
                            columnData[i].summary);

            // HACK: we cannot use internal id and summary columns together, so we are removing the internal id sort
            if (!!columnData[i].summary && removedInternalId === false) {
                columns.splice(0, 1);
                removedInternalId = true;
            }

            if (columnData[i].sortDirection != null && columnData[i].sortDirection.length > 0) {
				sortSpecified = true;
                col.setSort(getSortDirection(columnData[i].sortDirection));
            }

            if (columnData[i].formula != null && columnData[i].formula.length > 0) {
                col.setFormula(columnData[i].formula);
            }

            if (columnData[i].function != null && columnData[i].function.length > 0) {
                col.setFunction(columnData[i].function);
            }

            columns[columns.length] = col;

        }
    }

	if (sortSpecified === false) {
		columns[0].setSort();
	}
	
    return columns;
}


/**
 * checks if there is any summary col or not
 * @returns {Boolean}
 */
function hasSummaryColumns(columnData) {
    var hasSummaryField = false;

    if (!!columnData && columnData.length > 0) {
        //We came here because it seems that user has provided us information about columns

        for (var i = 0; i < columnData.length; i++) {
            // HACK: we cannot use internal id and summary columns together, so we are removing the internal id sort
            if (!!columnData[i].summary) {
                hasSummaryField = true;
                break;
            }
        }
    }

    return hasSummaryField;
}

/**
 *
 * @param sortDirection
 * @returns {boolean}
 */
function getSortDirection(sortDirection) {
    if (sortDirection == null || sortDirection.length <= 0) {
        return false;
    }

    return sortDirection.toLowerCase() == 'desc';
}

/**
 * Executes a javascript code provided to it.
 * @param dataIn
 */
function executeScript(dataIn) {
    var script = dataIn.script;
     nlapiLogExecution('DEBUG', 'final script  = ', script);
    var result = eval(script);

    return result;
}

/**
 * Handle start and finish process of a word Order 
 * Note: This method is specifically written for RICO Droid App. It has nothing to do with generic restlet existing functionality.
 * @param dataIn
 */
function handleWorkorderProgress(dataIn) {
	
	var fieldsData = dataIn.fieldsData;
	
	var WO_NOT_FOUND = 'Work Order not found';
	var WO_NOT_IN_REQUIRED_STATUS = 'Work Order not in required status';

	var tranid = fieldsData['tranid'];
	
	var internalId = getWorkOrderInternalId(tranid);
	
	var allowedStatusesToStart = ['Released', 'In Process', 'Planned'];

	if(!internalId) {
		// throw error, show error response, record not exist
		//throw(WO_NOT_FOUND);
		throw nlapiCreateError('WO_NOT_FOUND', WO_NOT_FOUND,true);
	}
	var statusVal = nlapiLookupField('workorder', internalId, 'status');
	if(!!statusVal && allowedStatusesToStart.indexOf(statusVal)) {
		var fields = [];
		var values = [];
		for(var key in fieldsData) {
			fields.push(key);
			values.push(fieldsData[key]);
		}
		var updatefields = nlapiSubmitField('workorder', internalId, fields, values);
		
		// Fetch this work order updated data again with 'listRecordProfessional' and send in response as 'listRecordProfessional' method do usally
		var listRecordExtendedMethodData = {};
		listRecordExtendedMethodData.recordType = 'workorder';
		listRecordExtendedMethodData.pageSize = 999;
		listRecordExtendedMethodData.filterData = dataIn.filterData;
		listRecordExtendedMethodData.columnData = dataIn.columnData;
		var result = listRecordProfessional(listRecordExtendedMethodData);
		return result;
	}
	else {
		// throw error, show error response, wo not is required status
		//throw(WO_NOT_IN_REQUIRED_STATUS);
		throw nlapiCreateError('WO_NOT_IN_REQUIRED_STATUS', WO_NOT_IN_REQUIRED_STATUS,true);
	}

}

/**
 * Get Work Order InternalId by Number
 * @param woNumber
 */
function getWorkOrderInternalId(woNumber) {
	var fils = [];
	fils.push(new nlobjSearchFilter('type', null, 'is', 'WorkOrd'));
	fils.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
	fils.push(new nlobjSearchFilter('tranid', null, 'is', woNumber));
	var internalId = null;
	var recs = nlapiSearchRecord('transaction', null, fils);
	if(!!recs && recs.length > 0) {
		internalId = recs[0].getId();
	}
	return internalId;
}