/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Apr 2016     gjohnson
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function onSoSave(type, form, request) {
	
	
	try{
		
		var ctx = nlapiGetContext();
		
		   var filters = new Array();
		   filters[0] = new nlobjSearchFilter('internalid', null, 'is', nlapiGetRecordId());
    
		     
		    // Define search columns
		    var columns = new Array();
		    columns[0] = new nlobjSearchColumn( 'internalid');
		    columns[1] = new nlobjSearchColumn( 'line');

			// Execute the search. You must specify the internal ID of the record type.
			var searchresults = nlapiSearchRecord( 'transaction','customsearch3407', filters, null);
			nlapiLogExecution('DEBUG', 'number of lines found', searchresults.length);
			
			
			if(searchresults.length >= 1){
				
		       var newLineShipDate = nlapiGetFieldValue('custbody_sortingshipdate'); 		 
		   
				
				var record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
				var lineItemCount = record.getLineItemCount('item');
				
				
				for (var i = 1; i <= lineItemCount; i++) {
					record.setLineItemValue('item', 'custcol_liamount', i, 1.00);				
					
				}
				
				
			    nlapiSubmitRecord(record, false, true);
				
				
			}
			//load sales order			
			
	}
	catch ( e )
	{
		if ( e instanceof nlobjError )
    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
   	else
   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
	} 	

	

}
