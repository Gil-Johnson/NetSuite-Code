function authorize_new_item (){
var toRecordValue = nlapiGetFieldValue('custitem_substitute');
var toTransferValue = nlapiGetFieldValue('custitem_can_be_on_so');
var record = nlapiLoadRecord('inventoryitem', toRecordValue);
record.setFieldValue('custitem_can_be_on_so', toTransferValue);
nlapiSubmitRecord(record);
nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'custitem_can_be_on_so', '');
}