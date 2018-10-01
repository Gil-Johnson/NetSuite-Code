/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       22 Mar 2016     Gil Johnson
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function userEventBeforeSubmit(type){
	
	
	if(type == 'delete'){
		
		nlapiLogExecution('DEBUG', 'd1', 'deleting');
		var createdfrom = nlapiGetFieldValue('createdfrom');
		
		try{
		nlapiSubmitField('salesorder', createdfrom, 'custbody_printstatus', 'Fulfillment Deleted');
		}
		catch(e){
				
		}
		
	//	nlapiLogExecution('DEBUG', 'd1', createdfrom);
		return;
	}

	 //obtain the context object
	 var context = nlapiGetContext();
	 
	 
	 if( type == 'ship'){
	 
	// nlapiLogExecution('DEBUG', 'context and type', 'context:' + context.getExecutionContext());
	 
	if( context.getExecutionContext() == 'userinterface' ||  
			context.getExecutionContext() == 'webservices' || context.getExecutionContext() == 'userevent'){
		 
	//	 try{
			 
			 var shipStatus = nlapiGetFieldValue('shipstatus');
			 
			 if(shipStatus == 'C'){	
				 
				 
			 var soId = nlapiGetFieldValue('createdfrom');	 
			 var fulfillmentItems = [];
			 var orderItems = [];
			 	 
			// nlapiLogExecution('DEBUG', 'shipStatus', 'shipStatus: ' + shipStatus);
			 
			 var intNumberItems = nlapiGetLineItemCount('item');
			 
		     for ( var i = 1; i <= intNumberItems; i++) 
				{					
					
		    	 var itemId = nlapiGetLineItemValue('item', 'item', i);		    	 
		    	 fulfillmentItems.push(itemId);				
		    	 
		    	 nlapiLogExecution('DEBUG', 'items array', fulfillmentItems);
						
				}
		     
		  // Define search filters
		     var filters = new Array();
		     filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', soId );
		     filters[1] = new nlobjSearchFilter( 'item', null, 'anyOf', fulfillmentItems );
		 //    filters[2] = new nlobjSearchFilter( 'salesrep', 'customer', 'anyOf', -5, null );
		     
		    // Define search columns
		    var columns = new Array();
		    columns[0] = new nlobjSearchColumn( 'item' );
		    columns[1] = new nlobjSearchColumn( 'line' );
		//  columns[2] = new nlobjSearchColumn( 'entity' );
		   
		     
		     // Execute the search. You must specify the internal ID of the record type.
		     var searchresults = nlapiSearchRecord( 'transaction', 'customsearch3356', filters, columns );
		     
		     if(searchresults == null ){
		    	 
		    	 nlapiLogExecution('DEBUG', 'return', 'returning no results');
		    	 return;
		    	 
		     }
		     
		     nlapiLogExecution('DEBUG', 'searchresults.length', searchresults.length);
		     
		     // Loop through all search results. When the results are returned, use methods
		     // on the nlobjSearchResult object to get values for specific fields.
		     for ( var x = 0; searchresults != null && x < searchresults.length; x++ )
		     {
		    	 
		      if(x > 40){
		    	  
		    	  break;
		      }	 
		      var searchresult = searchresults[ x ];
		      var record = searchresult.getId( );
		      var rectype = searchresult.getRecordType( );
		      var item = searchresult.getValue( 'item' );
		      var item_display = searchresult.getText( 'item' );
		      var line = searchresult.getValue( 'line' );
		      
		      orderItems.push({item:item , item_display:item_display, line:line});
		    //  nlapiLogExecution('DEBUG', 'shipStatus', 'item: ' + item_display);
		 
		     }
		     
				var itmhtml = "<table style='width:100%;' border='1' cellpadding='3' cellspacing='0'>";				
					itmhtml += "<tr>";
					itmhtml += "<td style='color:white;font-family:Calibri,Arial,sans-serif;font-size:10pt;background:#000000;text-align:center;vertical-align:middle;'>Line # </td>";
					itmhtml += "<td style='color:white;font-family:Calibri,Arial,sans-serif;font-size:10pt;background:#000000;text-align:center;vertical-align:middle;'>Item </td>";
					itmhtml += "</tr>";
					
					
							
			   orderItems.forEach(function (arrayElem){ 				   
				 
						  
				  if (arrayElem.item != '') {
								  
				    itmhtml += "<tr>";
				    itmhtml += "<td style='color:black;font-family:Calibri,Arial,sans-serif;font-size:9.5pt;font-weight:400;vertical-align:top;'>"+arrayElem.line+"</td>";
				    itmhtml += "<td style='color:black;font-family:Calibri,Arial,sans-serif;font-size:9.5pt;font-weight:400;vertical-align:top;'>"+arrayElem.item_display+"</td>";
				    itmhtml += "</tr>";	
				    
				  				    
						  }
						  
						}); 
				    
				    
			    itmhtml += "</table>";		    
		  
			
		     var errorMessage = '<span  style="font-size:12pt"> The sales order line has already been closed for the item(s) below.' 
		    	 + '<br>'+ 'Please contact customer service to see if the lines should be reopened before shipping.</span>' +'<br><br>'+ itmhtml;
		     
		     throw nlapiCreateError ('INV_PERMISSIONS', errorMessage, false);
			 
			 }
/*		 }
	/*	 
			catch ( e )
			{
		   		if ( e instanceof nlobjError )
			    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
			   	else
			   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
			} 
		*/ 
		 
	 }
	
	 }
	
	
 
}




	 
