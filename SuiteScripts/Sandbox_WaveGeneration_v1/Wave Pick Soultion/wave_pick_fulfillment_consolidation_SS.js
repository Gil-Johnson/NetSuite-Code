/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime', '/SuiteScripts - Globals/lodash'],
/**
 * @param {record} record
 * @param {search} search
 * @param {email} email
 * @param {runtime} runtime
 */
function(record, search, email, runtime, lodash) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
	 function execute(context) {
         
           try {  
        	
			var scriptObj = runtime.getCurrentScript();
        //	log.debug("Script parameter of custscript1: " + scriptObj.getParameter({name: 'custscript1'}));
        	
        	var waveId = scriptObj.getParameter({name: 'custscript_wave_id'});
        	var fulfillments = [];        
             	
        	log.debug("parameters", waveId);        	
        	   	   
        	//run search for all items on waves to pick   	       	
   	       	var fuiflillmentSearch = search.load({
   		         id: 'customsearch5070',
   		      });     	
   			
   	     
   	       fuiflillmentSearch.filters.push(search.createFilter({
   		         name: 'custbody_current_wave',
   		         join: 'createdfrom',
   		         operator: 'is',
   		         values: parseInt(waveId)
   		     }));	     
   			  
   	    var itemName = "";   
   	    var createdFromSO = "";
   	      			  
   	    fuiflillmentSearch.run().each(function(result) {
   	    	
   	    	//log.debug('values', JSON.stringify(result));
   	        	
		   	     var fuiflillmentid = result.getValue({
		             name: 'internalid',
		             summary: search.Summary.GROUP	 
		         });		   	     
		   	   				      				     				  
				  var item_name = result.getValue({
		              name: 'item',
		             summary: search.Summary.GROUP
		           });				  
   				  
   				  var quantity = result.getValue({
   		              name: 'quantity',
   		              summary: search.Summary.MAX
   		           });	
   				  
   				 var binNumber = result.getValue({
  		              name: 'binnumber',  		             
  		            summary: search.Summary.GROUP
  		           });	
	   				 
   				 var salesorder = result.getValue({
  		              name: 'createdfrom',  		             
  		            summary: search.Summary.GROUP
  		           });
   				 
   				    				  
   				   log.debug('search vals', 'fuiflillmentid: '+ fuiflillmentid + "   /item_name: "+item_name+"   /quantity:"+quantity+"  " +
   				   		"/binNumber: " + binNumber + "  /salesOrder: "+salesorder);
   				   
   				   var binString =  binNumber + '(' + Math.abs(quantity) + ')' ;
   				   
   				   
   				   if(item_name == itemName && salesorder == createdFromSO){
   				   //if item is the same as last add qty and concat the bin string	   
   					fulfillments[fulfillments.length-1].qty =  fulfillments[fulfillments.length-1].qty + Math.abs(quantity);
   					fulfillments[fulfillments.length-1].binString = fulfillments[fulfillments.length-1].binString + ',' + binString;
   					   
   				   }else{
   				   
   				   //create arry of fulfillments to consolidate
   			       fulfillments.push({id:fuiflillmentid,item: item_name, qty: Math.abs(quantity), bin: binNumber, binString: binString ,salesorder: salesorder})  ;
   			       
   				   }
   			      	
   			       try{
   			        record.delete({
   		       	    type:  record.Type.ITEM_FULFILLMENT, 
   		       	    id: parseInt(fuiflillmentid)
   		         	});
   			       }catch(e){
   			    	   
   			    	   log.error('error on deleting fulfillment', JSON.stringify(e));
   			       }
   			       
   			        itemName = item_name;
   			        createdFromSO  = salesorder;
   								  
   					return true; 				  
   				    				  
   			  	  });  	
   	    
   	    log.debug('fulfillments array', JSON.stringify(fulfillments));
   	 
   	    //remove duplicates from fulfillments array
   	    var cleanFulfillments = _.uniqBy(fulfillments, function(elem) { return [elem.item, elem.bin, elem.salesorder].join(); });
   	    
     	 log.debug('cleanFulfillments array', JSON.stringify(cleanFulfillments));   	 
     	
     	// return;
      	 //consolidate item fulfillments based on sales order
		   	 var grouped = _.groupBy(fulfillments, function(IF) {
		   	  return IF.salesorder;
		   	});
		
		   	log.debug('grouped array', JSON.stringify(grouped));
		   	
		  	
		   	//loop though grouped array and create fulfillments
		   	    	
		   	Object.keys(grouped).forEach(function(key, index) {
		   		
		   	  var fulfillmentRecord = record.transform({
					    fromType: record.Type.SALES_ORDER,
					    fromId: parseInt(key),
					    toType: record.Type.ITEM_FULFILLMENT,
					    isDynamic: false,
					});
				  
				  fulfillmentRecord.setValue({
					    fieldId: 'shipstatus',
					    value: 'A',
					    ignoreFieldChange: true
					});
				  
				  var numLines = fulfillmentRecord.getLineCount({
					    sublistId: 'item'
					});	 
				  
				  for (var i = 0; i <= numLines-1; i++) {
					  
						fulfillmentRecord.setSublistValue({
	        			    sublistId: 'item',
	        			    fieldId: 'itemreceive',
	        			    line: i,
	        			    value: false
	        			});	
					  
				  }
				  
				  
		   	  	   		
		   		log.debug('key', key);
		   	//	log.debug('index', index);		   		
		   		
		   		_.forEach(grouped[key], function(arrayItem) {
		   			
		   		    log.debug('item', arrayItem.item); 
		   	    	log.debug('bin', arrayItem.bin); 
		   		    log.debug('qty', Math.abs(arrayItem.qty)); 
			   			
			   					   			
				   		var lineNumber = fulfillmentRecord.findSublistLineWithValue({
	     		    	    sublistId: 'item',
	     		    	    fieldId: 'item',
	     		    	    value: arrayItem.item
	     		    	 }); 
				   		
				   		log.debug('line num', lineNumber);
				   		
				   		fulfillmentRecord.setSublistValue({
	        			    sublistId: 'item',
	        			    fieldId: 'itemreceive',
	        			    line: parseInt(lineNumber),
	        			    value: true
	        			});	
			    		 
				   	  	fulfillmentRecord.setSublistValue({
	        			    sublistId: 'item',
	        			    fieldId: 'quantity',
	        			    line: parseInt(lineNumber),
	        			    value: Math.abs(arrayItem.qty)
	        			}); 
                    	
                       	fulfillmentRecord.setSublistValue({
	        			    sublistId: 'item',
	        			    fieldId: 'binnumbers',
	        			    line: parseInt(lineNumber),
	        			    value: arrayItem.binString
	        			});   				    
	   				 
		   		});
			   	try{	
			   	  var fulfillmentid = fulfillmentRecord.save();
			   	}catch(e){
			   		
			   		log.debug(JSON.stringify(e));
			   	}
   				  log.debug('fulfillmentid', fulfillmentid);
		   		
		   		
		   		
		   	});
                  
	           
	             
	         } catch (e) {
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
	         
	         log.debug('usageRemaining2', scriptObj.getRemainingUsage()); 
	         
	     }

    return {
        execute: execute
    };
    
});
