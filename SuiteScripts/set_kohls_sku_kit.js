function transfer_kohls_sku (){
var toRecordValue = nlapiGetFieldValue('custitem_substitute');
var toTransferValue = nlapiGetFieldValue('custitemkohlssku');
var record = nlapiLoadRecord('kititem', toRecordValue);
record.setFieldValue('custitemkohlssku', toTransferValue);
nlapiSubmitRecord(record);
nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custitemkohlssku', '');
}