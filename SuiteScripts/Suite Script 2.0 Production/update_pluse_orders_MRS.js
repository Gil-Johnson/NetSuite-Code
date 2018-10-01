/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/record','N/email', 'N/runtime', 'N/https'],
    function(record, email, runtime, https) {
	
      function getInputData() {
        	
    		return {
        		type: 'search',
        		id: 5251
        	}  	 
           
        }
        function map(context) {
        	
      
        // 	log.debug('data' , context.value);
       
       	var order = JSON.parse(context.value); 
        	
        //	log.debug('data' , order.recordType);
        	log.debug('data' , order.values.custcol_personalization_1);
        	
        	var res = https.post({
                url: 'https://ep17p.hsn.com/API/api/Designer/ConfirmOrder?job=' + order.values.custcol_personalization_1,
                headers: {'apiKey': '22BqYONGQX9F67uK0TVrVfb7N0hDDxJJWRvQJNmNTk0'}
            });
         
        	log.debug('res.code' , res.code);
        	
        	// load and update the sales order 
        	var objRecord = record.load({
    		    type: record.Type.SALES_ORDER, 
    		    id: parseInt(order.id),
    		    isDynamic: false,
    		});        	
        	
        	 var lineNumber = objRecord.findSublistLineWithValue({
 			    sublistId: 'item',
 			    fieldId: 'custcol_personalization_1',
 			    value: order.values.custcol_personalization_1
 			});
        	
        	if(res.code == 200){  //2
        		
        		objRecord.setSublistValue({
        		    sublistId: 'item',
        		    fieldId: 'custcol_pz_status',
        		    line: parseInt(lineNumber),
        		    value: 2
        		});  	
        		
        		
        	}else{  //3
        		
        		objRecord.setSublistValue({
        		    sublistId: 'item',
        		    fieldId: 'custcol_pz_status',
        		    line: parseInt(lineNumber),
        		    value: 3
        		}); 
        		
        	}
        	
        	objRecord.save();       	
       
        
        }

        function summarize(summary) {    	
        
        	
            var type = summary.toString();
            log.audit(type + ' Usage Consumed', summary.usage);
            log.audit(type + ' Concurrency Number ', summary.concurrency);
            log.audit(type + ' Number of Yields', summary.yields);
          
            var contents = '';
            summary.output.iterator().each(function(key, value) {
                contents += (key + ' ' + value + '\n');
                return true;
            });
            

            
            
        
        }
        return {
            getInputData: getInputData,
            map: map,
    //        reduce: reduce,
            summarize: summarize
        };
    });