/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/ui/message','N/ui/dialog', 'N/currentRecord'],
/**
 * @param {record} record
 * @param {search} search
 * @param {message} message
 */
function(record, search, message, dialog, currentRecord) {
	
	 function reserveUpc() {			 
		 
		 if(!document.getElementById('upc_code').value){			 
			    
		  var upcSearch = search.load({
	            id: 'customsearch4820',	           
	       });
	        
	        var searchResult = upcSearch.run().getRange({
	            start: 0,
	            end: 1
	            });
	            for (var i = 0; i < searchResult.length; i++) {             	
	            	
	                var upcName = searchResult[i].getValue({
	                    name: 'name'
	                }); 
	                
	                var upcId = searchResult[i].id;	
	                if(i == 0){
	                	 document.getElementById('upc_code').value = upcName;
	                	   record.submitFields({
		  	                    type: 'customrecord_upccoderecord',
		  	                    id: parseInt(upcId),
		  	                    values: {
		  	                    	 custrecord_upcreserved: 'T'
		  	                    },
		  	                    options: {
		  	                        enableSourcing: false,
		  	                        ignoreMandatoryFields : true
		  	                    }
		  	                });
	              
	            	}
	            }
		 }
	            
	 }
    

    function fieldChanged(context) {
    	
    	   if(context.fieldId == "new_sub_item_name"){
              var name = context.currentRecord.getText({fieldId:"new_item_name"}).toUpperCase();
              var subname = context.currentRecord.getText({fieldId:"new_sub_item_name"}).toUpperCase();
              if(name == subname){
            	   dialog.alert({
                       title: 'Alert',
                       message: 'The subcompoent and main item can not have the same name.' 
                   });
            	   document.getElementById("submitter").disabled = true;
            	           	  
              }
              else{
            	  
            	  document.getElementById("submitter").disabled = false;
              }
          }
    	  
    	   
    	  

    }

   

    return {
  
        fieldChanged: fieldChanged,
        reserveUpc:reserveUpc
  
    };
    
});
