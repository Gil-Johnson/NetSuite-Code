/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       08 Apr 2014     ubaig
 *
 */


var Constants = Constants || {};

Constants.Netsuite = {
        SavedSearch: {
            CustomLeagueSearch: "customsearch_itemsthatcanbeonsalesorde_7",
            CustomProdTypeSearch: "customsearch_itemsthatcanbeonsalesorde_8"
        },
        ItemField: {
            League1: "custitem1",
            ProductType: "custitem_prodtype"
        }
    };

function custom_init(){

    Constants.Netsuite = {
        SavedSearch: {
            CustomLeagueSearch: "customsearch_itemsthatcanbeonsalesorde_7",
            CustomProdTypeSearch: "customsearch_itemsthatcanbeonsalesorde_8"
        },
        ItemField: {
            League1: "custitem1",
            ProductType: "custitem_prodtype"
        }
    };
}

var is_content_loaded = false;

(function () {
    // Load the script

    logMessage("D105");

	//var script = document.createElement("SCRIPT");
    //script.src = '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js';
    //script.type = 'text/javascript';
    //document.getElementsByTagName("head")[0].appendChild(script);

    script = document.createElement("SCRIPT");
    script.src = '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName("head")[0].appendChild(script);

    /////////////////////////////////
    script = document.createElement("link");
    script.href = '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css';
    script.rel = 'stylesheet';
    document.getElementsByTagName("head")[0].appendChild(script);


    // Poll for jQuery to come into existance
    var checkReady = function (callback) {
        if (window.jQuery) {
            callback(jQuery);
        }
        else {
            window.setTimeout(function () {
                checkReady(callback);
            }, 100);
        }
    };

    // Start polling...
    checkReady(function (jQuery) {
        // Use $ here...

        is_content_loaded = true;

    });
})();


/*
 * This function is called when custom add button is clicked.
 * */
function customAddButtonClick() {

	loadHtml();
	
    jQuery('a.zoom').easyZoom();

    //Disable the scrolling
    disable_scroll();

	//Lets delete this custom jQuery to make our popup look as intended
	jQuery("link[href='/core/media/media.nl?id=1803&c=3500213&h=d83ff76d2b3fb0727e81&mv=hkndns60&_xt=.css']").attr("href", "");
	
	//var closeUsingBtn = true;
    jQuery('#dialog-message').dialog({
        modal: true,
        draggable: true,
        resizable: false,
        position: ['center', 'top'],
        show: 'blind',
        hide: 'blind',
        width: "75%", //Lets keep it relative
        dialogClass: 'ui-dialog-osx',
        buttons: {
            'Add': function () {
                addSelectedItems();
            },
            'Close': function () {
				//closeUsingBtn = false;
                onDialogClose(jQuery(this));
            }
        },
		beforeClose: function(e) {
			//call our custom event handler
			//if(!!closeUsingBtn)
				//return onDialogClose($(this), true);
		},
        close: function() {
            //Enable the scroll
            enable_scroll();
			
			//Add this href to the link which doesnt have any href. Bad workaround, but lets take it as a last hope :p
			//And on NS, workaround is the only work-around :)
			jQuery("link[href='']").attr("href", "/core/media/media.nl?id=1803&c=3500213&h=d83ff76d2b3fb0727e81&mv=hkndns60&_xt=.css");

			//Reset all filters
			jQuery('#league').multiselect('uncheckAll');
			jQuery('#team').multiselect('uncheckAll');
			jQuery('#prod-type').multiselect('uncheckAll');

            //Reset grid
            jQuery('#searchResultContainer').jtable('loadClient', {Records:[],TotalRecordCount:0});
            jQuery('#searchResultRightContainer').jtable('loadClient', {Records:[],TotalRecordCount:0});
        }
    });
	
	//Hack: Modal popup not getting the background to be completely grey-out
	jQuery("div.ui-widget-overlay").css("background", "url('images/ui-bg_flat_0_aaaaaa_40x100.png') repeat-x scroll 50% -100% #AAAAAA");
}

function onDialogClose(dlg){

    var confirmationResponse = true;
    if (!!rightData && rightData.Records.length > 0) {
        confirmationResponse = confirm('There are items that have not been added yet. Do you want to close the window anyway?');
    }

    if (confirmationResponse === true){
        dlg.dialog('close');
    }
}

