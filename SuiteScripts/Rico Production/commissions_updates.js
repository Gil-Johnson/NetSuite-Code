/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Apr 2016     gjohnson
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function runUpdates(type) {
	
	var context = nlapiGetContext();
	
	
	try{	
			
		var idStr = context.getSetting('SCRIPT', 'custscript_searchid_com');
	//	var paramJson = context.getSetting('SCRIPT', 'custscript_com_reschedule_params');
		var tempIds = idStr.split(',');	
		var classes = getClasses();
		
	//	nlapiLogExecution('DEBUG', 'classes', JSON.stringify(classes));
			
			tempIds.forEach(function(id) {
				
			try{
				
				
			//	nlapiLogExecution('DEBUG', 'running search', JSON.stringify(tempIds));
				runsearch(id, classes);
						
			}
			  
			catch (e){
				if ( e instanceof nlobjError )
				    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
				   	else
				   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
			};
				
				
			});    	
	
	}	
	
	
	catch ( e )
	{
   		if ( e instanceof nlobjError )
	    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
	   	else
	   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
	} 
	
	
	nlapiLogExecution('DEBUG', 'logs', 'usage remaining at rescheduling: ' + context.getRemainingUsage());

}


function runsearch(searchId, classes) {	
	
	nlapiLogExecution('DEBUG', 'searchId', searchId);
	
	try{
	
	// Define search filters
	var filters = new Array();

//	filters[0] = new nlobjSearchFilter( 'internalid', null, 'greaterthan', transid );
	

	// Define search columns
	var columns = new Array();
	columns[0] = new nlobjSearchColumn( 'formulatext' );
	columns[1] = new nlobjSearchColumn( 'line' );
	columns[2] = new nlobjSearchColumn( 'internalid' ).setSort(false);
	columns[3] = new nlobjSearchColumn( 'class' );
	

	// Execute the search. You must specify the internal ID of the record type.
	var searchresults = nlapiSearchRecord( 'transaction', searchId, null, columns );
//	nlapiLogExecution('DEBUG', 'number of lines found', searchresults.length);
	// Loop through all search results. When the results are returned, use methods
	// on the nlobjSearchResult object to get values for specific fields.
	
	for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
	{ 
	//	nlapiLogExecution('DEBUG', 'entering search results', 'entering search results');
	   var searchresult = searchresults[ i ];
	   var record = searchresult.getId( );
	   var rectype = searchresult.getRecordType( );
	   var lineCommission = searchresult.getText( 'class' );
	   var new_commission_value = searchresult.getValue( 'formulatext' );
	
	//   nlapiLogExecution('DEBUG', 'commissions values', lineCommission +  " // " + new_commission_value);
	   
	   
	   if(lineCommission == new_commission_value){
	//	   nlapiLogExecution('DEBUG', 'commissions values match', 'commissions value match');
		   continue;
	   }
	   
	    var classObj = _.find(classes, { 'name': new_commission_value });
	    
	    nlapiLogExecution('DEBUG', 'classObj', JSON.stringify(classObj));
	      
	    soRec = nlapiLoadRecord(rectype, record);
	    
	    var lineIndex = soRec.findLineItemValue('item', 'line', searchresult.getValue( 'line' ));	    
	    soRec.setLineItemValue('item', 'class', lineIndex, classObj.id);
	   
		nlapiSubmitRecord(soRec, false, true);
			
		
	   
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

function getClasses(){
	
	  var classObjs = [];
	  
	  var columns = new Array();
	  columns[0] = new nlobjSearchColumn( 'name' );

	   var searchresults1 = nlapiSearchRecord('classification', 'customsearch3428', null, columns );
	   for ( var x = 0; searchresults1 != null && x < searchresults1.length; x++ )
		{
		   var searchresult1 = searchresults1[ x ];
		   var classid = searchresult1.getId( ); 
		   var name = searchresult1.getValue('name');
		   
		   classObjs.push({id:classid, name:name}); 
	  
		}
	   
	   return classObjs;
}



