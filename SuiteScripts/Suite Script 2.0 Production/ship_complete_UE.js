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

	

    }



    return {
    //    beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    //    afterSubmit: afterSubmit
    };
    
});