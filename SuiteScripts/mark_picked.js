function mark_picked (){
var SOId = nlapiGetFieldValue('createdfrom');
var SORecord = nlapiLoadRecord('salesorder', SOId);
SORecord.setFieldValue('custbody_printstatus','Picked');
SORecord.setFieldValue('custbody_readyprintpt','F');
var SOSubmit = nlapiSubmitRecord(SORecord);
}