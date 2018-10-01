/**
 * Module Description
 * A quick way to remove or swap certain item from an assembly BOM, while preserving the other items on the BOM
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Mar 2014     hakhtar
 *
 */

/**
 * POD_CS_Constants used in this utility
 */
var POD_CS_Constants = {
    ApiUrls: {
        searchInvoices: "https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=77&deploy=1&method=searchInvoices",
        // "https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=87&deploy=1&method=searchInvoices",
        //printItems: "http://f3nsroid.folio3.com/ns-rico-pod-test/index.php/pdf",
        printItems: "https://support.sparowatch.com/podutility/index.php/pdf",
        downloadFile: "https://support.sparowatch.com/podutility/",
        //downloadFile: "http://f3nsroid.folio3.com/ns-rico-pod-test/",
        printRecord: "https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=87&deploy=1&method=printRecord"
    },
    Setting: {
        LoggingEnabled: false, //Log messages on console
        ShowAssocItem: false //Show associated items on UI for the selected item
    },
    Message: {
        SuccessfullySwapped: "{item1} & {item2} are successfully swapped within all BOMs",
        SureToRemove: "Are you sure you want to remove this item from all the BOMs?",
        AssocItemsRemoved: "Items have been removed from all BOMs",
        SureSwap: "This item is part of {count} BOMs, are you sure you want to swap?",
        WaitWhileProcessingRequest: "* Please wait while your request is being processed. This might take some time. Leaving the page before processing get completed will result in incomplete operation.",
        SelectionRequired: "Please select at least on Invoice."
    },
    SavedSearch: {
        SearchMemberParent: "customsearch360",
        SearchInvoices: "customsearch_pod_invoice_tracking_search"
    }
};

//defines data in the main grid
var mainData = [];


if ( !Array.prototype.forEach ) {
    Array.prototype.forEach = function(fn, scope) {
        for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    }
}

/**
 * Get BOMs of the items
 * @param itemId
 * @returns {Array} BOM
 */
function getParentBOMItems(itemId) {
    logMethodStart(arguments.callee.name);

    var context = nlapiGetContext();
    //Hack: increase governance limit
    context.getRemainingUsage = function () {
        return 1000;
    }

    var savedSearch = [];
    var lastId = 0;
    do {
        lastRecord = nlapiSearchRecord(null, POD_CS_Constants.SavedSearch.SearchMemberParent, [new nlobjSearchFilter('internalid', 'memberitem', 'is', itemId), new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId)]);
        if (lastRecord != null) {
            lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record
            savedSearch = savedSearch.concat(lastRecord); //Concatenate the just fetched records in a list
        }
    }
    while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

    return savedSearch;
}



/**
 * Initialize functionality on page load
 */
(function () {
    var context = nlapiGetContext();
    context.getRemainingUsage = function () {
        return 1000;
    };

    //Move the custom HTML to the appropriate place first.
    $('body').append($('#custpage_page_template_val'));


    $('#custpage_dummy_1').hide();

//    $('#custpage_txt_from_date').attr('readonly', true);
//    $('#custpage_txt_to_date').attr('readonly', true);

    //apply the date time pick
    $('#custpage_txt_from_date').datepicker({
        changeMonth: true,
        changeYear: true
    });

    $('#custpage_txt_to_date').datepicker({
        changeMonth: true,
        changeYear: true
    });

    //Apply smaller fonts
    $('.ui-datepicker').css('font-size', '0.8em');
    initializeGrid();

    //move the paging stuff to top
    $('.jtable-bottom-panel').insertAfter($('.jtable-title'));

})();


