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
	 function execute(context) {
         if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand'); 
           try {                  
        	           	   
        	          	   
	             search.load({
	                 id: 'customsearch3781'
	             }).run().each(function(result) {	 
	            	 
	            	 log.debug('search', 'entering search'); 
	                
		             	var return_rec_id = result.id;                  
		                
		             	var return_auth = record.load({
		             	    type: record.Type.RETURN_AUTHORIZATION, 
		             	    id: return_rec_id,
		             	    isDynamic: true,
		             	});      	
		             	
		                
		             	var numLines = return_auth.getLineCount({
	        			    sublistId: 'item'
	        			})-1;		
		             	
		             	 log.debug('numLines', numLines); 
		             	
		            	for (var i = 0; i <= numLines; i++) {	
		        			
		        		  			
		        			var lineNum = return_auth.selectLine({
		        			    sublistId: 'item',
		        			    line: i
		        			});
		        			
		        			return_auth.setCurrentSublistValue({
		        			    sublistId: 'item',
		        			    fieldId: 'isclosed',
		        			    value: true,
		        			    ignoreFieldChange: true
		        			});
		        			
		        			return_auth.commitLine({
		    	      			sublistId: 'item'
		    	  			  });
		        	 				        		
        			
        			 } // end looping though contacts
		            	
		            	  var inv_id = return_auth.save({
		                      enableSourcing: false,
		                      ignoreMandatoryFields: false
		                  });
		             	
		         	/*	
		             	record.delete({
		             	    type: record.Type.RETURN_AUTHORIZATION, 
		             	    id: return_rec_id,
		             	});
		             */
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Fatal Error: Unable to remove default shipping address';
	             var authorId = -5;
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
