/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime'],
/**
 * @param {record} record
 * @param {search} search
 * @param {email} email
 * @param {runtime} runtime
 */
function(record, search, email, runtime) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
	
function runWoProcess(comittType){
	
	log.debug('comittType', comittType);
	
	var serchId = "customsearch4723";
	
	if(parseInt(comittType) == 1){
		
		serchId = "customsearch4731";
	}		
		
	var WOSearch = search.load({
	    id: serchId
	});	
	
	var searchResult = WOSearch.run().getRange({
	    start: 0,
	    end: 200
	    });
	
	log.debug(searchResult.length);
	
 if(searchResult.length != 0){
		
	
	try{	
		
	  for (var i = 0; i < searchResult.length; i++) {		  
		
		  
	    	 var workorderId = searchResult[i].getValue({
	            name: 'internalid',	                     
	        });
		   	 
		   	 var item = searchResult[i].getValue({
		         name: 'item',	                     
		     }); 	 
		   	 
		   	 

   	 //load record 
   	       var workOrderRec = record.load({
   			    type: record.Type.WORK_ORDER, 
   			    id: parseInt(workorderId),
   			    isDynamic: false,
   			});	   
	   	       
	   	    var lineNumber1 = workOrderRec.findSublistLineWithValue({
	    	    sublistId: 'item',
	    	    fieldId: 'item',
	    	    value: parseInt(item)
	    	});
   	         	 
	   	    log.debug('lineNum', lineNumber1);
	   	    
        	workOrderRec.setSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'commitinventory',
        	    line: parseInt(lineNumber1),
        	    value: parseInt(comittType)
        	});
   	        	
   	      	        
   	        workOrderRec.save({
	        	    enableSourcing: false,
	        	    ignoreMandatoryFields: true
	        	});
   	 
   	          log.debug('saving rec');
   	 	
	  }// end for loop

    
    
    
    } catch (e) {
        var subject = 'Error: Unable to update work order commit status';
        var authorId = -5;
        var recipientEmail = 'gjohnson@ricoinc.com';
        email.send({
            author: authorId,
            recipients: recipientEmail,
            subject: subject,
            body: 'Error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
        });
    }
	
    }// closing if statement
 else{
	 
	 return comittType;
 }
	
	}	

function execute(context) {
	
         if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand');    
         
     
          
        
         var val = runWoProcess(3);
          log.debug('returning', val);
               	
         var val2 = runWoProcess(1);
         log.debug('returning', val2);
        
              
	             
	     
	         
	     }

    return {
        execute: execute
    };
    
});
