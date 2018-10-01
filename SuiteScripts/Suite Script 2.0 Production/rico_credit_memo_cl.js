/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/currentRecord','N/search'],
/**
 * @param {record} record
 */
function(record, currentRecord, search) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(context) {
    	
    	if (context.mode === 'create')
       	{
    	 var crRecord = currentRecord.get();
    	
    	 crRecord.setValue({
    		    fieldId: 'shippingcost',
    		    value: 0,
    		    ignoreFieldChange: true
    		}); 
    	 

    	   crRecord.setValue({
    		    fieldId: 'custbody_emailinvoice',
    		    value: false,
    		    ignoreFieldChange: true
    		}); 
       	}
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(context) {
    	
    	

    	
    
    	

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {
    	
    	
    	

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(context) {
    	
    	var crRecord = context.currentRecord;
        var sublistName = context.sublistId;        
        
        var customer  = crRecord.getValue({
	        fieldId: 'entity'
	    });         
       	
    	var fieldLookUp = search.lookupFields({
    	    type: search.Type.ENTITY,
    	    id: parseInt(customer),
    	    columns: ['custentity_comlvl']
    	});
    	
    	try{
    	var comissionRate = fieldLookUp.custentity_comlvl[0].value;  
    	}catch(e){
    		
    	}
    
    	   	
    	if(sublistName === 'item'){        
        
    		
        	var subCommission = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'custcol_commpercent'
        	});
        	
        	
        	var price = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'price'
        	});
        	
        	
        	if (!subCommission && price != -1){
        		
    		    crRecord.setCurrentSublistValue({
    		    sublistId: 'item',
    		    fieldId: 'class',
    		    value: parseInt(comissionRate),
    		    ignoreFieldChange: true
    		});
    		
        	}
    	
    	}
    	
    	 return true;

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(context) {   
    	

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    return {
        pageInit: pageInit,
 //       fieldChanged: fieldChanged,
  //      postSourcing: postSourcing,
 //       sublistChanged: sublistChanged,
 //       lineInit: lineInit,
 //       validateField: validateField,
//        validateLine: validateLine,
 //       validateInsert: validateInsert,
 //       validateDelete: validateDelete,
 //       saveRecord: saveRecord
    };
    
});
