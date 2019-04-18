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
        
           var filters = new Array();
		  // filters[0] = new nlobjSearchFilter('internalid', null, 'is', nlapiGetRecordId());
    
		    // Define search columns
		    var columns = new Array();
		    columns[0] = new nlobjSearchColumn( 'internalid');
		    columns[1] = new nlobjSearchColumn( 'custbody_sortingshipdate', 'createdfrom');
                 
			// Execute the search. You must specify the internal ID of the record type.
			var searchresults = nlapiSearchRecord( 'transaction','customsearch7227' , null, columns);
		
			for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
			{ 
			
				   var searchresult = searchresults[ i ];
				   var record = searchresult.getId( );
                   var rectype = searchresult.getRecordType( );  
                   
			
					
					try{
                    
                        nlapiSubmitField(rectype, record, 'enddate', searchresult.getValue('custbody_sortingshipdate', 'createdfrom' ));
                        
					}
					catch(e){

						
						
					 }
			
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