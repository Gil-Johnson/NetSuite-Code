/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/format', 'N/record','N/error', 'N/runtime', 'N/task'],
/**
 * @param {file} file
 * @param {format} format
 * @param {record} record
 * @param {serverWidget} serverWidget
 */
function(format, record, error, runtime, task) {
   
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
    	    		 
    		 try{
    			 
    	   // Get the wave id and the orders 	 
    		 var waveid = context.request.parameters.waveid;    	
    		 var orders = context.request.parameters.orders;  
    		 
//    		 var itemIds = context.request.parameters.items;   		 
//    		 var itemFilters = itemIds.split(",");
    		 
    		 
    		 // create map reduce task

             var mapReduceScriptId = 414;
             log.audit('mapreduce id: ', mapReduceScriptId);
             
             var mrTask = task.create({
                 taskType: task.TaskType.MAP_REDUCE,
                 scriptId: parseInt(mapReduceScriptId),
               //  deploymentId : 'customdeploy_update_orders_with_wave_id',
                 params: {custscript_orders_to_update: orders, custscript_wave_id: waveid}
             });
             log.debug('testing');
             
             var mrTaskId = mrTask.submit();
             var taskStatus = task.checkStatus(mrTaskId);
             
             if (taskStatus.status === 'FAILED') {
                 var authorId = -5;
                 var recipientEmail = 'gjohnson@lumeris.com';
                 email.send({
                     author: authorId,
                     recipients: recipientEmail,
                     subject: 'Failure executing map/reduce job!',
                     body: 'Map reduce task: ' + mapReduceScriptId + ' has failed.'
                 });
             }
             
             log.debug(taskStatus.status);  
    		 
    	
		  //  context.response.writeFile(pdfFile);
		    
           }catch(e){
				 
				 log.debug('error', JSON.stringify(e));
			 }
			
    	 }

    }

   

    return {
        onRequest: onRequest
    };
    
});
