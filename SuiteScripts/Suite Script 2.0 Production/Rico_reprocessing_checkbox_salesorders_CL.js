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

        /*
          if(customLabel == true) {
                nlapiSetLineItemValue('item', COMMON.REQ_REPROCESS_ID, line, 'T');
            }else if(itemName.endsWith("-h")){
                alert('itemName.endsWith("-h")')
            }else if(lineRetailPricec && lineRetailPrice != retailPrice){
                alert('lineRetailPricec && lineRetailPrice != retailPrice')
            }else if(lineAltUpc && lineAltUpc != altUpc){
                alert('lineAltUpc && lineAltUpc != altUpc')
            }else if(lineSku && lineSku !=  custSku){
                alert('lineSku && lineSku !=  custSku')
            }else{
                alert('should not set reprocessing')
            }
            */
    	
    	var crRecord = context.currentRecord;
        var sublistName = context.sublistId;        
        
        var customLabel  = crRecord.getValue({
	        fieldId: 'custbody_reqcustlabelformat'
        });         
        

    	if(sublistName === 'item'){        
        
    		
        	var item = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'item'
            });

            var itemname = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'item_display'
            });
        
        	var itemtype = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'itemtype'
            });

            if(itemtype == "Assembly"){               		
                rectype = search.Type.ASSEMBLY_ITEM;               		
            }else if (itemtype == "Kit" ){   
                rectype = search.Type.KIT_ITEM;           		     		
            }else if (itemtype == "InvtPart"){               		
                rectype = search.Type.INVENTORY_ITEM;                		
            }else{               		
                return;
            } 

            var itemupc = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'custcol_upccode'
            });

            var itemusku = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'custcol_custsku'
            });
            
            var itemretail = crRecord.getCurrentSublistValue({
        	    sublistId: 'item',
        	    fieldId: 'custcol_rtlprc'
            });

            var fieldLookUp = search.lookupFields({
                type: rectype,
                id: parseInt(item),
                columns: ['custitem_rtlprc', 'upccode', 'custitem_custsku']
            });

        
           // alert(JSON.stringify(fieldLookUp));


            if (customLabel === true || 
                itemname.endsWith("-H") ||
                itemupc && (fieldLookUp.upccode != itemupc) ||
                itemusku && (itemusku != fieldLookUp.custitem_custsku) ||
                itemretail && (itemretail != fieldLookUp.custitem_rtlprc)){
		
    		    crRecord.setCurrentSublistValue({
    		    sublistId: 'item',
    		    fieldId: 'custcol_requiresreprocessing',
    		    value: true,
    		    ignoreFieldChange: true
    		});
    		
        	}else{

                crRecord.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_requiresreprocessing',
                    value: true,
                    ignoreFieldChange: false
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
 //       pageInit: pageInit,
 //       fieldChanged: fieldChanged,
  //      postSourcing: postSourcing,
 //       sublistChanged: sublistChanged,
 //       lineInit: lineInit,
 //       validateField: validateField,
        validateLine: validateLine,
 //       validateInsert: validateInsert,
 //       validateDelete: validateDelete,
 //       saveRecord: saveRecord
    };
    
});