function getApiUrlWithFilters() {

    showMessage(null);

    var url = POD_CS_Constants.ApiUrls.searchInvoices;

    var selectedLocation = nlapiGetFieldValue('custpage_sf_warehouse');
    var selectedCustomer = nlapiGetFieldValue('custpage_sf_customer');
    var selectedStatus = nlapiGetFieldValue('custpage_sf_invoice_status');

    var selectedFromDate = $('#custpage_txt_from_date').val();
    var selectedToDate = $('#custpage_txt_to_date').val();

    if (checkDate(selectedFromDate) == false){
        showMessage(selectedFromDate + ' is not a valid date!','error', false);
        $('#custpage_txt_from_date').focus();
        return null;
    }

    if (checkDate(selectedToDate) == false){
        showMessage(selectedToDate + ' is not a valid date!','error', false);
        $('#custpage_txt_to_date').focus();
        return null;
    }

    var selectedInvoices = $('#custpage_txt_invoices').val();

    if (!!selectedInvoices && selectedInvoices.length > 0) {
        // split the values by space or comma
        var separators = [' ', '\\\,'];
        //console.log(separators.join('|'));
        var tokens = selectedInvoices.split(new RegExp(separators.join('|'), 'g'));

        //make sure we only have non empty values
        tokens = $.grep(tokens, function(v) {
            return v != null && v.length > 0;
        });

        if (!!tokens && tokens.length > 0) {
            var hasError = false;
            tokens.forEach(function(a){
                if (!isNumeric(a)){
                    showMessage(a + ' is not a valid invoice number!','error', false);
                    $('#custpage_txt_invoices').focus();
                    hasError = true;
                }
            });

            if (hasError == true)
                return null;
        }

        url += "&invoices=" + encodeURIComponent(JSON.stringify(tokens));
    }


    url += "&location=" + selectedLocation;
    url += "&customer=" + selectedCustomer;
    url += "&status=" + selectedStatus;
    url += "&fromDate=" + selectedFromDate;
    url += "&toDate=" + selectedToDate;

    return url;
}

function loadData() {
    var apiUrl = getApiUrlWithFilters();

    if (!apiUrl) {
        return;
    }

    //Show loading records
    progressDownloading("#btnSearch", "#pBarGetResults", false);



        $.ajax({
            url: apiUrl,
            type: "GET",
            cache : false
        })
        .done(function (data) {

            //A little hack, to make it proper JSON,
            // since for large data we have some commented text after data from server
            if (data.indexOf("<!--") >= 0)
                data = data.substr(data.indexOf("{\"Result"), data.indexOf("<!--"));

            try {
                mainData = JSON.parse(data);
            }
            catch (e) {
                //do nothing here!
                //$('#lbl_message').text('There was an error while fetching data from server.');
                showMessage('There was an error while fetching data from server.', 'error', false);
            }

            $('#searchResultContainer').jtable('loadClient', mainData);

            //hide loading
            progressDownloading("#btnSearch", "#pBarGetResults", true);
        });
}


function showMessage(message, type, isHtml) {

    //ui-state-highlight
    //ui-state-error
    $('#divMessage').removeClass('ui-state-highlight');
    $('#divMessage').removeClass('ui-state-error');

    if (!!message && message.length > 0) {
        $('#divMessage').show();

        if (type == 'success') {
            $('#divMessage').addClass('ui-state-highlight');
        }
        else if (type == 'error') {
            $('#divMessage').addClass('ui-state-error');
        }

        isHtml == false ? $('#lbl_message').text(message) : $('#lbl_message').html(message);
    }
    else {
        $('#divMessage').hide();
    }
}

/**
 * Checks if given input is a valid date.
 * @param input_value
 * @returns {boolean}
 */
function checkDate(input_value) {
    var validformat = /^\d{2}\/\d{2}\/\d{4}$/; //Basic check for format validity
    var returnval = false;

    if (!input_value || input_value.length <= 0) {
        return true;
    }

    if (!validformat.test(input_value))
        return returnval;
    else { //Detailed check for valid date ranges
        var monthfield = input_value.split("/")[0];
        var dayfield = input_value.split("/")[1];
        var yearfield = input_value.split("/")[2];
        var dayobj = new Date(yearfield, monthfield - 1, dayfield);

        if ((dayobj.getMonth() + 1 != monthfield) || (dayobj.getDate() != dayfield) || (dayobj.getFullYear() != yearfield))
            returnval = false;
        else
            returnval = true;
    }

    return returnval;
}


/**
 * Sorts the records by Text (name)
 * @param records
 * @returns sorted records
 */
function sortRecords(records) {
    logMethodStart(arguments.callee.name);
    if (!records)
        return [];
    //Sort records by name
    records.sort(function (a, b) {
        var obj1 = a.Text.toUpperCase();
        var obj2 = b.Text.toUpperCase();
        return (obj1 < obj2) ? -1 : (obj1 > obj2) ? 1 : 0;
    });

    // delete all duplicates record
    for (var i = 0; i < records.length - 1; i++) {
        if (records[i].Value == records[i + 1].Value) {
            delete records[i];
        }
    }

    // remove the "undefined entries"
    records = records.filter(function (elem) {
        return (typeof elem !== "undefined");
    });

    return records;
}


/**
 * Validate both of the drop downs and disable the swap button if both are having same values
 */
