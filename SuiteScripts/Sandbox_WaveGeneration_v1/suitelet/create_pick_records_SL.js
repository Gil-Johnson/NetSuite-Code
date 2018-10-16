function createPickRecords(request, response)
{
	if (request.getMethod() == 'GET' )
		
	var orders = request.getParameter("orders");
	var waveid = request.getParameter("waveid");
	var user = request.getParameter("user");
	var itemjson = request.getParameter("itemjson");
	
	var orderFilters = orders.split(",");
	var items = JSON.parse(itemjson);
	
	try{
		
//	var itemFilters = _.map(items, 'itemId');
	var itemFilters = items.map( function(obj) { return obj.itemId; } );
	
	}catch(e){
		
		  nlapiLogExecution('DEBUG','ERROR',  JSON.stringify(e));
	}
	
//	var itemFilters = items.map('itemId');

 //   nlapiLogExecution('DEBUG','orderFilters',  orderFilters.toString());
 //   nlapiLogExecution('DEBUG','items',  JSON.stringify(itemFilters));
	
//	//search for bin 
//	// Define search filters
	var filters = new Array();
	filters[0] = new nlobjSearchFilter( 'internalid', 'transaction', 'anyOf', orderFilters );
	filters[1] = new nlobjSearchFilter( 'internalid', null, 'anyOf', itemFilters );


//	// Define search columns
	var columns = new Array();
	columns[0] = new nlobjSearchColumn( 'name' );
	columns[1] = new nlobjSearchColumn( 'binnumber' );
	columns[2] = new nlobjSearchColumn( 'preferredbin' );
	columns[3] = new nlobjSearchColumn( 'binonhandavail');
	columns[4] = new nlobjSearchColumn('formulatext').setFormula("{binnumber.custrecord_bintype}");
	columns[5] = new nlobjSearchColumn('formulanumeric').setFormula("{binnumber.internalid}");
	
	
	// Execute the search. You must specify the internal ID of the record type.
	var searchresults = nlapiSearchRecord( 'item', 'customsearch5086', filters, columns );
	
//	nlapiLogExecution('DEBUG','item values' , JSON.stringify(searchresults));
	
	var itemSearching = [];
	  
	
	//nlapiLogExecution('DEBUG','item values' , JSON.stringify(flatItemArray));
	
	// Loop through all search results. When the results are returned, use methods
	// on the nlobjSearchResult object to get values for specific fields.
	for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
	{
	   var searchresult = searchresults[ i ];
	   var record = searchresult.getId( );
	 //  var rectype = searchresult.getRecordType( );
	   var binnumber = searchresult.getValue( 'formulanumeric' );
	   var preferredbin = searchresult.getValue( 'preferredbin' );
	   var binonhand = searchresult.getValue( 'binonhandavail' );
	   var bintype = searchresult.getValue( 'formulatext' );
	   
	   
	   itemSearching.push(
			   { 
				 item: record,
				 bin: binnumber,
				 preferredbin: preferredbin,
				 binonhand: binonhand,
				 bintype: bintype
				   
			   });	   
	}
	
	nlapiLogExecution('DEBUG','item searching' , JSON.stringify(itemSearching));
	
	
	for (var j = 0; j < items.length; j++)	
	{
		nlapiLogExecution('DEBUG','items' , JSON.stringify(items[j]) ); 	    
		   //    var preferredbin = _.find(itemSearching, { 'item': items[j].itemId, 'preferredbin': 'T'});		
	     var preferredbin = _.find(itemSearching,  function(item){ return item.item === items[j].itemId && item.preferredbin === 'T' &&  parseFloat(item.binonhand) >=  parseFloat(items[j].openQty);});
		  // nlapiLogExecution('DEBUG','preferredbin' , JSON.stringify(preferredbin) ); 
		       if(preferredbin){		       
		    		   items[j]['bintouse'] = preferredbin.bin;
		    		  	    	   	    	   
		       }else{
		    	   
		    	   var primarybin = _.find(itemSearching,  function(item){ return item.item === items[j].itemId && item.preferredbin === 'F' && (item.bintype === 'Primary' || item.bintype === 'Overstock') &&  parseFloat(item.binonhand) >=  parseFloat(items[j].openQty);});
				   if(preferredbin){ 			       
			    		   items[j]['bintouse'] = primarybin.bin;
			    		   	 	   	    	   
			         } else{
			        	 
			        	   var putNobin = _.find(itemSearching,  function(item){ return item.item === items[j].itemId && (item.bintype === 'Primary' || item.bintype === 'Overstock');});
						    
						    if(!putNobin){
						    items[j]['bintouse'] = 34329;
						    } else {
						    	
						    	var preBin2 = _.find(itemSearching,  function(item){ return item.item === items[j].itemId && item.preferredbin === 'T';});
						    	 items[j]['bintouse'] = preBin2.bin;
						    }
			        	 
			        	 
			         }
				   
				 
		    	   
		       }
				       
			
		    
		    try{
			//create wave pick record	
			var rec = nlapiCreateRecord('customrecord_pick_task');
		    rec.setFieldValue('custrecord_pick_task_item', parseFloat(items[j].itemId));
		    rec.setFieldValue('custrecord_wave_pick_quantity', parseFloat(items[j].openQty));
		    rec.setFieldValue('custrecord_pick_task_wave', waveid);            
		    rec.setFieldValue('custrecord_pick_task_bin', items[j].bintouse);
		    
		    if(items[j].iskitmember === 'kitmbr'){
		    	 rec.setFieldValue('custrecord_wave_kit_parent', items[j].parentId);
		    	 rec.setFieldValue('custrecord_wave_kit_member_factor', items[j].memberQty);
		    	
		    }		
		    
		    if(user != null || user != ""){
		    try{
		    rec.setFieldValue('custrecord_pick_task_user', user);
		    }catch(e){
		    	nlapiLogExecution('error', 'error', JSON.stringify(e));
		    }
		    }
		    
		 
		    var wavePickTaskid = nlapiSubmitRecord(rec, true);  
		    }catch(e){
		    	
		    	nlapiLogExecution('error', 'error', JSON.stringify(e));
		    }
		    
		    nlapiLogExecution('DEBUG', 'wavePickTaskid', wavePickTaskid);
		       
	}  
	
}

