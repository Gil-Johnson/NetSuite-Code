function getJson(req, res){
    var customerId = req.getParameter('entity');
    var term = req.getParameter('term');
    
    if(isValidValue(customerId) && isValidValue(term)){
        var itemResult = getItemSearchResult(term);
        var customerItemDetailResult = getCustomerItemDetailSearchResult(term, customerId);
        
        
        if(customerItemDetailResult!=null && itemResult!=null){
            nlapiLogExecution('DEBUG','items : customerItem',itemResult.length + ' : ' + customerItemDetailResult.length);
            var concat = [];
            concat = concatenateArray(customerItemDetailResult, itemResult);
            //concat = removeDuplicates(concat);
            
            res.write(JSON.stringify(concat));
        }
        else if(customerItemDetailResult!=null){
            res.write(JSON.stringify(returnCustItemDetailArray(customerItemDetailResult)));
        }
        else if(itemResult!=null){
            res.write(JSON.stringify(returnItemArray(itemResult)));
        }
    }
    else{
        res.write('');
    }
}

function getItemSearchResult(term){
    return nlapiSearchRecord('item', null, 
        [
        new nlobjSearchFilter('custitem_custsku', null, 'contains', term)
        ],
        [
        new nlobjSearchColumn('custitem_custsku'),
        new nlobjSearchColumn('itemid')
        ]);
}

function getCustomerItemDetailSearchResult(term, customerId){
    return nlapiSearchRecord('customrecord_custitemdet', null, 
        [
        new nlobjSearchFilter('custrecord_custsku', null, 'contains', term)
        //new nlobjSearchFilter('custrecord_relcust', null, 'is', customerId)
        ],
        [
        new nlobjSearchColumn('custrecord_relitem'),
        new nlobjSearchColumn('custrecord_custsku')
        ]);
}

function sortArrayAsc(){
    return function(obj1, obj2){
        if (obj1.label > obj2.label) return 1;
        if (obj1.label < obj2.label) return -1;
        return 0;
    }
}
function sortArrayDes(){
    return function(obj1, obj2){
        if (obj1.label > obj2.label) return -1;
        if (obj1.label < obj2.label) return 1;
        return 0;
    }
}

function removeDuplicates(arr){
    var results = [];
    var sku = [];
    for (var i = 0; i < arr.length ; i++) {
        if(sku.indexOf(arr[i].label) == -1){
            sku.push(arr[i].label);
            results.push(arr[i]);
        }
    }
    return results;
}

function returnCustItemDetailArray(arr){
    var json = [];
    for(var i = 0; i<arr.length; i++){
        var obj = {};
        obj.id = arr[i].getValue('custrecord_relitem');
        obj.label = arr[i].getValue('custrecord_custsku') + " - " + arr[i].getText('custrecord_relitem') ;
        json.push(obj);
    }
    return json;
}

function returnItemArray(arr){
    var json = [];
    for(var i = 0; i<arr.length; i++){
        var obj = {};
        obj.id = arr[i].getId();
        obj.label = arr[i].getValue('custitem_custsku')+ " - " + arr[i].getValue('itemid') ;
        json.push(obj);
    }
    return json;
}

function concatenateArray(customerItemDetailResult, itemResult){
    var arr1 = [], arr2 = [];
    arr1 = returnCustItemDetailArray(customerItemDetailResult);
    arr2 = returnItemArray(itemResult);
    arr1.sort(sortArrayAsc());
    arr2.sort(sortArrayAsc());
    return arr1.concat(arr2);
}
function isValidValue(value) {
    return !(value == '' || value == null || typeof value == 'undefined');
}