function validateDropDown() {
    logMethodStart(arguments.callee.name);

    //Get both values of both the lists
    var ddlItemList = document.getElementById('item_list');
    var ddlItemSwapList = document.getElementById('item_swap_list');
    var item_id = ddlItemList.options[ddlItemList.selectedIndex].value;
    var item_swap_id = ddlItemSwapList.options[ddlItemSwapList.selectedIndex].value;

    showAssociation(item_id);

    //Disable the swap button if both the values are same, enable otherwise
    var btnSwap = document.getElementById('btnSwap');
    btnSwap.disabled = (item_id == item_swap_id) ? true : false;

    log(btnSwap.disabled);
}


/**
 * Log messages on console if logging is enabled
 * @param message
 */
function log(message) {
    //if (POD_CS_Constants.Setting.LoggingEnabled)
        //console.log(message);
}

/**
 * Log the name of method called
 * @param calleeName
 */
function logMethodStart(calleeName) {
    log("Method called: " + calleeName);
}





/**
 * show IDs of BOM for the selected item, if this option is enabled
 * @param itemId
 */
function showAssociation(itemId) {
    logMethodStart(arguments.callee.name);

    if (POD_CS_Constants.Setting.ShowAssocItem) {
        var div = document.getElementById("assoc_details");
        if (!div) {
            div = document.createElement('div');
            div.id = "assoc_details";
            attachElement(div);
        }
        div.innerText = "";
        var parentItems = getParentBOMItems(itemId);
        parentItems.forEach(function (item) {
            div.innerText += item.getId() + ", ";
        });
    }
}


/**
 * attach an HTML element to div__body or the main body
 * @param elem
 */
function attachElement(elem) {
    logMethodStart(arguments.callee.name);

    var parentElem = document.getElementById("div__body");
    if (!parentElem)
        parentElem = document.body;

    parentElem.appendChild(elem);
}


/**
 * show progress message on screen to user
 * @param message
 */
function showProgressMessage(message) {
    logMethodStart(arguments.callee.name);

    var div = document.getElementById("progress_details");
    if (message == null && !!div) {
        div.remove(); //remove the div if null is passed
        return;
    }
    else {
        if (!div) {
            //If the progress_details div doesn't exists, create it
            div = document.createElement('div');
            div.id = "progress_details";
            attachElement(div);
        }
        //Set styling and message to div
        div.style.color = "red";
        div.innerText = "";
        div.innerText = message;
    }
}

/**
 * Initializes Result Grid for Invoices.
 */
function initializeGrid() {
    //Prepare jTable
    $('#searchResultContainer').jtable({
        title: 'Invoices',
        paging: true,
        pageSize: 100,
        clientBinding: true,
        selecting: true, //Enable selecting
        multiselect: true, //Allow multiple selecting
        selectingCheckboxes: true, //Show checkboxes on first column
        fields: {
            internalid: {
                key: true,
                create: false,
                edit: false,
                list: false,
                title: "Invoice #",
                width: '10%'
            },
            trandate: {
                title: 'Date',
                width: '15'
            },
            duedate: {
                title: 'Due Date',
                width: '15%'
            },
            tranid: {
                title: 'Invoice #',
                width: '15%'
            },
//            account: {
//                title: 'Account',
//                width: '15%'
//            },
            total: {
                title: 'Amount',
                width: '15%'
            },
            location: {
                title: 'Warehouse',
                width: '20%'
            },
            trackingnumbers: {
                title: 'Tracking Numbers',
                width: '30%'
            }
        },
        selectionChanged: function (event, data) {

        },
        recordsLoaded: function (event, data) {


        }
    });
}

function progressDownloading(btnElement, pBarElem, done) {
    var btnDownload = $(btnElement);
    var downloadBar = $(pBarElem);


    if (!!done) {
        //hide progress bar & message
        downloadBar.hide();
        //show download button
        btnDownload.show();
    }
    else {
        //Set width and height of progress bar, same as button
        downloadBar.height(btnDownload.height());
        downloadBar.width(btnDownload.width());

        //set the div as progress bar with indeterminate state
        downloadBar.progressbar();
        downloadBar.progressbar("option", "value", false);

        //hide download button
        btnDownload.hide();
        //show progress bar
        downloadBar.show();
    }
}

