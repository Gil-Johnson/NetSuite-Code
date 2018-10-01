function customFulfillmentForm(req, res){
    var tranId =  null;
    
    // get transaction id from query string
    tranId = req.getParameter(COMMON.PARAMETER_CUST_TRANID_ID);
    
    if(isValidValue(tranId)){
        // get search result of transaction having ID = tranId
        var result = getSearchResult(tranId);
        
        if(result!=null){
            var custForm = null;
            var sublist = null;
            var tranType = null;
            var resultJSON = [];
            var tempResult = [];
            // get record type
            tranType = result[0].getRecordType();
            // create form to display
            custForm = nlapiCreateForm('Item Fulfillment');
            // add sublist into the form
            sublist = custForm.addSubList(COMMON.SUBLIST_ITEMS_ID, 'inlineeditor', 'Items');
            // add cloumns in sublist
            addColumnsInSublist(sublist);
            
            if(tranType == 'salesorder'){
                var soObj = nlapiLoadRecord('salesorder', tranId);
                // get JSON
                tempResult = convertToJSON(result,soObj);
                // get sorted array
                resultJSON = getResult(tempResult);
                addLinesInSublist(sublist, resultJSON, tranType);
            }else if(tranType == 'itemfulfillment'){
                var fulObj = nlapiLoadRecord('itemfulfillment', tranId);
                // get JSON
                tempResult = convertFulFillmentToJSON(fulObj);
                // get sorted array
                resultJSON = getResult(tempResult);
                addLinesInSublist(sublist, resultJSON, tranType);
            }
            custForm.addSubmitButton('Apply');
            custForm.setScript(COMMON.CLIENT_SCRIPT_ID);
            res.writePage(custForm);
        }
    }else{
        // popup window is closed when suitelet call with no tranId
        var custForm = nlapiCreateForm('Form Closed');
        var f = custForm.addField(COMMON.CUST_SCRIPT_ID,'inlinehtml','');
        var script = '<script type="text/javascript">';
        script += 'window.close();';
        script += '</script>';
        f.setDefaultValue(script);
        res.writePage(custForm);
    }
}

/* This function takes two parameters search result and sales order object
   and create two sorted json array and return it */
function convertToJSON(arr,soObj){
    var jsonWithBin = [];
    var jsonWithoutBin = [];
    var totalLines = soObj.getLineItemCount('item');
    for(var i=0;i<totalLines;i++){
        if(soObj.getLineItemValue('item', 'isclosed', parseInt(i)+1) == 'F'){
            var obj = {};
            obj.lineNum = parseInt(i) +1;
            obj.itemId = arr[i].getValue('item');
            obj.itemText = arr[i].getText('item');
            obj.quantity = arr[i].getValue('quantity');
            obj.quantityPicked = arr[i].getValue('quantitypicked');
            obj.open = parseInt(obj.quantity - obj.quantityPicked);
            obj.description = soObj.getLineItemValue('item', 'description', obj.lineNum);
            obj.bin = soObj.getLineItemValue('item', COMMON.CUSTCOL_BIN_ID, obj.lineNum);
            obj.binItemText = obj.bin+obj.itemText;

            if(isValidValue(obj.bin)){
                obj.binItemText = obj.bin+obj.itemText;
                jsonWithBin.push(obj);
            }
            else{
                obj.binItemText = obj.itemText;
                jsonWithoutBin.push(obj);
            }
        }
    }
    return [jsonWithBin, jsonWithoutBin];
}

/* This function takes two parameters search result and itemfulfillment object
   and create two sorted json array and return it */
function convertFulFillmentToJSON(fulObj){
    var jsonWithBin = [];
    var jsonWithoutBin = [];
    var totalLines = 0;
    
    totalLines = fulObj.getLineItemCount('item');
    
    for(var i=0;i<totalLines;i++){
        var obj = {};
        obj.lineNum = parseInt(i) +1;
        obj.itemText = fulObj.getLineItemText('item','item', obj.lineNum);
        obj.quantity = fulObj.getLineItemValue('item','quantity', obj.lineNum);
        obj.open = fulObj.getLineItemValue('item','quantityremainingdisplay', obj.lineNum);
        obj.description = fulObj.getLineItemValue('item', 'description', obj.lineNum);
        obj.bin = fulObj.getLineItemValue('item', COMMON.CUSTCOL_BIN_ID, obj.lineNum);
        obj.boxNum = fulObj.getLineItemValue('item', COMMON.CUSTCOL_BOX_NO_ID, obj.lineNum);
        obj.binItemText = obj.bin+obj.itemText;
        
        if(isValidValue(obj.bin))
            jsonWithBin.push(obj);
        else
            jsonWithoutBin.push(obj);
    }
    return [jsonWithBin, jsonWithoutBin];
}

function addColumnsInSublist(sublist){
    sublist.addField(COMMON.SUBLIST_COL_CUST_ITEM_ID, 'text', 'Item').setDisplayType('disabled');
    sublist.addField(COMMON.SUBLIST_COL_CUST_DESCRIPTION_ID, 'text', 'Description').setDisplayType('disabled');
    sublist.addField(COMMON.SUBLIST_COL_CUST_OPEN_ID, 'text', 'Open').setDisplayType('disabled');
    sublist.addField(COMMON.SUBLIST_COL_CUST_QTYSHP_ID, 'integer', 'Qty Shp');
    sublist.addField(COMMON.SUBLIST_COL_CUST_BOX_NUM_ID, 'text', 'Box #');
    sublist.addField(COMMON.SUBLIST_COL_CUST_BIN_ID, 'text', 'Bin').setDisplayType('disabled');
    sublist.addField(COMMON.SUBLIST_COL_CUST_LINE_NUM_ID, 'text', 'LineNum').setDisplayType('hidden');
}

function addLinesInSublist(sublist, array, type){
    var line = 1;
    for(var i in array){
        var quantity = array[i].quantity;
        var quantityPicked = array[i].quantityPicked;

        if(type == 'itemfulfillment' || (type == 'salesorder' && parseInt(quantityPicked) < parseInt(quantity)))
        {
            var lineNum = array[i].lineNum;
            var itemText = array[i].itemText;
            var description = array[i].description;
            var bin = array[i].bin;
            var open = array[i].open;
                        
            sublist.setLineItemValue(COMMON.SUBLIST_COL_CUST_ITEM_ID, line, itemText);
            sublist.setLineItemValue(COMMON.SUBLIST_COL_CUST_DESCRIPTION_ID, line, description);
            sublist.setLineItemValue(COMMON.SUBLIST_COL_CUST_OPEN_ID, line, open.toString());
            sublist.setLineItemValue(COMMON.SUBLIST_COL_CUST_BIN_ID, line, bin);
            sublist.setLineItemValue(COMMON.SUBLIST_COL_CUST_LINE_NUM_ID, line, lineNum);
            line++;
        }
    }
}

// return transaction search result
function getSearchResult(tranId){
    return nlapiSearchRecord('transaction',null,
        [
        new nlobjSearchFilter('internalid',null,'is',tranId), 
        new nlobjSearchFilter('mainline',null,'is','F')
        ],
        [
        new nlobjSearchColumn('item'),
        new nlobjSearchColumn('quantity'),
        new nlobjSearchColumn('quantitypicked')
        ]);
}

// this function return an array
function getResult(array){
    var resultJSONWithBin = array[0];
    var resultJSONWithoutBin = array[1];
    resultJSONWithBin.sort(sortArrayAscByBin());
    resultJSONWithoutBin.sort(sortArrayAscByItem());
    return resultJSONWithBin.concat(resultJSONWithoutBin);
}