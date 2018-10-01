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
	
	function beforeLoad(context){
		
		try{
			
		var objRecord = context.newRecord;
		
		var objSublist = objRecord.getSublist({
			   sublistId: 'item' 
			});

			var objColumn = objSublist.getColumn({
			   fieldId: 'class' 
			}); 
		
			objColumn.isMandatory(true);
			
		}catch(e){
			log.debug('error', JSON.stringify(e));
		}
		 
		
	}
   
	  
    function afterSubmit(context) {
    	
    	//log.debug('context type', context.UserEventType);
    	
   	 if (context.type === context.UserEventType.DELETE){    
   		 log.debug('returning on delete');
    		 return;
    	 }
   	 
   	 try{
    	  
    	  var creditMemoRecord = context.newRecord;
    	  var cmId = creditMemoRecord.id;
    	  
    	  var cmRecord = record.load({
    		    type: record.Type.CREDIT_MEMO, 
    		    id: cmId,
    		    isDynamic: false,
    		}); 
    	  
    	   var headerCommission = cmRecord.getValue({
      		    fieldId: 'custbody_comlvl'
      		   }); 
  	  
    	   var customer  = cmRecord.getValue({
    		    fieldId: 'entity'
    		});   
    	     			
    		var fieldLookUp = search.lookupFields({
    		    type: search.Type.ENTITY,
    		    id: parseInt(customer),
    		    columns: ['custentity_comlvl']
    		});

    		try{
    		var cusCommissionRate = fieldLookUp.custentity_comlvl[0].value;  
    		}catch(e){
    			
    		}
       
             
    	  var numLines = cmRecord.getLineCount({
    		    sublistId: 'item'
    		});   
    	  
  	  
	    for (var j = 0; j < numLines; j++) { 	    
	        	
	          var lineCommission = null;
	          
			  var itemCommission = cmRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'class',
			    line: parseInt(j)
			   });  
			  
			  
		  
			   if(itemCommission){
				  
				  continue;
				  
			    }else{
			    	
			    	
			    	if(headerCommission){	
			    		lineCommission = headerCommission;
			    	 }else{
			    		 lineCommission =  cusCommissionRate;
			  		    		 
			    	 }
			    	
	    		
					  cmRecord.setSublistValue({
			    		    sublistId: 'item',
			    		    fieldId: 'class',
			    		    line: parseInt(j),
			    		    value: lineCommission
			    		});
			    	
			    }
		  
			  
    	  }//end looping through items
    
    
   
    	    	  
    	 cmRecord.save({
    		    enableSourcing: false,
    		    ignoreMandatoryFields: true
    		}); 
    	 
    	 
    	 
   	 }catch(e){
   		 
   		 log.error('error', JSON.stringify(e));
   	 }  	 
   	 
 
    	

    }

    return {
    //    beforeLoad: beforeLoad,
    //    beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});