function addSelectedItems() {

    var selectedRows = jQuery('#searchResultRightContainer').find('.jtable-data-row'); //jQuery('#searchResultRightContainer').jtable('selectedRows');

    if (!selectedRows || selectedRows.length <= 0) {
        alert('Please select at least one item in right pane.');
        return;
    }

    if (!!selectedRows && selectedRows.length > 0) {
        var files = {};

        var rec = {};
        rec["Records"] = [];

        for (var i = 0; i < selectedRows.length; i++) {

            //for getting data from the HTML UI
            //$(selectedRows[i]).data('record')
            //push the data in the records
            var data = jQuery(selectedRows[i]).data('record');

            //get the latest value from the textbox
            data.available = jQuery(selectedRows[i]).find('.right-quantity-input').val();
            if(data.available == 0) {
                alert("The quantity should be set before you add these items.");
                return false;
            }
            rec["Records"].push(data);
        }

        //TODO: Here we can use rec.Records property to set back that in NetSuite

        jQuery(rec.Records).each(function(index, record) {
            nlapiSelectNewLineItem('item');
            nlapiSetCurrentLineItemValue('item', 'item', record.internalid, true, true);
            nlapiSetCurrentLineItemValue('item', 'quantity', record.available, true, true);
            //nlapiSetCurrentLineItemValue('item','price','-1', true, true);
            //nlapiSetCurrentLineItemValue('item', 'rate', '0', true, true);
            nlapiCommitLineItem('item');
        });

        moveLeftInternal(false);
    }


}

function moveRight(onSelectChange) {
    var selectedRows = jQuery('#searchResultContainer').jtable('selectedRows');
    var currentRows = [];
    //Check all rows, if quantity not available, show message and return error
    /*for (var i = 0; i < selectedRows.length; i++) {
        var rowData = jQuery(selectedRows[i]).data('record');
        if(!isNumber(rowData.available) || rowData.available == 0) {
            alert("There are unavailable items in your selection, please review your selection and try again.");

            // Unselect all
            //$('#searchResultContainer .jtable-row-selected').removeClass('jtable-row-selected');
            //$('#searchResultContainer input[type=checkbox]').removeAttr('checked');
            return false;
        }
    }*/


    if(!!onSelectChange) {
        if(!!selectedRows && selectedRows.length > 1) {
            onSelectChange = false;
            var countActiveRows = 0;
            for(var i =0; i<selectedRows.length;i++) {
                if(selectedRows[i].style.display.indexOf("none") == -1) {
                    currentRows.push(selectedRows[i]);
                    countActiveRows++;
                }
            }

            if(countActiveRows > 1)
                onSelectChange = true;
        }
        else if(!!selectedRows && selectedRows.length == 1) {

            onSelectChange = true;

            var rec = {
                TotalRecordCount: 0,
                Records: []
            };

            currentRows.push(selectedRows[0]);
            selectedRows = selectedRows[0];

            //push the data in the records
            var rowData = jQuery(selectedRows).data('record');
            rec["Records"].push(rowData);

            jQuery(selectedRows).attr('left-item-index', rowData.internalid);

            //remove this row from the left table
            jQuery(selectedRows).hide();


            rec.TotalRecordCount = rec.Records.length;

            if (!!rightData) {
                rightData = quantityZero(rec);
            }

            jQuery('#searchResultRightContainer').jtable('loadClient', rightData);
        }
    }
    if(!onSelectChange) {
        if (!!selectedRows && selectedRows.length > 0) {

            var rec = {
                TotalRecordCount: 0,
                Records: []
            };

            if(currentRows.length > 0) {
                selectedRows = currentRows;
            }

            for (var i = 0; i < selectedRows.length; i++) {

                //for getting data from the HTML UI
                //$(selectedRows[i]).data('record')
                //push the data in the records
                var rowData = jQuery(selectedRows[i]).data('record');
                rec["Records"].push(rowData);

                jQuery(selectedRows[i]).attr('left-item-index', rowData.internalid);

                //remove this row from the left table
                jQuery(selectedRows[i]).hide();

            }

            rec.TotalRecordCount = rec.Records.length;

            if (!!rightData && currentRows.length <= 0) {
                //rightData = quantityZero(rec);
                var tempRec = quantityZero(rec);

                tempRec.Records.forEach(function(tRec) {
                    rightData.Records.filter(function(e){
                        if(e.internalid == tRec.internalid) {
                            tRec.available = e.available;
                        }
                    });
                });

                rightData = tempRec;

            }

            else {
                rightData.Records = rightData.Records.concat(quantityZero(rec).Records);
                rightData.TotalRecordCount += rec.Records.length;
            }

            jQuery('#searchResultRightContainer').jtable('loadClient', rightData);
        }
    }
}

