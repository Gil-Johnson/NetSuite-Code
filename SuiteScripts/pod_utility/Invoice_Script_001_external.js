/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       09 Apr 2014     ubaig
 *
 */

var Constants = POD_CS_Constants || {};




Constants.api_url = "https://system.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=81&deploy=1";
    Constants.request_method = navigator.appName.indexOf("Internet Explorer") != -1 ? "GET" : "POST";
    Constants.Filters = {
        teams: 'team',
        leagues: 'league',
        prodTypes: 'prod-type'
    };
Constants.download_initializing_url = "https://support.sparowatch.com/imagedownloader/init_download.php";
    Constants.download_status_check_url = "https://support.sparowatch.com/imagedownloader/checkstatus.php";
    Constants.auth_token = "390ff82f-c9f3-4df6-9abe-95241c79e38d";



var leftData = [];
var rightData = [];

$(function () {
    var selectedLeagues = [];
    var intervalId = setInterval(
        function () {
            if (!!$('select[data-value="multiselect"]') && $('select[data-value="multiselect"]').length == 3) {
                $('select[data-value="multiselect"]').multiselect({
                    selectedList: 2
                });

                //Start with a team filter & GetResults button, disabled
                $('#team').multiselect('disable');
            }

            if (!!$('#league') && $('#league').length > 0) {
                $('#league').multiselect({
                    close: function () {
                        selectedLeagues = $(this).val();

                        $('#custpage_selectedleague')[0].value = JSON.stringify(selectedLeagues);
                        $('#imgLoadingTeams').show();
                        $.ajax({
                            url: Constants.api_url,
                            data: {method: "getTeamsByLeagueIds", leagueIds: JSON.stringify(selectedLeagues)}
                        }).done(function (data) {
                                var objData = JSON.parse(data);
                                if (objData.Result == "OK") {

                                    //Clear all the existing teams, no matter we got more teams or not
                                    $('#team option').remove();

                                    if (!!objData.teams) {
                                        var teams = JSON.parse(objData.teams);
                                        if (!!teams && teams.length > 0) {
                                            teams.forEach(function (team) {
                                                $('<option />').attr('value', team.value).text(team.name).appendTo('#team');
                                            });
                                        }
                                    }
                                }

                                //Refresh the list or the newly added options would not be displayed
                                $('#team').multiselect('refresh');
                                $('#team').multiselect($('#team option').length <= 0 ? 'disable' : 'enable');
                                $('#imgLoadingTeams').hide();
                            });
                    }
                });
                clearInterval(intervalId);
            }

        }, 100);
    refreshGrid(true);
    //refreshGridStyle();
});

//$("#btnDownloadImages").button();
$("#btnLoadSearch").button();

function initializeGrid() {
    //Prepare jTable
    $('#searchResultContainer').jtable({
        title: 'Choose Items',
        paging: true,
        pageSize: 1000,
        clientBinding: true,
        selecting: true, //Enable selecting
        multiselect: true, //Allow multiple selecting
        selectingCheckboxes: true, //Show checkboxes on first column
        fields: {
            internalid: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            mainimage: {
                list: false
            },
            thumbnail: {
                title: '<- Select All',
                width: '15%',
                display: function (data) {
                    //return '<a href="' + data.record.mainimage + '" class="zoom"><img onclick="zoomImage(this);" src="' + data.record.thumbnail + '" height="48px" width="70px" align="middle" alt="Product Image"></a>';

                    return '<img onmouseover="bigImg(this)" onmouseout="normalImg(this)" data-large="' + data.record.mainimage + '"  src="' + data.record.thumbnail + '" height="48px" width="70px" align="middle" alt="Product Image" />';
                }
            },
            itemnumber: {
                title: 'Item',
                width: '20%'
            },
            description: {
                title: 'Description',
                width: '45%'
            },
            league: {
                title: 'League',
                width: '20%'
            },
            team: {
                title: 'Team',
                width: '20%'
            },
            producttype: {
                title: 'Product Type',
                width: '20%'
            },
            available: {
                title: 'Available',
                width: '20%'
            }
        },
        selectionChanged: function (event, data) {
            refreshGridStyle();
        },
        recordsLoaded: function (event, data) {

            refreshGridStyle();
        }
    });
}

