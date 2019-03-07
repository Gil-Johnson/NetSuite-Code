/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/record',
    'N/search',
    '/SuiteScripts - Globals/moment',
    'N/format'
],
/**
* @param {record} record
* @param {search} search
*/
function(record, search, moment, format) {	

function highlightLines(arr, removeCl) {
    setTimeout(function () {
        for (var i = 0; i < arr.length; i++) {
            jQuery('#item_row_' + arr[i]).children('td').addClass('custom-highlight');
        }
        for (var i = 0; i < removeCl.length; i++) {
            jQuery('#item_row_' + removeCl[i]).children('td').removeClass('custom-highlight');
        }
    }, 200);

}
/**
 * Function to be executed after page is initialized.
 *
 * @param {Object} scriptContext
 * @param {Record} scriptContext.currentRecord - Current form record
 * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
 *
 * @since 2015.2
 */
function setItemFieldsPL(context) {
    


jQuery( document ).ready(function() {    
    setTimeout(function () {
    jQuery('#item_clear').click(); 
     }, 500);
});	
    
   if (context.mode === 'create')
   {     
    
    var currentRecord = context.currentRecord;	
    var createdfrom = currentRecord.getValue({
        fieldId: 'createdfrom'
    });   
    var assemblyItem = currentRecord.getValue({
        fieldId: 'assemblyitem'
    });       

        if(createdfrom){
            
            var fieldLookUp = search.lookupFields({
                type: search.Type.TRANSACTION,
                id: createdfrom,
                columns: ['type', 'enddate', 'shipdate']
            });   	    	   	    	
                           
            var enddate = fieldLookUp.enddate;     	    	
            var type = fieldLookUp.type[0].text;    	    	
        
            if(type == 'Sales Order'){       	        	
                
                var soRec = record.load({
                    type: record.Type.SALES_ORDER, 
                    id: createdfrom,
                    isDynamic: true,
                });
                
                var lineNumber = soRec.findSublistLineWithValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    value: assemblyItem
                });
            
                var item_description = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'description',
                    line: lineNumber
                });
                
                var item_sku = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_custsku',
                    line: lineNumber
                });
                
                var item_retail = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_rtlprc',
                    line: lineNumber
                });
                
                var item_upc = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_upccode',
                    line: lineNumber
                });
                
                var item_inner = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_inpk',
                    line: lineNumber
                });
                
                var item_case = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_cspk',
                    line: lineNumber
                });
                
                var shipdate = soRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'expectedshipdate',
                    line: lineNumber
                });
                
                if(!shipdate){
                    
                    shipdate = fieldLookUp.shipdate;
                    
                }
                
                
                  
                if(item_description){
                    
                    currentRecord.setValue({
                        fieldId: 'custbody_description',
                        value: item_description
                    });  	        		
                    
                    }
                
                if(item_sku){
                    
                    currentRecord.setValue({
                        fieldId: 'custbody_sku',
                        value: item_sku
                    });  	        		
                    
                    }
                
                if(item_retail){
                    
                    currentRecord.setValue({
                        fieldId: 'custbody_retailprice',
                        value: item_retail
                    });  	        		
                    
                    }
                
                if(item_upc){
                    
                    currentRecord.setValue({
                        fieldId: 'custbody_upccode',
                        value: item_upc
                    });  	        		
                    
                    }
                
                if(item_inner){
                    
                    currentRecord.setValue({
                        fieldId: 'custbody_innerpack',
                        value: item_inner
                    });  	        		
                    
                    }
                
                if(item_case){
                    
                    currentRecord.setValue({
                        fieldId: 'custbody_casepack',
                        value: item_case
                    });  	        		
                    
                    }
                
                
                if(shipdate){
                // shipdate = moment(shipdate).format('MM DD YYYY');  	    	
                
                // shipdate = moment(shipdate).subtract('days', 3); 
                
                       
                //  if (shipdate.isoWeekday() === 6){       	    	
                //      shipdate = moment(shipdate).subtract('days', 1);    	    		 
                //  } 
                // if (shipdate.isoWeekday() === 7){      	    		
                //     shipdate = moment(shipdate).subtract('days', 2);     	    		
                //  }   
                
                // shipdate = moment(shipdate).format('MM/DD/YYYY');    	       
                
                //  shipdate = format.parse({
                //     value: shipdate,
                //     type: format.Type.DATE
                // });
                try{
                currentRecord.setValue({
                    fieldId: 'enddate',
                    value: shipdate
                });
                }
                catch(e){}
                
                }
                
            }
            else {   	 	        	
                
                if(enddate){
                //   enddate = moment(enddate).format('MM DD YYYY');  	    	
                
                // enddate = moment(enddate).subtract('days', 3); 
                
                       
                //  if (enddate.isoWeekday() === 6){       	    	
                //      enddate = moment(enddate).subtract('days', 1);    	    		 
                //  } 
                // if (enddate.isoWeekday() === 7){      	    		
                //     enddate = moment(enddate).subtract('days', 2);     	    		
                //  }   
                
                // enddate = moment(enddate).format('MM/DD/YYYY');
                
                // enddate = format.parse({
                //     value: enddate,
                //     type: format.Type.DATE
                // });
                         
                try{
                 currentRecord.setValue({
                    fieldId: 'enddate',
                    value: enddate
                });	 
                }
                catch(e){}
                 
                }
                
            }     
            
            
            
         }  
        
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
       
    if (scriptContext.fieldId == 'quantity'  && scriptContext.sublistId != 'item') {
        setTimeout(function () {
               jQuery('#item_clear').click(); 
        }, 1000);
    } 
    

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
    
     if (scriptContext.sublistId == 'item') {
           
        jQuery('#item_clear').click(); 
   } 

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
    
      if (scriptContext.sublistId == 'item') {
          setTimeout(function () {
          jQuery('#item_clear').click(); 
          }, 500);
    } 
    

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
    
    pageInit: setItemFieldsPL,        
    fieldChanged: fieldChanged,   
    sublistChanged: sublistChanged, 
    /*
    postSourcing: postSourcing,
    sublistChanged: sublistChanged,
    lineInit: lineInit,
    validateField: validateField,
    validateLine: validateLine,
 validateInsert: validateInsert,
    validateDelete: validateDelete,
    saveRecord: saveRecord
   */
 
};




    
});


