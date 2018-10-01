/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/format'],
/**
 * @param {record} record
 */
function(record, search, format) {
   
	  
    function afterSubmit(context) {
   	 
   	 try{
   		 
   		 
   		 if (context.type === context.UserEventType.DELETE){    
   	   		 log.debug('returning not delete');
   	    		 return;
   	    	 }
    	  
    	  var orderRecordnew = context.newRecord;
    	  var orderId = orderRecordnew.id;
    	  
    	  var orderRecord = record.load({
    		    type: record.Type.SALES_ORDER, 
    		    id: orderId,
    		    isDynamic: true,
    		});   
    	  
      		  
		  var mySearch = search.load({
              id: 'customsearch3407',
           });
		  
 		  mySearch.filters.push(search.createFilter({
              name: 'internalid',
              operator: 'is',
              values: parseInt(orderId)
          }));
 		  
 		 var searchResult = mySearch.run().getRange({
             start: 0,
             end: 1
             });
 				 
 		 if(searchResult.length == 0){
 			 log.debug('orderid: ' + orderId +  '  results: ' + searchResult.length, 'returning not found in search');
 			 return;
 		 }else{
 			 
 			 log.debug('orderid: ' + orderId +  '  results: ' + searchResult.length);
 			 
 		 }
			    
		  var shipDateforSorting = orderRecord.getValue({
	  		    fieldId: 'custbody_sortingshipdate'
  	      });
		  
			  
//		  shipDateforSorting = format.parse({
//              value: shipDateforSorting,
//               type: format.Type.DATE
//          });	
//		  
		  log.debug('shipDateforSorting', shipDateforSorting);
	
     	  
    	  
    for (var i = 0; i < searchResult.length; i++){ 
    	
    	 log.debug('in search results');
    	
    	var item = searchResult[i].getValue({
            name: 'item'
        });	
    	
    	var lineId =  searchResult[i].getValue({
            name: 'line'
        });	
    	
    	
    	 var lineNumber =  orderRecord.findSublistLineWithValue({
	    	    sublistId: 'item',
	    	    fieldId: 'item',
	    	    value: item
	    	});
    	
    	 log.debug('pull lineNumber', lineNumber);	
    	 
//    	 var cleanDate = format.parse({
//                value: shipDateforSorting,
//                type: format.Type.DATE
//               });
    	 
    	 
    	 var lineNum = orderRecord.selectLine({
    		    sublistId: 'item',
    		    line: lineNumber
    		});
    	 
    	 objRecord.setCurrentSublistValue({
    		    sublistId: 'item',
    		    fieldId: 'shipdate',
    		    value: shipDateforSorting,
    		    ignoreFieldChange: true
    		});
    	 
    	 
    	 log.debug('cleandate', cleanDate);
//    	 
//    		  orderRecord.setSublistValue({
//	    		    sublistId: 'item',
//	    		    fieldId: 'shipdate',
//	    		    line: parseInt(lineNumber),
//	    		    value: '09/15/2017'
//	    		});       		   
    	   

    		  
    		 var newShipDate = orderRecord.getSublistValue({
	    		    sublistId: 'item',
	    		    fieldId: 'shipdate',
	    		    line: parseInt(lineNumber),
	    		  }); 
    		 
    		 log.debug('newShipDate ', newShipDate );	
    		 
    		   orderRecord.commitLine({
    			    sublistId: 'item'
    			});
    		   	    	  
    		    	 var id = orderRecord.save({
    		    		    enableSourcing: false,
    		    		    ignoreMandatoryFields: true
    		    		}); 
    		    	 
    	  }//end looping through items
    
 
    	 
    	 log.debug('id ', id ); 
    	 
    	 
   	 }catch(e){
   		 
   		 log.error('error', JSON.stringify(e));
   	 }  	 
   	 
 
    	

    }

    return {
     //   beforeLoad: beforeLoad,
    //    beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
