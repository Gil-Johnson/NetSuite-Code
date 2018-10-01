/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/email'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(record, runtime, search, email) {   
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
    function isValidValue(value){
        return !(value == '' || value == null || typeof value == 'undefined');
    }
    
    function afterSubmit(context) {  	
    
    	
    	var start = new Date().getTime();
    	
	   if (context.type !== context.UserEventType.CREATE){
	    	 log.debug('context.type', context.type); 
	    	 return;
	     }		   
	    	  	
    	
      	 var invissue_Record = context.newRecord;
	   	 var invissueId = invissue_Record.id;
	   	 var invissueType = invissue_Record.type;
	   	 var orderData = [];
	   	 
	     var oldItemid = invissue_Record.getValue({
 		    fieldId: 'custrecord_issue_item'
 		});
	   	 
	  	     
	     var newItemId = invissue_Record.getValue({
	 		    fieldId: 'custrecord_swapped_item'
	 		});
	    	 
	     var comments = invissue_Record.getValue({
	 		    fieldId: 'custrecord_issue_comments'
	 		});
	     
	     if(comments !== 'Swapped'){
	    	 log.debug('returning inv isssue is not swapped');
	    	 return;
	     }
	     
	     var waveId = invissue_Record.getValue({
	 		    fieldId: 'custrecord_issue_wave'
	 		});
	    
	   	 
	   	 //custrecord_swapped_item
	   	 var orderSearch = search.load({
             id: 'customsearch4291',
          });
	   	 
	   	 log.debug('waveId', waveId);
	   	// return;
	   	if(!waveId) {
	   	 log.debug('returning no associated wave');
	   		return;
	   	}
	   		
	   	orderSearch.filters.push(search.createFilter({
             name: 'name',
             join: 'custbody_current_wave',
             operator: search.Operator.IS,
             values: waveId
         }));   	 
	   	
	 	orderSearch.filters.push(search.createFilter({
            name: 'item',
            operator: search.Operator.IS,
            values: oldItemid
        }));
	   		   	 
	
	 	orderSearch.run().each(function(result) { 	
            
			var orderId = result.getValue({
			      name: 'internalid'
			});            	  
			var waveId = result.getValue({
			      name: 'custbody_current_wave'
			});            	  
			var itemId = result.getValue({
			      name: 'item'
			});            	  
			var lineId = result.getValue({
			    name: 'line'
			});                 
			var quantity = result.getValue({
			     name: 'quantity'
			});                 
			var rate = result.getValue({
			     name: 'rate'
			});                
			var amount = result.getValue({
			     name: 'amount'
			});                
			var pricelevel = result.getValue({
			     name: 'pricelevel'
			});
			var descrption = result.getValue({
			     name: 'memo'
			});
			
			var upc = result.getValue({
			     name: 'custcol_upccode'
			});
			var dsiupc = result.getValue({
			     name: 'custcol_dsi_upccode'
			});
			var innerpack = result.getValue({
			     name: 'custcol_sps_innerpack'
			});
			var casepack = result.getValue({
			     name: 'custcol_cspk'
			});   
			var sku = result.getValue({
			     name: 'custcol_custsku'
			});
			
			//   ///custcol_sps_rtl_unitprice
			var retailPrice = result.getValue({
			     name: 'custcol_rtlprc'
			});
			
			//custcol_sps_rtl_unitprice
			
                log.debug('orderId : ' + orderId + ' waveId: ' + waveId, 'lineId : ' + lineId + ' quantity: ' + quantity + ' rate: ' + rate + ' amount: ' + amount + ' pricelevel:' + pricelevel);
                
                orderData.push({number:i,orderId:orderId,itemId:itemId,lineId:lineId});
               
                 var objRecord = record.load({
 		    	    type: record.Type.SALES_ORDER, 
 		    	    id: parseInt(orderId),
 		    	    isDynamic: false,
 		    	});
                 
	                 var lineNumber = objRecord.findSublistLineWithValue({
						    sublistId: 'item',
						    fieldId: 'item',
						    value: itemId
						});
	                 
	        //     	    log.debug('is in list', itemId + '   lineNumber:' +  lineNumber);
	             	    
	             	   		                 
			            objRecord.setSublistValue({
		            	    sublistId: 'item',
		            	    fieldId: 'item',
		            	    line: lineNumber,
		            	    value: newItemId
			             });  	                 
		                 objRecord.setSublistValue({
		             	    sublistId: 'item',
		             	    fieldId: 'quantity',
		             	    line: lineNumber,
		             	    value: quantity
		              	});		
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'memo',
			             	    line: lineNumber,
			             	    value: descrption
			              	});	
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'price',
			             	    line: lineNumber,
			             	    value: -1
			             	});	
		          
		                 
		                 if(isValidValue(amount) && isValidValue(quantity) && quantity != 0){
		                     rate = parseFloat(amount)/parseFloat(quantity);	                 
		                 
				                 objRecord.setSublistValue({
				             	    sublistId: 'item',
				             	    fieldId: 'rate',
				             	    line: lineNumber,
				             	    value: rate
				             	});
		                 
		                 }        
		                 
		                 objRecord.setSublistValue({
		             	    sublistId: 'item',
		             	    fieldId: 'amount',
		             	    line: lineNumber,
		             	    value: amount
		             	});		
		                 
		                 
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'custcol_upccode',
			             	    line: lineNumber,
			             	    value: upc
			             	});	
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'custcol_dsi_upccode',
			             	    line: lineNumber,
			             	    value: dsiupc
			             	});	
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'custcol_sps_innerpack',
			             	    line: lineNumber,
			             	    value: innerpack
			             	});	
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'custcol_cspk',
			             	    line: lineNumber,
			             	    value: casepack
			             	});	
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'custcol_custsku',
			             	    line: lineNumber,
			             	    value: sku
			             	});	
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'custcol_rtlprc',
			             	    line: lineNumber,
			             	    value: retailPrice
			             	});	
		                 
		                 objRecord.setSublistValue({
			             	    sublistId: 'item',
			             	    fieldId: 'custcol_is_swapped',
			             	    line: lineNumber,
			             	    value: true
			             	});	
		             	
		             //custcol_is_swapped
		                 
		                  objRecord.save();
		                  
		                  return true;
		                       
	 	});
	 	
	 	
	 	  record.submitFields({
              type: 'customrecord_inventory_issue',
              id: invissueId,
              values: {
            	  custrecord_swap_processed: true,
            	  custrecord_swapped_orders: JSON.stringify(orderData)
              },
              options: {
                  enableSourcing: false,
                  ignoreMandatoryFields : true
              }
          });             	  
    	  
   	
    			 
		 var scriptObj = runtime.getCurrentScript();	
		 var usageRemaining = scriptObj.getRemainingUsage();
         log.debug('usageRemaining', usageRemaining);
         
         var end = new Date().getTime();
         var time = end - start;
         log.debug('Perfromance', 'Execution time: ' + time + " milliseconds.");      

    }

    return {
   //     beforeLoad: beforeLoad,
   //     beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
