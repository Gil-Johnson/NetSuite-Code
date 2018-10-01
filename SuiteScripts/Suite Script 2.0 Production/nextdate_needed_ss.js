/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, email, runtime) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {    	
    	
        try { 
        	
	             search.load({
	                 id: 'customsearch3963'
	             }).run().each(function(result) {	
	            	 
	            	 var skip = false;
	            	 
	            	 var itemId = result.getValue({
	                     name: 'internalid',
	                     join: 'item',
	                     summary: search.Summary.GROUP	 
	                 });
	            	 
	            	 var itemType = result.getValue({
	                     name: 'type',
	                     join: 'item',
	                     summary: search.Summary.GROUP	 
	                 });
	            	 
	            	 var nextdate_needed = result.getValue({
	                     name: 'formuladate',
	                     summary: search.Summary.MIN	 
	                 });
	            	 
	            
	                 log.debug('Search vlaues', itemId + ' - ' + itemType + ' / ' + nextdate_needed);              
	                 
	                                
	                 
		              if(itemType == 'Assembly'){
		            	  itemType = record.Type.ASSEMBLY_ITEM;			   
		      		   }
		      		   else if(itemType == 'InvtPart'){
		      			 itemType = record.Type.INVENTORY_ITEM;
		      		   }
		      		   else if (itemType == 'Kit'){		      			   
		      			 itemType = record.Type.KIT_ITEM;		      			   
		      		   }
		      		 else if (itemType == 'NonInvtPart'){		      			   
		      			 itemType = record.Type.NON_INVENTORY_ITEM;		      			   
		      		   }            
		              
		      		   else{
		      			   
		      			   var subject = 'Alert: Unable to update next date needed due to new item type';
			  	             var authorId = 17834;
			  	             var recipientEmail = 'gjohnson@ricoinc.com';
			  	             email.send({
		  	                 author: authorId,
		  	                 recipients: recipientEmail,
		  	                 subject: subject,
		  	                 body: 'Alert: ' + runtime.getCurrentScript().id + '\n\n' + 'itemType: ' + itemType
		  	             });
		      			   
		      			   skip = true;
		      			   
		      		   }
		      		   
		              
		           if(skip == false){  
		        	   
		               record.submitFields({
		                    type: itemType,
		                    id: itemId,
		                    values: {
		                    	custitem_next_date_needed: nextdate_needed
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });	
		           } 
		                	
	          		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to update next date needed';
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

    return {
        execute: execute
    };
    
});
