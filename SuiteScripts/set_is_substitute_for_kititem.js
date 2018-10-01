function assign_issubstitute (){
var toRecordValue = nlapiGetFieldValue('custitem_substitute');
var toTransferValue = nlapiGetFieldValue('internalid');
var record = nlapiLoadRecord('kititem', toRecordValue);
record.setFieldValue('custitem_is_substitute_for', toTransferValue);
nlapiSubmitRecord(record);
nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'internalid', '');
}