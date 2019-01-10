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

	function getNSType(ns_type){
	  
		//	  log.debug('ns_type', ns_type);
				
				if(ns_type == 'Assembly'){
					  ns_type= record.Type.ASSEMBLY_ITEM;			   
				   }
				   else if(ns_type == 'InvtPart'){
					 ns_type = record.Type.INVENTORY_ITEM;
				   }
				   else if (ns_type == 'Kit'){		      			   
					 ns_type = record.Type.KIT_ITEM;		      			   
				   }
				  else if (ns_type == 'NonInvtPart'){		      			   
					ns_type = record.Type.NON_INVENTORY_ITEM;		      			   
				   } 
				
				return ns_type;
				
			}

	  
	function getBinQty(bin, item_id) {
		
		var binQty = 0;

        var itemSearch = search.load({
 	         id: 'customsearch4378',
 	      });	
 		 
 		  itemSearch.filters.push(search.createFilter({
 		         name: 'internalid',
 		         operator: 'ANYOF',
 		         values: parseInt(item_id)
 		     }));
 		  
 		  
 		  itemSearch.filters.push(search.createFilter({
 		         name: 'binnumber',
 		         operator: 'is',
 		         values: bin
 		     }));
 		  
 		 var searchResult = itemSearch.run().getRange({
	            start: 0,
	            end: 1
	            });
 		 
 		 log.debug('searchResult.length', searchResult.length);
 		 
          for (var i = 0; i < searchResult.length; i++) {
          	
          	var itemName = searchResult[i].getValue({
                  name: 'name'
              });	
          	
          	var binName = searchResult[i].getValue({
                  name: 'binnumber'
              });	
          	
          	 binQty = searchResult[i].getValue({
                  name: 'binonhandavail'
              });	
          	
          	 log.debug('in function', binQty);
          	
          }

          log.debug('in function 2', binQty);
		return binQty;
		
	}
	
	
	 function execute(context) {
		 
         if (context.type !== context.InvocationType.ON_DEMAND)
         	log.debug('ondemand', 'ondemand'); 
           try {                  
        	  
        	   var scriptObj = runtime.getCurrentScript();	
        	   var deployment = scriptObj.deploymentId;
        	   
        	   log.debug(deployment);
        	   
        
        	   var inventory_adjustment = record.create({
                   type: record.Type.INVENTORY_ADJUSTMENT,
                   isDynamic: true
               });
        	    
        	   inventory_adjustment.setValue({
                   fieldId: 'account',
                   value: 459
               });
        	   
        	   var today = new Date();
        	   var month = today.getMonth() + 1;
        	   var day = today.getDate();
        	   var year = today.getFullYear();
        	   
        	   var adjustLocation = "";
        	   
        	   if(deployment === 'customdeploy_scrap_inv_adjust_niles'){
        		   adjustLocation = 1;        		   
        	   }
        	   else if(deployment === 'customdeploy_scrap_inv_adjust_hs'){
        		   adjustLocation = 2; 
        	   }else{
        		   return;
        	   }
        	   
                	   
        	   var inv_memo = "Scrap Adjustment for " +  month + '-' + day + '-' + year;
        	          	   
        	   inventory_adjustment.setValue({
                   fieldId: 'memo',
                   value: inv_memo
               });
        	   
        	        	   
        	   inventory_adjustment.setValue({
                   fieldId: 'adjlocation',
                   value: parseInt(adjustLocation)
               });
        	   
        	        	   
        		 var scrapSearch = search.load({
                     id: 'customsearch3751',
                  });
        		 
        		    			 
        		 try{
    			 if(adjustLocation){				 
    				 scrapSearch.filters.push(search.createFilter({
    	    			 join: 'custrecord_associated_assembly_build',
    	    			 name: 'location',
    	                 operator: 'is',
    	                 values: parseInt(adjustLocation)
    	             }));  
    				 }
        		 }catch(e){
        			 log.debug('error', JSON.stringify(e));
        		 }
        	   
    
        		 
    			 scrapSearch.run().each(function(result) {       	 
	                   
	            	   var binQty = 0;
	                    
		             	var scrap_rec_id = result.id;                  
		                
		                var scrap_item = result.getValue({
		                    name: 'custrecord_scrap_item'
		                });
		                
		                log.debug('scrap_item', scrap_item);
		                
		                var scrap_qty = result.getValue({
		                    name: 'custrecord_scrap_qty'
		                });
		                
		                var scrap_bin = result.getValue({
		                    name: 'custrecord_sc_binnumbers'
		                });
		             
		                var scrap_assembly_build = result.getValue({
		                    name: 'custrecord_associated_assembly_build',	                    
						});	     
						
						var scrap_assembly_item = result.getValue({
							join: 'custrecord_associated_assembly_build',	
							name: 'item'                    
						});	
						
						var assembly_scrap_item = search.lookupFields({
							type: 'item',
							id: parseInt(scrap_assembly_item),
							columns: ['isinactive', 'type']
						});

						log.debug('assembly_scrap_item.isinactive', assembly_scrap_item.type[0].value);

						var scrapItemType = getNSType(assembly_scrap_item.type[0].value)
						

						if(assembly_scrap_item.isinactive == true){
							record.submitFields({
			                    type: scrapItemType,
			                    id: parseInt(scrap_assembly_item),
			                    values: {
			                    	isinactive : false
			                    }
			                });
							
						}
						
		                
		               	if(scrap_bin){	
		               		log.debug('in scrap bin to function',scrap_bin);
		                    binQty = getBinQty(scrap_bin, scrap_item); 	
		               	}                
		               
		               	log.debug('scrap_qty', scrap_qty);
		               	log.debug('binQty', binQty);
		             
		                if(parseFloat(binQty) < parseFloat(scrap_qty)){	                	
		                	var errorMsg = 'not enough qty in bin for invenotry adjustment';
		                	
		                    record.submitFields({
			                    type: 'customrecord_scrap_qty',
			                    id: scrap_rec_id,
			                    values: {
			                    	custrecord_scrap_errored: true,
			                    	custrecord_scrap_error: errorMsg 
			                    },
			                    options: {
			                        enableSourcing: false,
			                        ignoreMandatoryFields : true
			                    }
			                });
		                		
		                      return true;
		                	
		                } else {	                	
		                
		                	log.debug('adding item', 'adding item');
		                
		                var assembly_build_item = result.getValue({
		                    name: 'item',
		                    join : 'custrecord_associated_assembly_build'
		                }); 
		                
		                var assembly_build_wo = result.getValue({
		                    name: 'createdfrom',
		                    join : 'custrecord_associated_assembly_build'
		                }); 
		               	        
		                var assembly_build_warehouse = result.getValue({
		                    name: 'location',
		                    join : 'custrecord_associated_assembly_build'
		                }); 		                
		         
		
			              inventory_adjustment.selectNewLine({
			                  sublistId: 'inventory'
			              });
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'item',
			                  value: scrap_item
			              });
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'location',
			                  value: assembly_build_warehouse
			              });
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'adjustqtyby',
			                  value: scrap_qty * -1
			              });
			              
			              		              
			              var binString = scrap_bin + '(' + scrap_qty + ')'; 
			              log.debug('binstring' , binString);
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'binnumbers',
			                  value: binString
			              });		              
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'custcol_scrap_adjust_assembly_build',
			                  value: scrap_assembly_build
			              });
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'custcol_scrap_adjus_item',
			                  value: assembly_build_item
			              });
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'custcol_linked_wo',
			                  value: assembly_build_wo
			              });		              
			           
			              
			              inventory_adjustment.setCurrentSublistValue({
			                  sublistId: 'inventory',
			                  fieldId: 'memo',
			                  value: 'created from scrap record ' + scrap_rec_id
			              });
			           
			              try{
			            	  
			              inventory_adjustment.commitLine({
			      			sublistId: 'inventory'
			  			  });
			              
			              }catch(e){
			            	
			            	     record.submitFields({
					                    type: 'customrecord_scrap_qty',
					                    id: scrap_rec_id,
					                    values: {
					                    	custrecord_scrap_errored: true,
					                    	custrecord_scrap_error: 'item was not added to invenotry adjustment:  ' + JSON.stringify(e)
					                    },
					                    options: {
					                        enableSourcing: false,
					                        ignoreMandatoryFields : true
					                    }
					                });
			            	  
			            	   
						  }
						  
						  if(assembly_scrap_item.isinactive == true){
							record.submitFields({
			                    type: scrapItemType,
			                    id: parseInt(scrap_assembly_item),
			                    values: {
			                    	isinactive : true
			                    }
			                });
							
						}
			                         
	  		                
			               record.submitFields({
			                    type: 'customrecord_scrap_qty',
			                    id: scrap_rec_id,
			                    values: {
			                    	custrecord_processed: true
			                    },
			                    options: {
			                        enableSourcing: false,
			                        ignoreMandatoryFields : true
			                    }
			                });
			              
		                }
		             
	                 return true;
	             });          
	           
	             
	         } catch (e) {
	             var subject = 'Fatal Error: Unable to Create Innventory Adjustment Records';
	             var authorId = 17834;
	             var recipientEmail = 'gjohnson@ricoinc.com';
	             email.send({
	                 author: authorId,
	                 recipients: recipientEmail,
	                 subject: subject,
	                 body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
	             });
	         }
	         
	         var inv_id = inventory_adjustment.save({
                 enableSourcing: false,
                 ignoreMandatoryFields: false
             });
	        
	         log.debug('inv_id', inv_id);
	                 
             var usageRemaining = scriptObj.getRemainingUsage(); 
             log.debug('usageRemaining', usageRemaining);
	         
	     }

    return {
        execute: execute
    };
    
});
