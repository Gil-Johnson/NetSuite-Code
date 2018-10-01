function approve_tooling (){
var toRecordValue = nlapiGetFieldValue('custitem_tooling');
var record = nlapiLoadRecord('customrecord_tooling', toRecordValue);
record.setFieldValue('custrecord_die_approved', 'T');
nlapiSubmitRecord(record);
}