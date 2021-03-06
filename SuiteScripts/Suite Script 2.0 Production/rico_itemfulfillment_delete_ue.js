/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/error', 'N/record', 'N/search'],
/**
 * @param {error} error
 * @param {record} record
 * @param {search} search
 */
function(error, record, search) {
   
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
    function beforeSubmit(context) {   

    var fulfillment_Record = context.newRecord;
    var fulfillmentId = fulfillment_Record.id;
    var fulfillmentType = fulfillment_Record.type;
        
    if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT){

        var totalParts = 0;
        //get line count  custbody_totalparts
        var numLines = fulfillment_Record.getLineCount({
            sublistId: 'item'
        });

        for (var i = 0; i <= numLines-1; i++) {
					 
         var itemreceive = fulfillment_Record.getSublistValue({
                sublistId: 'item',
                fieldId: 'itemreceive',
                line: i,
            });	

            if(itemreceive == true){

                var qty = fulfillment_Record.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'quantity',
                    line: i,
                });	

                totalParts += parseInt(qty);

            }  
      }

      log.debug('total parts', totalParts);

      fulfillment_Record.setValue({
        fieldId: 'custbody_totalparts',
        value: parseInt(totalParts),
        ignoreFieldChange: true
    });
    


       
        //    for(var line = 1; line <= itemCount; line++){
     
       
    }

    }


   /*  if (context.type !== context.UserEventType.DELETE){

    	 var fulfillment_Record = context.newRecord;
       	 var fulfillmentId = fulfillment_Record.id;
       	 var fulfillmentType = fulfillment_Record.type;
       	 
       	var orderId = search.lookupFields({
    	    type: search.Type.TRANSACTION,
    	    id: parseInt(fulfillmentId),
    	    columns: ['createdfrom']
    	});    
       	
        log.debug('orderId.createdfrom',orderId.createdfrom[0].value); 
   
       	  
       	  if(!orderId){
       		  return;
       	  }
       	  
       	log.debug('record details', 'fulfillmentId: ' + fulfillmentId + ' fulfillmentType', + fulfillmentType);

        try{ 
        var orderRecord = record.load({
		    type: record.Type.SALES_ORDER, 
		    id: orderId.createdfrom[0].value,
		    isDynamic: false,
		});	 
        }
        catch(e){
    		
    		log.error('error', JSON.stringify(e));
    		return;
    	
    	}
           
        var lineNumber = orderRecord.findSublistLineWithValue({
            sublistId: 'links',
            fieldId: 'type',
            value: 'Invoice'
        });
        
        if(lineNumber >= 0){        
        log.debug('lineNumber', lineNumber);

        var errorObj = error.create({    	    	 
    	    name: 'INVLD_PREMISSONS',
    	    message: 'You cannot delete this fulfillment as it has an invoice on the associated sales order',
    	    notifyOff: false
    	});
    	log.debug("Error Code: " + errorObj.name);
    	throw errorObj.message;
       
        }else{
        	 log.debug('lineNumber', 'No invoice found');
        	 return;        	
        }    
      
   	     	  
  // 	  var orderRecordnew = context.newRecord;
   //	  var orderId = orderRecordnew.id;
    }
}	  
*/
    
    return {
      //  beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
      //  afterSubmit: afterSubmit
    };
    
});
