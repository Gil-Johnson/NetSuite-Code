/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect', 'N/email', 'N/runtime', 'N/ui/serverWidget'],
/**
 * @param {record} record
 * @param {redirect} redirect
 */
function(record, redirect, email, runtime, ui) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
	
    function onRequest(context) {
    	
    	 if (context.request.method === 'GET') {
            
    		var transId = context.request.parameters.transId; 
    		log.debug('transId', transId);
    		
    		var form = ui.createForm({
                title: '_'
            });
    		
    		 var subject = form.addField({
                 id: 'subject',
                 type: ui.FieldType.INLINEHTML,
                 label: '_'
             });
    		 
    		  record.submitFields({
                  type: record.Type.WORK_ORDER,
                  id: transId,
                  values: {
                	  custbody_woprinted: true
                  },
                  options: {
                      enableSourcing: false,
                      ignoreMandatoryFields : true
                  }
              });	
    		
    		 subject.defaultValue = '<script>  setTimeout(function () { window.open("https://system.sandbox.netsuite.com/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&template=122&id='+transId+'&label=Bill+of+Materials&printtype=bom&trantype=workord", "_self")   }, 200); </script>' ;
    		 
    		 context.response.writePage(form);
    		
    	
     		 
         } else {
            
          log.debug('context.request.method', context.request.method);
           
         }    	

    }

    return {
        onRequest: onRequest
    };
    
});
