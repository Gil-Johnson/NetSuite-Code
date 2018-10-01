/**
 * Created by smehmood on 10/5/2015.
/**
 * RicoSalesOrderDao class that has the functionality of standard Netsuite Sales Order Related Opetaions
 */
var RicoSalesOrderDao = (function () {
    return {
        //Function to update Special Order Fields
        /*@recId is the sales order internalId */
        updateSOSpecialOrderFields:function(recId)
        {
        	
        	var context = nlapiGetContext();
        	nlapiLogExecution('DEBUG', 'logs1', 'usage remaining at rescheduling: ' + context.getRemainingUsage());
        	
            var soRec = nlapiLoadRecord('salesorder', recId);
            var count = soRec.getLineItemCount('item');
            var createdpo;
            var createdwo;
            for (var i = 1; i <= count; i++) {
            	
            	nlapiLogExecution('DEBUG', 'logs2', 'usage remaining at rescheduling: ' + context.getRemainingUsage() + 'line number' + i);

                createdpo = soRec.getLineItemValue('item', 'createdpo', i);
                createdwo = soRec.getLineItemValue('item', 'woid', i);
                nlapiLogExecution('debug', 'createdpo', createdpo);
                nlapiLogExecution('debug', 'createdwo', createdwo);

                if (!createdpo)
                    createdpo = '';
                else
                    createdpo = nlapiLookupField('purchaseorder', createdpo, 'transactionnumber');

                if (!createdwo)
                    createdwo = '';
                else
                    createdwo = nlapiLookupField('workorder', createdwo, 'transactionnumber');

                try {
           //         soRec.setLineItemValue('item', 'custcol_linkedpo', i, createdpo);
                    soRec.setLineItemValue('item', 'custcol_linkedwo', i, createdwo + createdpo);
                } catch (ex) {
                    nlapiLogExecution('debug', 'Error in setting custcol_linkedpo/custcol_linkedwo ', ex.toString());
                }
            }

            try {
                nlapiSubmitRecord(soRec);
            } catch (ex) {
                nlapiLogExecution('debug', 'Error in submitting record', ex.toString());
            }
        }
    };
})();