function bigImg(img) {
    var e = event;
    var objImage = $(img);

    var largeImage = objImage.attr('data-large');

    if (!!largeImage && largeImage.length > 0 ) {
        var myDiv = '<div id="easy_zoom"><img id="easy_zoom_image" src="' + largeImage + '" style="max-width: 100%;max-height: 100%;"></div>';

        //remove any existing
        $('#easy_zoom').remove();

        $(document.body).append(myDiv);

        $('#easy_zoom').css('left', (e.pageX + 20).toString() + "px");
        $('#easy_zoom').css('top', (e.pageY - 100).toString() + "px");

    }
}

function normalImg(x)
{
 $('#easy_zoom').remove();
}


function initializeResultGrid() {
    //Prepare jTable
    $('#searchResultRightContainer').jtable({
        title: 'Selected Items',
        paging: true,
        pageSize: 1000,
        clientBinding: true,
        selecting: true, //Enable selecting
        multiselect: true, //Allow multiple selecting
        selectingCheckboxes: true, //Show checkboxes on first column
        fields: {
            internalid: {
                key: true,
                create: false,
                edit: false,
                list: false
            },
            itemnumber: {
                title: 'Item',
                width: '20%'
            },
            available: {
                title: 'Quantity',
                edit: true,
                width: '20%',
                display: function (data) {
                    return '<input type="text" name="available" onchange="validateQuantity(this)" style="width: 50px;text-align: right;" class="right-quantity-input" value="' + data.record.available + '" />';
                }
            },
            remove: {
                title: '',
                width: '20%',
                display: function (data) {
                    return '<input type="button" name="Remove" data-val="' + data.record.internalid  + '" style="width: 50px;text-align: right;" onclick="onRemoveClick(this)"  value="Remove" />';
                }
            }
        },
        selectionChanged: function (event, data) {
            //refreshGridStyle();
        },
        recordsLoaded: function (event, data) {

            hideDuplicateDataRows();
        }
    });
}


function validateQuantity(txt){
    var quantity = $(txt).val();

    if(isNumber(quantity) === false) {
        $(txt).val('0');
        alert('quantity should be a number.');
        return;
    }
}

function onRemoveClick(obj) {
    var btn = $(obj);
    var internalId = btn.attr('data-val');

    var trArray = btn.closest('tr');
    moveLeftInternal(true, trArray);

}

function refreshGrid(isFirstLoad) {
    initializeGrid();

    initializeResultGrid();

    refreshGridStyle();

    loadLeftData();

    refreshGridStyle();

    loadRightData();

    //Load list from server, ignore if it is first time
    if (!isFirstLoad) {
        loadData();
    }

}

function loadLeftData() {
    //Show loading records
    var data = [];

    leftData = {
        TotalRecordCount: data.length,
        Records: data
    };

    try {
        $('#searchResultContainer').jtable('loadClient', leftData);
    }
    catch (e) {

    }
}

function loadRightData() {
    //Show loading records
    var data = [];

    rightData = {
        TotalRecordCount: data.length,
        Records: data
    };

    try {
        $('#searchResultRightContainer').jtable('loadClient', rightData);
    }
    catch (e) {

    }
}

function loadData() {
    //Show loading records
    progressDownloading("#btnLoadSearch", "#pBarGetResults", "#pBarGetResultsMessage");
    $.ajax({
        url: getApiUrlWithFilters(),
        type: "GET"
    })
        .done(function (data) {

            //A little hack, to make it proper JSON,
            // since for large data we have some commented text after data from server
            if (data.indexOf("<!--") >= 0)
                data = data.substr(data.indexOf("{\"Result"), data.indexOf("<!--"));

            leftData = JSON.parse(data);

            $('#searchResultContainer').jtable('loadClient', leftData);

            //hide loading
            progressDownloading("#btnLoadSearch", "#pBarGetResults", "#pBarGetResultsMessage", true);
        });
}

function refreshGridStyle() {
    var selectedRows = $('#searchResultContainer').jtable('selectedRows');

    var isSelected = !!selectedRows && selectedRows.length > 0;

    //Enable/Disable download button
    //disableElement('btnDownloadImages', !isSelected);

    var isScrollable = $("#searchResultContainer").height() > 400; //Since the parent div is 400px
    $("#searchResultContainer").css("overflow-y", isScrollable ? "scroll" : "hidden");
    $("#gridContainer").height(isScrollable ? "400" : Math.max($("#searchResultContainer").height(), 400));

    hidePageInfo();
}

function hidePageInfo(){
    $('.jtable-page-info').hide();
}

function getApiUrlWithFilters() {
    var url = Constants.api_url + "&method=searchTable";

    var selectedTeams = $('#team').val();
    var selectedProdTypes = $('#prod-type').val();
    var selectedLeagues = $('#league').val();

    url += "&teams=" + selectedTeams;
    url += "&producttypes=" + selectedProdTypes;
    url += "&leagues=" + selectedLeagues;

    return url;
}

