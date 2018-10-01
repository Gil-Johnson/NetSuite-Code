/*
 Set ship to, bill to address fields into hidden field
 */


function pageInit(type) {

 
}

function saveRecord() {

    nlapiSetFieldValue('custbody_hdn_ship_address', JSON.stringify(getShipAddress()));

    return true;

}

/*
Get fields related to ship address
 */
function getShipAddress(){
    var shipAddress = {};
    shipAddress.shipcountry = nlapiGetFieldValue('shipcountry');
    shipAddress.shipattention = nlapiGetFieldValue('shipattention');
    shipAddress.shipaddressee = nlapiGetFieldValue('shipaddressee');
    shipAddress.shipphone = nlapiGetFieldValue('shipphone');
    shipAddress.shipaddr1 = nlapiGetFieldValue('shipaddr1');
    shipAddress.shipaddr2 = nlapiGetFieldValue('shipaddr2');
    shipAddress.shipcity = nlapiGetFieldValue('shipcity');
    shipAddress.shipstate = nlapiGetFieldValue('shipstate');
    shipAddress.shipzip = nlapiGetFieldValue('shipzip');

    return shipAddress;
}