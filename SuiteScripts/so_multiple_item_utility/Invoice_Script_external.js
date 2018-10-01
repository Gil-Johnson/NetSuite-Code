/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       09 Apr 2014     ubaig
 *
 */

var Constants = Constants || {};




Constants.api_url = "https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=79&deploy=1";
Constants.request_method = navigator.appName.indexOf("Internet Explorer") != -1 ? "GET" : "POST";
Constants.Filters = {
    teams: 'team',
    leagues: 'league',
    prodTypes: 'prod-type'
};



var leftData = [];
var rightData = [];

jQuery(function () {
    var selectedLeagues = [];
    var intervalId = setInterval(
        function () {
            if (!!jQuery('select[data-value="multiselect"]') && jQuery('select[data-value="multiselect"]').length == 3) {
                jQuery('select[data-value="multiselect"]').multiselect({
                    selectedList: 2
                });

                //Start with a team filter & GetResults button, disabled
                jQuery('#team').multiselect('disable');
            }

            if (!!jQuery('#league') && jQuery('#league').length > 0) {
                jQuery('#league').multiselect({
                    close: function () {
                        selectedLeagues = jQuery(this).val();

                        jQuery('#custpage_selectedleague')[0].value = JSON.stringify(selectedLeagues);
                        jQuery('#imgLoadingTeams').show();
                        jQuery.ajax({
                            url: Constants.api_url,
                            data: {method: "getTeamsByLeagueIds", leagueIds: JSON.stringify(selectedLeagues)}
                        }).done(function (data) {
                                var objData = JSON.parse(data);
                                if (objData.Result == "OK") {

                                    //Clear all the existing teams, no matter we got more teams or not
                                    jQuery('#team option').remove();

                                    if (!!objData.teams) {
                                        var teams = JSON.parse(objData.teams);
                                        if (!!teams && teams.length > 0) {
                                            teams.forEach(function (team) {
                                                jQuery('<option />').attr('value', team.value).text(team.name).appendTo('#team');
                                            });
                                        }
                                    }
                                }

                                //Refresh the list or the newly added options would not be displayed
                                jQuery('#team').multiselect('refresh');
                                jQuery('#team').multiselect(jQuery('#team option').length <= 0 ? 'disable' : 'enable');
                                jQuery('#imgLoadingTeams').hide();
                            });
                    }
                });
                clearInterval(intervalId);
            }

        }, 100);
    refreshGrid(true);
});

jQuery("#btnLoadSearch").button();

function initializeGrid() {
    //Prepare jTable
    jQuery('#searchResultContainer').jtable({
        title: 'Choose Items',
        paging: true,
        pageSize: 1000,
        clientBinding: true,
        selecting: true, //Enable selecting
        multiselect: true, //Allow multiple selecting
        //selectingCheckboxes: true, //Show checkboxes on first column
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
                title: 'Thumbnail',
                width: '15%',
                display: function (data) {
                    return '<img onmouseover="bigImg(this)" onmouseout="normalImg(this)" data-large="' + data.record.mainimage + '"  src="' + data.record.thumbnail + '" height="48px" width="70px" align="middle" alt="Product Image" />';
                }
            },
            itemnumber: {
                title: 'Item',
                width: '20%'
            },
            description: {
                title: 'Description',
                width: '50%'
            },
            available: {
                title: 'Available',
                width: '15%'
            }
        },
        selectionChanged: function (event, data) {
            refreshGridStyle();
            moveRight(true);
        },
        recordsLoaded: function (event, data) {
            refreshGridStyle();
        }
    });
}

function bigImg(img) {
    var e = event;
    var objImage = jQuery(img);

    var largeImage = objImage.attr('data-large');

    if (!!largeImage && largeImage.length > 0 ) {
        var myDiv = '<div id="easy_zoom"><img id="easy_zoom_image" src="' + largeImage + '" style="max-width: 100%;max-height: 100%;"></div>';

        //remove any existing
        jQuery('#easy_zoom').remove();

        jQuery(document.body).append(myDiv);

        jQuery('#easy_zoom').css('left', (e.pageX + 20).toString() + "px");
        jQuery('#easy_zoom').css('top', (e.pageY - 100).toString() + "px");

    }
}

function normalImg(x)
{
 jQuery('#easy_zoom').remove();
}


