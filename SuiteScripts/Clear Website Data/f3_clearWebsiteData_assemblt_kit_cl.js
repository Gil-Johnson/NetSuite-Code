function pageInit(type) {
     
    if(type == 'copy'){
        if (nlapiGetRecordType() == 'assemblyitem' ||nlapiGetRecordType() == 'kititem') {
        	
        	nlapiSetFieldValue('custitem_specificsubcomponent', null);
        	nlapiSetFieldValue('custitem_is_substitute_for', null);
        	nlapiSetFieldValue('custitem_subcomponentof', null);
        	
        	
            nlapiSetFieldValue('isonline', false);
            nlapiSetLineItemValue('locations', 'reorderpoint', 1, '');
            nlapiSetLineItemValue('locations', 'reorderpoint', 2, '');
            nlapiSetLineItemValue('locations', 'reorderpoint', 3, '');
            nlapiSetLineItemValue('locations', 'preferredstocklevel', 1, '');
            nlapiSetLineItemValue('locations', 'preferredstocklevel', 2, '');
            nlapiSetLineItemValue('locations', 'preferredstocklevel', 3, '');
            var count = nlapiGetLineItemCount('sitecategory');
            if (count > 0){
                for(var j =nlapiGetLineItemCount('sitecategory'); j > 0 ;j--){
               
                    nlapiRemoveLineItem('sitecategory', j);
                }
            }
            try{    
                var vendor_count = nlapiGetLineItemCount('itemvendor');
               
                
                for (var i=0; vendor_count != null && i < vendor_count; i++)
                {
                var x = i + 1;
                	
                       
                nlapiSetLineItemValue('itemvendor', 'vendorcode', x, '');
                
         
                    
                }	
                
                }
    		catch ( e )
			{
		   		if ( e instanceof nlobjError )
			    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
			   	else
			   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
			} 
                
                
     
        }
    }
}