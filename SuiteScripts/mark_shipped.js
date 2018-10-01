function mark_shipped (){

nlapiLogExecution('DEBUG', 'entering mark so', 'entering mark so');
var SOId = nlapiGetFieldValue('createdfrom');
var SORecord = nlapiLoadRecord('salesorder', SOId);
SORecord.setFieldValue('custbody_printstatus','Shipped');
var SOSubmit = nlapiSubmitRecord(SORecord);
  
  
  
  

}