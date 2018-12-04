function changeItemTypeTxt(itemtype){
	var  newitemType = "";
	
	if(itemtype == "Assembly"){
		
		newitemType = "assemblyitem";
		
	}else if (itemtype == "Kit" ){
		
		newitemType = "kititem";
		
		
	}else if (itemtype == "InvtPart"){
		
		newitemType = "invenotryitem";
		
	}else{
		
		newitemType = "not found";
	}
	
	return newitemType;
	
	
}


function waveToolSL(request, response)
{
	if (request.getMethod() == 'GET' )
		
	var orders = request.getParameter("orders");
	var warehouse = request.getParameter("warehouse");
	var user = request.getParameter("user");
	var dropship = request.getParameter("dropship");
	
	var orderFilters = orders.split(",");
	 //nlapiLogExecution('DEBUG','SL testing' , orders + ' wh:' + warehouse + "  ue:" +  user + "   dr:" + dropship );	
	var itemJSON = []; 

	// Execute the search. You must specify the internal ID of the record type.
    //	var searchresults = nlapiSearchRecord( 'item', 'customsearch5126', filters, columns );
	var search = nlapiLoadSearch('item', 'customsearch5126');
	var newFilter = new nlobjSearchFilter('internalid', 'transaction', 'anyOf', orderFilters);
	search.addFilter(newFilter);
	
	var resultSet = search.runSearch();
	
	//nlapiLogExecution('DEBUG','SL testing' , resultSet.length );  	
	
	//algo to check if parent is kit if so is next kit member stop adding parent when the next item is not kit parent 
	  var isKit = false;
	  var parentVal = "";
	  var parentTxt = "";
	  var parentLine = "";
	  var parentQty = null;
	  var excludeMembers = false;
	  
	  
	  
	  resultSet.forEachResult(function(searchresult)
	  {
		 
	   //  var searchresult = searchresults[ i ];
	  //     var record = searchresult.getId( );
	 //      var rectype = searchresult.getRecordType( );
		  
	       var record = searchresult.getValue('internalid');
           var itemtype = searchresult.getValue('type');	
           var rectype = changeItemTypeTxt(itemtype);            
	       var itemtxt = searchresult.getValue( 'name');
	       var iskitmember = searchresult.getValue( 'formulatext');
	       
	       var itemDesc = searchresult.getValue( 'description').replace(/['"]+/g, '');
	       var orderid = searchresult.getValue( 'internalid', 'transaction');
	       var orderNum = searchresult.getValue( 'number', 'transaction');
	       var customerid = searchresult.getValue( 'name', 'transaction');
	       var customertxt = searchresult.getText( 'name', 'transaction');
	       var shipAddrtxt = searchresult.getValue( 'shipaddress', 'transaction');
	       var line = searchresult.getValue( 'line', 'transaction');
	       var qtyCom = searchresult.getValue( 'quantitycommitted', 'transaction');
	       nlapiLogExecution('DEBUG', 'qtyCom', itemtxt + "  /" + qtyCom);
	       var qty = searchresult.getValue( 'quantity', 'transaction');
	       var qtyRec = searchresult.getValue( 'quantityshiprecv', 'transaction');
	       var qtyPicked = searchresult.getValue( 'quantitypicked', 'transaction');
	       var allowSubs = searchresult.getValue( 'custbody_allow_substitutions', 'transaction');
	     //  var qtyOpen = qty - qtyRec;
	       var upc = searchresult.getValue( 'custcol_upccode', 'transaction' );
	       if(!upc){	    	   
	    	   upc = searchresult.getValue( 'upccode');
	    	   }
	       
	       var qtyOpen = (qty - qtyPicked);
	       if(qtyOpen <= 0 && iskitmember != 'kitmbr'){		    	   
	    	   excludeMembers = true;	    	   
	       }
	       
	       if(qtyOpen > 0 && iskitmember != 'kitmbr'){
	    	   excludeMembers = false;	    	   
	       }
	      
	       var itemObj = {
		    	   order:orderid,
		    	   orderNum:orderNum,
		    	   cusId:customerid,
		    	   cusName:customertxt,
		    	   shippingAddress:shipAddrtxt,
		    	   itemNum:itemtxt,
		    	   itemId:record,
		    	   itemUpc:upc,
		    	   itemDesc:itemDesc,
		    	   lineId: line,
		    	   openQty: qtyOpen,
		    	   qtyCommitted: qtyCom,
		    	   itemtype: rectype,
		    	   allowsubs: allowSubs,
		//    	   iskitmbr: iskitmember,
		//    	   parentId: null,
		//    	   parentName: null,
		//    	   parentLine: null
		     };
	       
	       if(iskitmember != 'kitmbr'){	//if item is not a kit member 	      	
	    	   parentVal =  null;
	    	   parentTxt = null;
	    	   parentLine = null;
	       }
	       
	       if(rectype == 'kititem'){	// if item is kit set parent up    	 
	    	  parentVal = record;
	    	  parentTxt = itemtxt;
	    	  parentLine = line;
	    	  parentQty = qty;
	       }
	       
	       if(iskitmember == 'kitmbr' && parentVal != null){ 		    	  
	    	   
	    	// want to push parent to kit
	    	   itemObj['parentId'] = parentVal;
	    	   itemObj['parentName'] = parentTxt;
	    	   itemObj['parentLine'] = parentLine;
	    	   itemObj['memberQty'] = qty/parentQty;
	    	   
		    }     
	       
	       
	       if((iskitmember == 'kitmbr' && parentVal == null)|| excludeMembers == true){
	    	   
	    	   nlapiLogExecution('DEBUG', 'debug', 'dont add assembly members');
	    	   
	       }else{
	    	   
	    	   itemJSON.push(itemObj);
	       }
	           
	     //  nlapiLogExecution('DEBUG','json data' , JSON.stringify(itemJSON) ); 
	 	  return true;                // return true to keep iterating
	 	  
	   });          
	
	  
  	  var JSONobj = {	
  			  
			  wavepicking_item_list: 
				  {
				   orders: orderFilters,
				   items: itemJSON,			  
				   dropship:dropship,
				   warehouse:warehouse,
				   user:user	
			  }
	  };
   
//	  nlapiLogExecution('DEBUG','json data' , JSON.stringify(JSONobj) ); 
    
    var columns = new Array();
    columns[0] = new nlobjSearchColumn( 'created');
    columns[1] = new nlobjSearchColumn( 'custrecord_wave_increment');        
    var waveRecords = nlapiSearchRecord( 'customrecord_wave', 'customsearch3886', null, columns );        
    var wave_name = 'WV_';
    var wave_increment = 0;
    var date = new Date();            
    if(dropship == 1){
        wave_name = 'DSWV_';
    }
    for ( var i = 0; waveRecords != null && i < waveRecords.length; i++ )
    {
       var searchresult = waveRecords[ i ];
       var record = searchresult.getId( );
       var rectype = searchresult.getRecordType( );
       var createdDate = searchresult.getValue( 'created');
       var increment = searchresult.getValue( 'custrecord_wave_increment');         
      
       wave_increment = parseInt(increment) + 1;
       wave_name = wave_name + moment(date).format('MM/DD/YYYY')  + '_' + wave_increment;
       break;              
    }
    if(waveRecords == null) {     
       
        wave_increment = 1;
        wave_name = wave_name + moment(date).format('MM/DD/YYYY') + '_' + wave_increment;
    }

    
 // need to addlogic if there are no search results

    var rec = nlapiCreateRecord('customrecord_wave');
    rec.setFieldValue('custrecord_wave_data', JSON.stringify(JSONobj));
    rec.setFieldValue('name',  wave_name);
    rec.setFieldValue('custrecord_wave_increment', wave_increment);            
   // rec.setFieldValue('custrecord_wave_status', 1);
    rec.setFieldValue('custrecord_warehouse', warehouse);
    
    if(user != null || user != ""){
    try{
    rec.setFieldValue('custrecord_assigned_user', user);
    }catch(e){
    	nlapiLogExecution('error', JSON.stringify(e));
    }
    }
    
   rec.setFieldValue('custrecord_script_status', 'pending');
   var wave_rec_id = nlapiSubmitRecord(rec, true);
     
   var suiteletURL = 'https://forms.na3.netsuite.com/app/site/hosting/scriptlet.nl?script=388&deploy=1&compid=3500213&h=9d94ec88f544124647d8';
   suiteletURL += '&waveid=' + wave_rec_id;

   
 //  nlapiLogExecution('DEBUG', 'orders waved', orderFilters.toString());
 
   
   var context1 = nlapiGetContext();

   for ( var x = 0; x < orderFilters.length; x++ ) {
      nlapiSubmitField('salesorder', orderFilters[x], ['custbody_current_wave', 'custbody_cleared_wave'] , [wave_rec_id, wave_rec_id]);
   
      
      if(context1.getRemainingUsage() < 100){     	     	  
    	  
    	  nlapiLogExecution('DEBUG', 'orders waved', orderFilters[x]);
    	  suiteletURL += '&orders=' + _.drop(orderFilters, x).toString();
    	  nlapiRequestURL(suiteletURL);	
    	  break;    	  
    	  
        }           
      
      }

    
    nlapiLogExecution('DEBUG', 'remaining usage', context1.getRemainingUsage());
      
      
}