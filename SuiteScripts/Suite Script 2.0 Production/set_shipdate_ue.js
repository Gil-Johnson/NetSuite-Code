/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','/SuiteScripts - Globals/moment','N/format', 'N/error'],
/**
 * @param {record} record
 */
function(record, search, moment, format, error) {
   
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

	var new_fulfillment_Record = context.newRecord; 
	var fulfillmentId = new_fulfillment_Record.id;

	log.debug('id',new_fulfillment_Record.id);

	var soId = new_fulfillment_Record.getValue({
	    fieldId: 'createdfrom'
	});

	var tranText = new_fulfillment_Record.getText({
	    fieldId: 'createdfrom'
	});
  	
    if(tranText.indexOf('Sales Order') > -1){

    	var fieldLookUp = search.lookupFields({
    	    type: search.Type.TRANSACTION,
    	    id: soId,
    	    columns: ['custbody_cleared_wave', 'shipcomplete']
		});  
		
		var soRecord = record.load({
			type: record.Type.SALES_ORDER, 
			id: soId,
			isDynamic: false,
		});
	}

	//check if ship complete is checked if so can't save partial fulfillment
	if (context.type === context.UserEventType.CREATE && tranText.indexOf('Sales Order') > -1 && fieldLookUp.shipcomplete == true){

		//do two sublist find 
		var lineNumber = new_fulfillment_Record.findSublistLineWithValue({
			sublistId: 'item',
			fieldId: 'itemreceive',
			value: false
		});

		log.debug('found partial fulfillment', lineNumber);

		var errObj = error.create({
			name: 'SHIP_COMPLETE_ERROR',
			message: 'Error - This order must be shipped complete.',
			notifyOff: true
		});

		//throw error on partial fulfillment
		if(lineNumber > 0){

			
			throw errObj; 
		}

		//loop through sublsit and see if any qty is not being fulfilled
		var numLines = new_fulfillment_Record.getLineCount({
			sublistId: 'item'
		});	 
	  
	  for (var i = 0; i <= numLines-1; i++) {
		  
		var item = new_fulfillment_Record.getSublistValue({
			sublistId: 'item',
			fieldId: 'item',
			line: i
		});

		var qty = new_fulfillment_Record.getSublistValue({
			sublistId: 'item',
			fieldId: 'quantity',
			line: i
		});

		var solineNumber = soRecord.findSublistLineWithValue({
			sublistId: 'item',
			fieldId: 'item',
			value: item
		});

		var qtyMatch = soRecord.getSublistValue({
			sublistId: 'item',
			fieldId: 'quantity',
			line: solineNumber
		});

		if(parseInt(qty) != parseInt(qtyMatch)){

				
			throw errObj; 
		}
		  
	  }
	
	}

    	
    if (context.type === context.UserEventType.DELETE && tranText.indexOf('Sales Order') > -1){
    	
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