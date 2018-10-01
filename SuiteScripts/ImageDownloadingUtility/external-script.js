var Constants = {
    api_url: "https://forms.na3.netsuite.com/app/site/hosting/scriptlet.nl?script=60&deploy=1&compid=3500213&h=a1af05a959f587d67ed9",
    request_method: navigator.appName.indexOf("Internet Explorer")!=-1 ? "GET" : "POST",
    Filters: {
    	teams: 'team',
    	leagues: 'league',
    	prodTypes: 'prod-type'
    },
    download_initializing_url: "https://support.sparowatch.com/imagedownloader/init_download.php",
    download_status_check_url: "https://support.sparowatch.com/imagedownloader/checkstatus.php",
    auth_token: "390ff82f-c9f3-4df6-9abe-95241c79e38d"
};

$(function() {
	var selectedLeagues = [];
	var intervalId = setInterval(
			function() {
				if(!!$('select[data-value="multiselect"]') && $('select[data-value="multiselect"]').length == 3) {
					$('select[data-value="multiselect"]').multiselect({
						selectedList : 2
					});

                    //Start with a team filter & GetResults button, disabled
                    $('#team').multiselect('disable');
				}

				if (!!$('#league') && $('#league').length > 0) {
					$('#league').multiselect({
						close : function() {
							selectedLeagues = $(this).val();

							$('#custpage_selectedleague')[0].value = JSON.stringify(selectedLeagues);
							$('#imgLoadingTeams').show();
							$.ajax({
								  url: Constants.api_url,
								  data: {method:"getTeamsByLeagueIds", leagueIds:JSON.stringify(selectedLeagues)}
								}).done(function( data ) {
								    var objData = JSON.parse(data);
								    if(objData.Result == "OK") {
							    		
								    	//Clear all the existing teams, no matter we got more teams or not
										$('#team option').remove();
										
										if(!!objData.teams) {
									    	var teams = JSON.parse(objData.teams);
									    	if(!!teams && teams.length > 0) {
									    		teams.forEach(function(team) {
													$('<option />').attr('value', team.value).text(team.name).appendTo('#team');
												});
									    	}
										}
								    }
								    
								    //Refresh the list or the newly added options would not be displayed
								    $('#team').multiselect('refresh');
								    $('#team').multiselect( $('#team option').length <= 0 ? 'disable' : 'enable' );
								    $('#imgLoadingTeams').hide();
								});
						}
					});
					clearInterval(intervalId);
				}
				
			}, 100);
	refreshGrid(true);
    refreshGridStyle();
});

$("#btnDownloadImages").button();
$("#btnLoadSearch").button();

function initializeGrid() {
	//Prepare jTable
	$('#searchResultContainer').jtable({
        title: 'Use the checkboxes to select images you wish to download.',
        paging: true,
		pageSize: 1000,
        clientBinding : true,
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
            thumbnail: {
                title: '<- Select All',
                width: '15%',
                display: function (data) {
                    return '<img src="'+ data.record.thumbnail +'" height="48px" width="70px" align="middle" />';
                }
            },
			itemnumber: {
				title: 'Item Number',
				width: '20%'
			},
			description: {
				title: 'Description',
				width: '45%'
			},
			upc: {
				title: 'UPC',
				width: '20%'
			}
		},
        selectionChanged: function(event, data) {
        	refreshGridStyle();
        },
        recordsLoaded: function(event, data) {
        	refreshGridStyle();
            fadeOutDiscontinuedItems();
        }
	});
}

function refreshGrid(isFirstLoad) {
	initializeGrid();

    //Load list from server, ignore if it is first time
    if(!isFirstLoad) {
    	loadData();
    }
}

function fadeOutDiscontinuedItems() {
    //Find item rows
    var itemRows = $("#searchResultContainer").find('.jtable-data-row');
    if(!!itemRows && itemRows.length > 0) {
        itemRows.each(function(row) {
            //Get data from each row
            var data = $(itemRows[row]).data('record');
            if(!!data) {
                //check if received is greater than or equal to quantity
                if(data.discontinued == "T") {
                    //Fade the row to pink color
                    $(itemRows[row]).css("background-color", "pink");
                }
            }
        });

    }
}

