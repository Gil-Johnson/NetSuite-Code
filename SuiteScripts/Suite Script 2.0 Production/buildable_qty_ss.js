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
	                 id: 'customsearch2387'
	             }).run().each(function(result) {	
	            	 
	            	 var itemId = result.id;
	            	 var itemType = result.recordType;
	            	 
	            	 var recType ='';
	            	 var buildQty = null;
	            	 
	            	            	 
	            	 var warehouseOnHand = result.getValue({	            		 
	                     name: 'locationquantityonhand',	                    
	                 });	
	            	 
	            	 var subcompoentOf = result.getValue({	            		 
	                     name: 'custitem_subcomponentof',	                    
	                 });
	            	 
	            	 var subcompoentOf_type = result.getValue({	            		 
	                     name: 'formulatext',	 
	                     }); 
	               
	            	 if(!warehouseOnHand){
	            		 log.debug('warehouseOnHand ', warehouseOnHand);
	            		 buildQty = null;
	            	 }
	            	 else{
	            		 
	            		 buildQty = Math.round(warehouseOnHand);
	            		 log.debug(' buildQty ',  buildQty);
	            		 
	            	 }
	            	 
	            	 
	            	 if(subcompoentOf_type == 'Assembly/Bill of Materials'){
	            		 recType = record.Type.ASSEMBLY_ITEM;
	            	 }  
	            	 else if (subcompoentOf_type == 'Inventory Item'){
	            		 recType = record.Type.INVENTORY_ITEM;
	            	 }  
	            	 else{
	            		 
	            		 return;
	            	 }
	            	 
	            	 
	            	 log.debug('Values from search ', 'warehouse: ' + warehouseOnHand + ' /subcompoentOf: ' + subcompoentOf + ' / subcompoentOf_type ' + subcompoentOf_type);
	            	 
	            	
	            	 try {   	                
		               record.submitFields({
		                    type: recType,
		                    id: subcompoentOf,
		                    values: {
		                    	custitem_buildableqty: buildQty
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
	             var subject = 'Error: Unable to update buildable qty on Item';
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
