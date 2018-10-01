function mark_packed (){
var SOId = nlapiGetFieldValue('createdfrom');
var packed_date = nlapiGetFieldValue('trandate');
var SORecord = nlapiLoadRecord('salesorder', SOId);
SORecord.setFieldValue('custbody_printstatus','Packed');
SORecord.setFieldValue('custbody_readyprintpt','F');
SORecord.setFieldValue('custbody_most_recent_date_packed', packed_date);
var SOSubmit = nlapiSubmitRecord(SORecord);
}