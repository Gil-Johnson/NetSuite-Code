/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 May 2016     Gil Johnson
 *
 */

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function updatenextneededdate(type) {
	
	try{
		
		// Define search columns
		var columns = new Array();
		columns[0] = new nlobjSearchColumn( 'formuladate',null, 'MIN' );
		columns[1] = new nlobjSearchColumn('internalid', null, 'group');
		columns[2] = new nlobjSearchColumn('type', null, 'group');	

		// Execute the search. You must specify the internal ID of the record type.
		var searchresults = nlapiSearchRecord( 'item', 'customsearch3948', null, columns );		
		nlapiLogExecution('DEBUG', 'search results', searchresults.length);			     	
   	    
   	    // Loop through all search results. When the results are returned, use methods
		// on the nlobjSearchResult object to get values for specific fields.
		for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
		{
			
		   var searchresult = searchresults[ i ];
		   nlapiLogExecution('DEBUG', 's1', searchresult);
		   var item_id = searchresult.getValue('internalid', null, 'group');
		   var item_type = searchresult.getValue('type', null, 'group');		   
		   var next_needed_date = searchresult.getValue( 'formuladate', null, 'MIN' );
		   
		   nlapiLogExecution('DEBUG', 'next_needed_date', 'item type :' + item_type + ' / next date date : ' + next_needed_date);
		  
		   
		   if(item_type == 'Assembly'){
			   item_type = 'assemblyitem';			   
		   }
		   else {
			   item_type = 'inventoryitem';
		   }
			   
			   
			   
			   
		  try{	
			  
			  nlapiSubmitField(item_type, item_id, 'custitem_next_date_needed', next_needed_date);
			  
		//   nlapiSubmitField('inventoryitem', item_id, 'custitem_next_date_needed', next_needed_date);
		//   nlapiLogExecution('DEBUG', 'submitted1', 'submitted');
		   
		  }
		  catch(e){
			  
		//	  nlapiSubmitField('assemblyitem', item_id, 'custitem_next_date_needed', next_needed_date);  
		//	  nlapiLogExecution('DEBUG', 'submitted1', 'submittedcatch');
			  
		  }
		   
		}

		
	// run second search enddate 3509	
		
/*		// Define search columns
		var columns1 = new Array();
		columns1[0] = new nlobjSearchColumn( 'enddate', 'transaction', 'MIN' );
		columns1[1] = new nlobjSearchColumn('internalid', null, 'group');
		columns1[2] = new nlobjSearchColumn('type', null, 'group');	

		// Execute the search. You must specify the internal ID of the record type.
		var searchresults2 = nlapiSearchRecord( 'item', 'customsearch3509', null, columns1 );
				
   	    nlapiLogExecution('DEBUG', 'result counts', searchresults2.length);
   	    
   	    // Loop through all search results. When the results are returned, use methods
		// on the nlobjSearchResult object to get values for specific fields.
		for ( var x = 0; searchresults2 != null && x < searchresults2.length; x++ )
		{
		   var searchresult2 = searchresults2[ x ];
		   nlapiLogExecution('DEBUG', 's2', searchresult2);
		   
		   var item_id2 = searchresult2.getValue('internalid', null, 'group');
		//   var item_type2 = searchresult2.getValue('type', null, 'group');		   
		   var next_needed_date2 = searchresult2.getValue( 'enddate', 'transaction', 'MIN' );
		  
		  try{		   	   
		   nlapiSubmitField('inventoryitem', item_id2, 'custitem_next_date_needed', next_needed_date2);
		   nlapiLogExecution('DEBUG', 'submitted', 'submitted2');
		  }
		  catch(e){
			  
			  nlapiSubmitField('assemblyitem', item_id2, 'custitem_next_date_needed', next_needed_date2);
			  nlapiLogExecution('DEBUG', 'submitted2', 'submitted22');
			  
		  }
		   
		}
*/		
		
	}
	
	catch ( e )
	{
		if ( e instanceof nlobjError )
    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
   	else
   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
	}	

}
