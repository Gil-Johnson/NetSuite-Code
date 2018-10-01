/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/record','N/runtime', 'N/search', 'N/email'],
/**
 * @param {record} record
 */

function(record, runtime, search, email) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */ 
 

  
   function lineItemsEvents(context, binId, locationId){
	   
	   var itemReceipt = context.currentRecord;  
	   var itemsOnOrder = [];
	   
	   var numLines = itemReceipt.getLineCount({
		    sublistId: 'item'
		});

	 
	 for (var b = 0; b < numLines; b++) {  
		 
		 itemReceipt.selectLine({
			    sublistId: 'item',
			    line: b  
			});
		 
		 var itemId = itemReceipt.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'item',
			    line: b
			});	
		 
		 var itemqty = itemReceipt.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'itemquantity',
			    line: b
			});	
		 
		 
		 var itemtype = itemReceipt.getSublistValue({
			    sublistId: 'item',
			    fieldId: 'itemtype',
			    line: b
			});	
		 
		 if(itemtype != 'InvtPart' && itemtype != 'Assembly'){			 
			 continue;
		 }
			 
		 itemsOnOrder.push(itemId);
		 
		 var binString = binId + '(' + itemqty + ')'; 
	//	 alert(binString);
				 
		 itemReceipt.setCurrentSublistValue({
			    sublistId: 'item',
			    fieldId: 'binnumbers',			    
			    value: binString,
			    ignoreFieldChange: true
			});	 
		 
		 if(locationId != null){
		 itemReceipt.setCurrentSublistValue({
			    sublistId: 'item',
			    fieldId: 'location',			    
			    value: locationId,
			    ignoreFieldChange: true
			});	
		 }
		 
		 itemReceipt.commitLine({
	      	    sublistId: 'item'
	        	});     	
   	
   } 
	   
	   return itemsOnOrder; 
	   
	   
   }
   
 
	
	
    function pageInit(context) { 
    	
    try{
    	
	jQuery( document ).ready(function() {    		    
	   	 
    var css = '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.4/css/bootstrap.min.css" integrity="sha384-2hfp1SzUoho7/TsGGGDaFdsuuDL0LX2hnUp6VkX3CUQ2K4K+xjboZdsXyp4oUHZj" crossorigin="anonymous">' +
	 "<style> #overlay { position:  absolute; top: 0; left: 0;  width: 100%; height: 500%; background-color: #000; filter:alpha(opacity=50);  -moz-opacity:0.5; -khtml-opacity: 0.5; opacity: 0.5; z-index: 10000;} </style> " ;
    var d = document.createElement('div'); d.innerHTML = css; document.body.appendChild(d);     
     var processingbox = jQuery('<div id="overlay" style="display:none; text-align: center"> <div style="position:absolute;top:5%;width:900px;left:20%" >    <h3 style="color:white"> Please Wait While Processing...... <img src="https://checkout.netsuite.com/core/media/media.nl?id=2406571&c=3500213&h=26185cc85f875d2647b1" alt="waiting" height="100" width="100">  </h3> </div>  </div>');      
    jQuery('#pageContainer').append(processingbox);    
	    	
    	
	if (context.type === context.mode.CREATE){  
		
	      	
    var userObj = runtime.getCurrentUser();
    var binId = '';
    var binInternalId = '';
    var locationId = userObj.location;   
        
    var createdfrom = context.currentRecord.getText({fieldId: 'createdfrom'});    	
	   var check =  createdfrom.split(" ");  	
	    if(check[0] == 'Transfer'){	    	
	    	return true;
	    }   
   
       
    if(locationId === 2){
    	
    	binId = 'Receiving-H';
    	binInternalId = 13508;
    }
    else if(locationId === 1){
    	
    	binId = 'RECEIVING-N';
    	binInternalId = 13811;
     }
    else{
    	
    	 return true;
     	
    }      	
    
    
	    var itemsOnOrder = lineItemsEvents(context, binId, locationId);
	    
	    if(itemsOnOrder.length > 0){
	    
	    	  datain = {
					  
					  itemsOnOrder:itemsOnOrder,
					  binInternalId: binInternalId,
					  binId:binId  
			  }
			  
			  
			  jQuery.ajax({
				    type: "post",
				    dataType: "json",
				    contentType: "application/json",
				    url: "/app/site/hosting/restlet.nl?script=308&deploy=1",
				    data: JSON.stringify(datain),
				    beforeSend: function(){
				    	if(itemsOnOrder.length > 5){				    	
				    	jQuery( "#overlay" ).show();
				    	}
				      },				     
				    success: function(data){
				    	log.debug(data);
				    },	
				    error: function(){
				        alert('failure');
				        jQuery( "#overlay" ).hide();
				      },
				}).done(function() {
						 jQuery( "#overlay" ).hide();
				});  
	    
	    }
    
	 }
    	 });//end jquery doc statement
	}catch(e){
		   var subject = 'Error: Unable to update commited status on orders';
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
    	
    	try{
    	
    	var itemReceipt = context.currentRecord; 
    	var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
    	
    	  if (context.fieldId == 'custbody_change_bin'){
    		  
    		  var binId = itemReceipt.getText({fieldId: 'custbody_change_bin'});
    		  var binInternalId = itemReceipt.getValue({fieldId: 'custbody_change_bin'});     		  
    		  
    		  var itemsOnOrder = lineItemsEvents(context, binId, null);  
    		  
    		  if(itemsOnOrder.length > 0){
    		  
    			  datain = {
    					  
    					  itemsOnOrder:itemsOnOrder,
    					  binInternalId: binInternalId,
    					  binId:binId  
    			  }
    			  
    			  
    			  jQuery.ajax({
  				    type: "post",
  				    dataType: "json",
  				    contentType: "application/json",
  				    url: "/app/site/hosting/restlet.nl?script=308&deploy=1",
  				    data: JSON.stringify(datain),
  				    beforeSend: function(){
  				    	if(itemsOnOrder.length > 5){				    	
  				    	jQuery( "#overlay" ).show();
  				    	}
  				      },				     
  				    success: function(data){
  				    	log.debug(data);
  				    }
  				}).done(function() {
  						 jQuery( "#overlay" ).hide();
  				});  		
    		  
    		  }
    		  
    		 
    	  }
    	  
    	  if (sublistName === 'item' && sublistFieldName === 'quantity'){
    		  
    		    		     		  
    		  itemReceipt.setCurrentSublistValue({
    			    sublistId: 'item',
    			    fieldId: 'binnumbers',
    			    value: '',
    			    ignoreFieldChange: true
    			});
    		  
    		  
    	  }
    	}catch(e){
    		   var subject = 'Error: Unable to update commited status on orders';
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
        fieldChanged: fieldChanged,
     //   postSourcing: postSourcing,
   //     sublistChanged: sublistChanged,
   //     lineInit: lineInit,
   //     validateField: validateField,
   //     validateLine: validateLine,
   //     validateInsert: validateInsert,
   //     validateDelete: validateDelete,
   //     saveRecord: saveRecord
    };
    
});
