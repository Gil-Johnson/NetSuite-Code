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
function scheduled(type) {
	
	
	try{
		
		var ctx = nlapiGetContext();
                 
			// Execute the search. You must specify the internal ID of the record type.
			var searchresults = nlapiSearchRecord( 'transaction','customsearch3466' , null, null );
//			nlapiLogExecution('DEBUG', 'number of lines found', searchresults.length);
			// Loop through all search results. When the results are returned, use methods
			// on the nlobjSearchResult object to get values for specific fields.
		
			for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
			{ 
			
				 var searchresult = searchresults[ i ];
				   var record = searchresult.getId( );
				   var rectype = searchresult.getRecordType( );  
			     
			//	   nlapiLogExecution('DEBUG', 'logs', record + ' : ' + rectype);
					var invoiceRec = nlapiLoadRecord(rectype, record);
					invoiceRec.setFieldValue('cleared', 'T');
					
					try{
					var logrec = nlapiSubmitRecord(invoiceRec, false, true);
					}
					catch(e){
						 nlapiSubmitField(rectype, record, 'custbody7', 'T')	
						
					}
			 //    nlapiSubmitField(rectype, record, 'cleared', 'T');
					 nlapiLogExecution('DEBUG', 'logs - submitted record', record + ' : ' + rectype + ':' + logrec );
					
			  
			 	if (ctx.getRemainingUsage() < 100) {
					nlapiLogExecution('DEBUG', 'logs', 'usage remaining at rescheduling: ' + ctx.getRemainingUsage());
					nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId());
					return;
				}
			 
			 }		
	}
	catch ( e )
	{
		if ( e instanceof nlobjError )
    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
   	else
   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
	} 	

	

}