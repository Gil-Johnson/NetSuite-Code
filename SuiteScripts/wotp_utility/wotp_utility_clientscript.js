/**
 * Created by ubaig on 9/17/2014.
 * A general purpose constants file to be used as a common point for constants or hard code values
 * -
 * Referenced By:
 * -
 * -
 * -
 * Dependencies:
 * -
 * -
 * -
 * -
 */

var g_currentOperation;
var backOrdered = 1;

/**
 * Load data in jquery table
 */
function loadDataMaster() {
    var heads = [],
        Records = [],
        data = {// it will contain data for jtable.
            Result: "OK",
            Version: "1",
            TotalRecordCount: "",
            Records: []
        };
    try {

        var detailedSearchId = getDetailSearchId();

        var searchInfo = nlapiLoadSearch(null, detailedSearchId);
        var mainSearch = nlapiLoadSearch(null, WotpUtilityCommon.SavedSearches.MainWorkOrderSearch);

        var fils = getFiltersForSearch(mainSearch);
        heads = nlapiSearchRecord(mainSearch.type, null, fils, mainSearch.columns);
        if (!!heads && heads.length > 0) {
            heads.forEach(function (searchResult) {
                var eachRecord = {}; // used for single record traversing
                searchResult.rawValues.forEach(function (rec) {
                    if (rec.text) {
                        eachRecord[rec.name] = {text: rec.text, value: rec.value};
                    } else {
                        eachRecord[rec.name] = (!!rec.value) ? rec.value : rec.text;
                    }
                });
                Records.push(eachRecord);
            });
            data.TotalRecordCount = heads.length;
            data.Records = Records;
        }
    } catch (e) {
        //Show error for now
        !!console && console.log("Warning: " + e.name + ", " + e.message);
    }
    $('#searchResultContainer').jtable('loadClient', data);
}

/**
 * Gets Search Id for Detail
 * @returns {string}
 */
function getDetailSearchId() {

    var filter = new nlobjSearchFilter('custrecord_emp', null, 'anyof', nlapiGetContext().user);
    var col = new nlobjSearchColumn(WotpUtilityCommon.Fields.WorkOrderTrackingSearchId);
    var searchResult = nlapiSearchRecord(WotpUtilityCommon.Records.CustomRecordWotp, null, filter, col);

    var e = (!!searchResult && searchResult.length > 0) ? searchResult[0] : null;

    var searchId = (!e) ? null : e.getValue(WotpUtilityCommon.Fields.WorkOrderTrackingSearchId);
    if (!searchId || searchId.length <= 0) {
        searchId = WotpUtilityCommon.SavedSearches.DetailWorkOrderSearch;
    }
    return searchId;
}

/**
 * Gets Record after detailed searching
 * @param savedSearchId
 * @param filter
 * @param pages
 * @returns {*}
 */
function getRecords(savedSearchId, filter, pages) {
    var savedSearch;
    try {
        savedSearch = nlapiLoadSearch(null, savedSearchId);
    } catch (ex) {
        nlapiLogExecution('DEBUG', 'getRecords', ex);
        return null;
    }

    if (!!filter) {
        savedSearch.filters.push(filter);
    }

    var runSearch = savedSearch.runSearch();
    var start = 0, end = 1000;
    var page = 1;
    var chunk = runSearch.getResults(start, end);
    var result = [];
    if (chunk !== null) {
        result = result.concat(chunk);
        while (chunk.length === 1000 && (!!pages ? page < pages : true)) {
            start += 1000;
            end += 1000;
            chunk = runSearch.getResults(start, end);
            if (chunk !== null) {
                result = result.concat(chunk);
            }

            page = !!pages ? ++page : null;
        }
    }
    return result;
}

/**
 * Loads data in detail table
 */
function loadDataDetail(filter) {
    var heads = [],
        searchFilter = null,
        Records = [],
        data = {// it will contain data for jtable.
            Result: "OK",
            Version: "1",
            TotalRecordCount: "",
            Records: []
        };
    try {

        if (!!filter) {
            searchFilter = new nlobjSearchFilter('custbody_currentoperation', null, 'anyof', [filter]);
        }
        heads = getRecords(getDetailSearchId(), searchFilter, null);
        if (heads.length > 0) {
            heads.forEach(function (searchResult) {
                var eachRecord = {}; // used for single record traversing
                searchResult.rawValues.forEach(function (rec) {
                    if (rec.text) {
                        eachRecord[rec.name] = rec.text;
                    } else {
                        eachRecord[rec.name] = (!!rec.value) ? rec.value : rec.text;
                    }
                });

                if (searchResult.id) {
                    eachRecord.id = searchResult.id;
                }

                Records.push(eachRecord);
            });
            data.TotalRecordCount = heads.length;
            data.Records = Records;
        }
    } catch (e) {
        //Show error for now
        !!console && console.log("Warning: " + e.name + ", " + e.message);
    }
    $('#searchResultContainerDetail').jtable('loadClient', data);
}

