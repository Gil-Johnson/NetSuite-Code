/*
    Package Sublist Ids = ["packageweight", "packagedescr", "packagetrackingnumber", "trackingnumberkey"]
*/

function userEventBeforeSubmit(type){
    if(type == 'create' || type == 'edit' || type == 'ship'){
        var status = nlapiGetFieldValue('shipstatus');
        /*
         * A for pick
         * B for pack
         * C for ship
         */
        if(status == COMMON.SHIP_STATUS.SHIP){
            var serialNumber = nlapiGetLineItemValue('package', 'packagetrackingnumber', 1);
            if(serialNumber){
                nlapiSetFieldValue(COMMON.TRACKING_REFERENCE_ID, serialNumber);
            }
        }
    }
    var ctx = nlapiGetContext();
    var exeCtx = ctx.getExecutionContext();
    if((exeCtx == 'webservices' && (type == 'create'))
        || exeCtx == 'csvimport'
        || type == 'pack' 
        || type == 'ship'){
        var status = nlapiGetFieldValue('shipstatus');
        if(status == COMMON.SHIP_STATUS.PACK || status == COMMON.SHIP_STATUS.SHIP){
            var obj = getTotalPackagesAndWeight();
            setTotalWeight(obj.totalWeight);
            setTotalPackages(obj.totalPackages);
        }
        setTotalParts(getTotalParts());
    }
}