function downloadImages() {
    var selectedRows = $('#searchResultContainer').jtable('selectedRows');
    if (!!selectedRows && selectedRows.length > 0) {
        var files = {};
        for (var i = 0; i < selectedRows.length; i++) {
            files[i] = $(selectedRows[i]).attr('data-record-key');
        }
        files = encodeURIComponent(JSON.stringify(files));

        //progressDownloading("#btnDownloadImages", "#pBarDownloading", "#pBarDownloadingMessage");
        $.ajax({
            //Hack: Added reqid to make every response unique, or else IE will consider it a 304
            url: Constants.download_initializing_url + "?reqid=" + Math.floor((Math.random() * 1000) + 1),
            type: Constants.request_method,
            data: {
                auth_token: Constants.auth_token,
                files: files
            }})
            .fail(function (err) {
                handleDownloadFail();
            })
            .done(function (data) {
                if (typeof data != "object")
                    data = JSON.parse(data);
                if (!!data && data.status == "OK") {
                    checkDownloadStatus(data);
                }
                else {
                    handleDownloadFail();
                }
            });

    }
}

function checkDownloadStatus(postData) {
    //Already checked, its an object and status = OK

    var eta = postData.ETA;
    var uid = postData.UID;

    if (eta == "0") {
        //Ready to download
        var url = postData.url;
        if (!!url && url.indexOf('.zip') >= 0) {
            //ensure if this contains .zip
            window.location.href = url;
        }
        handleDownloadSuccess();
    }
    else if (eta > "0") {
        setTimeout(function () {
            $.ajax({
                //Hack: Added reqid to make every response unique, or else IE will consider it a 304
                url: Constants.download_status_check_url + "?reqid=" + Math.floor((Math.random() * 1000) + 1),
                type: Constants.request_method,
                data: {
                    auth_token: Constants.auth_token,
                    folderName: uid
                }})
                .fail(function (err) {
                    handleDownloadFail();
                })
                .done(function (data) {
                    if (typeof data != "object")
                        data = JSON.parse(data);
                    if (!!data && data.status == "OK") {
                        checkDownloadStatus(data);
                    }
                    else {
                        handleDownloadFail();
                    }
                });
        }, eta);
    }
    else {
        //Some error occured
        handleDownloadFail();
    }
}

function handleDownloadSuccess() {
    //progressDownloading("#btnDownloadImages", "#pBarDownloading", "#pBarDownloadingMessage", true);
}

function handleDownloadFail() {
    $("#dialog-message").dialog('open');
    //progressDownloading("#btnDownloadImages", "#pBarDownloading", "#pBarDownloadingMessage", true);
}

function progressDownloading(btnElement, pBarElem, pBarMsgElem, done) {
    var btnDownload = $(btnElement);
    var downloadBar = $(pBarElem);
    var downloadingMessage = $(pBarMsgElem);

    if (!!done) {
        //hide progress bar & message
        downloadBar.hide();
        downloadingMessage.hide();

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
        downloadingMessage.show();
    }
}

function loadSearch() {
    var selectedLeagues = $('#league').val();
    var selectedProdTypes = $('#prod-type').val();

    //Check if we have to disable the loadSearch action (any filter selected?)
    var isDisabled = (!selectedProdTypes || selectedProdTypes.length < 0) && (!selectedLeagues || selectedLeagues.length < 0);

    if (!!isDisabled) {
        //Show message
        $("#msgSelectFilter").show();
        $("#msgSelectFilter").fadeTo(500, 1);
        setTimeout(function () {
            $("#msgSelectFilter").fadeTo(500, 0, function () {
                $('#msgSelectFilter').hide();
            });
        }, 5000);
    }
    else {

        leftData = [];
        rightData = [];

        //load records
        refreshGrid();
    }

}

function disableGetresultsBtn() {
    var selectedLeagues = $('#league').val();
    var selectedProdTypes = $('#prod-type').val();

    var isDisabled = (!selectedProdTypes || selectedProdTypes.length < 0) && (!selectedLeagues || selectedLeagues.length < 0);
    disableElement('btnLoadSearch', !!isDisabled);
}

function disableElement(elementId, isDisabled) {
    //Enable/Disable element
    $('#' + elementId).prop("disabled", isDisabled ? true : false);
    $('#' + elementId).css("opacity", isDisabled ? 0.5 : 1);
}