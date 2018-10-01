/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       05 Apr 2016     Gil Johnson
 * This script sends the customer to the enter scrap suitelet if the 'enter scrap' field is set to yes. The enter scrap field is edited from the client modal script on the aseembly build.
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only) 
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function userEventAfterSubmit(type){
	
	  //obtain the context object
	   var context = nlapiGetContext();
	   
	   try{
	   
	   if( context.getExecutionContext() == 'userinterface'){
		   
		 
	
		   var enterScrap = nlapiGetFieldValue('custbody_enter_scrap');	
		   
		   if (enterScrap == 'T'){
		
		   var assemblybuild_id = nlapiGetRecordId();
		   var params = new Array();
		   params['assemblybuild'] = assemblybuild_id;
		   nlapiSetRedirectURL('SUITELET','customscript_enter_scrap_sl', 'customdeploy_enter_scrap', null, params);
	   
	       }  
		   
		   
		   }
	   
	 if (type == 'delete'){
			 
		// Define search filters
		    var filters = new Array();
		    filters[0] = new nlobjSearchFilter( 'custrecord_associated_assembly_build', null,  'is', nlapiGetRecordId());	
		
		    // Execute the search for custom records
		    var scrapRecsearchresults = nlapiSearchRecord('customrecord_scrap_qty', 'customsearch3384', filters, null);
			 
		    if(!scrapRecsearchresults)
		    {    				    	
		    	
		    	return;
		    	
		    }			    
			    for ( var y = 0; scrapRecsearchresults != null && y < scrapRecsearchresults.length; y++ )
			    {	 
			   
			     var scrapSearchresult = scrapRecsearchresults[ y ];
			     var record = scrapSearchresult.getId( );
			 //    var rectype = scrapSearchresult.getRecordType( );
			     
			     nlapiDeleteRecord('customrecord_scrap_qty', record);		 
			     
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



