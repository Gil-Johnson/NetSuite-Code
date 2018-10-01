/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param {record} record
 */
function(record) {
   
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
    function afterSubmit(context) {
    	
    	  if (context.type === context.UserEventType.DELETE)
              return;
    	  
    	  
    	     	  
    	  var orderRecordnew = context.newRecord;
    	  var orderId = orderRecordnew.id;
    	  
    	  var orderRecord = record.load({
    		    type: record.Type.SALES_ORDER, 
    		    id: orderId,
    		    isDynamic: false,
    		});
    	  
    	  
    	  var updateLines = orderRecord.getValue({
  		    fieldId: 'custbody_update_ship_date'
  	      });
    	  if(updateLines === false){
    		  
    		  log.debug('updateLines', updateLines);
    		  return;
    	  }
    	  
    	  var shipdate = orderRecord.getValue({
    		    fieldId: 'shipdate'
    	  });
    	  if(!shipdate){
    		  return;
    	  }
    
    	  var numLines = orderRecord.getLineCount({
    		    sublistId: 'item'
    		});
    	  
    	  log.debug('context.type', context.type);
    	  log.debug('shipdate', shipdate );
    	  log.debug('orderId ', orderId );
    	  log.debug('numLines', numLines);
    	  
    	  
    	  
    	  for (var j = 0; j < numLines; j++) {    		  
    		  
    	  	
		  var isclosed = orderRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'isclosed',
			    line: parseInt(j)
			});
		  
		  var linked = orderRecord.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'linked',
			    line: parseInt(j)
			});
		  
		  log.debug('updateLines', 'isclosed: ' + isclosed + ' linked: ' + linked );
		  
		  if(isclosed === true || linked === true){
			  log.debug('updateLines', 'isclosed: ' + isclosed + ' linked: ' + linked );
			  continue;
		  }
    		  
		  orderRecord.setSublistValue({
    		    sublistId: 'item',
    		    fieldId: 'expectedshipdate',
    		    line: parseInt(j),
    		    value: shipdate
    		});
    	  
    	  
    	  }  
    	  
    	    	  
    	  orderRecord.setValue({
    		    fieldId: 'custbody_update_ship_date',
    		    value: false,
    		    ignoreFieldChange: true
    		});
    	  
    	 orderRecord.save({
    		    enableSourcing: false,
    		    ignoreMandatoryFields: true
    		});     	
    	

    }

    return {
     //   beforeLoad: beforeLoad,
    //    beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
