/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime', 'N/task'],

function(record, search, email, runtime, task) {
	
   
    function afterSubmit(context) {
    	
//    	  if (context.type !== context.UserEventType.CREATE){ 
//    	    	 log.debug('context.type', context.type); 
//    	    	 return;
//    	     }
    	
    	  var scriptObj = runtime.getCurrentScript();
    
    	  log.debug('usageRemaining', scriptObj.getRemainingUsage());  	
    	  
    	  
    	  try{    	    	     
    	    	 var waveRec = context.newRecord;
    	    	 var waveId = waveRec.id;  	  
    	    	 
    	    	 log.debug('waveid', waveId);
	       	 
    	       	var custrecord_wave_complete = waveRec.getValue({
    	    	    fieldId: 'custrecord_wave_complete'
    	    	});
    	       	
    	       	
    	        log.debug('custrecord_wave_complete', custrecord_wave_complete);
    	       	
    	       	if(custrecord_wave_complete === true){
    	       		
        	    	var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
        	    	scriptTask.scriptId = 427;
        	    	scriptTask.deploymentId = 'customdeploy_wave_fulfillment_consol';
        	    	scriptTask.params = {custscript_wave_id: waveId};
        	    	var scriptTaskId = scriptTask.submit();
        	    	
        	    	log.debug('ss id', scriptTaskId);
    	       		
    	       		
    	       	}
    	     
    	    	
	    	    	       	
    	       	
    	       	
    } catch (e) {
        var subject = 'Fatal Error: Unable to process pick wave task';
        var authorId = -5;
        var recipientEmail = 'gjohnson@ricoinc.com';
        email.send({
            author: authorId,
            recipients: recipientEmail,
            subject: subject,
            body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
        });
    }
    
    
    log.debug('usageRemaining2', scriptObj.getRemainingUsage()); 
    
    	  }
    

    return {
     //   beforeLoad: beforeLoad,
     //   beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
