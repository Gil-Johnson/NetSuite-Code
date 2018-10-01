function clientPageInit(type){
    // feature: fetch the data from fulfillment : start
    var arr = [];
    var totalLines = nlapiGetLineItemCount(COMMON.SUBLIST_ITEMS_ID);
    
    for(var line=1; line<=totalLines;line++){
        var obj = {};
        obj.lineNum = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_LINE_NUM_ID, line);
        obj.qtyshp = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_QTYSHP_ID, line);
        obj.boxnum = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_BOX_NUM_ID, line);
        obj.itemText = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_ITEM_ID, line);
        obj.bin = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_BIN_ID, line);
        
        // to prevent from breaking the array with bin and without bin add the dummy bin for sorting
        if(!isValidValue(obj.bin)){
            obj.binItemText = 'zzzzzzzzzzzz'+obj.itemText;
        }else{
            obj.binItemText = obj.bin+obj.itemText;
        }
            
        arr.push(obj);
    }
        
    arr = sortingArrayByLineNum(arr);
        
    var line = 1;
    for(var i in arr){
        var qty = window.opener.nlapiGetLineItemValue('item','quantity',line);
        var box = window.opener.nlapiGetLineItemValue('item',COMMON.CUSTCOL_BOX_NO_ID,line);
        var bin = window.opener.nlapiGetLineItemValue('item',COMMON.CUSTCOL_BIN_ID,line);
        arr[i].qtyshp = qty;
        arr[i].boxnum = box;
        arr[i].bin = bin;
        line++;
    }
    arr.sort(sortArrayAscByBin());
        
    line = 1;
    for(var i in arr){
        nlapiSetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_QTYSHP_ID, line, arr[i].qtyshp);
        nlapiSetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_BOX_NUM_ID, line, arr[i].boxnum);
        line++;
    }
    nlapiRefreshLineItems(COMMON.SUBLIST_ITEMS_ID);
    // feature: fetch the data from fulfillment : end
    
    var z = {};
    z.q = jQuery.noConflict();
    // remove sublist buttons
    var a = z.q(COMMON.SUBLIST_BUTTONS_ID);
    for(var i=1;i<a.length;i++){
        a[i].style.display='none';
    }
    // focus on first line
    nlapiSelectLineItem(COMMON.SUBLIST_ITEMS_ID, 1);
}

function clientSaveRecord(){
    var arr = [];
    var totalLines = nlapiGetLineItemCount(COMMON.SUBLIST_ITEMS_ID);
    for(var line=1; line<=totalLines;line++){
        var obj = {};
        obj.lineNum = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_LINE_NUM_ID, line);
        obj.qtyshp = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_QTYSHP_ID, line);
        obj.boxnum = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_BOX_NUM_ID, line);
        obj.item = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_ITEM_ID, line);
 
        arr.push(obj);
    }
    
    arr = sortingArrayByLineNum(arr);
    
    // set the values in fulfillment
    var line = 1;
    for(var i in arr){
        if(isValidValue(arr[i].qtyshp)){
            window.opener.nlapiSetLineItemValue('item','itemreceive',line,'T');
            window.opener.nlapiSetLineItemValue('item', 'quantity', line, arr[i].qtyshp);
            window.opener.nlapiSetLineItemValue('item', COMMON.CUSTCOL_BOX_NO_ID, line, arr[i].boxnum);
        }else{
            window.opener.nlapiSetLineItemValue('item','itemreceive',line,'F');
            window.opener.nlapiSetLineItemValue('item', 'quantity', line, '');
        }
        line++;
        
    }// for handling the 3 fulfillment fields project - onchange event does not fire on change of quantity in item sublist fulfillment
    setTotalParts();
    return true;
}


function clientFieldChange(type,name,linenum){
    if(type == COMMON.SUBLIST_ITEMS_ID){
        if(name == COMMON.SUBLIST_COL_CUST_QTYSHP_ID){
            var qty = nlapiGetCurrentLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_QTYSHP_ID);
            // quantity check - can not be less than 1
            if(isValidValue(qty) && qty<1){
                alert('Qty can not be less than 1');
                nlapiSetCurrentLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_QTYSHP_ID,'');
                nlapiSelectLineItem(COMMON.SUBLIST_ITEMS_ID, nlapiGetCurrentLineItemIndex(COMMON.SUBLIST_ITEMS_ID));
            }
        }
    }
}

function lineInit(type){
    if(type == COMMON.SUBLIST_ITEMS_ID){
        // remove the dynamically populated last line
        removeLastLineOfSublist();
    }
}
var isSubmit = false;
function lineValidate(type){
    if(type == COMMON.SUBLIST_ITEMS_ID){
        // check -  prevent from adding new line
        if(nlapiGetCurrentLineItemIndex(COMMON.SUBLIST_ITEMS_ID)>nlapiGetLineItemCount(COMMON.SUBLIST_ITEMS_ID)){
            alert('You can not add the new line.');
            nlapiSelectNewLineItem(COMMON.SUBLIST_ITEMS_ID);
            return false;
        }
        var box = nlapiGetCurrentLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_BOX_NUM_ID);
        var qty = nlapiGetCurrentLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_QTYSHP_ID);
            
        if(!isValidValue(qty) && isValidValue(box)){
            alert('Please enter quantity before entering Box #');
            return false;
        }
        
        // box number check - can not be less than 1
        if(isValidValue(box) && box < 1){
            alert('Box # can not be less than 1');
            return false;
        }
    }
    return true;
}

function removeLastLineOfSublist(){
    setTimeout(function(){
        var z = {};
        z.q = jQuery.noConflict();
        var a = z.q(COMMON.SUBLIST_ROWS_ID);
        a[a.length-1].style.display='none';
        a[a.length-2].style.display='none';
    }, 1);
}

function sortingArrayByLineNum(arr){
    /*var sortable = [];
    // making an array
    for(var i in arr)
        sortable.push([arr[i].lineNum,arr[i]]);
    // sorting by line number
    sortable.sort(function(a, b) {
        return a[0] - b[0];
    });
   
    arr = [];
    for(var i in sortable){
        arr.push(sortable[i][1]);
    }
    return arr;*/
    
    arr.sort(function(a, b) {
        return a.lineNum - b.lineNum;
    });
    return arr;
}

function setTotalParts(){
    var itemCount = nlapiGetLineItemCount(COMMON.SUBLIST_ITEMS_ID);
    var totalParts = 0;
    for(var line = 1; line <= itemCount; line++){
        var qty = nlapiGetLineItemValue(COMMON.SUBLIST_ITEMS_ID, COMMON.SUBLIST_COL_CUST_QTYSHP_ID, line)
        if(isValidValue(qty)){
            totalParts += parseInt(qty);
        }
    }
    window.opener.nlapiSetFieldValue(COMMON.TOTAL_PARTS_ID, totalParts);
}