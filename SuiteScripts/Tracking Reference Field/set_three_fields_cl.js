function pageInit(type){
    var status = nlapiGetFieldValue('shipstatus');
    if(status == COMMON.SHIP_STATUS.PACK || status == COMMON.SHIP_STATUS.SHIP){
        var obj = getTotalPackagesAndWeight();
        if(!nlapiGetFieldValue(COMMON.TOTAL_WEIGHT_ID))
            setTotalWeight(obj.totalWeight);
        if(!nlapiGetFieldValue(COMMON.TOTAL_PACKAGES_ID))
            setTotalPackages(obj.totalPackages);
    }
    if(!nlapiGetFieldValue(COMMON.TOTAL_PARTS_ID))
        setTotalParts(getTotalParts());
}

function clientFieldChange(type, name, linenum){
    if(name == 'shipstatus'){
        var status = nlapiGetFieldValue('shipstatus');
        if(status == COMMON.SHIP_STATUS.PACK || status == COMMON.SHIP_STATUS.SHIP){
            var obj = getTotalPackagesAndWeight();
            setTotalWeight(obj.totalWeight);
            setTotalPackages(obj.totalPackages);
        }else{
            setTotalWeight(0);
            setTotalPackages(0);
        }
        setTotalParts(getTotalParts());
    }
}

function clientRecalc(type){
    var status = nlapiGetFieldValue('shipstatus');
    if(type == 'item' || type == 'package'){
        if(status == COMMON.SHIP_STATUS.PACK || status == COMMON.SHIP_STATUS.SHIP){
            var obj = getTotalPackagesAndWeight();
            setTotalWeight(obj.totalWeight);
            setTotalPackages(obj.totalPackages);
        }
        setTotalParts(getTotalParts());
    }
}