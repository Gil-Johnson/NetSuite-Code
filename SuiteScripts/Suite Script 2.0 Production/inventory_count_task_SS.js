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
	 function runItemSearch(bin_name) {
	    	
    	 var itemSearch = search.load({
	         id: 'customsearch4438',
	      });		 
			 
		
		  itemSearch.filters.push(search.createFilter({
	         name: 'binnumber',
	         operator: 'is',
	         values: bin_name
	     }));
		  
          var itemsToProcess = []; 
     
			
		  itemSearch.run().each(function(result) {		  
			  
			  var recid = result.id;
			     				  
			  var item_name = result.getText({
	              name: 'item'
	           });
			  
			  var binonhandavail = result.getValue({
	              name: 'binonhandavail'
	           });	
			  
			  if(!binonhandavail){
				  binonhandavail = 0;
			  }
			  
			  var binNumber = result.getValue({
	              name: 'binnumber'
	           });				  
			 
				  
			var binLocation = result.getValue({
	              name: 'location',
	              join: 'binnumber'
	           });
				  
			      				 
		   				
		//	  log.debug('item name', item_name + '   or' + recid);
			  
			  itemsToProcess.push({itemid : recid, qtyadj: parseFloat(binonhandavail), binNumber:binNumber, binLocation:binLocation, qtyType: 'negitive'}); 
			  return true; 
			  
		  	  });    
		  
    	
    	return itemsToProcess; 	    	
		
	}
    
 function searchInvCountRecs(inv_count_Id, itemsToProcess, needAr) {
	 
	  log.debug('searchInvCountRecs', 'searchInvCountRecs in');
	    var itemsToProcess = [];
	    
	    	
    	 var invCountSearch = search.load({
	         id: 'customsearch4440',
	      });		 
			 
		
		  invCountSearch.filters.push(search.createFilter({
	         name: 'custrecord_initiating_task',
	         operator: 'ANYOF',
	         values: parseInt(inv_count_Id)
	     }));
		  
         			
		  invCountSearch.run().each(function(result) {		  
			  
			  var recid = result.id;
			     				  
			  var item = result.getValue({
	              name: 'custrecord_inv_count_item'
	           });
			  
			  var countQty = result.getValue({
	              name: 'custrecord_inv_count_qty'
	           });	
			  
			  var countBin = result.getText({
	              name: 'custrecord_inv_count_bin'
	           });	
			  
			 				  
			  var  binLocation = result.getValue({
		              name: 'location',
		              join: 'custrecord_inv_count_bin'
		       });
			  
			  var itemType = result.getValue({
	              name: 'type',
	              join: 'custrecord_inv_count_item'
	          });
			  
			  var binInternalid = result.getValue({
	              name: 'internalid',
	              join: 'custrecord_inv_count_bin'
	          });
				  
			//	log.debug('itemType', itemType);	
				
			 // itemsToProcess.push({itemid : item , qtyadj:parseFloat(countQty), binNumber:countBin, binLocation:binLocation, qtyType: 'positive'});
			  
			  itemsToProcess.push({
				  itemid : item, 
				  qtyadj:parseFloat(countQty), 
				  binNumber:countBin, 
				  binLocation:binLocation, 
				  qtyType: 'positive', 
				  item_type:itemType,
				  onHandQty: 0,
				  binInternalid:binInternalid 
				  });
			  
			  return true; 
			  
		  	  });    
		  
		  log.debug('searchInvCountRecs', 'searchInvCountRecs out');
		  log.debug('itemsToProcess', itemsToProcess.length);
    	  return itemsToProcess; 	    	
		
	}

 
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

 function updateItems(itemsOnOrder, binInternalId,  binId) {
	 
	    var itemsToSearch = [];
	    
	    log.debug('binInternalId', binInternalId);
	    
	    for (var x = 0; x < itemsOnOrder.length; x++) {	
	    	
	    	itemsToSearch.push(itemsOnOrder[x].itemid);
	    
	    }	    
		 
		 var itemsToAddBins = [];
				
		 var itemSearch = search.load({
	         id: 'customsearch4222',
	      });		 
			 
		log.debug('binId', binId);
			
	
		  itemSearch.filters.push(search.createFilter({
	         name: 'internalid',
	         operator: 'ANYOF',
	         values: itemsToSearch
	     }));
		  
	if(binId.length > 4){					
			
		  itemSearch.filters.push(search.createFilter({
		         name: 'formulanumeric',
		         operator: 'equalto',
		         values: 0,
		         formula: "case when NS_CONCAT({binnumber}) like '%"+ binId +"%' then 1 else 0 end",
		         summary: search.Summary.MAX
		     }));	
		  
	}
		  
			
	itemSearch.run().each(function(result) {		  
			  
			  var item_id = result.getValue({
	              name: 'internalid',
	              summary: search.Summary.GROUP	 
	          });
			  
			  var item_type = result.getValue({
	              name: 'type',
	              summary: search.Summary.GROUP	 
	          });
			  
			  var binString = result.getValue({
	              name: 'formulatext',
	              summary: search.Summary.MAX 
	          });				  
			
			  log.debug('item that doesnt have bin', 'item_id: ' + item_id + '  Bin String: ' + binString);
			  
			  itemsToAddBins.push({item_id : item_id, item_type:item_type}); 
			  return true; 
			  
		  	  });  
		  
	  		  
      if(itemsToAddBins.length > 0){
			  
		  itemsToAddBins.forEach(function(item) {
			  
		//	  log.debug('item.item_id', item.item_id);
			  
			  var recType = getNSType(item.item_type);
			  
		//	  log.debug('recType', recType);
			  
			  var itemRecord = record.load({
				    type: recType, 
				    id: item.item_id,
				    isDynamic: false,
				});
			  				  
			   var numLines = itemRecord.getLineCount({
				    sublistId: 'binnumber'
				});
			   
			//   log.debug('numLines', numLines);

			 
			   var newLine = itemRecord.insertLine({
				    sublistId: 'binnumber',
				    line: parseInt(numLines),
				    ignoreRecalc: true
				});
			   
			   itemRecord.setSublistValue({
				    sublistId: 'binnumber',
				    fieldId: 'binnumber',
				    line: parseInt(numLines),
				    value: parseInt(binInternalId)
				});
			   
			   itemRecord.save();	

			});		
		  
		  }   
	
   }
 
 function upDateItems2(invCountItems2){
	 
	 log.debug('upDateItems2', 'upDateItems2 in');
	 
	 invCountItems2.forEach(function(item) {
		  
		 // log.debug('item.item_id', item.itemid + ' item.item_type/'+item.item_type);
		  
		  var recType = getNSType(item.item_type);
		  
		//  log.debug('recType', recType);
		  
		  var itemRecord = record.load({
			    type: recType, 
			    id: parseInt(item.itemid),
			    isDynamic: false,
			});
		  
		 		  
		  var lineNumber1 = itemRecord.findSublistLineWithValue({
	    	    sublistId: 'binnumber',
	    	    fieldId: 'binnumber',
	    	    value: item.binInternalid 
	    	});
   	 
   	    //  log.debug('lineNumber1', lineNumber1 + "  item.binNumber:" +item.binNumber);
   	      
   	      if(lineNumber1 != -1){
   	    	  
   	    	item.onHandQty = itemRecord.getSublistValue({
   	    		    sublistId: 'binnumber',
   	    		    fieldId: 'onhandavail',
   	    		    line: parseInt(lineNumber1)
   	    		});
   	    	
   	    //	log.debug('qty check', item.onHandQty);
   	      } 
   	   else{
		  
		    var numLines = itemRecord.getLineCount({
			    sublistId: 'binnumber'
			});
		   
		 //  log.debug('numLines', numLines);

		 
		   var newLine = itemRecord.insertLine({
			    sublistId: 'binnumber',
			    line: parseInt(numLines),
			    ignoreRecalc: true
			});
		   
		   itemRecord.setSublistValue({
			    sublistId: 'binnumber',
			    fieldId: 'binnumber',
			    line: parseInt(numLines),
			    value: parseInt(item.binInternalid)
			});
		   
		   itemRecord.save();
	    }

		});
	 
	 log.debug('upDateItems2', 'upDateItems2 out');
	 return invCountItems2;
	 
 }
    
 function createInvenotryAdjRec(invCountItems, inv_count_Id, task_type, task_warehouse) {	
       
	 log.debug('createInvenotryAdjRec', 'createInvenotryAdjRec in');
	 
	  var inventory_adjustment = record.create({
          type: record.Type.INVENTORY_ADJUSTMENT,
          isDynamic: true
      });
   	    
   	   inventory_adjustment.setValue({
              fieldId: 'account',
              value: 133
          });
   	   
   	   var today = new Date();
   	   var month = today.getMonth() + 1;
   	   var day = today.getDate();
   	   var year = today.getFullYear();
   	   
   	   var inv_memo = "Inventory Count " +  month + '-' + day + '-' + year;
   	   
		inventory_adjustment.setValue({
		    fieldId: 'memo',
		    value: inv_memo
		});
		
		inventory_adjustment.setValue({
		    fieldId: 'custbody_inv_count_task',
		    value: inv_count_Id
		});
		
		
		
		try{
		if(task_warehouse){
			inventory_adjustment.setValue({
			    fieldId: 'adjlocation',
			    value: parseInt(task_warehouse)
			});			
		}
		}catch(e){
			
		}
   	
   	
	   for (var k = 0; k < invCountItems.length; k++) {
		   
		   log.debug('item count', invCountItems.length);
		      	   
		   	   inventory_adjustment.selectNewLine({
		           sublistId: 'inventory'
		       });
		       
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'item',
		           value: invCountItems[k].itemid
		       });
		       
		            
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'location',
		           value: invCountItems[k].binLocation
		       });
		       
		      var quantity = 0; 
		      var binString = "";
		      
              if(task_type == 1){
            	  
            	  if(invCountItems[k].qtyType == 'positive'){		    	   
   		    	   quantity = parseFloat(invCountItems[k].qtyadj);		    	   
   		       } else{
   		    	   
   		    	   quantity = invCountItems[k].qtyadj * -1;	 
   		       }   
            	  
               binString = invCountItems[k].binNumber + '(' + invCountItems[k].qtyadj + ')';    		      
            	  
              }else{
            	  log.debug('task_type', task_type);
            	  
            	  quantity = invCountItems[k].qtyadj - invCountItems[k].onHandQty;            	  
            	  binString =  invCountItems[k].binNumber + '(' + Math.abs(quantity) + ')';            	  
              }
              
               log.debug('binstring' ,'item: '+ invCountItems[k].itemid + " binstr " + binString);	       
		       log.debug('quantity', quantity);
		       
		       try{		       
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'adjustqtyby',
		           value: parseFloat(quantity)
		       });	   
		     
		       }catch(e){
		    	   JSON.stringify(e);
		       }
		       
		       try{
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'binnumbers',
		           value: binString
		       });
		       }catch(e){
		    	   JSON.stringify(e);
		       }
		       
		       	try{	       
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'memo',
		           value: 'created from Inventory Count Task ' + inv_count_Id
		       });
		        }catch(e){  	  
			     	   
			    	   log.debug('error commitLine', JSON.stringify(e));
			       } 
		    
		       try{
		     	  
		       inventory_adjustment.commitLine({
					sublistId: 'inventory'
				  });
		       
		       }catch(e){  	  
		     	   
		    	   log.debug('error commitLine', JSON.stringify(e));
		       }  
		       
	   }   
	   
	   try{
       
       var inv_id = inventory_adjustment.save({
           enableSourcing: false,
           ignoreMandatoryFields: false
       });  
       
	   }catch(e){  	  
     	   
    	   log.debug('error on save', JSON.stringify(e));
       } 
  
       log.debug('createInvenotryAdjRec', 'createInvenotryAdjRec out');
       
       return inv_id; 
		
	}
 
	 function execute(context) {
         
           try {  
        	
			var scriptObj = runtime.getCurrentScript();
        //	log.debug("Script parameter of custscript1: " + scriptObj.getParameter({name: 'custscript1'}));
        	
        	var recId = scriptObj.getParameter({name: 'custscript_task_id'});       
        	var invAdjId = null;
        	
        	log.debug('val', recId);
        	
        	try{
        	var inv_count_Record = record.load({
        	    type: 'customrecord_inv_count_task', 
        	    id: parseInt(recId),
        	    isDynamic: true,
        	});  
        	}catch(e){
        		log.debug('error', JSON.stringy(e));
        		
        	}     
        
	       	
	       	var taskType = inv_count_Record.getValue({
	    	    fieldId: 'custrecord_inv_count_task_type'
	    	});
	       	
	       	var bin_name = inv_count_Record.getText({
	    	    fieldId: 'custrecord_inv_count_task_bin'
	    	});
	       	
	    	var bin_id = inv_count_Record.getValue({
	    	    fieldId: 'custrecord_inv_count_task_bin'
	    	});  	    
	    	
	    	var task_warehouse = inv_count_Record.getValue({
	    	    fieldId: 'custrecord_count_task_warehouse'
	    	});       	
        	
	    
        	
        if(taskType == 1){
        		
        	
       	   var itemsToProcess = runItemSearch(bin_name);	    	      
		   var invCountItems = searchInvCountRecs(recId, itemsToProcess, false);	
		   
		   log.debug('how many items', invCountItems.length);
			   
		   //verify bins are on item records if not add them    			  		   
		   updateItems(invCountItems, bin_id,  bin_name); 	   
		     				
           //create invenotry adjustment     			   
		   invAdjId = createInvenotryAdjRec(invCountItems, recId, taskType, task_warehouse); 		   
		   
        
        }else if (taskType == 3 || taskType ==4){
        	
        	log.debug('log2', taskType);
        	 
        	   var invCountItems2 = searchInvCountRecs(recId, null, true);     			   
  			 
			   //verify bins are on item records if not add them    			  		   
			   var invAdjItems = upDateItems2(invCountItems2);   				   
			   
			   //create invenotry adjustment     			   
			   invAdjId = createInvenotryAdjRec(invAdjItems, recId, taskType, task_warehouse); 
			   
        } else {
        	
        	//do nothing
        	
        	
        }    
	           
      
        log.debug('logger',  invAdjId);
        
        inv_count_Record.setValue({
            fieldId: 'custrecord_inv_count_adjustment',
            value:  invAdjId,
            ignoreFieldChange: true
        });
        
        inv_count_Record.save();
        
	             
	         } catch (e) {
	             var subject = 'Error: Unable to create inventory adjustment';
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
