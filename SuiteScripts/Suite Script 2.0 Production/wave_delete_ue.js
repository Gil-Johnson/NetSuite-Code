/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/error', 'N/record', 'N/search', 'N/email', 'N/runtime'],
/**
 * @param {error} error
 * @param {record} record
 * @param {search} search
 */
function(error, record, search, email, runtime) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(context) {  
    	
    try {
    	
    
    	 var wave_Record = context.newRecord;
       	 var waveId = wave_Record.id;
       	 var waveType = wave_Record.type;
       	 
       	 var isDeleted = wave_Record.getValue({
 		    fieldId: 'custrecord_wave_status'
 		});
       	 
     if(isDeleted != 7){
    	 
    	 log.debug('status id', isDeleted);
    	 
    	 return;
     }
       	 
       	 var soWaveSearch = search.load({
	         id: 'customsearch4785',
	      });		 
			 
       	 
       	 		
       	soWaveSearch.filters.push(search.createFilter({
	         name: 'custbody_current_wave',
	         operator: 'ANYOF',
	         values: parseInt(waveId)
	     }));
       	
       	
        log.debug('waveId', waveId);
		  
         
       try{
    	   
       
       	soWaveSearch.run().each(function(result) {		  
			  
			  var recid = result.id;
			     				  
			if(recid){
			   log.debug('So ID', recid);
			   
			   
		          record.submitFields({
                      type: record.Type.SALES_ORDER,
                      id: parseInt(recid),
                      values: {
                    	  custbody_current_wave: null,
                    	  custbody_cleared_wave: null
                      },
                      options: {
                          enableSourcing: false,
                          ignoreMandatoryFields : true
                      }
                  });  	
			}
			   
					  
			
			  return true; 
			  
		  	  }); 
       	
       }catch(e){
    	   log.debug(JSON.stringify(e));
       }
       	
    } catch (e) {
    	
    	 log.debug(JSON.stringify(e));
        var subject = 'Error: Unable to clear wave fields from sales order: ' +  recid;
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

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {

    }

    return {
      //  beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
      //  afterSubmit: afterSubmit
    };
    
});
