/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/error', 'N/record', 'N/search', 'N/runtime', 'N/email'],

function(error, record, search, runtime, email) {   


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
    	
    	try{
    	
    	var userObj = runtime.getCurrentUser();
    	
    	 var new_item_Record = context.newRecord;
       	 var itemId = new_item_Record.id;
       	 var itemType = new_item_Record.type;
       	 
           var old_item_Record = context.oldRecord;
           
           if(!old_item_Record){
               return;
           }
       	 

   	 var usebins = new_item_Record.getValue({
   		    fieldId: 'usebins'
   		}); 
   	 
   	 if(usebins == false){
   		 
   		 return;
   	 }
       	 
       	 
        var old_numLines = old_item_Record.getLineCount({
        	 sublistId: 'binnumber'
        	});
       	
        
        var new_numLines = new_item_Record.getLineCount({
       	 sublistId: 'binnumber'
       	});    
     	
     	 
     	if(new_numLines < old_numLines){
     		
     	
     		
     	//	log.debug('bins have been removed')
     		
     	   	 log.debug('old_numLines', old_numLines);       	 
         	 log.debug('new_numLines', new_numLines);     	 
             log.debug("Internal ID of current user: " + userObj.name  +  "	runtime.ContextType: " + 	JSON.stringify(runtime.executionContext) + "  itemid: "  + itemId);
     		
     		
     		 var subject = 'bin has been removed from item: ' + new_item_Record.id;
             var authorId = 17834;
             var recipientEmail = 'gjohnson@ricoinc.com';
             email.send({
                 author: authorId,
                 recipients: recipientEmail,
                 subject: subject,
                 body: 'bin has been removed from item: ' + new_item_Record.id + '  by user: ' + userObj.name
             });
     		
     		
     	}
     	
        } catch (e) {
            var subject = 'Error: Unable sedn bin removal email';
            var authorId = 17834;
            var recipientEmail = 'gjohnson@ricoinc.com';
            email.send({
                author: authorId,
                recipients: recipientEmail,
                subject: subject,
                body: 'Error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
            });
        } 
       	 
       	 

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
    function afterSubmit(scriptContext) {

    }

    return {
    //    beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
    //    afterSubmit: afterSubmit
    };
    
});
