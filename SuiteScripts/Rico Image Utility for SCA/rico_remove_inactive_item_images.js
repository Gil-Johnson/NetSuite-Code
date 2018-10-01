/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime', 'N/file'],
/**
 * @param {record} record
 * @param {search} search
 * @param {email} email
 * @param {runtime} runtime
 */
function(record, search, email, runtime, file) {
   
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
	                 id: 'customsearch5859'
	             }).run().each(function(result) {
	            	 
	            	
	            	 
	            	 var itemId = result.id;
	            	 var itemType = result.recordType;
	            	 
	            	 var itemName = result.getValue({
	                     name: 'name'	                   
	                 });
	            	 
	            	 
	            // run another search for the file	 
	            	 var fileSearch = search.load({
	       		         id: 'customsearch5801',
	       		      });     	
	       			
	       	     
	       			  fileSearch.filters.push(search.createFilter({
	       		         name: 'name',
	       		         operator: search.Operator.STARTSWITH,
	       		         values: itemName
	       		     }));	     
	       			  
	       	             
	       			  
	       			  
	       			  fileSearch.run().each(function(result) {	    				  
	       				  var fileid = result.id;   
	       				      				     				  
	       				file.delete({
	       				    id: fileid
	       				});
    
	       					  
	       					  return true; 
	       					         				 
	       				  
	       			  	  });  
	          
	            	           	 
	            	 
	            	
	            	 try {   	
	            		 
		               record.submitFields({
		                    type: itemType,
		                    id: parseInt(itemId),
		                    values: {
		                    	custitem_pulled_sca_image: false
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });	
	            	 }
	            	 catch(e){
	            		 
	            	log.error('error', JSON.stringify(e));
	            		 
	            	 }	          
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to remove inactive item image';
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
