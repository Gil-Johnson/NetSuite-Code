/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search'],
/**
 * @param {record} record
 */
function(record, search) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
		
    function beforeLoad(context) {
    	
       }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(context) {  	
    	
    	
    //	log.debug('entering ue after save');
    	
    	var item_Record = context.newRecord;
    	var itemId = item_Record.id;
    	var itemType = item_Record.type;   
    	var itemisinactive = false;
    	
    	
    	 var itemRecord = record.load({
      	    type: itemType, 
      	    id: parseInt(itemId),
      	    isDynamic: true,
      	});  
    	 
    	
    	 var isCopied = itemRecord.getValue({
    		    fieldId: 'custitem_is_copied'
    		}); 
    	 
    	 var oldItem = itemRecord.getValue({
 		    fieldId: 'custitem_current_item'
 		  }); 
    	 
    	 
    	 var isInactive = itemRecord.getValue({
 		    fieldId: 'isinactive'
 		}); 
    	 
    	 itemisinactive = isInactive;
    	 
    //	 log.debug('item field values', 'isInactive: ' + itemisinactive + ' isCopied: ' + isCopied + '  oldItem: '+  oldItem);
    	 
    	 
    	 if(isCopied == true){   
    		 
    		  if(itemisinactive == true){  
    			  
    			  try{
	           	   record.submitFields({
	                      type: itemType, 
	                      id: parseInt(itemId),
	                      values: {
	                      	isinactive: false
	                      },
	                      options: {
	                          enableSourcing: false,
	                          ignoreMandatoryFields : true
	                      }
	                  }); 
    			  }catch(e){
    				  log.debug('error', JSON.stringify(e));
    			  }
           	 
            }   		 
	
    		 log.debug('itemRecord is copied', itemRecord);
    	 
	    	   var mySearch = search.load({
	               id: 'customsearch4196',
	            });
	   		 
		   		 mySearch.filters.push(search.createFilter({
		               name: 'internalid',
		               operator: 'ANYOF',
		               values: parseInt(itemId)
		           }));    
  
           
		      		 mySearch.run().each(function(result) {	      			 
		      	 		
		   			  
	      			   var bin_number_id = result.getValue({
				            name: 'internalid',
				            join: 'binnumber'
				        });
		 			  		 		        
		 		       var bin_number = result.getValue({
				            name: 'binnumber',
				            join: 'binnumber'
				        });
		 		        
		 		        var bin_type = result.getValue({
		 		            name: 'custrecord_bintype',
		 		           join: 'binnumber'
		 		        });   
		 		        
		 		        log.debug('bin_number', bin_number); 	
		 		        
		 		        
		 		       log.debug('bin_type', bin_type);
		 		       
		 		      		 		        
		 		        if(bin_type != 4 && bin_type != 5){		 		        	
		 		        	
		 		        	 var lineNumber1 = itemRecord.findSublistLineWithValue({
		        		    	    sublistId: 'binnumber',
		        		    	    fieldId: 'binnumber',
		        		    	    value: bin_number_id
		        		    	});	 		        	 
		 		        	
		        		     
		 		        	itemRecord.removeLine({
		        		    	    sublistId: 'binnumber',
		        		    	    line: parseInt(lineNumber1),
		        		    	    ignoreRecalc: true
		        		    	}); 	
		 		        	
		 		        	
		 		        } 		        
		 		      
		 		        
		 		        return true; 	 
		 		        		        
		 		    });    		 
		      		 
		      	    
		      		
		      		itemRecord.setValue({
		      		    fieldId: 'custitem_is_copied',
		      		    value: false,
		      		    ignoreFieldChange: true
		      		});
		      		
		      		itemRecord.setValue({
		      		    fieldId: 'custitem_copied_from',
		      		    value: oldItem,
		      		    ignoreFieldChange: true
		      		});
		      		
		      		
		      		itemRecord.setValue({
		      		    fieldId: 'custitem_current_item',
		      		    value: itemRecord.id,
		      		    ignoreFieldChange: true
		      		});
		      		
		      		
		      		
		      		itemRecord.save();	
		      		
		      		
		      		
		      	  if(itemisinactive == true){  
	    			  
	    			  try{
		           	   record.submitFields({
		                      type: itemType, 
		                      id: parseInt(itemId),
		                      values: {
		                      	isinactive: true
		                      },
		                      options: {
		                          enableSourcing: false,
		                          ignoreMandatoryFields : true
		                      }
		                  }); 
	    			  }catch(e){
	    				  log.debug('error', JSON.stringify(e));
	    			  }
	           	 
	            }
		      		 
    	 }

    }

    return {
    //    beforeLoad: beforeLoad,
    //    beforeSubmit: beforeSubmit,
       afterSubmit: afterSubmit
    };
    
});
