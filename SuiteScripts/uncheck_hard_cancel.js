function uncheck_hard_cancel (){
var SOId = nlapiGetFieldValue('createdfrom');
var SORecord = nlapiLoadRecord('salesorder', SOId);
SORecord.setFieldValue('custbody_hrdcncl','F');
var SOSubmit = nlapiSubmitRecord(SORecord);
}