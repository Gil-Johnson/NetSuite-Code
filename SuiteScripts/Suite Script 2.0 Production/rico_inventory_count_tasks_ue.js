/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime', '/SuiteScripts - Globals/lodash'],

function(record, search, email, runtime, lodash) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
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
     
		try{	
			
		  itemSearch.run().each(function(result) {		  
			  
			  var recid = result.id;
			     				  
			  var item_name = result.getText({
	              name: 'item'
	           });
			  
			  var item_type = result.getValue({
	              name: 'type'
	           });
			  
			  var isInactive = result.getValue({
	              name: 'isinactive'
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
				  
			      				 
		   				
			  log.debug('parseFloat(binonhandavail)', parseFloat(binonhandavail));
			  
			  itemsToProcess.push({
						  itemid : recid, 
						  item_type: item_type, 
						  qtyadj: parseFloat(binonhandavail), 
						  binNumber:binNumber, 
						  binLocation:binLocation, 
						  qtyType: 'negitive',
						  isInactive: isInactive  
					  }); 
			  
			  return true; 
			  
		  	  });  
		  
		}catch(e){
			
			log.debug('error', JSON.stringify(e));
		}
	
		  
    	
    	return itemsToProcess; 	    	
		
	}
    
 function searchInvCountRecs(inv_count_Id, itemsToProcess, needAr) {
	
	  log.debug('searchInvCountRecs', 'searchInvCountRecs in');
	  	
	  
	  if(needAr == true){
	     var itemsToProcess = [];
	  }
    	
    	 var invCountSearch = search.load({
	         id: 'customsearch4440',
	      });	
	  
			 
		
		  invCountSearch.filters.push(search.createFilter({
	         name: 'custrecord_initiating_task',
	         operator: 'ANYOF',
	         values: inv_count_Id
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
			  
			  var isInactive = result.getValue({
	              name: 'isinactive',
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
				  binInternalid:binInternalid,
				  isInactive: isInactive
				  });
			  
			  return true; 
			  
		  	  });    
		  
		  log.debug('searchInvCountRecs', 'searchInvCountRecs out');
		  
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
			
			  log.debug('item dose not have bin', 'item_id: ' + item_id + '  Bin String: ' + binString);
			  
			  itemsToAddBins.push({item_id : item_id, item_type:item_type}); 
			  return true; 
			  
		  	  });  
		  
	  		  
      if(itemsToAddBins.length > 0){
			  
		  itemsToAddBins.forEach(function(item) {
			  
			  log.debug('item.item_id', item.item_id);
			  
			  var recType = getNSType(item.item_type);
			  
			  log.debug('recType', recType);
			  
			  var itemRecord = record.load({
				    type: recType, 
				    id: item.item_id,
				    isDynamic: false,
				});
			  				  
			   var numLines = itemRecord.getLineCount({
				    sublistId: 'binnumber'
				});
			   
			   log.debug('numLines', numLines);

			 
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
    
 function createInvenotryAdjRec(invCountItems, inv_count_Id, task_type, task_warehouse, clearBins) {	
       
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
			
			log.debug('error', JSON.stringify(e));
		}
   	
   	
	   for (var k = 0; k < invCountItems.length; k++) {	
		   
		   log.debug('invCountItems[k].qtyadj', invCountItems[k].qtyadj);
		      	   
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
		      
              if(task_type == 1 || clearBins == true){
            	  
            	  if(invCountItems[k].qtyType == 'positive'){		    	   
   		    	   quantity = parseFloat(invCountItems[k].qtyadj);		    	   
   		       } else{
   		    	   
   		    	   quantity = parseFloat(invCountItems[k].qtyadj) * -1;	 
   		       }   
            	  
               binString = invCountItems[k].binNumber + '(' + parseFloat(invCountItems[k].qtyadj) + ')';    		      
            	  
              }else{
            	  log.debug('task_type', task_type);
            	  
            	  quantity = invCountItems[k].qtyadj - invCountItems[k].onHandQty;            	  
            	  binString =  invCountItems[k].binNumber + '(' + Math.abs(quantity) + ')';            	  
              }
              
               log.debug('binstring' ,'item: '+ invCountItems[k].itemid + " binstring:  " + binString);	       
		       log.debug('quantity', quantity);
		       
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'adjustqtyby',
		           value: parseFloat(quantity)
		       });	       		              
		       
		       
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'binnumbers',
		           value: binString
		       });		              
		       
		       		       
		       inventory_adjustment.setCurrentSublistValue({
		           sublistId: 'inventory',
		           fieldId: 'memo',
		           value: 'created from Inventory Count Task ' + inv_count_Id
		       });
		    
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
 
 function submitInvAdj(inv_count_Type, inv_count_Id, invAdjId){
	 
	   record.submitFields({
             type: inv_count_Type,
             id: inv_count_Id,
             values: {
            	 custrecord_inv_count_adjustment: invAdjId
             },
             options: {
                 enableSourcing: false,
                 ignoreMandatoryFields : true
             }
         });
	 
	 
 }
 
 function handleInactiveItems(itemsArray, inactive){ 
	 itemsArray.forEach( function (item)
			 {		 
		 		var itemType = getNSType(item.item_type);
			    
				   record.submitFields({
			             type: itemType,
			             id: item.itemid,
			             values: {
			            	 isinactive: inactive
			             },
			             options: {
			                 enableSourcing: false,
			                 ignoreMandatoryFields : true
			             }
			         });		 
			 });	 
 }
    
    function afterSubmit(context) {
    	
    	  if (context.type !== context.UserEventType.EDIT && context.type !== context.UserEventType.XEDIT){ 
    	    	 log.debug('context.type', context.type); 
    	    	 return;
    	     }  
    	  
    	  try{   
    		  
    		    
    	    	 var inv_count_Record = context.newRecord;
    	    	 var inv_count_Id = inv_count_Record.id; 
    	    	 var inv_count_Type = inv_count_Record.type;
	       	 
	       	 
    	       	var is_complete = inv_count_Record.getValue({
    	    	    fieldId: 'custrecord_inv_count_task_complete'
    	    	});
    	       	
    	       	var task_type = inv_count_Record.getValue({
    	    	    fieldId: 'custrecord_inv_count_task_type'
    	    	});
    	       	
    	       	var bin_name = inv_count_Record.getText({
    	    	    fieldId: 'custrecord_inv_count_task_bin'
    	    	});
    	       	
    	    	var bin_id = inv_count_Record.getValue({
    	    	    fieldId: 'custrecord_inv_count_task_bin'
    	    	});
    	       	
    	    	var linkedadjustment = inv_count_Record.getText({
    	    	    fieldId: 'custrecord_inv_count_adjustment'
    	    	});
    	    	
    	    	var task_warehouse = inv_count_Record.getValue({
    	    	    fieldId: 'custrecord_count_task_warehouse'
    	    	});
    	    	
    	    	var processAdjustment = inv_count_Record.getValue({
    	    	    fieldId: 'custrecord_pr_adjustment'
    	    	});
    	    	
    	    	var binIsEmpty = inv_count_Record.getValue({
    	    	    fieldId: 'custrecord_bin_empty'
    	    	});
    	    	
    	    	
    	    	var inactiveItems = [];
    	    	var inactiveitems2 = [];
    	    	
    	    	
    	    //	log.debug('vales', is_complete + "  / " + binIsEmpty + "  /  " + linkedadjustment);    	   
    	    	
    	    	if(is_complete == true  && binIsEmpty == true && !linkedadjustment){
    	    		
      	    	  log.debug('triggering script 1');
      	    	  
      	    	  //search all items in bin on record and pull their qty    	       	     	       	  
      	   	      var itemsToProcess = runItemSearch(bin_name);       			
       			  log.debug('itemsToProcess', itemsToProcess.length);
       			  
       		 	  if(itemsToProcess.length <= 0){
        	       		   log.debug('returning', "no items to process");
        	       		   return;
        	       	   }	
       		 	  
       		 	  inactiveItems = _.filter(itemsToProcess, function(o) { return o.isInactive; });
       		 	  
	       		   if(inactiveItems.length <= 0){
		       		   log.debug('inactivefunction', "no inactive items");		       		  
		       	   }else{		       		   
		       		handleInactiveItems(inactiveItems, false);		       		   
		       	   }
       			     				
       	           //create invenotry adjustment     			   
       			   var invAdjId = createInvenotryAdjRec(itemsToProcess, inv_count_Id, task_type, task_warehouse, true);          			   
       			   submitInvAdj(inv_count_Type, inv_count_Id, invAdjId);
       			   
       			   if(inactiveItems.length > 0){
       				handleInactiveItems(inactiveItems, true);	       		  
		       	   }
       			     
       	       	} else if(is_complete == true && task_type == 1 && !linkedadjustment){
         	       		
         	          	log.debug('triggering script 3');
         	           var invCountItemsStop = searchInvCountRecs(inv_count_Id, null, true);
         	          if(invCountItemsStop.length <= 0){
   	   	       		   log.debug('returning', "no items to process");
   	   	       		   return;
  	       	          }
         	           
    	       		
		    	       	   var itemsToProcess = runItemSearch(bin_name);	
		    	       	   
		    	        	inactiveItems = _.filter(itemsToProcess, function(o) { return o.isInactive; });
		    	       	   
		    			   var invCountItems = searchInvCountRecs(inv_count_Id, itemsToProcess, false);
		    			   
		    			   inactiveItems2 = _.filter(invCountItems, function(f) { return f.isInactive; });
		    			   
		    			 	
    			
		    	    inactiveItems   = _.concat(inactiveItems, inactiveItems2);
		    	    if(inactiveItems.length <= 0){
			       		   log.debug('inactivefunction', "no inactive items");		       		  
			       	   }else{		       		   
			       		handleInactiveItems(inactiveItems, false);		       		   
			       	   }
		    	    
//		    	    if (invCountItems.length === itemsToProcess.length) {
//                        log.debug('returning', "no inv count recs to process");
//                        return;
//                    }
		    	    
		    	    
		    	    
    			   //verify bins are on item records if not add them    			  		   
    			   updateItems(invCountItems, bin_id,  bin_name);   			   
    			   
    			     				
    	           //create invenotry adjustment     			   
    			   var invAdjId = createInvenotryAdjRec(invCountItems, inv_count_Id, task_type, task_warehouse);  	
    			   
    			   submitInvAdj(inv_count_Type, inv_count_Id, invAdjId);
    		       
    			   if(inactiveItems.length > 0){
          				handleInactiveItems(inactiveItems, true);	       		  
   		       	   }
    			     
    	       	} else if(is_complete == true && !linkedadjustment && (task_type == 3 ||  task_type == 4 )){
    	       		
    	       	   log.debug('triggering script 4');
     	       	   
    	       	   var invCountItems2 = searchInvCountRecs(inv_count_Id, null, true);  
    	       	   
    	       	   if(invCountItems2.length <= 0){
   	       		   log.debug('returning', "no items to process");
   	       		   return;
   	       	       }
    	       	   
    	       	  inactiveItems = _.filter(invCountItems2, function(f) { return f.isInactive; });
    	          if(inactiveItems.length <= 0){
		       		   log.debug('inactivefunction', "no inactive items");		       		  
		       	   }else{		       		   
		       		handleInactiveItems(inactiveItems, false);		       		   
		       	   }
     			 
     			   //verify bins are on item records if not add them    			  		   
     			   var invAdjItems = upDateItems2(invCountItems2);   				   
     			   
     			   //create invenotry adjustment     			   
     			   var invAdjId = createInvenotryAdjRec(invAdjItems, inv_count_Id, task_type, task_warehouse);  		   
     			   
     			  submitInvAdj(inv_count_Type, inv_count_Id, invAdjId);
     			  if(inactiveItems.length > 0){
        				handleInactiveItems(inactiveItems, true);	       		  
 		       	   }
     	       		
     	       	}  else if(processAdjustment == true && task_type == 2 && !linkedadjustment){
    	    		
    	    		log.debug('triggering script 5');
    	       		
     	       	   var itemsToProcess = runItemSearch(bin_name);	 
     	           if(itemsToProcess.length <= 0){
   	       		   log.debug('returning', "no items to process");   	       		
   	       	       }   	           
     	           
     	           inactiveItems = _.filter(itemsToProcess, function(o) { return o.isInactive; });     	           
     	           
     			   var invCountItems = searchInvCountRecs(inv_count_Id, itemsToProcess, false);
     			   
     			  inactiveItems2 = _.filter(invCountItems, function(f) { return f.isInactive; });
     			   
     			   inactiveItems   = _.concat(inactiveItems, inactiveItems2);
		    	    if(inactiveItems.length <= 0){
			       		   log.debug('inactivefunction', "no inactive items");		       		  
			       	   }else{		       		   
			       		handleInactiveItems(inactiveItems, false);		       		   
			       	   }
     			
     			  log.debug('invCountItems', invCountItems.length);
     			   //verify bins are on item records if not add them    			  		   
     			   updateItems(invCountItems, bin_id,  bin_name);   			   
     			   
     			     				
     	           //create invenotry adjustment     			   
     			   var invAdjId = createInvenotryAdjRec(invCountItems, inv_count_Id, task_type, task_warehouse);    			   
     			   submitInvAdj(inv_count_Type, inv_count_Id, invAdjId);
     			   
     			  if(inactiveItems.length > 0){
      				handleInactiveItems(inactiveItems, true);	       		  
		       	   }
     			     
     	       	}else {
     	       		
     	       		log.debug('donothing');
     	       	}
    	    	
    	   
    	    	

    	    	
    	    	
    	       	
    	       	
    } catch (e) {
        var subject = 'Fatal Error: Unable to process invenotry count task';
        var authorId = -5;
        var recipientEmail = 'gjohnson@ricoinc.com';
        email.send({
            author: authorId,
            recipients: recipientEmail,
            subject: subject,
            body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
        });
    }
    	  }

    return {
     //   beforeLoad: beforeLoad,
     //   beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