function quantityZero(record) {
    //Clone the original object
    var copy = jQuery.extend(true, {}, record);

    for(var i in copy.Records) {
        copy.Records[i].available = "0";
    }
    return copy;
}

function resetRightData(){
    var data = [];

    rightData = {
        TotalRecordCount: data.length,
        Records: data
    };

    //reload the grid now
    refreshRightData();
}

function refreshRightData(){
    try {
        jQuery('#searchResultRightContainer').jtable('loadClient', rightData);

        hideDuplicateDataRows();
    }
    catch (e) {

    }
}
/*
 showRowsOnLeft: if true, it makes rows from left available.
* */
function moveLeftInternal(showRowsOnLeft, existingRows) {

    var selectedRows = jQuery('#searchResultRightContainer').find('.jtable-data-row');// $('#searchResultRightContainer').jtable('selectedRows');

    //if rows have been passed to us, then we will use those rows.
    if (!!existingRows && existingRows.length > 0)
        selectedRows = existingRows;

    if (!!selectedRows && selectedRows.length > 0) {

        for (var i = 0; i < selectedRows.length; i++) {

            var tableRow = selectedRows[i];
            //for getting data from the HTML UI
            //$(selectedRows[i]).data('record')
            //push the data in the records
            var rowData = jQuery(tableRow).data('record');

            var row = jQuery("[left-item-index=" + rowData.internalid + "]");
            row.show();

            row.removeClass('jtable-row-selected');

            if (showRowsOnLeft === true) {
                //jQuery('#searchResultContainer').find('.jtable-row-selected').removeClass('jtable-row-selected');
                //row.removeClass('jtable-row-selected');
                //row.show();
            }
            else {
                row.remove();
            }

            var internalId = rowData.internalid;
            jQuery('#searchResultRightContainer').jtable('deleteRecord', {
                key: internalId,
                clientOnly: true
            });

            rightData.Records = rightData.Records.filter(function (obj) {
                return obj.internalid !== internalId;
            });

            rightData.TotalRecordCount = rightData.Records.length;
        }

        for (var i = 0; i < selectedRows.length; i++) {
            jQuery(selectedRows[i]).remove();
        }


        refreshRightData();

        hideDuplicateDataRows();
    }
}

function hideDuplicateDataRows(){
    var dataRowLen = jQuery('#searchResultRightContainer').find('.jtable-no-data-row').length;
    for (var i = 0; i <= dataRowLen - 1; i++) {
        //remove duplicate
        jQuery(jQuery('#searchResultRightContainer').find('.jtable-no-data-row')[i]).remove();
    }

    if(rightData.TotalRecordCount == 1 && jQuery('#searchResultRightContainer').find('.jtable-data-row').length > 1) {
        refreshRightData();
    }
}

