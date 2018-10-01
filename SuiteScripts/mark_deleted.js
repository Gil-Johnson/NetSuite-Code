function mark_deleted (){
var SOId = nlapiGetFieldValue('createdfrom');
var SORecord = nlapiLoadRecord('salesorder', SOId);
SORecord.setFieldValue('custbody_printstatus','Fulfillment Deleted');
var SOSubmit = nlapiSubmitRecord(SORecord);
}