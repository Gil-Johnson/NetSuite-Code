/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '/SuiteScripts - Globals/moment', 'N/format'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
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
	 function beforeLoad(context) {
        if (context.type !== context.UserEventType.CREATE)
             return;
         
       
        
        var currentRecord = context.newRecord;	
        var createdfrom = currentRecord.getValue({
	        fieldId: 'createdfrom'
	    });   
	    var assemblyItem = currentRecord.getValue({
	        fieldId: 'assemblyitem'
	    }); 
	    
    	if(createdfrom){
	    	
	    	var fieldLookUp = search.lookupFields({
	    	    type: search.Type.TRANSACTION,
	    	    id: createdfrom,
	    	    columns: ['type', 'enddate', 'shipdate']
	    	});   	    	   	    	
	    	   	    	
	    	var enddate = fieldLookUp.enddate;     	    	
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
	        		
	        		currentRecord.setValue({
		                fieldId: 'custbody_description',
		                value: item_description
		            });  	        		
	        		
	            	}
	        	
	        	if(item_sku){
	        		
	        		currentRecord.setValue({
		                fieldId: 'custbody_sku',
		                value: item_sku
		            });  	        		
	        		
	            	}
	        	
	        	if(item_retail){
	        		
	        		currentRecord.setValue({
		                fieldId: 'custbody_retailprice',
		                value: item_retail
		            });  	        		
	        		
	            	}
	        	
	        	if(item_upc){
	        		
	        		currentRecord.setValue({
		                fieldId: 'custbody_upccode',
		                value: item_upc
		            });  	        		
	        		
	            	}
	        	
	        	if(item_inner){
	        		
	        		currentRecord.setValue({
		                fieldId: 'custbody_innerpack',
		                value: item_inner
		            });  	        		
	        		
	            	}
	        	
	        	if(item_case){
	        		
	        		currentRecord.setValue({
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
	        	currentRecord.setValue({
	                fieldId: 'enddate',
	                value: shipdate
	            });
	        	}
	        	catch(e){}
	        	
	        	}
	        	
	        }else {   	 	        	
	        	
//	        	if(enddate){
//	          	enddate = moment(enddate).format('MM DD YYYY');  	    	
//		    	
//		    	enddate = moment(enddate).subtract('days', 3); 
//		    	
//	
//		    	 if (enddate.isoWeekday() === 6){       	    	
//		    		 enddate = moment(enddate).subtract('days', 1);    	    		 
//		    	 } 
//		    	 if (enddate.isoWeekday() === 7){      	    		
//		    		enddate = moment(enddate).subtract('days', 2);     	    		
//		    	 }   
//	        	
//	        	enddate = moment(enddate).format('MM/DD/YYYY');
//	        	
//	        	enddate = format.parse({
//	                value: enddate,
//	                type: format.Type.DATE
//	            });
//	        	     	
//	        	try{
//		         	currentRecord.setValue({
//		                fieldId: 'enddate',
//		                value: enddate
//		            });	 
//	        	}
//	        	catch(e){}
//	         	
//	        	}
	        	
	        }
    	}
	    	 
         
	 }// end before load function 
       
     function afterSubmit(context) {
    	
    	  if (context.type !== context.UserEventType.CREATE){
              return;
		  }

		  log.debug('created fomr SO', context.type);
	
    	    	  
    	  var workOrderRec = context.newRecord;
          var workOrderId = workOrderRec.id;
          
          var workOrderRecord = record.load({
            type: record.Type.WORK_ORDER, 
            id: workOrderId,
            isDynamic: false,
        });
    	
            var createdfrom = workOrderRecord.getValue({
                fieldId: 'createdfrom'
            });   
            var assemblyItem = workOrderRecord.getValue({
                fieldId: 'assemblyitem'
			}); 
			
			log.debug('createdfrom', createdfrom);

            if(createdfrom){

                var fieldLookUp = search.lookupFields({
    	    	    type: search.Type.TRANSACTION,
    	    	    id: createdfrom,
    	    	    columns: ['type', 'enddate', 'shipdate']
                });  
                
               	    	
				var type = fieldLookUp.type[0].text;
				
				log.debug('type ', fieldLookUp.type[0].text);
                
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


							//var newshipdate = moment(shipdate).subtract('days', 1); 
							var newshipdate = moment(shipdate).subtract(1, 'days');

							log.debug('ship date value', newshipdate);
							log.debug('newshipdate.day()', newshipdate.day());
	   
							 if (newshipdate.day() === 6 ){       	    	
								 newshipdate = moment(newshipdate).subtract('days', 1);    	    		 
							 } 
							if (newshipdate.day() === 7){      	    		
								newshipdate = moment(newshipdate).subtract('days', 2);     	    		
							 }   
							
							var setShipDate = moment(newshipdate).format('MM/DD/YYYY');  

							log.debug('ship date value3', newshipdate);
							
							 var parsedDateStringAsRawDateObject = format.parse({
								value: setShipDate,
								type: format.Type.DATE
							});

							try{
								workOrderRecord.setValue({
								fieldId: 'enddate',
								value: parsedDateStringAsRawDateObject
							});

							log.debug('ship date 2 value', formattedDateString);

							}
							catch(e){

								log.error('error on setting field', JSON.stringify(e));

							}
							
							}
    	        	
    	       

			}
			
			try{

            workOrderRecord.save({
    		    enableSourcing: false,
    		    ignoreMandatoryFields: true
			});     

		}catch(e){

			log.error('error on record save', JSON.stringify(e));
		}
    }
}

    return {
    	
        beforeLoad: beforeLoad,
       afterSubmit: afterSubmit
  
    };
    
});
