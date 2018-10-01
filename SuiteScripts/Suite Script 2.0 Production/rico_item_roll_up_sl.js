/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect', 'N/email', 'N/runtime', 'N/ui/serverWidget', 'N/search',  '/SuiteScripts - Globals/moment',  'N/format', 'N/workflow'],
/**
 * @param {record} record
 * @param {redirect} redirect
 */
function(record, redirect, email, runtime, ui, search, moment, format, workflow) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
	
    function onRequest(context) {
    	
    	 if (context.request.method === 'GET') {   		      
            
    try {
    	
    
    		var itemNSid = context.request.parameters.itemId; 
    		var itemNStype = context.request.parameters.itemType;
    		var isassemblywithasub = false;
    		    		
    		var item_fields = search.lookupFields({
	    	    type: itemNStype,
	    	    id: parseInt(itemNSid),
	    	    columns: ['itemid','custitem_prodtype', 'custitem2', 'custitem_specificsubcomponent', 'isinactive']
    		});  
    		
    		log.debug('fields', item_fields );
    		
    		var item_fields_custitem2 = '';
    		var item_fields_custitem_specificsubcomponent = '';
    		
    		
    		if(item_fields.custitem2 != ''){
    			item_fields_custitem2 = parseInt(item_fields.custitem2[0].value);
    		}
    		if(item_fields.custitem_specificsubcomponent != ''){
    			item_fields_custitem_specificsubcomponent = parseInt(item_fields.custitem_specificsubcomponent[0].value);
    		}    	    		
    		
    		var form = ui.createForm({
                title: 'Rolling Up item  ' + item_fields.itemid
            });    		
    		
    		form.addSubmitButton({
                label: 'Copy Item'
            });
    		var button = form.addButton({
    		    id : 'reserve_upc',
    		    label : 'Reserve UPC',
    		    functionName : "reserveUpc"
    		});
    		
    		form.clientScriptModulePath = "SuiteScripts/Suite Script 2.0 Production/clscript_item_rollup_cljs.js";	

    		
    		 var itemid_field = form.addField({
                 id: 'itemid',
                 type: ui.FieldType.TEXT,
                 label: 'Item Id'
             });
    		 itemid_field.updateDisplayType({
 			    displayType : ui.FieldDisplayType.HIDDEN
 			});		
    		 
    		 var itemtype_field = form.addField({
                 id: 'itemtype',
                 type: ui.FieldType.TEXT,
                 label: 'Item Type',                
             });
    		 itemtype_field.updateDisplayType({
 			    displayType : ui.FieldDisplayType.HIDDEN
 			});
    		 
    		 var iteminactive_field = form.addField({
                 id: 'iteminactive',
                 type: ui.FieldType.CHECKBOX,
                 label: 'Item Inactive',                
             });
    		 iteminactive_field.updateDisplayType({
 			    displayType : ui.FieldDisplayType.HIDDEN
 			});
    		
    		 if(item_fields.isinactive == true){
    			 iteminactive_field.defaultValue = "T";   			 
    		 }
    		 log.debug("test val", item_fields.isinactive);
    		     		 
    		    		 
    		 itemid_field.defaultValue = itemNSid;
    		 itemtype_field.defaultValue = itemNStype;
    		 var mainItemLable = 'New Item Name';
    		
     try{
    	   if(itemNStype == 'assemblyitem' && item_fields.custitem_specificsubcomponent != ''){
    		   isassemblywithasub = true;
    		   mainItemLable = 'New Main Item Name';    		   
      	     }
    	   
     }catch(e){
    	 
     }
     
     log.debug('isassemblywithasub', isassemblywithasub );
    	   
    	   var issub_field = form.addField({
               id: 'is_sub',
               type: ui.FieldType.TEXT,
               label: 'Has sub'
           });
     		issub_field.updateDisplayType({
			    displayType : ui.FieldDisplayType.HIDDEN
			});
     		issub_field.defaultValue = isassemblywithasub;
    	   
    	   var new_item_name = form.addField({
               id: 'new_item_name',
               type: ui.FieldType.TEXT,
               label: mainItemLable
           });    
    	   new_item_name.isMandatory = true;
    	   
    	   var upc_code = form.addField({
               id: 'upc_code',
               type: ui.FieldType.TEXT,
               label: 'UPC Code'
           }); 
    	   upc_code.updateDisplayType({
			    displayType : ui.FieldDisplayType.DISABLED
			});  	   
    	   
    	      	    		 
    		 var date_needed = form.addField({
                 id: 'date_needed',
                 type: ui.FieldType.DATE,
                 label: 'Date Needed'
             });  
    		 date_needed.isMandatory = true;
    		 
    		 var set_date = moment().add('days', 14).format('MM/DD/YYYY');   		
    			 
    		 var dateNeeded = format.parse({
	                value: set_date,
	                type: format.Type.DATETIME
	            }); 
    		 	
    		date_needed.defaultValue = dateNeeded;
    		
    		 var original_upc_code = form.addField({
                 id: 'original_upc_code',
                 type: ui.FieldType.TEXT,
                 label: 'Original UPC Code'
             });
    	    
               
    		 var mySearch = search.load({
                 id: 'customsearch4644',
              });
    		 mySearch.filters.push(search.createFilter({
                 name: 'custitem_prodtype',
                 operator: 'is',
                 values: item_fields.custitem_prodtype[0].value
             }));
    		 mySearch.filters.push(search.createFilter({
                 name: 'custitem2',
                 operator: 'is',
                 values: item_fields_custitem2
             })); 
    		 
    		 
    		 var sublist = form.addSublist({
                 id: 'sublist',
                 type: ui.SublistType.STATICLIST,
                 label: 'Main Items'
             });
             sublist.addField({
                 id: 'sublist1_item_name',
                 type: ui.FieldType.TEXT,
                 label: 'Item Name'
             });
             sublist.addField({
                 id: 'sublist2_desc',
                 type: ui.FieldType.TEXT,
                 label: 'Description'
             });
             sublist.addField({
                 id: 'sublist3_dis',
                 type: ui.FieldType.TEXT,
                 label: 'Discontinued'
             });
             sublist.addField({
                 id: 'sublist4_inv',
                 type: ui.FieldType.TEXT,
                 label: 'Inactive'
             });
             sublist.addField({
                 id: 'sublistupc',
                 type: ui.FieldType.TEXT,
                 label: 'Upc'
             });
             sublist.addField({
                 id: 'sublistorgupc',
                 type: ui.FieldType.TEXT,
                 label: 'Orginial UPC'
             });
             
             /*
             sublist.addField({
                 id: 'sublistteam',
                 type: ui.FieldType.TEXT,
                 label: 'Team'
             });
             
             sublist.addField({
                 id: 'sublistproduct',
                 type: ui.FieldType.TEXT,
                 label: 'Product Type'
             });
             */
    
    		 
    		 var searchResult = mySearch.run().getRange({
                 start: 0,
                 end: 20
                 });
    		 
             for (var i = 0; i < searchResult.length; i++) {  
            	 
            	 var sr_team = searchResult[i].getValue({     		 
                     name: 'customrecord4'
                 });
            	 var sr_prodType = searchResult[i].getValue({     		 
                     name: 'custitem_prodtype'
                 });
            //	 log.debug('test', sr_prodType);
            	 
            	 var sr_item_name = searchResult[i].getValue({     		 
                     name: 'itemid'
                 });
            	 
            	  var sr_description = searchResult[i].getValue({
            		  name: 'salesdescription',
                    });
                 
                 var sr_discontinued = searchResult[i].getValue({
                     name: 'custitem_discontinued'
                 });  
                 
                 
                 var sr_upc = searchResult[i].getValue({
                     name: 'upccode'
                 });
                 
                 var sr_org_upc = searchResult[i].getValue({
                     name: 'custitemoriginalupc'
                 });
                 
                 if(!sr_discontinued){                	 
                	 sr_discontinued = 'NO';
                 }
                 if(sr_discontinued == true){                	 
                	 sr_discontinued = 'YES';
                 }
               
                 
                 var sr_isinactive = searchResult[i].getValue({
                     name: 'isinactive'
                 });
                 
                if(!sr_isinactive){                	 
                	sr_isinactive = 'NO';
                 }
                if(sr_isinactive == true){                	 
                	sr_isinactive = 'YES';
                 }
                 
	                   sublist.setSublistValue({
	                	    id : 'sublist1_item_name',
	                	    line : i,
	                	    value : sr_item_name
	                	});
	                  
		                 sublist.setSublistValue({
		             	    id : 'sublist2_desc',
		             	    line : i,
		             	    value : sr_description
		             	});
		                 
		                 sublist.setSublistValue({
		             	    id : 'sublist3_dis',
		             	    line : i,
		             	    value : sr_discontinued 
		             	});
		               
		                 if(sr_upc){
		                 sublist.setSublistValue({
		             	    id : 'sublistupc',
		             	    line : i,
		             	    value : sr_upc
		             	});  
		                 }
		            
		                 
		                 if(sr_org_upc){
		                 sublist.setSublistValue({
			             	    id : 'sublistorgupc',
			             	    line : i,
			             	    value : sr_org_upc
			             	});  
		                 }
		                 
		                 sublist.setSublistValue({
			             	    id : 'sublist4_inv',
			             	    line : i,
			             	    value : sr_isinactive
			             	});  
		                 
	
//	 	                 sublist.setSublistValue({
//			             	    id : 'sublistteam',
//			             	    line : i,
//			             	    value : sr_team
//			             	});
//		                 
//		                 sublist.setSublistValue({
//			             	    id : 'sublistproduct',
//			             	    line : i,
//			             	    value : sr_prodType
//			             	});

         
             }            
             
             
     if(isassemblywithasub == true){
      		   
       		  var new_sub_item_name = form.addField({
                      id: 'new_sub_item_name',
                      type: ui.FieldType.TEXT,
                      label: 'New Subcomponent Name'
                  }); 
       		new_sub_item_name.isMandatory = true;
       		
             		  
       		 var subid_field = form.addField({
                 id: 'subid',
                 type: ui.FieldType.TEXT,
                 label: 'Sub Id'
             });
       		subid_field.updateDisplayType({
  			    displayType : ui.FieldDisplayType.HIDDEN
  			});
       		
       		subid_field.defaultValue = item_fields_custitem_specificsubcomponent;
    		 
    		 var sublist2 = form.addSublist({
                 id: 'sublist2',
                 type: ui.SublistType.STATICLIST,
                 label: 'Subcomponent  Items'
             });
             sublist2.addField({
                 id: 'sublist1_item_name2',
                 type: ui.FieldType.TEXT,
                 label: 'Item Name'
             });
             sublist2.addField({
                 id: 'sublist2_desc2',
                 type: ui.FieldType.TEXT,
                 label: 'Description'
             });
             sublist2.addField({
                 id: 'sublist3_dis2',
                 type: ui.FieldType.TEXT,
                 label: 'Discontinued'
             });
             sublist2.addField({
                 id: 'sublist4_inv2',
                 type: ui.FieldType.TEXT,
                 label: 'Inactive'
             });
             
             var mySearch2 = search.load({
                 id: 'customsearch4644',                 
             });
    		 
    		 var searchResult2 = mySearch.run().getRange({
                 start: 0,
                 end: 10
                 });
    		 
             for (var x = 0; x < searchResult2.length; x++) {            	 
            	 
            	 var sr_item_name2 = searchResult2[x].getValue({     		 
                     name: 'itemid'
                 });
            	 
            	  var sr_description2 = searchResult2[x].getValue({
            		  name: 'salesdescription',
                    });
                 
                 var sr_discontinued2 = searchResult2[x].getValue({
                     name: 'custitem_discontinued'
                 });     
                 
                 if(!sr_discontinued2){                	 
                	 sr_discontinued2 = 'NO';
                 }
                 if(sr_discontinued2 == true){                	 
                	 sr_discontinued2 = 'YES';
                 }
               
                 
                 var sr_isinactive2 = searchResult2[x].getValue({
                     name: 'isinactive'
                 });
                if(!sr_isinactive2){                	 
                	sr_isinactive2 = 'NO';
                 }
                if(sr_isinactive2 == true){                	 
                	sr_isinactive2 = 'YES';
                 }
                 
	                   sublist2.setSublistValue({
	                	    id : 'sublist1_item_name2',
	                	    line : x,
	                	    value : sr_item_name2
	                	});
	                  
		                 sublist2.setSublistValue({
		             	    id : 'sublist2_desc2',
		             	    line : x,
		             	    value : sr_description2
		             	});
		                 
		                 sublist2.setSublistValue({
		             	    id : 'sublist3_dis2',
		             	    line : x,
		             	    value : sr_discontinued2 
		             	});
		                 
		                 sublist2.setSublistValue({
		             	    id : 'sublist4_inv2',
		             	    line : x,
		             	    value : sr_isinactive2
		             	});                
         
             } 		  
       		  
       		  
       		  
       	   }
             
    } catch (e) {
        var subject = 'Error: item roll up error in get request';
        var authorId = 17834;
        var recipientEmail = 'gjohnson@ricoinc.com';
        email.send({
            author: authorId,
            recipients: recipientEmail,
            subject: subject,
            body: 'Error occurred get request of script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
        });
    }
             
     	 
    		 context.response.writePage(form);
    		
    	
     		 
         } else {  
        	 
        	 var is_sub = context.request.parameters.is_sub;
        	 var dateNeeded = context.request.parameters.date_needed;
        	 var itemIdold = context.request.parameters.itemid;
             var itemType = context.request.parameters.itemtype;
             var itemName = context.request.parameters.new_item_name;
             var upc_code = context.request.parameters.upc_code;             
             var itemisinactive = context.request.parameters.iteminactive;
             var original_upc_code = context.request.parameters.original_upc_code;  
             var inactive = false;
             
             
             
             
             if(itemisinactive == "T"){
            	 
            	   inactive = true;
            	 
            	   record.submitFields({
                       type: itemType, 
                       id: parseInt(itemIdold),
                       values: {
                       	isinactive: "F"
                       },
                       options: {
                           enableSourcing: false,
                           ignoreMandatoryFields : true
                       }
                   });            	 
            	 
             }
             
             var newItem = record.copy({
                 type: itemType,
                 id: itemIdold,
                 isDynamic: true,
             });
             
          
             
             newItem.setValue({
                 fieldId: 'itemid',
                 value : itemName 
             });
              newItem.setValue({
                 fieldId: 'custitem_is_substitute_for',
                 value : itemIdold 
             });
              newItem.setValue({
                  fieldId: 'custitem_copied_from',
                  value : itemIdold 
              });
              newItem.setValue({
                  fieldId: 'upccode',
                  value : upc_code 
              });
              
              newItem.setValue({
                  fieldId: 'custitemoriginalupc',
                  value : original_upc_code 
              });
              
              var parsedDateStringAsRawDateObject = format.parse({
               value: dateNeeded,
               type: format.Type.DATE
            });            
             
              newItem.setValue({
                 fieldId: 'custitem_dateneeded',
                 value : parsedDateStringAsRawDateObject 
             });      
              
              
           /////////////////  itemIdold   keep if type is 4 or 5
              
              var mySearch = search.load({
                  id: 'customsearch4196',
               });
      		 
      		 mySearch.filters.push(search.createFilter({
                  name: 'internalid',
                  operator: 'ANYOF',
                  values: parseInt(itemIdold)
              }));     
              
		      		 mySearch.run().each(function(result) {
		   			  
		      			 var bin_number_id = result.getValue({
					            name: 'internalid',
					            join: 'binnumber'
					        });
		 			  		 		        
		 		       var bin_number = result.getValue({
				            name: 'binnumber',
				            join: 'binnumber'
				        });
		 		        
		 		        var bin_type = result.getValue({
		 		            name: 'custrecord_bintype',
		 		           join: 'binnumber'
		 		        });   
		 		        
		 		       log.debug('bin_number', bin_number);
		 		       
		 		       try{
		 		        
		 		        if(bin_type != 4 && bin_type != 5){		 		        	
		 		        	
		 		        	 var lineNumber1 = newItem.findSublistLineWithValue({
		        		    	    sublistId: 'binnumber',
		        		    	    fieldId: 'binnumber',
		        		    	    value: bin_number_id
		        		    	});
		 		        	 
		 		        	 log.debug('lineNumber1', lineNumber1);
		 		        	 
		 		        	 if(lineNumber1 > 0){
		 		        	 
		 		        	 
			 		        	var lineNum = newItem.selectLine({
			 		        	    sublistId: 'binnumber',
			 		        	    line: parseInt(lineNumber1)
			 		        	}); 
			 		        	 
			 		        	 
			 		        	newItem.setCurrentSublistValue({
			 		        		sublistId: 'binnumber',
			 		        	    fieldId: 'onhand',
			 		        	    value: 0,
			 		        	    ignoreFieldChange: true
			 		        	});		 		        	 
			        		 		        	 
			 		        	 newItem.commitLine({
			        		            sublistId: 'binnumber'
			        		        });       	 
			 		        	 
			 		        	
			        		     
			 		        	newItem.removeLine({
			        		    	    sublistId: 'binnumber',
			        		    	    line: parseInt(lineNumber1),
			        		    	    ignoreRecalc: true
			        		    	}); 	
		 		        	 }
		 		        	
		 		        }
		 		        
 		      } catch (e) {
 	             var subject = 'Error: item roll up error in bin logic';
 	             var authorId = 17834;
 	             var recipientEmail = 'gjohnson@ricoinc.com';
 	             email.send({
 	                 author: authorId,
 	                 recipients: recipientEmail,
 	                 subject: subject,
 	                 body: 'Error occurred in bin changes of script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
 	             });
 	         }
		 		        
		 		      
		 		        
		 		        return true; 	 
		 		        		        
		 		    }); 
              
              
      
 		 
 		 //////////////////
              
              
             
      var itemId = newItem.save();
      
      var workflowInstanceId = workflow.initiate({
          recordType: itemType,
          recordId: parseInt(itemId),
          workflowId: 'customworkflow202'
      });
      
      log.debug('workflowInstanceId ', workflowInstanceId );
      
      var workflowInstanceId2 = workflow.initiate({
          recordType: itemType,
          recordId: parseInt(itemId),
          workflowId: 'customworkflow_itemsetfields'
      });
       
      log.debug('workflowInstanceId2', workflowInstanceId2 );
             
             record.submitFields({
                 type: itemType, 
                 id: parseInt(itemIdold),
                 values: {
                 	custitem_discontinued: true,
                 	custitem_substitute: parseInt(itemId),
                 	isinactive: inactive
                 },
                 options: {
                     enableSourcing: false,
                     ignoreMandatoryFields : true
                 }
             });
             
             //
           
        	 
        	  if(is_sub == 'true'){  
        		  
        		  log.debug('hit sub', 'hit sub');
        		 
        		  var subitemName = context.request.parameters.new_sub_item_name;
        		  var subid = context.request.parameters.subid;	       		 
       		   
        		     var subnewItem = record.copy({
                         type: itemType,
                         id: parseInt(subid),
                         isDynamic: true,
                     });
                     subnewItem.setValue({
                         fieldId: 'itemid',
                         value : subitemName 
                     });
                                        
        		     subnewItem.setValue({
                         fieldId: 'custitem_dateneeded',
                         value : parsedDateStringAsRawDateObject 
                     });
                     
                      subnewItem.setValue({
                         fieldId: 'custitem_subcomponentof',
                         value : parseInt(itemId) 
                     });
                     
                       subnewItem.setValue({
                         fieldId: 'custitem_copied_from',
                         value : parseInt(subid) 
                     });
                       
                       subnewItem.setValue({
                           fieldId: 'custitem_is_substitute_for',
                           value : parseInt(subid) 
                       });                     
       		   
                     var subitemId = subnewItem.save();
        		     
                     record.submitFields({
                         type: itemType, 
                         id: parseInt(subid),
                         values: {
                         	custitem_discontinued: true,
                         	custitem_substitute: parseInt(subitemId)
                         },
                         options: {
                             enableSourcing: false,
                             ignoreMandatoryFields : true
                         }
                     });
        		     
        		     var objRecord = record.load({
        		    	    type: itemType, 
        		    	    id: parseInt(itemId),
        		    	    isDynamic: true,
        		    	});
        		     objRecord.setValue({
        		    	    fieldId: 'custitem_specificsubcomponent',
        		    	    value: parseInt(subitemId),
        		    	    ignoreFieldChange: true
        		    	});
        		     var lineNumber = objRecord.findSublistLineWithValue({
        		    	    sublistId: 'member',
        		    	    fieldId: 'item',
        		    	    value: parseInt(subid)
        		    	});
        		     
        		     var subQty = objRecord.getSublistValue({
        		    	    sublistId: 'member',
        		    	    fieldId: 'quantity',
        		    	    line: parseInt(lineNumber)
        		    	});   
        		 
        		     
        		     objRecord.removeLine({
        		    	    sublistId: 'member',
        		    	    line: parseInt(lineNumber),
        		    	    ignoreRecalc: true
        		    	});
        		     
        		     var newSub = objRecord.selectNewLine({
        		    	    sublistId: 'member'
        		    	});
        		     objRecord.setCurrentSublistValue({
        		    	    sublistId: 'member',
        		    	    fieldId: 'item',
        		    	    value: parseInt(subitemId),
        		    	    ignoreFieldChange: true
        		    	});
        		     objRecord.setCurrentSublistValue({
        		    	    sublistId: 'member',
        		    	    fieldId: 'quantity',
        		    	    value: subQty,
        		    	    ignoreFieldChange: true
        		    	});  
        		     objRecord.commitLine({
        		            sublistId: 'member'
        		        });
        		
        		     objRecord.save();
       	     } 
                         
                          
           
         
             redirect.toRecord({
                 type: itemType,
                 id: parseInt(itemId)
             });
       	   
        	 
         }    	

    }

    return {
        onRequest: onRequest
    };
    
});

/*
 * 	 
    
 */
