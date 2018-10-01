/**
 * Module Description
 * A utility used to maintain customer item pricing in bulk.
 *
 * Version    Date            Author            Reviewer            Remarks
 * 1.00       11 Mar 2014     hakhtar           wahajahmed
 *
 */


var Constant = {
    ErrorMessage: "Some error has occured, please go back and try again.",
    MainForm: {
        Name: "Item Price Propagation",
        ClientScriptId: "customscript_ipp_cs",
        FieldId: {
            ProdType: "custpage_prodtype",
            Price: "custpage_price",
            IncludeCustomItems: "custpage_inc_custom_item",
            Customer: "custpage_customer",
            league: "custpage_customrecord5"
        },
        FieldSource: {
            ProdType: "customrecord_producttypes",
            League: "customrecord5"
        },
        FieldLabel: {
            ProdType: "Product Type",
            Price: "Price",
            IncludeCustomItems: "Include Custom Items When Adding Propagations",
            Customer: "Customer",
            league: "Leagues"
        }
    }
};

/**
 * Main method hit by GET/POST requests
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function main(request, response) {
    try {
        var context = nlapiGetContext();
        if(request.getMethod() == "POST") {
            var removeBtn = request.getParameter("remove_btn") || null;
            var removeAllBtn = request.getParameter("remove_all_btn") || null;

            var data = {
                ProdType: request.getParameter(Constant.MainForm.FieldId.ProdType),
                CustomerId: request.getParameter(Constant.MainForm.FieldId.Customer),
                IncludeCustomItems: !!request.getParameter(Constant.MainForm.FieldId.IncludeCustomItems) &&
                request.getParameter(Constant.MainForm.FieldId.IncludeCustomItems) == "T" ? true : false,
                Price: request.getParameter(Constant.MainForm.FieldId.Price),
                league:request.getParameter(Constant.MainForm.FieldId.league)
            };
            var LeagueArray=(data.league).split("\u0005");
           // nlapiLogExecution("DEBUG", "data", LeagueArray[1]);


            nlapiLogExecution("DEBUG", "data", JSON.stringify(data));


            var filterItem = [];

            if (!!data.ProdType) {
                filterItem.push(new nlobjSearchFilter('custitem_prodtype', null, 'is', data.ProdType));
            }

            /*
             Previously only active items' pricing is being removing. No after change described in link below,
             https://folio3alpha.basecamphq.com/projects/10954509-rico-netsuite-customization/posts/83786557/comments#comment_299235647
             we have to remove pricing of inactive items too
             */
            if (!removeBtn) {
                filterItem.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            }
            if(!!data.league) {
                //added by ahmed
                filterItem.push(new nlobjSearchFilter('custitem1', null, 'anyof',LeagueArray));
            }

            //Check if we don't need to include the custom items
            //Dont consider custom item check at time of removal
            if (!removeBtn && !data.IncludeCustomItems) {
                filterItem.push(new nlobjSearchFilter('custitem_custom', null, 'is', "F"));
            }

            //Get list of items matching the above criterion
            var items = [], itemIds = [], lastId = 0, batchRecords = null, filterLength = filterItem.length;
            do {
                filterItem[filterLength] = new nlobjSearchFilter("internalidnumber", null, "greaterthan", lastId);
                batchRecords = nlapiSearchRecord('item', null, filterItem, [(new nlobjSearchColumn('internalid')).setSort()]);
                if (batchRecords != null) {
                    batchRecords.forEach(function(recrd) {
                        itemIds.push(recrd.getId());
                    });
                    lastId = batchRecords[batchRecords.length - 1].getId(); //get internalID of last record
                    //TODO: This items & batchRecords are not being used, remove it
                    items = items.concat(batchRecords); //Concatenate the just fetched records in a list
                }
            }
            while(!!batchRecords && context.getRemainingUsage() > 1 && batchRecords.length == 1000); //while the records didn't lasts or the limit not reached! and we expect more records

            nlapiLogExecution("DEBUG", "fetched all items", JSON.stringify(itemIds));

            var customer = nlapiLoadRecord("customer", data.CustomerId);
            nlapiLogExecution("DEBUG", "customer loaded", customer);
            if (!!customer) {

                nlapiLogExecution("DEBUG", "item pricing count", customer.getLineItemCount('itempricing'));
                //If form is submitted using "remove" button or "remove all" button
                if ((!!removeBtn || !!removeAllBtn) && customer.getLineItemCount('itempricing') > 0) {
                    for (var i = customer.getLineItemCount('itempricing'); i >= 1; i--) {
                        // remove item if "Remove All" button is pressed or item contains in list of selected item ids ("remove" button case)
                        if (!!removeAllBtn || itemIds.indexOf(customer.getLineItemValue('itempricing', 'item', i)) >= 0) { //Item already exists in customer item pricing
                            customer.removeLineItem('itempricing', i);
                        }
                    }
                    nlapiSubmitRecord(customer); //Save this record
                }
                else if (!removeBtn && !removeAllBtn) {
                    if (customer.getLineItemCount('itempricing') > 0) {
                        //If some items already exists in item-pricing
                        for (var i = 1; i <= customer.getLineItemCount('itempricing'); i++) {
                            if (itemIds.indexOf(customer.getLineItemValue('itempricing', 'item', i)) >= 0) { //Item already exists in customer item pricing
                                customer.setLineItemValue('itempricing', 'level', i, '-1'); //-1 => custom level
                                customer.setLineItemValue('itempricing', 'price', i, data.Price);
                                itemIds.splice(itemIds.indexOf(customer.getLineItemValue('itempricing', 'item', i)), 1); //Delete this item from the list
                            }
                        }
                    }
                    var lineNum = customer.getLineItemCount('itempricing') + 1;
                    nlapiLogExecution("DEBUG", "line Num = " + lineNum);
                    itemIds.forEach(function(itemId) {
                        customer.setLineItemValue('itempricing', 'item', lineNum, itemId);
                        customer.setLineItemValue('itempricing', 'level', lineNum, '-1'); //-1 => custom level
                        customer.setLineItemValue('itempricing', 'price', lineNum++, data.Price);
                    });
                    nlapiSubmitRecord(customer, false, true); //Save this record
                }
            }
        }

        //Create form
        var form = nlapiCreateForm(Constant.MainForm.Name, false);
        form.setScript(Constant.MainForm.ClientScriptId);
        form.addField(Constant.MainForm.FieldId.ProdType, "select", Constant.MainForm.FieldLabel.ProdType, Constant.MainForm.FieldSource.ProdType);
        form.addField(Constant.MainForm.FieldId.Customer, "select", Constant.MainForm.FieldLabel.Customer, "customer");
        form.addField(Constant.MainForm.FieldId.league, "multiselect", Constant.MainForm.FieldLabel.league, Constant.MainForm.FieldSource.League);//added by ahmed
        form.addField(Constant.MainForm.FieldId.IncludeCustomItems, "checkbox", Constant.MainForm.FieldLabel.IncludeCustomItems);
        form.addField(Constant.MainForm.FieldId.Price, "currency", Constant.MainForm.FieldLabel.Price);

        form.addSubmitButton("Run");
        form.addButton("custpage_removebtn", "Remove", "jQuery('<input />').attr({'id':'remove_btn', 'name': 'remove_btn', 'value':'true', 'type':'hidden'}).appendTo('#main_form');jQuery('#main_form').submit();");
        form.addButton("custpage_remove_all_btn", "Remove All Customer Propagations", "jQuery('<input />').attr({'id':'remove_all_btn', 'name': 'remove_all_btn', 'value':'true', 'type':'hidden'}).appendTo('#main_form');jQuery('#main_form').submit();");

        //Write the above form on page
        response.writePage(form);
    }
    catch(e) {
        //Error occurred
        nlapiLogExecution("ERROR", e.name, e.message);
        response.write(Constant.ErrorMessage);
    }
}