function changeRowTextColor() {
    $('#searchResultContainerDetail table tbody tr td:nth-child(7)').each(function () {
        var cellVal = parseInt($(this).text())
        if (cellVal > 0) {
            var row = $(this).closest('tr');
            row.css("color", "red");
            row.find('a').css("color", "red");
            row.find('input').css("color", "red");
            row.find('select').css("color", "red");
        }
    });
}

/**
 * This methos is called on jtable field selection
 */
function onSelection() {
    var selectedRows = $('#searchResultContainer').jtable('selectedRows'),
        values = $('#values').val(),
        obj = {}, // contains selected columns
        i, // loop variable
        selectedRow;
    if (values.length > 0) {
        for (i = 0; i < selectedRows.length; i++) {
            selectedRow = $(selectedRows[i]).attr('data-record-key');
            if (obj[selectedRow]) {
                delete obj[selectedRow];
            } else {
                obj[selectedRow] = $(selectedRows[i]).attr('data-record-key');
            }
        }
    } else {
        for (i = 0; i < selectedRows.length; i++) {
            obj[$(selectedRows[i]).attr('data-record-key')] = $(selectedRows[i]).attr('data-record-key');
        }
    }
    $('#values').val(JSON.stringify(obj));
}

/**
 * Initialize jquery table
 */
function initializeGrid(options) {
    //Prepare jTable
    var jTableOptions = {
        title: 'Work Orders Group',
        paging: true,
        pageSize: 100,
        clientBinding: true,
        fields: {},
        selectionChanged: function (event, data) {
            onSelection();
        }
    };
    jTableOptions.fields = options;
    $('#searchResultContainer').jtable(jTableOptions);
}

/**
 * Initialize Detail jQuery Table
 */
function initializeDetailGrid() {

    var heads, fields = {};

    try {
        heads = nlapiLoadSearch(null, WotpUtilityCommon.SavedSearches.DetailWorkOrderSearch);
        heads.getColumns().forEach(function (searchResult) {
            fields[searchResult.name] = {
                title: "",
                key: false
            };
            fields[searchResult.name].title = searchResult.label;
            if (searchResult.name === 'tranid') {
                fields[searchResult.name].key = true;

                fields[searchResult.name].display = function (data) {
                    return '<a href="javascript:;" onclick="onShowWorkOrder(this); return false;" data-id="' + data.record.tranid + '" data-val="' + encodeURIComponent(JSON.stringify(data.record)) + '">' + data.record.tranid + '</a>';
                };
            } else if (searchResult.name === 'enddate') {
                fields[searchResult.name].display = function (data) {
                    return '<input type="text" class="line-end-date" style="width: 80px" onblur="onDateBlur(this);" value="' + data.record.enddate + '" data-val="' + encodeURIComponent(JSON.stringify(data.record)) + '" />';
                };
            } else if (searchResult.name === 'custbody_currentoperation') {
                fields[searchResult.name].display = function (data) {
                    var options = jQuery('.main-operations').html();
                    var currentValue = '>' + data.record.custbody_currentoperation;
                    options = options.replace(currentValue, ' selected ' + currentValue);
                    return '<select class="line-current-operation" data-val="' + encodeURIComponent(JSON.stringify(data.record)) + '" onchange="onCurrentOperationChange(this);">' + options + '</select>';
                };
            }
        });
    } catch (e) {
        //Show error for now
        !!console && console.log("Warning: " + e.name + ", " + e.message);
    }

    //Prepare jTable
    var jTableOptions = {
        title: 'Work Orders - Details',
        paging: true,
        pageSize: 100,
        clientBinding: true,
        fields: fields,
        recordsLoaded: function (event, data) {
            $('.line-end-date').datepicker({
                changeMonth: true,
                changeYear: true,
                onSelect: function (dateText) {
                    var data = JSON.parse(decodeURIComponent(jQuery(this).attr('data-val')));
                    var workOrderId = data.id;
                    var info = {};
                    info.id = workOrderId;
                    info.field = 'enddate';
                    info.value = jQuery(this).val();
                    updateData(info);
                }
            });
            if (backOrdered) {
                //changeRowTextColor();
            }
        }
    };
    $('#searchResultContainerDetail').jtable(jTableOptions);
}

/**
 * Description of method updateDate
 * @param parameter
 */
function updateData(info) {
    try {
        nlapiSubmitField('workorder', info.id, info.field, info.value);
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main updateDate', e.toString());
    }
}

/**
 * Description of method onDateBlur
 * @param parameter
 */
function onDateBlur(element) {
    try {
        var data = JSON.parse(decodeURIComponent(jQuery(element).attr('data-val')));
        var workOrderId = data.id;
        var info = {};
        info.id = workOrderId;
        info.field = 'enddate';
        info.value = jQuery(this).val();
        updateData(info);

    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main onDateBlur', e.toString());
    }
}

