/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','/SuiteScripts - Globals/moment','N/format'],
/**
 * @param {record} record
 */
function(record, search, moment, format) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }
    
    function hasFulfillment(soid, fulfillid) {
    	
    var hasfulfilrec = false;
    	
   	 var fulfillmentSearch = search.load({
         id: 'customsearch4447',
      });		 
		 
	
   	fulfillmentSearch.filters.push(search.createFilter({
         name: 'createdfrom',
         operator: 'ANYOF',
         values: soid
     }));   	
   	
   	
    var i = 0;	
    
    fulfillmentSearch.run().each(function(result) {
   	  i++;	
   	  return true; 
	  
	 });   
   	
    if( i > 1){
    
    	hasfulfilrec = true;
    
    }
    return hasfulfilrec;
		
	}
    
    function beforeSubmit(context) {
    	
    if (context.type === context.UserEventType.DELETE){
    	
    	var new_fulfillment_Record = context.newRecord;
    	var fulfillmentId = new_fulfillment_Record.id;
    	
    	var soId = new_fulfillment_Record.getValue({
    	    fieldId: 'createdfrom'
    	});
   /* 	
    	var printStatus = "New";
    	
    	var hasfulrec = hasFulfillment(soId, fulfillmentId);
    	
    	if(hasfulrec == true){
    		
    		printStatus = "New Backorder";
    	}
    	
    	*/
    	
    	try{
    		
    	var fieldLookUp = search.lookupFields({
    	    type: search.Type.TRANSACTION,
    	    id: soId,
    	    columns: ['custbody_cleared_wave']
    	});  
    	}catch(e){
    		
    	}
    	
    	var cleared_wave_so = "";
    	
    	try{
    		cleared_wave_so = fieldLookUp.custbody_cleared_wave[0].value; 
    	}catch(e){}
    
    	try{
    	  record.submitFields({
              type: record.Type.SALES_ORDER, 
              id: soId,
              values: {
            	  custbody_current_wave: cleared_wave_so
            	//  custbody_printstatus: printStatus
            	
              },
              options: {
                  enableSourcing: false,
                  ignoreMandatoryFields : true
              }
          });
    	}
        catch(e){
          
          log.error('error', JSON.stringify(e));
        
        }
    
    	 log.debug('context.type', context.type); 
    	 return;
    }	
    	
        	
    var submitShipdate = false;
      
    var new_fulfillment_Record = context.newRecord; 
    
    log.debug('id',new_fulfillment_Record.id);
      
  	var soId = new_fulfillment_Record.getValue({
	    fieldId: 'createdfrom'
	});
	var shipDate = new_fulfillment_Record.getValue({
	    fieldId: 'custbody_actualfulfillmentshipdate'
	});
    	 
	 log.debug('shipDate', shipDate);
 	var new_status = new_fulfillment_Record.getValue({
	    fieldId: 'shipstatus'
	});    	
 	
 	var today = moment().format('MM/DD/YYYY');   
 	
 	log.debug('today', today);
	
 	today = format.parse({
        value: today,
        type: format.Type.DATE
    });
      
    	  
   	  if (context.type === context.UserEventType.CREATE){
 	    	
   		if(new_status == 'C'){   			
   			submitShipdate = true;    			
   		  }  
    		  
   		  
      }  
    	  
   	  if(context.type === context.UserEventType.EDIT){   
   		  
   		 var old_fulfillment_Record = context.oldRecord;
   		 
   		var old_status = old_fulfillment_Record.getValue({
		    fieldId: 'shipstatus'
		});
   		
   		
   		if(new_status == 'C' && old_status != 'C' ){   			
   			submitShipdate = true;    			
   		  } 		
   		

   		if(new_status != 'C' && old_status == 'C' ){   	
   			
   			var cleared_wave = new_fulfillment_Record.getValue({
   			    fieldId: 'custbody_cleared_wave'
   			});  
   			
   		try{
   			
   		  record.submitFields({
              type: record.Type.SALES_ORDER, 
              id: soId,
              values: {
            	  custbody_current_wave: cleared_wave,
            	
              },
              options: {
                  enableSourcing: false,
                  ignoreMandatoryFields : true
              }
          });
   		}
        catch(e){
          
          log.error('error', JSON.stringify(e));
        
        }
   			  			
   		  }
    		  
       }  
   	  
   	 if(context.type === context.UserEventType.SHIP){	    	
   		       submitShipdate = true;     		  
      		  
         } 
    	 
   	   log.debug('before true', submitShipdate);
		if(submitShipdate == true){			
	  log.debug('after true', submitShipdate);
	  
	//  custbody_actualfulfillmentshipdate: today,
	  new_fulfillment_Record.setValue({
		    fieldId: 'custbody_actualfulfillmentshipdate',
		    value: today,
		    ignoreFieldChange: true
		});
		
			try{ 
			
			  record.submitFields({
                  type: record.Type.SALES_ORDER, 
                  id: soId,
                  values: {
                	  custbody_last_so_ship_date: today,                	 
                	  custbody_current_wave: null
                  },
                  options: {
                      enableSourcing: false,
                      ignoreMandatoryFields : true
                  }
              });
			  
			}
	          catch(e){
	            
	            log.error('error', JSON.stringify(e));
	          
	          }
			
			
		}		
		

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
    function afterSubmit(scriptContext) {

    }

    return {
    //    beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    //    afterSubmit: afterSubmit
    };
    
});
