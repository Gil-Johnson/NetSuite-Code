var TEMP_SHIPTO_FIELD = 'custpage_temp_inlinefield';
var TEMP_SHIPTO_SELECT = 'custpage_tempshiptofield';

var ADDR_INFO_RECORD = {
    id: 'customrecord_addressshipinfo',
    fields: {
        CUSTOMER: 'custrecord_addressshipcust',
        SHIP_TO_LABEL: 'custrecord_addressshiplabel',
        PARTNER: 'custrecord_addressshippart',
        SHIPPING_SCREEN_INSTRUCTIONS: 'custrecord_soshippinginstructions'
    }
};
/*
 *  Get the shipping instruction and Partner field values from "Address Specific Shipping Info"
 *  according to values in customer and Ship Address List
 *  and set them in current SO
 */
function setShipFields(){

    if(nlapiGetFieldValue('shipaddresslist')){
        var recs = nlapiSearchRecord(ADDR_INFO_RECORD.id,null,
            [
            //new nlobjSearchFilter(ADDR_INFO_RECORD.fields.CUSTOMER, null, 'is', nlapiGetFieldValue('entity')),
            new nlobjSearchFilter(ADDR_INFO_RECORD.fields.SHIP_TO_LABEL, null, 'is', nlapiGetFieldValue('shipaddresslist'))
            ],
            [
            new nlobjSearchColumn(ADDR_INFO_RECORD.fields.PARTNER),
            new nlobjSearchColumn(ADDR_INFO_RECORD.fields.SHIPPING_SCREEN_INSTRUCTIONS)
            ]);
        
        if(recs){
            nlapiSetFieldValue('custbody_shippinginstructions',recs[0].getValue(ADDR_INFO_RECORD.fields.SHIPPING_SCREEN_INSTRUCTIONS));
            nlapiSetFieldValue('partner',recs[0].getValue(ADDR_INFO_RECORD.fields.PARTNER));
        }
        
        
    }
}