/**
 * Module Description
 * A quick way to remove or swap certain item from an assembly BOM, while preserving the other items on the BOM
 *
 * Version    Date            Author           Remarks
 * 1.00       07 Mar 2014     hakhtar
 *
 */

/**
 * Constants used in this utility
 */
var Constants = {
	MainScriptURL: "https://system.na3.netsuite.com/app/site/hosting/scriptlet.nl?script=62&deploy=1",
    Setting: {
        LoggingEnabled: false, //Log messages on console
        ShowAssocItem: false //Show associated items on UI for the selected item
    },
    Message: {
        SuccessfullySwapped: "{item1} & {item2} are successfully swapped within all BOMs",
        SureToRemove: "Are you sure you want to remove this item from all the BOMs?",
        AssocItemsRemoved: "Items have been removed from all BOMs",
        SureSwap: "This item is part of {count} BOMs, are you sure you want to swap?",
        WaitWhileProcessingRequest: "* Please wait while your request is being processed. This might take some time. Leaving the page before processing get completed will result in incomplete operation."
    },
    SavedSearch: {
        SearchMemberParent: "customsearch_search_member_parent"
    }
};

/**
 * Swap items in BOM as selected in lists
 */
function swap_associated_items() {
    logMethodStart(arguments.callee.name);

    var ddlItemList = document.getElementById('item_list');
    var ddlItemSwapList = document.getElementById('item_swap_list');
    var itemList = ddlItemList.options[ddlItemList.selectedIndex];
    var itemSwapList = ddlItemSwapList.options[ddlItemSwapList.selectedIndex];

    setTimeout(function () {
        var item_id = itemList.value;
        var item_swap_id = itemSwapList.value;

        log("itemID = " + item_id + ", itemSwapID = " + item_swap_id);

        if (!!item_id && !!item_swap_id && (item_id != item_swap_id)) {
            showProgressMessage(Constants.Message.WaitWhileProcessingRequest);

            var parentItems = getParentBOMItems(item_id);
            if (confirm(Constants.Message.SureSwap.replace("{count}", parentItems.length))) {
                parentItems.forEach(function (item) {
                    var currentRecord = nlapiLoadRecord(item.getRecordType(), item.getId());
                    for (var i = 1; i <= currentRecord.getLineItemCount('member'); i++) {
                        if (currentRecord.getLineItemValue('member', 'item', i) == item_id) {
                            oldQty = currentRecord.getLineItemValue('member', 'quantity', i);
                            currentRecord.setLineItemValue('member', 'item', i, item_swap_id);
                            currentRecord.setLineItemValue('member', 'quantity', i, oldQty);
                        }
                    }
                    nlapiSubmitRecord(currentRecord);
                });
                showMessage(Constants.Message.SuccessfullySwapped.replace("{item1}", itemList.text).replace("{item2}", itemSwapList.text));

                itemList.remove(); //remove the item from item list, since there would be no more records associated with that

                //Check if this swapped item is not in list, then add it
                if (!ddlItemList.options.contains(item_swap_id)) {
                    var temp_opt = document.createElement("option");
                    temp_opt.value = itemSwapList.value;
                    temp_opt.innerHTML = itemSwapList.text;
                    ddlItemList.appendChild(temp_opt); //Add this item from swap list to item list
                }
            }
        }
        showProgressMessage(null);
    }, 100);
}

/**
 * overload to Select options: Contains
 * @param zValue
 * @returns {Boolean} true if the value exists within select option(s), false otherwise
 */
HTMLOptionsCollection.prototype.contains = function (zValue) {
    for (var i = 0; i < this.length; i++) {
        if (this[i].value == zValue) {
            return true;
        }
    }
    return false;
};


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
        lastRecord = nlapiSearchRecord(null, Constants.SavedSearch.SearchMemberParent, [new nlobjSearchFilter('internalid', 'memberitem', 'is', itemId), new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId)]);
        if (lastRecord != null) {
            lastId = lastRecord[lastRecord.length - 1].getId(); //get internalID of last record
            savedSearch = savedSearch.concat(lastRecord); //Concatenate the just fetched records in a list
        }
    }
    while (!!lastRecord && context.getRemainingUsage() > 1); //while the records didn't lasts or the limit not reached!

    return savedSearch;
}

