/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/currentRecord','N/search'],

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
    	
    	if (context.mode !== 'create'){
    		
    		return true;
    	}
    	
    	var assemblyBuildRecord = context.currentRecord;
    	
    	var productTypeId = assemblyBuildRecord.getValue({
	        fieldId: 'custbody_woproducttype'
	    }); 
    		
    	var productTypeRec = search.lookupFields({
    	    type: 'customrecord_producttypes',
    	    id: productTypeId,
    	    columns: ['custrecord_wip_bin', 'custrecord_receiving_bin']
    	}); 
    	var wipBin = '';
    	var receivingBin = '';
    	
    	if(productTypeRec.custrecord_wip_bin[0]){    	   	    	
    	wipBin = productTypeRec.custrecord_wip_bin[0].text;   
    	}
    	
    	if(productTypeRec.custrecord_receiving_bin[0]){     	
    	receivingBin = productTypeRec.custrecord_receiving_bin[0].text; 
    	}
    	     	 
        // alert('wipBin: ' + wipBin  + '  //receivingBin: ' + receivingBin);
		 
		 if(receivingBin){
			 
			 assemblyBuildRecord.setValue({
	                fieldId: 'binnumbers',
	                value: receivingBin
	            });		 
		 }
		 else{
			 
			 assemblyBuildRecord.setValue({
	                fieldId: 'binnumbers',
	                value: ''
	            });	
			 
			 alert('There is no receiving Bin. Please eneter a BIN in the Bin Field');
		 }
			 
		
		 if(wipBin){
			 
		 
		 var numLines = assemblyBuildRecord.getLineCount({
			    sublistId: 'component'
			});
		 
		// alert('wipBin: ' + wipBin);	 
	
		 
		 for (var b = 0; b < numLines; b++) {  
			 
			 assemblyBuildRecord.selectLine({
				    sublistId: 'component',
				    line: b
				});
			 
			 assemblyBuildRecord.setCurrentSublistValue({
				    sublistId: 'component',
				    fieldId: 'binnumbers',			    
				    value: wipBin,
				    ignoreFieldChange: true
				});	 
			 
			 assemblyBuildRecord.commitLine({
		      	    sublistId: 'component'
		        	}); 
			 
		 }
		 
    }
		 else{
			 
			 alert('There is no WIP Bin associated with this product type');
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
    function fieldChanged(context) {
    	
    	

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
    function postSourcing(scriptContext) {

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
    function validateLine(scriptContext) {

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
    function validateInsert(scriptContext) {

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
     //   fieldChanged: fieldChanged,
      //  postSourcing: postSourcing,
      //  sublistChanged: sublistChanged,
     //   lineInit: lineInit,
     //   validateField: validateField,
     //   validateLine: validateLine,
     //   validateInsert: validateInsert,
     //   validateDelete: validateDelete,
     //   saveRecord: saveRecord
    };
    
});
