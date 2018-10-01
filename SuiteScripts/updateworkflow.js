function updateDepartment()
{
    var rec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
    var count = rec.getLineItemCount('item');
    var dept;
    var itemInternalId;
    var itemRecDept;

    nlapiLogExecution('debug', 'nlapiGetRecordId()', nlapiGetRecordId());

    for (var i = 1; i <= count; i++)
    {
        itemInternalId = rec.getLineItemValue('item', 'item', i);
        itemRecDept = nlapiLookupField('item', itemInternalId, 'department');

        if(!!itemRecDept)
        rec.setLineItemValue('item', 'department', i,itemRecDept);
    }
    rec.setFieldValue('custbody_2015_dept_update', 'T');
    nlapiSubmitRecord(rec);
}