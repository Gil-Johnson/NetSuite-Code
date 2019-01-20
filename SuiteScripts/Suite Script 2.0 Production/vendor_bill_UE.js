/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 */
function(record, search) {
   

    function afterSubmit(context) {
    	
    	  if (context.type !== context.UserEventType.CREATE){
              return;
		  }
    	    	  
    	  var orderRecordnew = context.newRecord;
    	  var orderId = orderRecordnew.id;
    	  
    	  var orderRecord = record.load({
    		    type: record.Type.VENDOR_BILL, 
    		    id: orderId,
    		    isDynamic: false,
    		});
    	  
    	  
    	  var isCopied = orderRecord.getValue({
  		    fieldId: 'custbody_is_copied'
			});

			log.debug('sCopied', isCopied)
			

    	  if(isCopied == true){

			log.debug('sCopied is in');
			  
			orderRecord.setValue({
    		    fieldId: 'custbody_pay',
    		    value: false,
    		    ignoreFieldChange: true
			});
			
			// run search for all attachments and remove them   

			var billSearch = search.load({
				id: 'customsearch_vendor_bill_attachments',  // netsuite id 6827
			});
	
			billSearch.filters.push( search.createFilter({
				name: 'internalid',
				operator: search.Operator.IS,
				values: orderId
			})); 
	
			billSearch.run().each(function(result) {	
				
				log.debug('bill id', result.id );
				
				var fileid = result.getValue({
					join: 'file',
					name: 'internalid'	                   
				});

				log.debug('file id', fileid );
			  
				record.detach({
				    record: {
				        type: 'file',
				        id: fileid
				    },
				    from: {
				        type: record.Type.VENDOR_BILL,
				        id: orderId
				    }
				});
									 		
			  
				    return true; 
				
			 }); 
				 
			
    		
    	  }
    	  
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