function initializeResultGrid() {
    //Prepare jTable
    jQuery('#searchResultRightContainer').jtable({
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
                width: '30%'
            },
            available: {
                title: 'Quantity',
                edit: true,
                width: '20%',
                display: function (data) {
                    return '<input type="text" name="available" onchange="validateQuantity(this)" data-val="' + data.record.internalid  + '" style="width: 50px;text-align: right;" class="right-quantity-input" value="' + data.record.available + '" />';
                }
            },
            remove: {
                title: '',
                width: '10%',
                display: function (data) {
                    return '<img src="https://system.netsuite.com/core/media/media.nl?id=323164&c=3500213&h=340c79c55dddc317cafa" data-val="' + data.record.internalid  + '" style="text-align: right;" onclick="onRemoveClick(this)"  title="Remove" />';
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
    var quantity = jQuery(txt).val();

    if(isNumber(quantity) === false) {
        jQuery(txt).val('0');
        alert('quantity should be a number.');
        return;
    }

    //Update right data as well
    rightData.Records.forEach(function(dt) {
        if(dt.internalid == jQuery(txt).attr('data-val'))
            dt.available = quantity;
    });
}


function onRemoveClick(obj) {
    var btn = jQuery(obj);
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
    else {
        jQuery("#searchResultContainer .jtable-no-data-row").hide();
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
        jQuery('#searchResultContainer').jtable('loadClient', leftData);
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
        jQuery('#searchResultRightContainer').jtable('loadClient', rightData);
    }
    catch (e) {

    }
}

function loadData() {
    //Show loading records
    progressDownloading("#btnLoadSearch", "#pBarGetResults", "#pBarGetResultsMessage");
    jQuery.ajax({
        url: getApiUrlWithFilters(),
        type: "GET"
    })
        .done(function (data) {

            //A little hack, to make it proper JSON,
            // since for large data we have some commented text after data from server
            if (data.indexOf("<!--") >= 0)
                data = data.substr(data.indexOf("{\"Result"), data.indexOf("<!--"));

            leftData = JSON.parse(data);

            jQuery('#searchResultContainer').jtable('loadClient', leftData);

            //hide loading
            progressDownloading("#btnLoadSearch", "#pBarGetResults", "#pBarGetResultsMessage", true);
        });
}

function refreshGridStyle() {
    var selectedRows = jQuery('#searchResultContainer').jtable('selectedRows');

    var isSelected = !!selectedRows && selectedRows.length > 0;

    var isScrollable = jQuery("#searchResultContainer").height() > 400; //Since the parent div is 400px
    jQuery("#searchResultContainer").css("overflow-y", isScrollable ? "scroll" : "hidden");
    jQuery("#gridContainer").height(isScrollable ? "400" : Math.max(jQuery("#searchResultContainer").height(), 400));

    hidePageInfo();
}

function hidePageInfo(){
    jQuery('.jtable-page-info').hide();
}

function getApiUrlWithFilters() {
    var url = Constants.api_url + "&method=searchTable";

    var selectedTeams = jQuery('#team').val();
    var selectedProdTypes = jQuery('#prod-type').val();
    var selectedLeagues = jQuery('#league').val();
    var itemNameTxt = jQuery('#txtItemName').val();

    url += "&teams=" + selectedTeams;
    url += "&producttypes=" + selectedProdTypes;
    url += "&leagues=" + selectedLeagues;
    url += "&itemName=" + itemNameTxt;

    return url;
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
            jQuery.ajax({
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
}

function handleDownloadFail() {
    jQuery("#dialog-message").dialog('open');
}

function progressDownloading(btnElement, pBarElem, pBarMsgElem, done) {
    var downloadingMessage = jQuery(pBarMsgElem);

    if (!!done) {
        //hide progress bar & message
        downloadingMessage.hide();
        if(jQuery("#searchResultContainer").find('.jtable-data-row').length > 0) {
            jQuery("#searchResultContainer .jtable-no-data-row").hide();
        }
        else {
            jQuery("#searchResultContainer .jtable-no-data-row").show();
        }
    }
    else {
        jQuery("#searchResultContainer .jtable-no-data-row").hide();
        downloadingMessage.show();
    }
}

function loadSearch() {
    var selectedLeagues = jQuery('#league').val();
    var selectedProdTypes = jQuery('#prod-type').val();
    var itemNameTxt = jQuery('#txtItemName').val();

    //Check if we have to disable the loadSearch action (any filter selected?)
    var isDisabled = (!selectedProdTypes || selectedProdTypes.length < 0) && (!selectedLeagues || selectedLeagues.length < 0)
        && !itemNameTxt;

    if (!!isDisabled) {
        //Show message
        jQuery("#msgSelectFilter").show();
        jQuery("#msgSelectFilter").fadeTo(500, 1);
        setTimeout(function () {
            jQuery("#msgSelectFilter").fadeTo(500, 0, function () {
                jQuery('#msgSelectFilter').hide();
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
