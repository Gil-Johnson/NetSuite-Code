/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 *@NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/email', 'N/runtime','N/log'],
    function(search, record, email, runtime, log) {
        function execute(context) {
            if (context.type !== context.InvocationType.ON_DEMAND)
            	log.debug('ondemand', 'ondemand'); 
              try {
                search.load({
                    id: 'customsearch3710'
                }).run().each(function(result) {
                   
                	var entity = result.id;                	
                     log.debug('id', entity);
                     
                     var rec = record.load({
                         type: 'customer',
                         id: entity, 
                         isDynamic: false
                     });
                 //    log.debug('Debug', rec);                    
                	
                    var lineCount = rec.getLineCount('addressbook');
                    
                    for (var i = 0; i < lineCount; i++) {   
                    	
            	 var sublistFieldValue_1 = rec.getSublistText({
                     sublistId: 'addressbook',
                     fieldId: 'addr1_initialvalue',
                     line: i
                 });
            //     log.debug('Sublist Field 1', sublistFieldValue_1);
                    	
                    var isdefault = rec.getSublistValue({
                    	    sublistId: 'addressbook',
                    	    fieldId: 'defaultshipping',
                    	    line: i
                    	});          
                    
                    
                    if(isdefault){
                    	
                    	log.debug('value', isdefault);
                    	
                    	rec.setSublistValue({
                    		sublistId: 'addressbook',
                    	    fieldId: 'defaultshipping',
                    	    line: i,
                    	    value: false
                    	});                           	
                    	
                    	log.debug('is', 'is shipping addr default');  
                    	rec.save(); 
                   	
                      }  
                                         
                   }                  
                                    
                    
                    return true;
                });
            } catch (e) {
                var subject = 'Fatal Error: Unable to remove default shipping address';
                var authorId = 17834;
                var recipientEmail = 'gjohnson@ricoinc.com';
                email.send({
                    author: authorId,
                    recipients: recipientEmail,
                    subject: subject,
                    body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
                });
            }
        }
        return {
            execute: execute
        };
    });

