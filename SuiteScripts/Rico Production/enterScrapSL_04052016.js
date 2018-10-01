/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Mar 2016     Gil Johnson
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function enterScrap(request, response){
	
	try{
	
	if (request.getMethod() == 'GET'){	
	
		var assemblyBuild = request.getParameter('assemblybuild');
	         
		form = nlapiCreateForm('Enter Scrap', true);
	//	form.setScript('customscript308');
		
	    var recordIdField = form.addField('custpage_recordid', 'text');
		recordIdField.setDefaultValue(assemblyBuild);
		recordIdField.setDisplayType('hidden');	
		
		var itemList = form.addSubList('custpage_items', 'inlineeditor', 'Items');
		
		itemList.addField('custpage_scraprec_id', 'text', 'Scrap Rec Id').setDisplayType('hidden');
		itemList.addField('custpage_item_id', 'text', 'Item Id').setDisplayType('hidden');
		itemList.addField('custpage_item', 'text', 'Item Name').setDisplayType('disabled').setMandatory(true);
		itemList.addField('custpage_scrap', 'float', 'Scrap Quantity').setDisplayType('entry');
		itemList.addField('custpage_binnumber', 'textarea', 'Binnumbers');
		
		// Define search filters
		    var filters1 = new Array();
		    filters1[0] = new nlobjSearchFilter( 'custrecord_associated_assembly_build', null,  'is', assemblyBuild);
			    
		   // Define search columns
		   var columns1 = new Array();
		   columns1[0] = new nlobjSearchColumn( 'custrecord_scrap_item' );		   
		   columns1[1] = new nlobjSearchColumn( 'custrecord_scrap_qty' );
		 
		
		
		    // Execute the search for custom records
		    var scrapRecsearchresults = nlapiSearchRecord('customrecord_scrap_qty', 'customsearch3384', filters1, columns1);
	    
			    if(!scrapRecsearchresults)
			    {    				    	
			    	
			    	nlapiLogExecution('DEBUG', 'results', '!scrapRecsearchresults');
				    	// Define search filters
					    var filters = new Array();
					    filters[0] = new nlobjSearchFilter( 'internalid', null, 'is', assemblyBuild );
						    
					   // Define search columns
					   var columns = new Array();
					   columns[0] = new nlobjSearchColumn( 'item' );
					   columns[1] = new nlobjSearchColumn( 'binnumber' );
					   
					    
					    // Execute the search. You must specify the internal ID of the record type.
					    var searchresults = nlapiSearchRecord( 'transaction', 'customsearch3383', filters, columns );
					    
					    if(!searchresults){    	
					    	
					    	form.addField('custpage_label', 'inlinehtml').setDefaultValue('<h1>There are no items for Scrap</h1>');
							response.writePage(form);
					   	    nlapiLogExecution('DEBUG', 'return', 'returning no results');
					        return;
					   	 
					    }
					    
					    nlapiLogExecution('DEBUG', 'searchresults.length', searchresults.length);       
					   
					    var i = 1;
					    // Loop through all search results. When the results are returned, use methods
					    // on the nlobjSearchResult object to get values for specific fields.
					    for ( var x = 0; searchresults != null && x < searchresults.length; x++ )
					    {	 
					   
					     var searchresult = searchresults[ x ];
					     var record = searchresult.getId( );
					     var rectype = searchresult.getRecordType( );
					     var item = searchresult.getValue( 'item' );
					     var item_display = searchresult.getText( 'item' );
					     var binnumber = searchresult.getValue( 'binnumber' );
					  // var line = searchresult.getValue( 'line' );
					     
					   //  orderItems.push({item:item , item_display:item_display});
					   //  nlapiLogExecution('DEBUG', 'shipStatus', 'item: ' + item_display);
					     
					     itemList.setLineItemValue("custpage_item_id", i, item);
					     itemList.setLineItemValue("custpage_item", i, item_display);
					     itemList.setLineItemValue("custpage_binnumber", i, binnumber);
					     
					     i++;
					     
					    }
			   	 
			      }
			    
			    else{
			    	
			    	
				    var z = 1;
				    // Loop through all search results. When the results are returned, use methods
				    // on the nlobjSearchResult object to get values for specific fields.
				    for ( var y = 0; scrapRecsearchresults != null && y < scrapRecsearchresults.length; y++ )
				    {	 
				   
				     var scrapSearchresult = scrapRecsearchresults[ y ];
				     var record = scrapSearchresult.getId( );
				     var rectype = scrapSearchresult.getRecordType( );
				     var item = scrapSearchresult.getValue( 'custrecord_scrap_item' );
				     var item_display = scrapSearchresult.getText( 'custrecord_scrap_item' );
				     var scrapQty = scrapSearchresult.getValue( 'custrecord_scrap_qty' );
				  // var line = searchresult.getValue( 'line' );
				     
				   //  orderItems.push({item:item , item_display:item_display});
				   //  nlapiLogExecution('DEBUG', 'shipStatus', 'item: ' + item_display);
				     
				     itemList.setLineItemValue("custpage_scraprec_id", z, record);
				     itemList.setLineItemValue("custpage_item_id", z, item);				     
				     itemList.setLineItemValue("custpage_item", z, item_display);				     
				     itemList.setLineItemValue("custpage_scrap", z, scrapQty);
				     
				     z++;
				     
				    }			    	
			    	
			    } 	
           
	    
	    form.addSubmitButton('Submit');    
	    response.writePage(form);       
	   
    
	}
	
	else {		
		
		var assemblyRecId = request.getParameter('custpage_recordid');		
		nlapiLogExecution('DEBUG', 'assemblyRecId', assemblyRecId);
		
		
		var scrapItemCount = request.getLineItemCount('custpage_items');
		
		for(var i = 1; i <= scrapItemCount; i++) {
		
			scrapRecId = request.getLineItemValue('custpage_items', 'custpage_scraprec_id', i);	
			scrapQuantity = request.getLineItemValue('custpage_items', 'custpage_scrap', i);
			itemName = request.getLineItemValue('custpage_items', 'custpage_item_id', i);
			binnumber = request.getLineItemValue('custpage_items', 'custpage_binnumber', i);
			
			nlapiLogExecution('DEBUG', 'scrapRecId', scrapRecId);			
			nlapiLogExecution('DEBUG', 'scrapQuantity', scrapQuantity);
			nlapiLogExecution('DEBUG', 'itemName', itemName);
			
			if(!scrapRecId){			
			
				if(scrapQuantity != null && scrapQuantity != ''){
				var scrapRec = nlapiCreateRecord('customrecord_scrap_qty');
				scrapRec.setFieldValue('custrecord_associated_assembly_build', assemblyRecId);
				scrapRec.setFieldValue('custrecord_scrap_item', itemName);
				scrapRec.setFieldValue('custrecord_scrap_qty', scrapQuantity);			
				scrapRec.setFieldValue('custrecord_sc_binnumbers', binnumber);
				nlapiSubmitRecord(scrapRec);
				
				nlapiLogExecution('DEBUG', 'itemName in 2', itemName);
				}
			
			}
			else{
				
			nlapiSubmitField('customrecord_scrap_qty', scrapRecId, 'custrecord_scrap_qty', scrapQuantity);	
				
				
			}
			
			
		//	nlapiLogExecution('DEBUG', 'results', 'item name' + itemName + " Scrap: " + scrapQuantity);
			
		}		
	
      
		 nlapiSetRedirectURL('RECORD','assemblybuild', assemblyRecId, null, null);
		
	}
	
}
	
  
catch(e){
	response.write(LogError(e));
}

}
	function LogError(e){
		var errorMessage = '';
		
		if (e instanceof nlobjError){
			nlapiLogExecution('ERROR', e.getCode() , e.getDetails());
			errorMessage = e.getCode() + ': ' + e.getDetails();
		}
		else{
			nlapiLogExecution('ERROR',  'Unspecified', e.toString());
			errorMessage = e.toString();
		}
		
		return errorMessage;
	}