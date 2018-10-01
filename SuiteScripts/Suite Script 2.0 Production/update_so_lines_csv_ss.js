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
    	var csvString = "Internal ID,Ship Date (For SO Sorting),Line ID \n";
    	var csvBody = "";
    	
    	if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand'); 
           try {        	
        	    
        	      
        //	  log.debug('before search');
        	  
	             search.load({
	                 id: 'customsearch3407'
	             }).run().each(function(result) {	
	            	 
	           // 	 log.debug('in search');
	            	 	            	 
	            	 var orderId = result.getValue({
	                     name: 'internalid'	                   
	                 });
	            	 
	            	 csvBody +=  orderId + ',';
	            	 
	            	 var shipdateForSorting = result.getValue({
	                     name: 'custbody_sortingshipdate'	                   
	                 });
	            	 
	            	 csvBody +=  shipdateForSorting + ',';
	            	            	 
	            	 var lineid = result.getValue({
	                     name: 'line'	                   
	                 });
	            	 
	            	 csvBody +=  lineid + '\n';
	            	 
	            	 
	           
		             
	                 return true;
	             });   
	             
	         //    log.debug('after search');
	             
	             csvString += csvBody;
	             
//	             
//	             var fileObj = file.create({
//	                 name: 'testing.csv',
//	                 fileType: file.Type.CSV,
//	                 contents: csvString
//	      	       });
//	                 
//	      	       fileObj.folder = 12;
//	      	       var fileid = fileObj.save();
	             
	             
	           //  log.debug('csvString', csvString);
	             
	           	             
	             
	             var scriptTask = task.create({taskType: task.TaskType.CSV_IMPORT});
	             scriptTask.mappingId = 257; 
	           //  var f = file.load('SuiteScripts/custjoblist.csv');
	             scriptTask.importFile = csvString;
	           //  scriptTask.linkedFiles = {'addressbook': 'street,city\nval1,val2', 'purchases': file.load('SuiteScripts/other.csv')};
	             var csvImportTaskId = scriptTask.submit();
	             
	             log.debug('csvImportTaskId', csvImportTaskId);
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to update shipping line dates';
	             var authorId = -5;
	             var recipientEmail = 'gjohnson@ricoinc.com';
	             email.send({
	                 author: authorId,
	                 recipients: recipientEmail,
	                 subject: subject,
	                 body: 'Error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
	             });
	         }
	         
	     
    }

    return {
        execute: execute
    };
    
});