function moveLeft() {
    moveLeftInternal(true);
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function setPrice(){

    var price = jQuery('#custpage_setprice').val();

    if(isNumber(price) === false) {
        alert('price should be a number');
        return;
    }

    jQuery(rightData.Records).each(function(index, item) {
        item.price = price;
    });
}

function setQuantity() {
    var quantity = jQuery('#custpage_setquantity').val();

    if(isNumber(quantity) === false) {
        alert('quantity should be a number.');
        return;
    }

    //To be shown on UI
    jQuery('.right-quantity-input').val(quantity);

    //For backend
    rightData.Records.forEach(function(rec) {
        rec.available = quantity;
    });
}

function loadHtml() {

    logMessage("D102");

    var checkReady = function (callback) {
        if (is_content_loaded) {
            callback();
        }
        else {
            window.setTimeout(function () {
                checkReady(callback);
            }, 100);
        }
    };

    // Start polling...
    checkReady(function () {
        // Use $ here...

        if(jQuery && jQuery('#dialog-message').length <= 0) {
            var html = getHtmlContent(); // '<div id="dialog-message" style="display: none;" title="Important information"><span class="ui-state-default"><span class="ui-icon ui-icon-info" style=" float:left; margin:0 7px 0 0;"></span></span><div style="margin-left: 23px;"><p>We\'re closed during the winter holiday from 21st of December, 2010 until 10th of January 2011.<br /><br />Our hotel will reopen at 11th of January 2011.<br /><br />Another line which demonstrates the auto height adjustment of the dialog component.</p></div></div>';

            window.jQuery(html).appendTo('body');
            logMessage("D101");
        }
        else {
            logMessage("D100");
        }

    });


}


function getHtmlContent() {
    try {
        logMessage("D103");
        //multiselect.css is pasted directly on code
        //
        var htmlDependencies = "";

        /*jQuery UI*/
        htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=323167&c=3500213&h=ae2dfd1c1da642d3226f&_xt=.js'></script>";

        /*xdr.js*/
        htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=323166&c=3500213&h=406eacfb22896fbcf88b&_xt=.js'></script>";

        /*jQuery Multiselect*/
		htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=323167&c=3500213&h=ae2dfd1c1da642d3226f&_xt=.js'></script>";
//
//		/* jquery.jtable.min.js */
        htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=323168&c=3500213&h=f6f29c843dcd0a472094&_xt=.js'></script>";
//		
//		//jquery.jtable.clientbinding.js
        htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=323169&c=3500213&h=6270d45d8d55e2b9c1d0&_xt=.js'></script>";
//		
//		/*external-script*/
        htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=322656&c=3500213&h=212b94126bcf7edd252a&_xt=.js'></script>";

        //this is our HTML content
        var indexPage = nlapiRequestURL('https://system.na3.netsuite.com/core/media/media.nl?id=322651&c=3500213&h=fb263073a341a0f7b10b&_xt=.html');
        var indexPageValue = indexPage.getBody();

        if (!Constants.Netsuite) {
            custom_init();
        }
        var leagues = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.CustomLeagueSearch);
        var leaguesSelectHtml = addMultiselectDropdown('Leagues', 'league', leagues, Constants.Netsuite.ItemField.League1);

        var teamSelectHtml = addMultiselectDropdown('Teams', 'team', null);

        var prodTypes = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.CustomProdTypeSearch);
        var prodTypeHtml = addMultiselectDropdown('Product Type', 'prod-type', prodTypes, Constants.Netsuite.ItemField.ProductType);

        indexPageValue = indexPageValue.replace('#LEAGUES#', leaguesSelectHtml)
            .replace('#TEAMS#', teamSelectHtml)
            .replace('#PROD_TYPE#', prodTypeHtml);

        var finalHtml = htmlDependencies + indexPageValue;

        return finalHtml;
    }
    catch (e) {
        //Show error for now
        return ("Error: " + e.name + ", " + e.message);
    }
}


function addMultiselectDropdown(label, id, searchResults, fieldNameToGet) {
    var html = "<select data-value='multiselect' multiple='multiple' id='" + id + "' name='" + id + "' size='5'>";
    if (!!searchResults) {
        searchResults.forEach(function (searchResult) {
            if (!!fieldNameToGet)
                html += ("<option value='" + searchResult.getValue(fieldNameToGet, null, 'group') + "'>" + searchResult.getText(fieldNameToGet, null, 'group') + "</option>");
            else
                html += ("<option value='" + searchResult.getId() + "'>" + searchResult.getValue('name') + "</option>");
        });
    }
    else {
        //Do nothing
    }
    html += "</select>";
    return html;
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function msoClientPageInit(type) {

    try {
		//hide original add multiple item button
		//jQuery('#tbl_item_addmultiple').hide();

    var fieldValue = nlapiGetFieldValue('entity');

    var button = document.getElementById('custpage_add_multiple');

    button.disabled = (!!fieldValue && fieldValue.length > 0 ) == false;

		//loadHtml();	
	}
	catch (e) {
		//do nothing.
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function msoClientSaveRecord() {

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function msoClientValidateField(type, name, linenum) {

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function msoClientFieldChanged(type, name, linenum) {
    if (name == 'entity') {
        var fieldValue = nlapiGetFieldValue(name);

        var button = document.getElementById('custpage_add_multiple');

        button.disabled = (!!fieldValue && fieldValue.length > 0 ) == false;
    }
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function msoClientPostSourcing(type, name) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function msoClientLineInit(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function msoClientValidateLine(type) {

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function msoClientRecalc(type) {

}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function msoClientValidateInsert(type) {

    return true;
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function msoClientValidateDelete(type) {

    return true;
}


// left: 37, up: 38, right: 39, down: 40,
// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36

//Not not disabling arrow keys, since user might have to use them while adding quantity

var keys = [33,34,35,46];//[37, 38, 39, 40];

function preventDefault(e) {
    e = e || window.event;
    if (e.preventDefault)
        e.preventDefault();
    e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

//Wheel is also used to traverse the list.. :(
//Add a check to see the effecting area of scroll then decide either to prevent or not

function wheel(e) {
    //preventDefault(e);
}

function disable_scroll() {
    if (window.addEventListener) {
        window.addEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = wheel;
    document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;
}

function logMessage(message) {
    console.log(message);
}