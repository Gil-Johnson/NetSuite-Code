function createPickRecords(request, response)
{
	if (request.getMethod() == 'GET' )
		
	var orders = request.getParameter("orders");
	var waveid = request.getParameter("waveid");
	var user = request.getParameter("user");
	var itemjson = request.getParameter("itemjson");
	var orderFilters = orders.split(",");
	var items = JSON.parse(itemjson);
	
	//item JSON is now an object of objects
	nlapiLogExecution('DEBUG','itemjson', itemjson);
		
//	var itemFilters = _.map(items, 'itemId');
//	var itemFilters = items.map( function(obj) { return obj.itemId; } );
		var itemFilters = [];
		items.forEach(function (arrayItem) {
			itemFilters.push(arrayItem.itemId);
		});	
//	var itemFilters = items.map('itemId');

 //   nlapiLogExecution('DEBUG','orderFilters',  orderFilters.toString());
    nlapiLogExecution('DEBUG','itemFilters',  JSON.stringify(itemFilters));
	
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
	var searchresults = nlapiSearchRecord( 'item', 'customsearch_create_pick_records_sl', filters, columns );
	
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
	
	
	// for (var j = 0; j < items.length; j++)	
	// {
		items.forEach(function (arrayItem) {
	
		
		var binToUse = "";
		//nlapiLogExecution('DEBUG','items' , JSON.stringify(items[j]) ); 	   
		nlapiLogExecution('DEBUG','item id' , arrayItem.itemId );  
			//var preferredbin = _.find(itemSearching, { 'item': itemId, 'preferredbin': 'T'});		
			//var preferredbin = _.find(itemSearching, {'item': itemId});	
		try{


			//select perferred bin or bin with highest Target CO2's to record setup
	      var preferredbin = _.find(itemSearching,  function(item){ return item.item === arrayItem.itemId && item.preferredbin === 'T';});
		   nlapiLogExecution('DEBUG','preferredbin' , JSON.stringify(preferredbin) ); 
				if(arrayItem.mtoBin){
					binToUse = arrayItem.mtoBin;
				}
		       else if (preferredbin){	

				binToUse = preferredbin.bin;
		    		  	    	   	    	   
		       }else{

					var preBin2 = _.find(itemSearching,  function(item){ return item.item === arrayItem.itemId});
					binToUse = preBin2.bin;
	          
			   }
			}catch(e){

				nlapiLogExecution('error', 'error searching for bin', JSON.stringify(e));
			}
			   
			   nlapiLogExecution('DEBUG', 'item bin values', "item: " + arrayItem.itemId + "  bin: " + binToUse);      
			
	
		    try{

				//create wave pick record	
				var rec = nlapiCreateRecord('customrecord_pick_task');
				rec.setFieldValue('custrecord_pick_task_item', arrayItem.itemId);
				rec.setFieldValue('custrecord_wave_pick_quantity', parseFloat(arrayItem.qtyCommitted));
				rec.setFieldValue('custrecord_wave_pick_qty_remaining', parseFloat(arrayItem.qtyCommitted));
				rec.setFieldValue('custrecord_pick_task_wave', waveid); 
				 
				try{
				rec.setFieldValue('custrecord_pick_task_bin', binToUse);
				}catch(e){
					rec.setFieldValue('custrecord_pick_task_bin', null);
					nlapiLogExecution('error', 'setting bin error', JSON.stringify(e));

				}
				
				
				// if(items[j].iskitmember === 'kitmbr'){
				// 	 rec.setFieldValue('custrecord_wave_kit_parent', items[j].parentId);
				// 	 rec.setFieldValue('custrecord_wave_kit_member_factor', items[j].memberQty);	
				// }		
				
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

				
				
	
			});	
	
}