function onCurrentOperationChange(element) {
    try {
        var data = JSON.parse(decodeURIComponent(jQuery(element).attr('data-val')));
        var workOrderId = data.id;
        var info = {};
        info.id = workOrderId;
        info.field = 'custbody_currentoperation';
        info.value = jQuery(element).val();
        updateData(info);
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main onCurrentOperationChange', e.toString());
    }
}

/**
 * Description of method updateWorkOrder
 * @param parameter
 */
function updateWorkOrder(data) {
    try {
        var record = nlapiLoadRecord('', data.id);

    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main updateWorkOrder', e.toString());
    }
}

/**
 * runs on Saved searches drop down change
 */
function createMasterFields() {
    var heads, fields = {}, filters;

    try {
        heads = nlapiLoadSearch(null, WotpUtilityCommon.SavedSearches.MainWorkOrderSearch);
        heads.getColumns().forEach(function (searchResult) {
            fields[searchResult.name] = {
                title: "",
                key: false
            };
            fields[searchResult.name].title = searchResult.label;
            if (searchResult.name === 'internalid') {
                fields[searchResult.name].key = true;
            }

            if (searchResult.name === 'custbody_currentoperation') {
                fields[searchResult.name].display = function (data) {

                    return '<a href="javascript:;" onclick="onShowDetail(this); return false;" data-id="' + data.record.custbody_currentoperation.value + '" data-val="' + encodeURIComponent(JSON.stringify(data.record)) + '">' + data.record.custbody_currentoperation.text + '</a>';
                };
            }

            if (searchResult.name === 'enddate') {
                fields[searchResult.name].display = function (data) {
                    var dateColor = "black";
                    var className = "";
                    var currentDate = new Date();
                    currentDate.setHours(0, 0, 0, 0);
                    var enddate = data.record.enddate.split('/');
                    var formattedEndDate = new Date(enddate[2], enddate[0] - 1, enddate[1]);

                    if (formattedEndDate < currentDate) {
                        dateColor = "red";
                        className = "blink";
                    }
                    return '<span class = "' + className + '" id="blinkText" style="color:' + dateColor + '">' + data.record.enddate + '</span>';
                };
            }


        });
    } catch (e) {
        //Show error for now
        !!console && console.log("Warning: " + e.name + ", " + e.message);
    }
    $('#searchResultContainer').jtable('destroy');
    initializeGrid(fields);
    loadDataMaster();
}

/**
 * Description of method onShowDetail
 * @param element
 */
function onShowDetail(element) {
    try {
        var dataId = jQuery(element).attr('data-id');

        g_currentOperation = dataId;

        if (!dataId || dataId.length <= 0) {
            dataId = WotpUtilityCommon.CurrentOperations.None;
        }

        //passing the filter info to load detail data
        loadDataDetail(dataId);

    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main onShowDetail', e.toString());
    }
}

/**
 * Description of method onShowWorkOrder
 * @param parameter
 */
function onShowWorkOrder(element) {
    try {
        var workOrderInfo = JSON.parse(decodeURIComponent(jQuery(element).attr('data-val')));
        var id = workOrderInfo.id;

        window.open(nlapiResolveURL('RECORD', 'workorder', id));

    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main onShowWorkOrder', e.toString());
    }
}

/**
 * ClintScript main function
 */
function wotpPageInit() {

    $(document).ready(function () {
        //$('.uir-field-wrapper').insertAfter($('.uir-page-title-firstline'));
        //$('.table_fields').attr('width', '100%');
    });

    initializeGrid();

    createMasterFields();

    initializeDetailGrid();
}
function wotpPagefieldChg(type, name) {
}
function applyFiltersOnSearch() {
    createMasterFields();
    loadDataDetail(-1);
}
function getFiltersForSearch(mainSearch) {
    var oldFilters, newFilters, finalFilters;
    oldFilters = getOldFilters(mainSearch);
    newFilters = getNewFilters();
    finalFilters = oldFilters.concat(newFilters);
    return finalFilters;
}
function getOldFilters(mainSearch) {
    var fils = [], filters;
    filters = mainSearch.getFilters();
    if (filters instanceof Array) {
        for (var i in filters) {
            fils.push(filters[i]);
        }
    }
    return fils;
}
function getNewFilters() {
    var fils = [];
    var printedTicket = nlapiGetFieldValue('printpickingticket');
    var productType = nlapiGetFieldValue('producttype');
    var department = nlapiGetFieldValue('department');
    if (!!printedTicket) {
        fils.push(new nlobjSearchFilter("printedpickingticket", null, "is", printedTicket, null));
    }
    if (!!productType) {
        fils.push(new nlobjSearchFilter("custbody_woproducttype", null, "anyof", [productType], null));
    }
    if (!!department) {
        fils.push(new nlobjSearchFilter("custbody6", "", "anyof", [department], null));
    }
    return fils;
}