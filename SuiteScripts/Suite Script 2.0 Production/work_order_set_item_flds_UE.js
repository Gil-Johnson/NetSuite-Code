/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '/SuiteScripts - Globals/moment', 'N/format'],
/**
 * @param {record} record
 */
function(record, search, moment, format) {
   

    function afterSubmit(context) {
    	
    	  if (context.type !== context.UserEventType.CREATE){
              return;
		  }
    	    	  
    	  var workOrderRec = context.newRecord;
          var workOrderId = workOrderRec.id;
          
          var workOrderRecord = record.load({
            type: record.Type.WORK_ORDER, 
            id: workOrderId,
            isDynamic: false,
        });
    	
            var createdfrom = workOrderRec.getValue({
                fieldId: 'createdfrom'
            });   
            var assemblyItem = workOrderRec.getValue({
                fieldId: 'assemblyitem'
            }); 

            if(createdfrom){

                var fieldLookUp = search.lookupFields({
    	    	    type: search.Type.TRANSACTION,
    	    	    id: createdfrom,
    	    	    columns: ['type', 'enddate', 'shipdate']
                });  
                
             //   var enddate = fieldLookUp.enddate;     	    	
                var type = fieldLookUp.type[0].text;
                
                if(type == 'Sales Order'){       	        	
    	        	
    	        	var soRec = record.load({
    	        	    type: record.Type.SALES_ORDER, 
    	        	    id: createdfrom,
    	        	    isDynamic: true,
    	        	});
    	        	
    	        	var lineNumber = soRec.findSublistLineWithValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'item',
    	        	    value: assemblyItem
    	        	});
    	        
    	        	var item_description = soRec.getSublistValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'description',
    	        	    line: lineNumber
    	        	});
    	        	
    	        	var item_sku = soRec.getSublistValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'custcol_custsku',
    	        	    line: lineNumber
    	        	});
    	        	
    	        	var item_retail = soRec.getSublistValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'custcol_rtlprc',
    	        	    line: lineNumber
    	        	});
    	        	
    	        	var item_upc = soRec.getSublistValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'custcol_upccode',
    	        	    line: lineNumber
    	        	});
    	        	
    	        	var item_inner = soRec.getSublistValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'custcol_inpk',
    	        	    line: lineNumber
    	        	});
    	        	
    	        	var item_case = soRec.getSublistValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'custcol_cspk',
    	        	    line: lineNumber
    	        	});
    	        	
    	        	var shipdate = soRec.getSublistValue({
    	        	    sublistId: 'item',
    	        	    fieldId: 'expectedshipdate',
    	        	    line: lineNumber
    	        	});
    	        	
    	        	if(!shipdate){
    	        		
    	        		shipdate = fieldLookUp.shipdate;
    	        		
    	        	}
    	        	
    	        	
    	        	  
    	        	if(item_description){
    	        		
    	        		workOrderRecord.setValue({
        	                fieldId: 'custbody_description',
        	                value: item_description
        	            });  	        		
    	        		
    	            	}
    	        	
    	        	if(item_sku){
    	        		
    	        		workOrderRecord.setValue({
        	                fieldId: 'custbody_sku',
        	                value: item_sku
        	            });  	        		
    	        		
    	            	}
    	        	
    	        	if(item_retail){
    	        		
    	        		workOrderRecord.setValue({
        	                fieldId: 'custbody_retailprice',
        	                value: item_retail
        	            });  	        		
    	        		
    	            	}
    	        	
    	        	if(item_upc){
    	        		
    	        		workOrderRecord.setValue({
        	                fieldId: 'custbody_upccode',
        	                value: item_upc
        	            });  	        		
    	        		
    	            	}
    	        	
    	        	if(item_inner){
    	        		
    	        		workOrderRecord.setValue({
        	                fieldId: 'custbody_innerpack',
        	                value: item_inner
        	            });  	        		
    	        		
    	            	}
    	        	
    	        	if(item_case){
    	        		
    	        		workOrderRecord.setValue({
        	                fieldId: 'custbody_casepack',
        	                value: item_case
        	            });  	        		
    	        		
    	            	}
    	        	
    	        	
    	        	if(shipdate){
    	        	shipdate = moment(shipdate).format('MM DD YYYY');  	    	
        	    	
    	        	shipdate = moment(shipdate).subtract('days', 3); 
        	    	
        	   	    	
        	    	 if (shipdate.isoWeekday() === 6){       	    	
        	    		 shipdate = moment(shipdate).subtract('days', 1);    	    		 
        	    	 } 
        	    	if (shipdate.isoWeekday() === 7){      	    		
        	    		shipdate = moment(shipdate).subtract('days', 2);     	    		
        	    	 }   
    	        	
        	    	shipdate = moment(shipdate).format('MM/DD/YYYY');    	       
    	        	
    	         	shipdate = format.parse({
    	                value: shipdate,
    	                type: format.Type.DATE
    	            });
    	        	try{
    	        	workOrderRecord.setValue({
    	                fieldId: 'enddate',
    	                value: shipdate
    	            });
    	        	}
    	        	catch(e){

                        log.error('error on saving work order', JSON.stringify(e));
                    }
    	        	
    	        	}

            }

            workOrderRecord.save({
    		    enableSourcing: false,
    		    ignoreMandatoryFields: true
    		});     
    }
}

    return {
     //   beforeLoad: beforeLoad,
    //    beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
