function updateDepartment( rec_type, rec_id )
{

    var rec = nlapiLoadRecord(rec_type,rec_id);	 
    var count= rec.getLineItemCount('item');	
    var dept;
    var itemInternalId;

    for(var i=1;i<=count;i++)
	{

	itemInternalId = rec.getLineItemValue('item','item',i);

	   rec.setLineItemValue('item','department',i,nlapiLookupField('item',itemInternalId,'department'));							
		
	}	
	nlapiSubmitRecord(rec);

}