function loadData() {
	//Show loading records
    progressDownloading("#btnLoadSearch", "#pBarGetResults", "#pBarGetResultsMessage");
    $.ajax({
        url: getApiUrlWithFilters(),
        type: "GET"
        })
        .done(function(data){

            //A little hack, to make it proper JSON,
            // since for large data we have some commented text after data from server
            if(data.indexOf("<!--") >= 0)
                data = data.substr(data.indexOf("{\"Result"), data.indexOf("<!--"));

            var objData = JSON.parse(data);
            $('#searchResultContainer').jtable('loadClient', objData);
            
            //hide loading
            progressDownloading("#btnLoadSearch", "#pBarGetResults", "#pBarGetResultsMessage", true);
        });
}

function refreshGridStyle() {
	var selectedRows = $('#searchResultContainer').jtable('selectedRows');
	
	var isSelected = !!selectedRows && selectedRows.length > 0;

	//Enable/Disable download button
	disableElement('btnDownloadImages', !isSelected);
	
	var isScrollable = $("#searchResultContainer").height() > 400; //Since the parent div is 400px
	$("#searchResultContainer").css("overflow-y", isScrollable ? "scroll" : "hidden");
	$("#gridContainer").height(isScrollable ? "400" : $("#searchResultContainer").height());
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


function downloadImages(){
    var selectedRows = $('#searchResultContainer').jtable('selectedRows');
    if(!!selectedRows && selectedRows.length > 0) {
        var files = {};
        for (var i=0;i<selectedRows.length;i++)
        {
        	files[i] = $(selectedRows[i]).attr('data-record-key');
        }
        files = encodeURIComponent(JSON.stringify(files));

        progressDownloading("#btnDownloadImages", "#pBarDownloading", "#pBarDownloadingMessage");
        $.support.cors = true; //Enable CORS
        $.ajax({
            //Hack: Added reqid to make every response unique, or else IE will consider it a 304
            url: Constants.download_initializing_url + "?reqid=" + Math.floor((Math.random()*1000)+1),
            type: Constants.request_method,
            data: {
                auth_token: Constants.auth_token,
                files: files
            }})
            .fail(function(err) {
            	handleDownloadFail();
            })
            .done(function(data){
            	if(typeof data != "object")
            		data = JSON.parse(data);
                if(!!data && data.status == "OK") {
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

    if(eta == "0") {
        //Ready to download
        var url = postData.url;
        if(!!url && url.indexOf('.zip') >= 0) {
            //ensure if this contains .zip
            window.location.href = url;
        }
        handleDownloadSuccess();
    }
    else if(eta > "0") {
        setTimeout(function() {
            $.support.cors = true; //Enable CORS
            $.ajax({
                //Hack: Added reqid to make every response unique, or else IE will consider it a 304
                url: Constants.download_status_check_url + "?reqid=" + Math.floor((Math.random()*1000)+1),
                type: Constants.request_method,
                data: {
                    auth_token: Constants.auth_token,
                    folderName: uid
                }})
                .fail(function(err) {
                    handleDownloadFail();
                })
                .done(function(data){
                    if(typeof data != "object")
                        data = JSON.parse(data);
                    if(!!data && data.status == "OK") {
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
    progressDownloading("#btnDownloadImages", "#pBarDownloading", "#pBarDownloadingMessage", true);
}

function handleDownloadFail() {
	$( "#dialog-message" ).dialog('open');
    progressDownloading("#btnDownloadImages", "#pBarDownloading", "#pBarDownloadingMessage", true);
}

function progressDownloading(btnElement, pBarElem, pBarMsgElem, done) {
    var btnDownload = $(btnElement);
    var downloadBar = $(pBarElem);
    var downloadingMessage = $(pBarMsgElem);
    
    if(!!done) {
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
	
    if(!!isDisabled) {
    	//Show message
        $("#msgSelectFilter").show();
    	$("#msgSelectFilter").fadeTo(500, 1);
    	setTimeout(function() {
    		$("#msgSelectFilter").fadeTo(500, 0, function(){$('#msgSelectFilter').hide();});
    	}, 5000);
    }
    else {
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