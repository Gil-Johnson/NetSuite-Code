/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/error', 'N/record', 'N/search', 'N/email', 'N/runtime'],
/**
 * @param {error} error
 * @param {record} record
 * @param {search} search
 */
function(error, record, search, email, runtime) {
   
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
     if (context.type !== context.UserEventType.DELETE){
    	 log.debug('context.type', context.type); 
    	 return;
     }
     
	 log.debug('context.type', context.type);
	 
	 if( context.type === context.UserEventType.XEDIT){
		 
		 log.debug('is xedit', 'is xedit');
	 }
	 
	 return;
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

         
        var orderRecord = record.load({
		    type: record.Type.SALES_ORDER, 
		    id: orderId.createdfrom[0].value,
		    isDynamic: false,
		});	       
           
        var lineNumber = orderRecord.findSublistLineWithValue({
            sublistId: 'links',
            fieldId: 'type',
            value: 'Invoice'
        });
        
        if(lineNumber >= 0){        
        log.debug('lineNumber', lineNumber);

        var errorObj = error.create({    	    	 
    	    name: 'INVLD_PREMISSONS',
    	    message: 'You cannot delete this fulfillment as it has an invoice on the asscoaited sales order',
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
         log.debug('context.type', context.type);

         var userObj = runtime.getCurrentUser();
         
         var fulfillment_Record = context.newRecord;
         var fulfillmentId = fulfillment_Record.id;
         var fulfillmentType = fulfillment_Record.type;

         var ponumber = fulfillment_Record.getValue({
            fieldId: 'tranid'
        });

        var sonumber = fulfillment_Record.getText({
            fieldId: 'createdfrom'
        });
        var soid = fulfillment_Record.getValue({
            fieldId: 'createdfrom'
        });

 
   	 
    	 if (context.type === context.UserEventType.DELETE){  

            if(sonumber.indexOf('Sales Order') > -1){
                //check if sales order is billed if it isn't don't send email
                var orderRecord = record.load({
                   type: record.Type.SALES_ORDER, 
                   id: soid,
                   isDynamic: false,
               });	  
               
                //find the line item with the wo order id
                var lineNumber = orderRecord.findSublistLineWithValue({
                    sublistId: 'links',
                    fieldId: 'type',
                    value: 'Invoice'
                });

        if(lineNumber != -1){
    
                var tranid = orderRecord.getSublistValue({
                    sublistId: 'links',
                    fieldId: 'tranid',
                    line: parseInt(lineNumber),
                });	
    
                var id = orderRecord.getSublistValue({
                    sublistId: 'links',
                    fieldId: 'id',
                    line: parseInt(lineNumber),
                });	
    
                var invoiceURL = '/app/accounting/transactions/custinvc.nl?id='+id;

            //send email when fulfillment is deleted
            var subject = 'Item Fulfillment ' + ponumber + ' has been deleted. It was created from: ' + sonumber + ' and deleted by: ' + userObj.name;
            var authorId = 17834;
            var recipientEmail = ['gjohnson@ricoinc.com', 'gclark@ricoinc.com', 'darlenep@ricoinc.com', 'rickyc@ricoinc.com']; //, 19038, 28644, 6295
            email.send({
                author: authorId,
                recipients: recipientEmail,
                subject: subject,
                body: 'Item Fulfillment: ' + ponumber 
                + '  <br/> Associated Invoice: <a href="'+invoiceURL+'"> ' + tranid + '</a>' 
                + ' <br/> Deleted by: ' + userObj.name
            });
        }

    
            }
           
        	 return;
         }
    	 
    	
    	 var mySearch = search.load({
             id: 'customsearch4199',
          });
		 
		 mySearch.filters.push(search.createFilter({
             name: 'internalid',
             operator: 'ANYOF',
             values: fulfillmentId
         }));
		
		 var searchResult = mySearch.run().getRange({
             start: 0,
             end: 1
             });    	 
        
		 var total_weight = 0;
		 
		 for (var x = 0; x < searchResult.length; x++) {     
		     
			   total_weight = searchResult[x].getValue({     		 
                   name: 'formulanumeric',
                   summary: search.Summary.SUM
               });	
			   
					 
		 }		 
		 
		 record.submitFields({
             type: record.Type.ITEM_FULFILLMENT, 
             id: fulfillmentId,
             values: {
            	 custbody_totalweight: total_weight             	
             },
             options: {
                 enableSourcing: false,
                 ignoreMandatoryFields : true
             }
         });
		 
		 
		 
		 
		 
		 
    	
    	//custbody_totalweight
    	

    }

    return {
      //  beforeLoad: beforeLoad,
     //   beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
