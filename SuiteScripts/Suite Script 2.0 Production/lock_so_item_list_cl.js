/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '/SuiteScripts - Globals/jquery.modal', 'N/currentRecord'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search, modal, currentRecord) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {      	
    	
    	 var css = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.4/css/bootstrap.min.css" integrity="sha384-2hfp1SzUoho7/TsGGGDaFdsuuDL0LX2hnUp6VkX3CUQ2K4K+xjboZdsXyp4oUHZj" crossorigin="anonymous">' +
    	 "<style> #overlay { position:  absolute; top: 0; left: 0;  width: 100%; height: 100%; background-color: #000; filter:alpha(opacity=50);  -moz-opacity:0.5; -khtml-opacity: 0.5; opacity: 0.5; z-index: 10000;} </style> " ;
    	 	 
    	 
         var d = document.createElement('div'); d.innerHTML = css; document.body.appendChild(d);	    
         
            
    	    jQuery( document ).ready(function() {     	    	
    	    	
    	    	 var record = currentRecord.get();
    	    	 
    	    	
    	  
    	  	    	    	
    	    	     	    	  
    	    	  var mySearch = search.load({
    	              id: 'customsearch4159',
    	           });
    	  		 
    	  		 mySearch.filters.push(search.createFilter({
    	              name: 'internalid',
    	              operator: 'ANYOF',
    	              values: record.id
    	          }));  	  		 
    	  		 
    	  		 		 
    	  		var resultsNum = 0;
    	  		
    	  		 mySearch.run().each(function(result) {
    	  			  
    	  			    resultsNum++;   	  			 
    	  		        
    	  	       //   alert(resultsNum);    	  		        
    	  		        
    	  		        return true; 	 
    	  		        		        
    	  		    }); 
    	  		 
    	  		 if(resultsNum != 0){
    	  			 
    	  		   jQuery('#item_form').prepend('<div> <h2> The picking ticket has been printed or this order is in a wave, and items can no longer be changed.  </h2> </div>');
   	        	
   	        	
    	  		   	var overlay = jQuery('<div id="overlay"> </div>');
    	  		   	jQuery('#item_form').append(overlay);  	  			 
    	  			
    	  			 
    	  		 }

    	    	
    	    	 });
    	    	

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
   //     fieldChanged: fieldChanged,
   //     postSourcing: postSourcing,
   //     sublistChanged: sublistChanged,
   //     lineInit: lineInit,
   //     validateField: validateField,
   //     validateLine: validateLine,
   //     validateInsert: validateInsert,
   //     validateDelete: validateDelete,
   //     saveRecord: saveRecord
    };
    
});
