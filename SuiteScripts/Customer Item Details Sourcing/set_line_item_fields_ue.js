//region (Global Variables)
var context = nlapiGetContext();
//endregion

//region (Constants)
var BY_PASS_SO_ID = 'bypasssoid';
//endregion


function usereventBeforeSubmitItemRate(type){
   // nlapiLogExecution('DEBUG','context: ' + nlapiGetContext().getExecutionContext(), 'type: ' + type);
    
      
    if(nlapiGetContext().getExecutionContext() != 'csvimport' && nlapiGetContext().getExecutionContext() != 'userinterface' && nlapiGetContext().getExecutionContext() != 'webservices' && nlapiGetContext().getExecutionContext() != 'scheduled'){
    	//  nlapiLogExecution('DEBUG','returning', nlapiGetContext().getExecutionContext());
    	return;
    }
   
   nlapiLogExecution('DEBUG','execution context', nlapiGetContext().getExecutionContext());
    
    if(type == 'create' || type == 'edit'){
        var itemCount = nlapiGetLineItemCount('item');
        
        // getting header ship date
        var shipDate = nlapiGetFieldValue('shipdate');
        
    //    nlapiLogExecution('DEBUG', 'get ship date from header', shipDate);
        
        if(!isValidValue(shipDate)){
            shipDate = '';
        }
        
		var currentSOId = nlapiGetFieldValue('id');
		//nlapiLogExecution('DEBUG', 'f3_logs', 'currentSOId=' + currentSOId);

		var bypassSOId = context.getSessionObject(BY_PASS_SO_ID);
		//nlapiLogExecution('DEBUG', 'f3_logs', 'bypassSOId=' + bypassSOId);
		
        for(var line = 1; line <= itemCount; line++){
            var rate = 0;
            var amount = nlapiGetLineItemValue('item', 'amount', line);
            var quantity = nlapiGetLineItemValue('item', 'quantity', line);
            var lineShipDate = nlapiGetLineItemValue('item', 'expectedshipdate', line, shipDate);
            
            if(lineShipDate == null || lineShipDate == ""){
            	nlapiLogExecution('DEBUG', 'settign empty shipdate', shipDate);            	
              	nlapiSetLineItemValue('item', 'expectedshipdate', line, shipDate);
              }   
            
            if(context.getExecutionContext() == "scheduled"){  	
            	nlapiLogExecution('DEBUG', 'returning from setting shipdate' + 'id: ' + nlapiGetFieldValue('id'), 'shipdate:' + shipDate + ' execontext'+ context.getExecutionContext());
            	  return;
            }
                             
            
            if(isValidValue(amount) && isValidValue(quantity) && quantity != 0){
                rate = parseFloat(amount)/parseFloat(quantity);
                nlapiSetLineItemValue('item', COMMON.ITEM_RATE_ID, line, rate);
            }    
                 
			
			
			if(context.getExecutionContext() != "userinterface" && (!bypassSOId ||  (bypassSOId && bypassSOId != currentSOId))){
			
				// set header ship date to line item ship date
			//	nlapiLogExecution('DEBUG', 'before setting expected ship date', '');
				nlapiSetLineItemValue('item', 'expectedshipdate', line, shipDate);
				//nlapiLogExecution('DEBUG', 'after setting expected ship date', '');
			//	nlapiLogExecution('DEBUG', 'get expected ship date after setting', nlapiGetLineItemValue('item', 'expectedshipdate', line));
			}

            if(context.getExecutionContext() == "webstore"){
                var itemId = nlapiGetLineItemValue('item', 'item', line);
             //   nlapiLogExecution('DEBUG', 'itemId_w', itemId);
                var itemPrimaryBin = getItemPrimaryBin(itemId);
             //   nlapiLogExecution('DEBUG', 'itemPrimaryBin_w', itemPrimaryBin);
                if(!!itemPrimaryBin){
                    nlapiSetLineItemValue('item', 'custcol_bin', line, itemPrimaryBin);
                }
            }
        }
    }
}

function isValidValue(value){
    return !(value == '' || value == null || typeof value == 'undefined');
}

function getItemPrimaryBin(itemId) {
    var primaryBin = '';
    try {
        primaryBin = nlapiLookupField('item', itemId, 'custitem_preferred_bin');
    }
    catch (ex) {
        nlapiLogExecution('ERROR', 'set_line_item_fields_ue # getItemPrimaryBin', ex.message);
    }
    return primaryBin;
}