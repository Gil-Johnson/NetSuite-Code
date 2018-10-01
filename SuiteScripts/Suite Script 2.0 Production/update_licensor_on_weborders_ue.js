/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 */
function(record, search) {
   

	  function getNSType(ns_type){
		  
		  log.debug('ns_type', ns_type);
			
			if(ns_type == 'Assembly'){
				  ns_type= record.Type.ASSEMBLY_ITEM;			   
			   }
			   else if(ns_type == 'InvtPart'){
				 ns_type = record.Type.INVENTORY_ITEM;
			   }
			   else if (ns_type == 'Kit'){		      			   
				 ns_type = record.Type.KIT_ITEM;		      			   
			   }
			  else if (ns_type == 'NonInvtPart'){		      			   
				ns_type = record.Type.NON_INVENTORY_ITEM;		      			   
			   } 
			  else{
				  
				  ns_type = "skip";
			  }
			
			return ns_type;
			
		}
	  
    function afterSubmit(context) {
    	
    	//log.debug('context type', context.UserEventType);
    	
   	 if (context.type !== context.UserEventType.CREATE){    
   		 log.debug('returning not create');
    		 return;
    	 }
   	 
   	 try{
    	  
    	  var orderRecordnew = context.newRecord;
    	  var orderId = orderRecordnew.id;
    	  
    	  var orderRecord = record.load({
    		    type: record.Type.SALES_ORDER, 
    		    id: orderId,
    		    isDynamic: false,
    		});   
       
          
		  var weborder = orderRecord.getValue({
	  		    fieldId: 'webstore'
	  	      });
		  
		  if(weborder == 'F'){
			  log.debug(orderId, 'returning not a web order');
			 return;
		  }
		  
	     
    	  var numLines = orderRecord.getLineCount({
    		    sublistId: 'item'
    		});   
    	  
    	  
      	      	  
    	  
    for (var j = 0; j < numLines; j++) { 	    
        	
        
		  var item = orderRecord.getSublistValue({
		    sublistId: 'item',
		    fieldId: 'item',
		    line: parseInt(j)
		   });
		  
		  var item_type = orderRecord.getSublistValue({
		    sublistId: 'item',
		    fieldId: 'itemtype',
		    line: parseInt(j)
		   });
    	  	
		  var lic_1 = orderRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'custcol_hiddenlicensorfield',
			    line: parseInt(j)
			});
		  
		   if(lic_1){
			  
			  continue;
		    }
		  
			var ns_itemType = getNSType(item_type);
			if(ns_itemType == 'skip'){			
				continue;
			}
		
		
			var fieldLookUp = search.lookupFields({
	    	    type: ns_itemType,
	    	    id: item,
	    	    columns: ['custitem3']
	    	});   
		
		try{
		
			var lic_id = fieldLookUp.custitem3[0].value;  
			
		}catch(e){}		
		
		
	    	if(lic_id)	{  
	    		
			  orderRecord.setSublistValue({
	    		    sublistId: 'item',
	    		    fieldId: 'custcol_hiddenlicensorfield',
	    		    line: parseInt(j),
	    		    value: lic_id
	    		});
	    	}
    
        
    	  }//end looping through items
    
    
    	  
  	 try{
   		 
    		var shippingMethod =  orderRecord.getValue({
   		    fieldId: 'shipmethod'
   		   });   		
    		
    		log.debug('ship method', shippingMethod);
    		
    		if(shippingMethod == 263080){
    			
    			var customer =  orderRecord.getValue({
    	  		    fieldId: 'entity'
    	  		});	
    			

       	     var customerRecord = record.load({
    		    type: record.Type.CUSTOMER, 
    		    id: customer,
    		    isDynamic: true,
    		     }); 
       		
       	     var defaultshippingItem =  customerRecord.getValue({
    		     fieldId: 'custentity_ship_method_pref'
    		     });
    			
       	   log.debug('defaultshippingItemv2', defaultshippingItem);
    			
       	   orderRecord.setValue({
       		    fieldId: 'shipmethod',
       		    value: defaultshippingItem,
       		    ignoreFieldChange: true
       		});
       	      	      
    			
    		}  	
    		
    	 }catch(e){    	
    		 
    		 log.error('error', JSON.stringify(e));
    		 
    	 }	
    	 
   
  
    	    	  
    	 orderRecord.save({
    		    enableSourcing: false,
    		    ignoreMandatoryFields: true
    		}); 
    	 
    	 
    	 
   	 }catch(e){
   		 
   		 log.error('error', JSON.stringify(e));
   	 }  	 
   	 
 
    	

    }

    return {
     //   beforeLoad: beforeLoad,
    //    beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
