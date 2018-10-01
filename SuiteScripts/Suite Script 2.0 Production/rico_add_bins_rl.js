/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 */
function(record, search) {
	
	 
	  function getNSType(ns_type){
		  
		  log.debug('ns_type', ns_type);
			
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
			 
			 var itemsToAddBins = [];
					
			 var itemSearch = search.load({
		         id: 'customsearch4222',
		      });		 
				 
			log.debug('binId', binId);
			log.debug('binId', binId.length);			
		
			  itemSearch.filters.push(search.createFilter({
		         name: 'internalid',
		         operator: 'ANYOF',
		         values: itemsOnOrder
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
		
		try{
			  
				
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
				
				  log.debug('item dose not have bin   Bin String: ' + binString);
				  
				  itemsToAddBins.push({item_id : item_id, item_type:item_type}); 
				  return true; 
				  
			  	  });
			  
		}
		catch(e){
			
		      log.error('error', SON.stringify(e));
		      
		}
			  
		  		  
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
 
    
    function doPost(requestBody) {   	 
    	 
    	var error = false; 
    	log.debug('requestBody', requestBody);
    	
    	log.debug('requestBody', requestBody.itemsOnOrder);
    	log.debug('requestBody', requestBody.binInternalId);
    	log.debug('requestBody', requestBody.binId);
    	
    	try{
    	
    	updateItems(requestBody.itemsOnOrder, requestBody.binInternalId,  requestBody.binId);
    	}catch(e){
    		log.debug('error', JSON.stringify(e));  
    		error = true;
    		return error;
    	}
    	
    	return error;
    	
    //	updateItems(itemsOnOrder, binInternalId,  binId)
    	    	

    }

   

    return {
   //     'get': doGet,
   //     put: doPut,
        post: doPost,
   //     'delete': doDelete
    };
    
});
