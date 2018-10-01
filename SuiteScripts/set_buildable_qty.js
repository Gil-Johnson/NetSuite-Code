function set_item_buildable_qty ()
{
	
var Mainitem = nlapiGetFieldValue('custitem_subcomponentof');
var searchFilter = new Array();
searchFilter[0] = new nlobjSearchFilter('internalid',null,'is',nlapiGetRecordId());
searchFilter[1] = new nlobjSearchFilter('internalid','inventorylocation','anyof','2');
var searchColumn = new Array();
searchColumn[0] = new nlobjSearchColumn('quantityonhand');
var search = nlapiSearchRecord('assemblyitem', null, searchFilter, searchColumn);
var Buildable = search[0].getValue('quantityonhand');
nlapiLogExecution('DEBUG','Details',Mainitem+' '+Buildable);
var Mainitemrecord = nlapiLoadRecord('assemblyitem', Mainitem);
Mainitemrecord.setFieldValue('custitem_buildableqty',parseInt(Buildable));
var ItemSubmit = nlapiSubmitRecord(Mainitemrecord);
nlapiLogExecution('DEBUG','Item',ItemSubmit);

}