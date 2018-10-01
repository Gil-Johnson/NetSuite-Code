/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       20 Jul 2016     Gil Johnson
 *
 */

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment. 
 * @appliedtorecord recordType
 * 
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
var ordernoteLength = nlapiGetFieldValue('custbody_order_entry_notes').length;
function setContactsPL(type){
	
	if(type == 'create'){
		
	 var role = nlapiGetRole();	
	
	
	 var cusId = nlapiGetFieldValue('entity');
	 if(cusId){
		 
	  var orderMsg = updateOrderFields(cusId);	  
	    
	  if(orderMsg && (role == 18 || role == 1007|| role == 3)){
	  alert(orderMsg);
	  }
		 
		
	 }
	 
	 
	}
	
	
	if(type == 'edit'){
		
	  	var notes = nlapiGetFieldValue('custbody_note_count');
    	if(notes > 0){
    		
    		 jQuery(".uir-page-title-secondline").prepend('<div> <h3> Has Customer Notes  </h3> </div>');
    		
    	} 
		
		
		
		
		
	}
	
}

function setContactsPS(type, name) {	
	
	        if(name == 'entity' || name == 'customform'){
	        	
	        	var role = nlapiGetRole();        	      	
	            var cusId = nlapiGetFieldValue('entity');	            
	            if(cusId){	            
	            	
	            var orderMsg = updateOrderFields(cusId);
	            
	            if(orderMsg && (role == 18 || role == 1007|| role == 3)){
	          	  alert(orderMsg);
	          	  }
	            
	            
	            }
	        }     
}

function updateOnRecordSave(){
	
	   var orderNoteChar = nlapiGetFieldValue('custbody_order_entry_notes').length;
	   var orderNoteVal = nlapiGetFieldValue('custbody_order_entry_notes');
	   
	   var role = nlapiGetRole();  
	   
	   if(role == 3){
		   
	      if(orderNoteChar != ordernoteLength){
	    	  
	    	 var customer = nlapiGetFieldValue('entity'); 
	    	 
	    	 try{
	    	 nlapiSubmitField('customer', parseInt(customer), 'custentity_order_entry_notes', orderNoteVal);
	    	 }catch(e){
	    		 return true; 
	    	 }  	 
	    
	    	  
	      }
	   }
	   
	   return true;
	
	
}

function updateOrderFields(cusId) {
	
    	var contacts = [];
        //var cusId = nlapiGetFieldValue('entity');	 
    	
    	// adding logic to remove cc information
    	nlapiSetFieldValue('creditcard', '');
    	nlapiSetFieldValue('paymentmethod', '');
    	
        var cusRec = nlapiLoadRecord('customer', cusId);	            
        var sendEmail = cusRec.getFieldValue('custentity_send_order_conf_email');  
        
        var orderEntryMsg = cusRec.getFieldValue('custentity_order_entry_notes'); 
         
        if(sendEmail == 'T'){        	
        
        
	    	var partner = nlapiGetFieldValue('partner');                  	
	        	
	        	var contactroles = cusRec.getLineItemCount('contactroles');	             	
	        	
				for (var i = 1; i <= contactroles; i++) {	
					
					var contact = cusRec.getLineItemValue('contactroles', 'contact', i);
					 var send_email = nlapiLookupField('contact', contact, 'custentity_send_order_conf_email');		
					 
					 if(send_email == 'T'){							
						contacts.push(contact);														
					}
				}	
				
			if (nlapiLookupField('partner', partner , 'custentity_send_order_conf_email') == 'T'){					
						contacts.push(partner);				
				     } 	
				 
				 
				nlapiSetFieldValue('custbody_send_confirmation', 'T', false);			 
				nlapiSetFieldValues('custbody_send_confirmation_to', contacts, false); 
			
        }//closing braket for send email == t	
	
	   if(orderEntryMsg){
		   
       return orderEntryMsg;
       
	   }
              
}


