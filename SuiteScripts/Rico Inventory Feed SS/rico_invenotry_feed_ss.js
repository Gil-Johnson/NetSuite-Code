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
    function execute(context) {    	
    	
    	var scriptObj = runtime.getCurrentScript();
    	log.debug("Deployment Id: " + scriptObj.deploymentId);
    	var grouping = false;
    	var searchId = null;
    	var itemType = null;
    	
    	if(scriptObj.deploymentId == 'customdeploy_inv_feed_5909'){
    		searchId = 5909;
    		itemType = record.Type.INVENTORY_ITEM;		
    	}else if (scriptObj.deploymentId == 'customdeploy_inv_feed_5910'){
    		searchId = 5910;
    		itemType = record.Type.KIT_ITEM;
    		grouping = true;
    	}else if (scriptObj.deploymentId == 'customdeploy_inv_feed_5911'){
    		searchId = 5911;
    		itemType = record.Type.ASSEMBLY_ITEM;
    	}else if (scriptObj.deploymentId == 'customdeploy_inv_feed_5918'){
    		searchId = 5918;
    		itemType = record.Type.ASSEMBLY_ITEM;
    	}
    	

    	
        try { 
        	
	             search.load({
	                 id: searchId
	             }).run().each(function(result) {	
	            	 
	            	 var itemId = null;
	            	 var  invFeedVal = null;
	  
	            	 if(grouping == false){
	            		 
	            		 itemId = result.id;
	            		 
	            		 invFeedVal = result.getValue({
		                     name: 'formulanumeric',      	 
		                 });
	            		 	 
	            		 
	            	 }else{
	            		 
		            	 itemId = result.getValue({
		                     name: 'internalid',
		                     summary: search.Summary.GROUP	 
		                 });
		            	 
		            	 invFeedVal = result.getValue({
		                     name: 'formulanumeric',
		                     summary: search.Summary.MIN 
		                 });
	            		 
	            		 
	            	 }
	            	 
	            	 log.debug('item id', itemId);
            		 log.debug('inv value', invFeedVal);
            		 log.debug('itemType', itemType);
	            	 
	            	 var itemRecord = record.load({
	            		    type:itemType, 
	            		    id: itemId,
	            		    isDynamic: false,
	            		});
	            	             	 
	            	 itemRecord.setValue({
	            		    fieldId: 'custitem_invfeednumber',
	            		    value: parseInt(invFeedVal),
	            		    ignoreFieldChange: true
	            		});
	            	
	            	 var recordId = itemRecord.save({
	            		    enableSourcing: true,
	            		    ignoreMandatoryFields: true
	            		});
	            	 
	            	 log.debug('rec id', recordId);
	            	 
	            	 
	            	if(scriptObj.getRemainingUsage() > 500){
	            		
	            		return;
	            	}

	          		             
	                  return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Error: Unable to update invenotry feed number in search' + scriptObj.deploymentId;
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
