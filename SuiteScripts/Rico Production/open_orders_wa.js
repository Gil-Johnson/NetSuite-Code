/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 May 2016     gjohnson
 *
 */

/**
 * @returns {Void} Any or no return value
 */
function openLines() {
	
	
	
	
	var rec = nlapiGetRecordId(); 
	
	var soRec = nlapiLoadRecord('salesorder', rec);
	
	var itemCount = soRec.getLineItemCount('item');
	
    for ( var i = 1; i <= itemCount; i++) 
	{					
		
    	 var itemId = nlapiGetLineItemValue('item', 'item', i);		
    	
    	 nlapiLogExecution('DEBUG', 'itemId ', i + ' - ' + itemId );
    	soRec.setLineItemValue('item', 'isclosed', i, 'F');  
			
	
			
	}
	
    soRec.setFieldValue('status', 'open' );
	nlapiSubmitRecord(soRec);
	

}
