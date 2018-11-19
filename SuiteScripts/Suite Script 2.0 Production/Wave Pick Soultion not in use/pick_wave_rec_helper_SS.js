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
         
           try {  
        	
			var scriptObj = runtime.getCurrentScript();
        //	log.debug("Script parameter of custscript1: " + scriptObj.getParameter({name: 'custscript1'}));
        	
        	var waveId = scriptObj.getParameter({name: 'custscript_waveid'});	
        	var item = scriptObj.getParameter({name: 'custscript_item'});	 
        	var qtyAvl = parseInt(scriptObj.getParameter({name: 'custscript_qtyavl'}));  
        	var bin = scriptObj.getParameter({name: 'custscript_bin'}); 
        	
        	
        	log.debug("parameters", waveId + " / " + item + " / " + qtyAvl + " / "  + bin);
        	
        	   	   
        	//run search for all items on waves to pick   	       	
   	       	var orderSearch = search.load({
   		         id: 'customsearch5062',
   		      });     	
   			
   	     
   			  orderSearch.filters.push(search.createFilter({
   		         name: 'custbody_current_wave',
   		         operator: 'is',
   		         values: parseInt(waveId)
   		     }));	     
   			  
   	       
   			  orderSearch.filters.push(search.createFilter({
    		         name: 'item',
    		         operator: 'is',
    		         values: parseInt(item)
    		     }));       
   			  
   			  
   			  orderSearch.run().each(function(result) {	    				  
   				  var orderid = result.id;   
   				      				     				  
   				  var item_name = result.getValue({
   		              name: 'item'
   		           });
   				  
   				  var quantityOpen = result.getValue({
   		              name: 'formulanumeric'
   		           });	
   				  
   				  log.debug('item_name', item_name);    				  
   				  
   				  var fulfillmentRecord = record.transform({
   					    fromType: record.Type.SALES_ORDER,
   					    fromId: orderid,
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
		            			            	    
		            		  //loop though line items and uncheck items to fulfill		        			
		        			var itemValue = fulfillmentRecord.getSublistValue({
		        			    sublistId: 'item',
		        			    fieldId: 'item',
		        			    line: i
		        			});
		        			
		        			 var binString = bin + '(' + qtyAvl + ')';
		        			 
		        			if(itemValue == item_name){	
	 	        			//check to see if we have enough qty to fulfill the this order
		        				
	                            if(parseInt(qtyAvl) < parseInt(quantityOpen)){
	                            	
	                            	log.debug('qtyAvl < quantityOpen');	
	                            
	                            	
	                            	fulfillmentRecord.setSublistValue({
	    		        			    sublistId: 'item',
	    		        			    fieldId: 'quantity',
	    		        			    line: i,
	    		        			    value: parseInt(qtyAvl)
	    		        			}); 
	                            	
	                               	fulfillmentRecord.setSublistValue({
	    		        			    sublistId: 'item',
	    		        			    fieldId: 'binnumbers',
	    		        			    line: i,
	    		        			    value: bin
	    		        			});
	                            	
		        				}
	                            
	                          
	                        	fulfillmentRecord.setSublistValue({
    		        			    sublistId: 'item',
    		        			    fieldId: 'binnumbers',
    		        			    line: i,
    		        			    value: bin
    		        			});
	                        	
	                        	log.debug('before subtraction qtyAvl', qtyAvl  + '   quantityOpen:' +  quantityOpen);
	                            qtyAvl = parseInt(qtyAvl) - parseInt(quantityOpen);
	                        	log.debug('after subtractionqtyAvl', qtyAvl  + '   quantityOpen:' +  quantityOpen);
	                             				
		        				
		        			} else {		        		    
		        			
		        			fulfillmentRecord.setSublistValue({
		        			    sublistId: 'item',
		        			    fieldId: 'itemreceive',
		        			    line: i,
		        			    value: false
		        			});	      			
		        			
		        				        			
		        			}	        			
       			
       			 } // end looping though items on fulfillments   				  
   				  
   				  try{
   				  var fulfillmentid = fulfillmentRecord.save();
   				  }catch(e){
   					  
   					  log.error('error on save of fulfillment', JSON.stringify(e));
   				  }
   				  
   				  log.debug('fulfillmentid', fulfillmentid);
                     
   				  if(qtyAvl < 1){
   					  
   					  return false;
   					  
   				  }else{
   					  
   					  return true; 
   					  
   				  }		
   				  
   				 
   				  
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
