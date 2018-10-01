/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/email', 'N/runtime', 'N/file', 'N/task', 'N/search'],

function(record, email, runtime, file, task, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(context) {
    	
    	//var csvString = "";    	
    	var csvString = "Internal ID,Line ID,Preferred Bin  \n";
    	var csvBody = "";
    	
    	if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand'); 
           try {   
        	  
	             search.load({
	                 id: 'customsearch5049'
	             }).run().each(function(result) {	
	            	 
	            	 if(!result){
	            		 
	            		 log.debug("no resutls");
	            	 }
	            	 	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid'	                   
	                 });
	            	 
	            	 csvBody +=  orderId + ',';
	            	 
	            	 var lineid = result.getValue({
	                     name: 'line'	                   
	                 });
	            	 
	            	 csvBody +=  lineid + ',';
	            	            	 
	            	 var preferredBin = result.getText({
	            		 join: 'item',
	                     name: 'custitem_preferred_bin'	                   
	                 });
	            	 
	            	 log.debug('preferredBin' + preferredBin );
	            	 
	            		            	 
	            	 csvBody += preferredBin + '\n';           
		             
	                 return true;
	             });   
	             
	         //    log.debug('after search');
	             
	             csvString += csvBody;           	             
	             
	             var scriptTask = task.create({taskType: task.TaskType.CSV_IMPORT});
	             scriptTask.mappingId = 381; 
	           //  var f = file.load('SuiteScripts/custjoblist.csv');
	             scriptTask.importFile = csvString;
	           //  scriptTask.linkedFiles = {'addressbook': 'street,city\nval1,val2', 'purchases': file.load('SuiteScripts/other.csv')};
	             var csvImportTaskId = scriptTask.submit();
	             
	             log.debug('csvImportTaskId', csvImportTaskId);
	           
	             
	         } catch (e) {
	        	 
	        	 log.debug('error', JSON.stringify(e) );
	             var subject = 'Error: Unable to update shipping line dates';
	             var authorId = -5;
	             var recipientEmail = 'gjohnson@ricoinc.com';
	  /*           email.send({
	                 author: authorId,
	                 recipients: recipientEmail,
	                 subject: subject,
	                 body: 'Error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
	             });
	             
	             */
	         }
	         
	     
    }

    return {
        execute: execute
    };
    
});
