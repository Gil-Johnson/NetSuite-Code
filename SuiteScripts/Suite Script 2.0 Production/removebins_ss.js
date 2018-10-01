/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime'],
/**
 * @param {record} record
 * @param {search} search
 * @param {email} email
 * @param {runtime} runtime
 */
function(record, search, email, runtime) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
	  function getNSType(ns_type){
			
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
			
			return ns_type;
			
		}
	  
	 function execute(context) {
         if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand'); 
           try {      	   
        	        	           	   
        	        	   
	             search.load({
	                 id: 'customsearch5144'
	             }).run().each(function(result) {	
	            	 
	            	 var itemId = result.getValue({
	                     name: 'internalid',
	                     
	                 });	            	 
	            	 var itemType = result.getValue({
	                     name: 'type',
	                     
	                 });
	            	 var binnumber = result.getValue({
                       join: 'binnumber',
	                     name: 'internalid'
	                                
	                 });
	            	 
	            	var recType = getNSType(itemType);
	            
	            	
	                 
	            	try{
	            	 var objRecord = record.load({
	            		    type: recType, 
	            		    id: parseInt(itemId),
	            		    isDynamic: false,
	            		});
	            	}catch(e){
	            		log.debug('values', itemId + ' '  + recType);
	            		log.debug('error caught', JSON.stringify(e));
	            		return true;
	            	}
	            	
	            //	log.debug('after loaded record');
		        
	            	 var lineNumber = objRecord.findSublistLineWithValue({
						    sublistId: 'binnumber',
						    fieldId: 'binnumber',
						    value: binnumber
						});
	            	 
	            	 
	            	 
	            //	 log.debug('lineNumber', lineNumber);
	            	 
	            	 
	            	   objRecord.removeLine({
           			    sublistId: 'binnumber',
           			    line: lineNumber,
           			    ignoreRecalc: true
           			});
	            	 
	            	 
	            	 /*
	            	 objRecord.setValue({
	            		    fieldId: 'custitem16',
	            		    value: true,
	            		    ignoreFieldChange: true
	            		});
	            	 
	            	 
	            	   var numLines = objRecord.getLineCount({
	              		    sublistId: 'binnumber'
	              		   });
	            	   
	            	   log.debug('numLines', numLines);
	            	   
	            	   for (var x = 0; x < numLines.length; x--) {  
	            		   
	            		   objRecord.removeLine({
	            			    sublistId: 'binnumber',
	            			    line: x,
	            			    ignoreRecalc: true
	            			});
	            		   
	            	   }
	            	 
	            	*/ 
	            	 var recordId = objRecord.save({
	            		    enableSourcing: true,
	            		    ignoreMandatoryFields: true
	            		});
	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             
	         }
	         
	     }

    return {
        execute: execute
    };
    
});
