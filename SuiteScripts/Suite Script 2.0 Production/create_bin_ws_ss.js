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
        	   var today = new Date();
        	   var month = today.getMonth() + 1;
        	   var day = today.getDate();
        	   var year = today.getFullYear();
        	   var inv_memo = "Created Via Scheduled Script On " +  month + '-' + day + '-' + year;
        	   
        	   var inventory_adjustment = record.create({
                   type: record.Type.BIN_WORKSHEET,
                   isDynamic: true
               });
        	    
        	   inventory_adjustment.setValue({
                   fieldId: 'location',
                   value: 1 // need to know the location
               });
        	   
        	   inventory_adjustment.setValue({
                   fieldId: 'transdate',
                   value: today.getDate()
               });
        	   
        	   inventory_adjustment.setValue({
                   fieldId: 'memo',
                   value: inv_memo
               });
        	   
        	
        	   
	             search.load({
	                 id: 'customsearch3751'
	             }).run().each(function(result) {
	            	 
	                
		             	var scrap_rec_id = result.id;                  
		                
		                var scrap_item = result.getValue({
		                    name: 'custrecord_scrap_item'
		                });
		                
		                var scrap_qty = result.getValue({
		                    name: 'custrecord_scrap_qty'
		                });
		             
		                var scrap_assembly_build = result.getValue({
		                    name: 'custrecord_associated_assembly_build',	                    
		                });
		                
		                var assembly_build_item = result.getValue({
		                    name: 'item',
		                    join : 'custrecord_associated_assembly_build'
		                }); 
		                
		                var assembly_build_wo = result.getValue({
		                    name: 'createdfrom',
		                    join : 'custrecord_associated_assembly_build'
		                }); 
		               	        
		                var assembly_build_warehouse = result.getValue({
		                    name: 'location',
		                    join : 'custrecord_associated_assembly_build'
		                }); 
		                
		             //   scrap_rec_id
		                
		               record.submitFields({
		                    type: 'customrecord_scrap_qty',
		                    id: scrap_rec_id,
		                    values: {
		                    	custrecord_processed: true
		                    },
		                    options: {
		                        enableSourcing: false,
		                        ignoreMandatoryFields : true
		                    }
		                });
		
	              inventory_adjustment.selectNewLine({
	                  sublistId: 'inventory'
	              });
	              
	              inventory_adjustment.setCurrentSublistValue({
	                  sublistId: 'inventory',
	                  fieldId: 'item',
	                  value: scrap_item
	              });
	              
	              inventory_adjustment.setCurrentSublistValue({
	                  sublistId: 'inventory',
	                  fieldId: 'adjustqtyby',
	                  value: scrap_qty * -1
	              });
	              
	              inventory_adjustment.setCurrentSublistValue({
	                  sublistId: 'inventory',
	                  fieldId: 'custcol_scrap_adjust_assembly_build',
	                  value: scrap_assembly_build
	              });
	              
	              inventory_adjustment.setCurrentSublistValue({
	                  sublistId: 'inventory',
	                  fieldId: 'custcol_scrap_adjus_item',
	                  value: assembly_build_item
	              });
	              
	              inventory_adjustment.setCurrentSublistValue({
	                  sublistId: 'inventory',
	                  fieldId: 'custcol_linked_wo',
	                  value: assembly_build_wo
	              });
	              
	              inventory_adjustment.setCurrentSublistValue({
	                  sublistId: 'inventory',
	                  fieldId: 'location',
	                  value: assembly_build_warehouse
	              });
	              
	              inventory_adjustment.setCurrentSublistValue({
	                  sublistId: 'inventory',
	                  fieldId: 'memo',
	                  value: 'created from scrap record ' + scrap_rec_id
	              });
	           
	              inventory_adjustment.commitLine({
	      			sublistId: 'inventory'
	  			  });
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Fatal Error: Unable to Create Innventory Adjustment Records';
	             var authorId = 17834;
	             var recipientEmail = 'gjohnson@ricoinc.com';
	             email.send({
	                 author: authorId,
	                 recipients: recipientEmail,
	                 subject: subject,
	                 body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
	             });
	         }
	         
	         var inv_id = inventory_adjustment.save({
                 enableSourcing: false,
                 ignoreMandatoryFields: false
             });
             
             log.debug('inv id', inv_id); 
	         
	     }

    return {
        execute: execute
    };
    
});
