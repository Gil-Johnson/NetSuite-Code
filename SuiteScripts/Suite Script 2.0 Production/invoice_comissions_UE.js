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
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function setCommissions(context) {

        if (context.type !== context.UserEventType.CREATE){
            return;
        }

        var new_invoice_Record = context.newRecord; 
        var invoiceId = new_invoice_Record.id;
        var recType = new_invoice_Record.type;

        var invoiceRecord = record.load({
            type: recType, 
            id: invoiceId,
            isDynamic: false,
        });

        var comissionRate = invoiceRecord.getValue({
			fieldId: 'custbody_comlvl'
        });	 

       
        var numLines = invoiceRecord.getLineCount({
			sublistId: 'item'
        });	 


        for (var i = 0; i <= numLines-1; i++) {
		  
            var commission = invoiceRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'class',
                line: i
            });

            if(!commission){

                log.debug(' invoiceId' ,  invoiceId);
                 log.debug('comissionRate' , comissionRate);

                invoiceRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'class',
                    line: i,
                    value: comissionRate
                });

            }
    
          // log.debug('sublist values', ' line: '+i+ ' commission: '+commission);
    
    
              
          }

          invoiceRecord.save();
        

    }

    return {
    //    beforeLoad: beforeLoad,
    //    beforeSubmit: beforeSubmit,
        afterSubmit: setCommissions
    };
    
});