/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect', 'N/email', 'N/runtime', 'N/ui/serverWidget', 'N/search',  '/SuiteScripts - Globals/moment',  'N/format', 'N/workflow'],
/**
 * @param {record} record
 * @param {redirect} redirect
 */
function(record, redirect, email, runtime, ui, search, moment, format, workflow) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
	
    function onRequest(context) {
    	
    	 if (context.request.method === 'GET') {   		      
            
    try {
    	    
    		var inventoryCountTaskid = context.request.parameters.recId; 
    		var assignedUser = context.request.parameters.AssignedTo;
    		var recordType = context.request.parameters.recType;
    	
    		
    		var form = ui.createForm({
                title: 'Inventory Count Task Recount'
            });    		
    		
    		form.addSubmitButton({
                label: 'Create Recount'
            });
    		
       		
    		 var recid_field = form.addField({
                 id: 'recid',
                 type: ui.FieldType.TEXT,
                 label: 'rec Id'
             });
    		 
    		 recid_field.updateDisplayType({
 			    displayType : ui.FieldDisplayType.HIDDEN
 			 });		
    		 
    		 recid_field.defaultValue = parseInt(inventoryCountTaskid);
    		 
    		 
    		 var rectype_field = form.addField({
                 id: 'rectype',
                 type: ui.FieldType.TEXT,
                 label: 'rec type'
             });
    		 
    		 rectype_field.updateDisplayType({
 			    displayType : ui.FieldDisplayType.HIDDEN
 			 });		
    		 
    		 rectype_field.defaultValue = recordType;
    		 
    		 
    		 var assignedUser_field = form.addField({
                 id: 'assigneduser',
                 type: ui.FieldType.TEXT,
                 label: 'The last assigned user was',                
             });
    		 assignedUser_field.updateDisplayType({
 			    displayType : ui.FieldDisplayType.INLINE
 			});
    		 
    		 assignedUser_field.defaultValue = assignedUser;
    		 
    		 
    		 var newAssign = form.addField({
    			    id : 'newassign',
    			    type : ui.FieldType.SELECT,
    			    label : 'To whom should the recount be assigned?',
    			    source: 'customlist_dsi_user'
    		});
             
    		 newAssign.isMandatory = true; 
    
       		  
       		  
       	   
             
    } catch (e) {
        var subject = 'Error: item roll up error in get request';
        var authorId = 17834;
        var recipientEmail = 'gjohnson@ricoinc.com';
        email.send({
            author: authorId,
            recipients: recipientEmail,
            subject: subject,
            body: 'Error occurred get request of script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
        });
    }
             
     	 
    		 context.response.writePage(form);
    		
    	
     		 
         } else {  
        	 
        	 var recid = context.request.parameters.recid;
        	 var newassign = context.request.parameters.newassign;
        	// var recType = context.request.parameters.rectype;
          
             
              
		             
		             var newItem = record.copy({
		                 type: 'customrecord_inv_count_task',
		                 id: Math.round(recid),
		                 isDynamic: true,
		             });             
		                      
			             newItem.setValue({
			                 fieldId: 'custrecord_inv_count_task_assigned_to',
			                 value : newassign 
			             });
			             
			              newItem.setValue({
			                 fieldId: 'custrecord_inv_count_task_complete',
			                 value : false 
			             });
			              newItem.setValue({
			                  fieldId: 'custrecord_inv_count_task_type',
			                  value : 2
			              });
			              
			              
			              newItem.setValue({
			                  fieldId: 'custrecord_inv_count_adjustment',
			                  value : null 
			              });   
			              
			              newItem.setValue({
			                  fieldId: 'custrecord_bin_empty',
			                  value : false
			              });  
			              
			              newItem.setValue({
			                  fieldId: 'custrecord_inv_count_task_dsi_checked',
			                  value : false
			              });  
			              
			              
			              newItem.setValue({
			                  fieldId: 'custrecord_inv_count_task_memo',
			                  value : null 
			              }); 
			             
			              var itemId = newItem.save();                     
			                          
			           
		         
		             redirect.toRecord({
		                 type: 'customrecord_inv_count_task',
		                 id: parseInt(itemId)
		             });
		       	   
		        	 
		         }    	

    }

    return {
        onRequest: onRequest
    };
    
});

/*
 * 	 
    
 */
