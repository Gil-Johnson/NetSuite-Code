function getTotalParts(){
    var itemCount = nlapiGetLineItemCount('item');
    var totalParts = 0;
    for(var line = 1; line <= itemCount; line++){
        var isFulFill = nlapiGetLineItemValue('item','itemreceive',line);
        if(isFulFill == 'T'){
            totalParts += parseInt(nlapiGetLineItemValue('item', 'quantity', line));
        }
    }
    return totalParts;
}

function getTotalPackagesAndWeight(){
    var count = 0;
    var totalWeight = 0;
    var totalLines = nlapiGetLineItemCount('package');
    for(var line = 1; line <= totalLines; line++){
        totalWeight += parseFloat(nlapiGetLineItemValue('package', 'packageweight', line));
        if(nlapiGetLineItemValue('package', 'packageweight', line) != 0)
            count++;
    }
    return {
        'totalPackages':count, 
        'totalWeight':totalWeight
    };
}

function setTotalWeight(weight){
    nlapiSetFieldValue(COMMON.TOTAL_WEIGHT_ID, weight);
}

function setTotalParts(parts){
    nlapiSetFieldValue(COMMON.TOTAL_PARTS_ID, parts);
}

function setTotalPackages(packages){
    nlapiSetFieldValue(COMMON.TOTAL_PACKAGES_ID, packages);
}