/**
 * Removes all associations from BOM, of currently selected item
 */
function remove_associated_items() {
    logMethodStart(arguments.callee.name);

    //Ask user before removing
    var bom_confirm = confirm(Constants.Message.SureToRemove);
    if (bom_confirm) { //Remove operation if user confirms
        var ddlItemList = document.getElementById('item_list');
        var selectedItem = ddlItemList.options[ddlItemList.selectedIndex];

        log("itemID = " + selectedItem.value);

        showProgressMessage(Constants.Message.WaitWhileProcessingRequest); //Tell user to wait while processing
        setTimeout(function () {
            var parentItems = getParentBOMItems(selectedItem.value);
            parentItems.forEach(function (item) {
                var currentRecord = nlapiLoadRecord(item.getRecordType(), item.getId());
                for (var i = 1; i <= currentRecord.getLineItemCount('member'); i++) {
                    if (currentRecord.getLineItemValue('member', 'item', i) == selectedItem.value) {
                        currentRecord.removeLineItem('member', i); //remove it from member items
                    }
                }
                nlapiSubmitRecord(currentRecord); //Save the record
            });
            showMessage(Constants.Message.AssocItemsRemoved); //show success message
            showProgressMessage(null);
            selectedItem.remove(); //remove the item from list
        }, 100);
    }

}

/**
 * Initialize functionality on page load
 */
(function () {
    var context = nlapiGetContext();
    context.getRemainingUsage = function () {
        return 1000;
    };

    
  //Make ajax request to get items for swap-list
    jQuery.ajax({
        type: "post",
        url: Constants.MainScriptURL + "&method=getItemsOfBOM"
    }).done(function(data){
            var objData = JSON.parse(data);
            log("item_list response: " + objData.Status);
            if(!!objData.Status && objData.Status == "OK") {
            	jQuery("<select />").attr({"id": "item_list", "onchange": "validateDropDown()"}).replaceAll("#div_bom_items");
                var optionsData = !!objData.OptionsForSelectItem ? JSON.parse(objData.OptionsForSelectItem) : null;

                //Sort and add items to select list
                sortRecords(optionsData).forEach(function (selectItemValue) {
                    jQuery('<option />').val(selectItemValue.Value).text(selectItemValue.Text).appendTo('#item_list');
                });
            }
            else {
                log("Error occurred while populating item list.");
                log(objData);
            }
        });

    //Make ajax request to get items for item-list
    jQuery.ajax({
        type: "post",
        url: Constants.MainScriptURL + "&method=getAllItems"
    }).done(function(data){
            var objData = JSON.parse(data);
            log("item_swap_list response: " + objData.Status);
            if(!!objData.Status && objData.Status == "OK") {
            	jQuery("<select />").attr({"id": "item_swap_list", "onchange": "validateDropDown()"}).replaceAll("#div_all_items");
                var optionsData = !!objData.OptionsForSelectItem ? JSON.parse(objData.OptionsForSelectItem) : null;
                

                //Sort and add items to select list
                sortRecords(optionsData).forEach(function (selectItemValue) {
                    jQuery('<option />').val(selectItemValue.Value).text(selectItemValue.Text).appendTo('#item_swap_list');
                });
            }
            else {
                log("Error occurred while populating item swap list.");
                log(objData);
            }
        });
})();


/**
 * Sorts the records by Text (name)
 * @param records
 * @returns sorted records
 */
function sortRecords(records) {
    logMethodStart(arguments.callee.name);
    if(!records)
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
    if (Constants.Setting.LoggingEnabled)
        console.log(message);
}

/**
 * Log the name of method called
 * @param calleeName
 */
function logMethodStart(calleeName) {
    log("Method called: " + calleeName);
}


/**
 * show message to user
 * @param message
 */
function showMessage(message) {
    logMethodStart(arguments.callee.name);

    alert(message);
}


/**
 * show IDs of BOM for the selected item, if this option is enabled
 * @param itemId
 */
function showAssociation(itemId) {
    logMethodStart(arguments.callee.name);

    if (Constants.Setting.ShowAssocItem) {
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

