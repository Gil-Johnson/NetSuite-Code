/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/record','N/email', 'N/runtime', 'N/file'],
    function(record, email, runtime, file) {
	
      function getInputData() {
        	
        	var inputData = [];  
        	
        	
        	var scriptObj = runtime.getCurrentScript();
        	log.debug("Script parameter of custscript1: " + scriptObj.getParameter({name: 'custscript1'}));
        	
        	var orders = scriptObj.getParameter({name: 'custscript_orders_to_update'}).split(",");
        	var waveId = scriptObj.getParameter({name: 'custscript_wave_id'});
        	     	        	
	    
        	
        	for (var i = 0; i < orders.length; i++) { 
        	inputData.push({waveid:waveId, orderId: orders[i]});
        	}
	         	         
        	 return inputData;   	 
           
        }
        function map(context) {
        	
      
         	log.debug('data' , context.value);
       
        	var order = JSON.parse(context.value); 
        	
        //	log.debug('data' , order.orderId);
         
      
        	try{	
            record.submitFields({
                type: record.Type.SALES_ORDER,
                id: parseInt(order.orderId),
                values: {
                	custbody_current_wave: order.waveid
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            });
        	}catch(e){
        		
        		log.debug('error', JSON.stringify(e));
        	}
        	
       
        
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