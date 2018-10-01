/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/format', 'N/record', 'N/ui/serverWidget', 'N/search', '/SuiteScripts - Globals/underscore', 'N/error', 'N/runtime'],
/**
 * @param {file} file
 * @param {format} format
 * @param {record} record
 * @param {serverWidget} serverWidget
 */
function(file, format, record, ui, search, underscore, error, runtime) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
function getNSType(item_type_bin){
		
		if(item_type_bin == 'Assembly'){
			  item_type_bin= record.Type.ASSEMBLY_ITEM;			   
		   }
		   else if(item_type_bin == 'InvtPart'){
			 item_type_bin = record.Type.INVENTORY_ITEM;
		   }
		   else if (item_type_bin == 'Kit'){		      			   
			 item_type_bin = record.Type.KIT_ITEM;		      			   
		   }
		  else if (item_type_bin == 'NonInvtPart'){		      			   
			item_type_bin = record.Type.NON_INVENTORY_ITEM;		      			   
		   } 
		
		return item_type_bin;
		
	}

    function onRequest(context) {
    	
    	 if (context.request.method === 'GET') {  
    		 
    		 var form = ui.createForm({
                 title: 'Upload CSV File For Bin Transfer'
             }); 
    		 
    		 form.addSubmitButton({
                 label: 'Process CSV'
             });
    		 
    		 var userObj = runtime.getCurrentUser();    		 
    		 
    	    		 
    		  var select = form.addField({
                  id: 'selectfield_location',
                  type: ui.FieldType.SELECT,
                  label: 'Location'
               
              });
              select.addSelectOption({
                  value: '1',
                  text: 'Niles'
              });
              select.addSelectOption({
                  value: '2',
                  text: 'Heath Springs'
              });
              
              select.defaultValue = userObj.location;    
    	
    		 
    		 var file_field = form.addField({
                 id: 'file_field',
                 type: ui.FieldType.FILE,
                 label: 'CSV File'
             });	   		
    		 
    		
    		 context.response.writePage(form);
    		 
    	 } else{  		 
    		 
    		 var csv_location = context.request.parameters.selectfield_location;  
    		 log.debug('csv_location', csv_location);
    		 
    		 
    		 return;
    		 var csv_file = context.request.files.file_field;   		 
    		 var contents  = csv_file.getContents();
    		 var fileName  = csv_file.name;   		 
    		 
    		 var fileObj = file.create({
    			    name    : fileName,
    			    fileType: file.Type.CSV,
    			    contents: contents 
    			    });
    		 fileObj.folder = 1800082;
    		 //move file save until task is successful
    		 var fileId = fileObj.save();   		 
    		 
    	//	 log.debug('file value', fileId);
    	//	 log.debug('file value', contents);   
    		 
    		 
    		 
    		 var result = [];

    		 var lines = contents.split("\n");
    		 
    		 var headers = lines[0].split(",");
    		 
    		 for(var i=1;i<lines.length;i++){

    			  var obj = {};
    			  var currentline=lines[i].split(",");

    			  for(var j=0;j<headers.length;j++){
    				  obj[headers[j]] = currentline[j];
    				  
    		      }	    

    			  result.push(obj);

    		}   		 
    		 
    		    		 
    		   var today = new Date();
        	   var month = today.getMonth() + 1;
        	   var day = today.getDate();
        	   var year = today.getFullYear();
        	   var inv_memo = "Scripted-" +  month + '-' + day + '-' + year; 
    		 
        	   var inventory_adjustment = record.create({
                   type: record.Type.BIN_WORKSHEET,
                   isDynamic: true,                   
               });            	   
        	   
        	   inventory_adjustment.setValue({
                   fieldId: 'location',
                   value: parseInt(csv_location) 
               });
        	   
        	   inventory_adjustment.setValue({
                   fieldId: 'transdate',
                   value: today.getDate()
               });
        	   
        	   inventory_adjustment.setValue({
                   fieldId: 'memo',
                   value: fileName
               });
    		 
        	   var numLines = inventory_adjustment.getLineCount({
       		    sublistId: 'item'
       		    });	 
        	   
        //	   log.debug('numlines', numLines);  
        	   
        	  //////////////// Clear all lines form dynamic load \\\\\\\\\\\\\\ 
        	   
        	   for (var l = 0; l < numLines; l++) {   
        		   
        		   
        	//	   log.debug('linenum',  parseInt(l));
					
					inventory_adjustment.selectLine({
					    sublistId: 'item',
					    line: parseInt(l) 
					});
        		   
        		     inventory_adjustment.setCurrentSublistValue({
			        	    sublistId: 'item',
			        	    fieldId: 'itembinnumbers',						        
			        	    value: null,
			        	    ignoreFieldChange: true
			        	});	 
        		   
        		     
			         inventory_adjustment.commitLine({
			      	    sublistId: 'item'
			        	});  
        	   }
        	/////////////////////////////////////////////////////////////////////
        	   
        	   var itemSearchArray = [];
        	   
        	   result.forEach(function(item) {
                   
  				 if(item.internalid){					    
  					
						//get the value of name
  					itemSearchArray.push(item.internalid);
						
						
  				  };
        	   });	
   /*     	   
        	   var bin_items = [];
        	       	   
        		 var mySearch = search.load({
	                 id: 'customsearch3950',
	              });
				 
	    		 mySearch.filters.push(search.createFilter({
	                 name: 'internalid',
	                 operator: 'ANYOF',
	                 values: itemSearchArray
	             }));
	    		 
	    		 
				
	    		 mySearch.run().each(function(result) {
	    			  
	    		        var item_id_bin = result.getValue({
	    		            name: 'internalid'
	    		        });
	    		        
	    		        var item_type_bin = result.getValue({
	    		            name: 'type'
	    		        });
	    		        
	    		        item_type_bin = getNSType(item_type_bin);
	    		        
	    		        var binNum = result.getValue({
		                     name: 'binnumber',		                  
		                   });
	    		        
	    		        		             
			             var binId = result.getValue({
		                     name: 'internalid',
		                     join: 'binnumber',
		                   });
			             
			            
	    		        
			             bin_items.push({item_id_bin:item_id_bin, item_type_bin: item_type_bin, binNum: binNum, binId:binId});
	    		        
	    		        
	    		        return true; 		        
	    		        
	    		        
	    		    });        	
	         
       */ 	
    		 
    		 if(numLines != 0){
    			 
    			 result.forEach(function(item) {
                        
    				 if(item.Item){					    
    					
						//get the value of name
    					var itemId = item.internalid;
						var itemItem = item.Item;
						var itemBins = item.Bins.split("/");
						
				//		log.debug('itemBins.length', itemBins.length);						
						
						var itemWarehouse = item.Warehouse;
						var itemDate = item.Date;
						var itemDateTotalQuantity = item.TotalQuantity;
						
			//			log.debug('arrNames', 'itemItem:' + itemItem + '  itemBins:' + itemBins + ' itemWarehouse:' + itemWarehouse + ' itemDate :' + itemDate + ' itemDateTotalQuantity :' + itemDateTotalQuantity);	
						
				 		 
			                	var lineNumber = inventory_adjustment.findSublistLineWithValue({
								    sublistId: 'item',
								    fieldId: 'item',
								    value: itemId
								});
			                	    log.debug('is in list', itemId + '   lineNumber:' +  lineNumber);
									           		            							
								   
																
								inventory_adjustment.selectLine({
								    sublistId: 'item',
								    line: parseInt(lineNumber)
								});
														
								var sub_item = inventory_adjustment.getSublistValue({
								    sublistId: 'item',
								    fieldId: 'item',
								    line: parseInt(lineNumber)
								});
								  
								var sub_qty = inventory_adjustment.getSublistValue({
								    sublistId: 'item',
								    fieldId: 'quantity',
								    line: parseInt(lineNumber)
								});
								
							//	log.debug('item values', sub_item + ' : ' +  sub_qty);
							
								var binnumbers = '';
					//			var binnumbersCompare = [];
								
								 for (var b = 0; b < itemBins.length; b++) {  
								    	
								  //  	 log.debug('itemBins', itemBins[b]);
								    	 var item_bin_de = itemBins[b].split(":");
								    	 
								  //  	 log.debug('item_bin_de name', item_bin_de[0]);
								  //  	 log.debug('item_bin_de qty', item_bin_de[1]);

						//		    	 binnumbersCompare.push(item_bin_de[0]);								    	 
								    	 binnumbers += item_bin_de[0] + '(' + item_bin_de[1] + ')';							
								 //   	 log.debug('binnumbers', binnumbers);
								     }			
								 
							/*	 
								 var errorObj = error.create({    	    	 
							    	    name: 'INVAILD QUANTITES',
							    	    message: 'The quantities dont match for the bins and items',
							    	    notifyOff: true
							    	});
							    	log.debug("Error Code: " + errorObj.name);
							    	throw errorObj.message;
						*/	 	       
						
						         var formatted_bins = binnumbers.replace(/\)/g, "),").replace(/,\s*$/, "");
								 
							//	 var formatted_bins = binnumbers.replace(/\)/g, ")\n");
						   //     log.debug('formatted_bins', formatted_bins);					      
						     						         
		 				         
						         inventory_adjustment.setCurrentSublistValue({
						        	    sublistId: 'item',
						        	    fieldId: 'itembinnumbers',						        
						        	    value: formatted_bins, 
						        	    ignoreFieldChange: true
						        	});	 		         
						   
			   
						         inventory_adjustment.commitLine({
						      	    sublistId: 'item'
						        	}); 	  
			             							
    				 }	
    			   });	   			 
    			 
    		 } 	
    		 
    		 try {
    		 
    		 var recordId = inventory_adjustment.save();
    		 
    		 log.debug({
                 title: 'Record created successfully',
                 details: 'Id: ' + recordId
             });
    		   } catch (e) {    			   
    			   
    			   var errorObj = error.create({    	    	 
			    	    name: e.name,
			    	    message:  e.message ,
			    	    notifyOff: true
			    	});
			    	log.debug("Error Code: " + errorObj.name);
			    	throw errorObj.message;    	             
                 
               }
    		   
    		   var scriptObj = runtime.getCurrentScript();	
    		   var usageRemaining = scriptObj.getRemainingUsage();
	           log.debug('usageRemaining', usageRemaining);
    		
    	 }

    }

    return {
        onRequest: onRequest
    };
    
});
