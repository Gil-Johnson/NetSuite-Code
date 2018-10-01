function set_so_actual_ship (){
	
var SOId = nlapiGetFieldValue('createdfrom');
var ShipDate = nlapiGetFieldValue('custbody_actualfulfillmentshipdate');

/*

var SORecord = nlapiLoadRecord('salesorder', SOId);
SORecord.setFieldValue('custbody_last_so_ship_date',ShipDate);
var SOSubmit = nlapiSubmitRecord(SORecord);*/


nlapiSubmitField('salesorder', SOId, 'custbody_last_so_ship_date', ShipDate);

}