var guid = (function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return function() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();

/**
 * prints proof of delivery
 */
function btnPrint_Click(){

    //disable the print button
    //$('#custpage_btn_print').attr('disabled', true);

    showMessage(null);// $('#lbl_message').text('');
//    $('#lbl_download_link').text('');
//    $('#lbl_download_link').html('');

    var selectedRows = $('#searchResultContainer').jtable('selectedRows');

    if(selectedRows.length <= 0) {
        alert(POD_CS_Constants.Message.SelectionRequired);
        return;
    }



    var dataToSend = [];

    for (var row = 0; row < selectedRows.length; row++) {
        var item = $(selectedRows[row]).data();

        dataToSend.push({
            internalid: item.record.internalid,
            //trackingnumbers: item.record.trackingnumbers.split('<BR>'),
            tranid: item.record.tranid,
            trackingdetails: {
                location: item.record.locationId,
                version: item.record.version,
                number: item.record.trackingnumbers.split('<BR>')
            }
        });
    }

    var uuid = guid();

    //send the data to server to process
    $.ajax({
        url: POD_CS_Constants.ApiUrls.printItems + '?uuid=' + uuid,
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify(dataToSend),
        success: function(response){
            //$('#lbl_message').text('Please wait while we process your request. This might take some time.');
            showMessage('Please wait while we process your request. This might take some time.', 'success', false);
            //console.log("success " + response);

            setTimeout(function(){
                followUp(response);
            }, 10000) ;
        },
        fail: function(response) {
            alert('background process failed.');
            //console.log("faile:" + response);
        }
    });
}

/**
 * Checks if give number is a number or not.
 * @param num
 * @returns {boolean}
 */
function isNumeric(num){
    return !isNaN(num)
}

function checkStatus(uid){

    if ($('#' + uid).length <= 0) {
        //this is first time
        $(document.body).append('<input type="hidden" id="' + uid + '">');

        //set that we are in progress
        $('#' + uid).val('1');
    }

    if ($('#' + uid).val() == '0'){
        return;
    }


    //send the data to server to process
    $.ajax({
        url: POD_CS_Constants.ApiUrls.printItems + "?uid=" + uid,
        cache : false,
        type: 'GET',
        success: function(response){
            if (!!response && response.status == "OK" && !!response.response && response.response.files_remaining <= 0) {

                if (response.response.action == "0"){
                    setTimeout(function(){
                        checkStatus(uid);
                    }, 10000) ;
                }
                else {
                    $('#' + uid).val('0');

                    var final_url = POD_CS_Constants.ApiUrls.downloadFile + response.response.pod_pdf_file;
                    showMessage('Click <a target="_blank" href="' + final_url + '">here</a> to download!', 'success', true);
                }
            }
            else {
                showMessage('background process has been started for PDF processing. Still working ..., PODs Remaining: ' +
                    response.response.files_remaining, 'success', false);
                //$('#lbl_message').text('background process has been started for PDF processing. Still working ... ');
                setTimeout(function(){
                    checkStatus(uid);
                }, 20000) ;

            }
            //console.log("success " + response);
        },
        fail: function(response) {
            //console.log("faile:" + response);
            showMessage('PDF Generation failed on server.', 'success', false);
            //$('#lbl_message').text('PDF Generation failed on server.');
        }
    });
}

function followUp(postResponse){

    var uid = postResponse.UID;

    //$('#lbl_message').text('background process has been started for PDF processing. Checking status ... ');
    showMessage('background process has been started for PDF processing. Checking status ... ', 'success', false);

    //check it after every 30 seconds.
    //setInterval(function(){
        checkStatus(uid);
    //}, 20000);
}

/**
 * Called when Cancel button is clicked
 */
function btnCancel_Click(){
    // refresh the page.
    window.location.href = window.location.href;
}


/**
 * Called when Mark All is clicked
 */
function btnMarkAll_Click(){
    // refresh the page.
    var chkBox = $('#searchResultContainer').find('td.jtable-selecting-column input');

    for (var i = 0; i < chkBox.length; i++) {
        var chBox = $(chkBox[i]);
        var isChecked = chBox.attr('checked');
        if ( !isChecked || isChecked == '' || isChecked != 'checked') {
            chBox.click();
        }
    }
}

/**
 * Called when UnMark All is clicked
 */
function btnUnmarkAll_Click(){
    // refresh the page.
    // refresh the page.
    var chkBox = $('#searchResultContainer').find('td.jtable-selecting-column input');

    for (var i = 0; i < chkBox.length; i++) {
        var chBox = $(chkBox[i]);
        var isChecked = chBox.attr('checked');

        if ( isChecked == 'checked' || chBox.closest('tr').hasClass('jtable-row-selected') ) {
            chBox.click();
        }
    }
}
