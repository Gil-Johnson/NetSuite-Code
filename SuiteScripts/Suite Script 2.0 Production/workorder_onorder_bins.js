/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],

function(record, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
	
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
			
			return ns_type;
			
		}
	  
    function execute(scriptContext) {
    	
    	 var itemSearch = search.load({
	         id: 'customsearch4715',
	      });		 
	
			
		  itemSearch.run().each(function(result) {		  
			  
			  var item_id = result.getValue({
	              name: 'internalid',
	              summary: search.Summary.GROUP	 
	          });
			  
			  var item_type = result.getValue({
	              name: 'type',
	              summary: search.Summary.GROUP	 
	          });
			  
			  var binInternalId = result.getValue({
	              name: 'formulatext',
	              summary: search.Summary.GROUP
	          });				  
			
			  var recType = getNSType(item_type);
			  
			  log.debug('recType', recType);
			  
			  var itemRecord = record.load({
				    type: recType, 
				    id: parseInt(item_id),
				    isDynamic: false,
				});
			  				  
			   var numLines = itemRecord.getLineCount({
				    sublistId: 'binnumber'
				});
			   
			   log.debug('numLines', numLines);
			   
			   log.debug('item_id', item_id);
			   log.debug('binInternalId', binInternalId);

			 try{
			   var newLine = itemRecord.insertLine({
				    sublistId: 'binnumber',
				    line: parseInt(numLines),
				    ignoreRecalc: true
				});
			 }catch(e){
				 
				 log.debug('error', 'newline');
				 return;
			 }
			 
			 try{
			   itemRecord.setSublistValue({
				    sublistId: 'binnumber',
				    fieldId: 'binnumber',
				    line: parseInt(numLines),
				    value: parseInt(binInternalId)
				});
               }catch(e){
				 
				 log.debug('error', 'setsublist');
				 return;
			 }
			
			   
			   itemRecord.save();		  		  
			  
			  
			  return true; 
			  
		  	  });  

    }

    return {
        execute: execute
    };
    
});
