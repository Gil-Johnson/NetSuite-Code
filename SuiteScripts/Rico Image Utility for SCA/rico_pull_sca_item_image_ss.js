/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/record', 'N/runtime', 'N/search', 'N/task', 'N/file'],
/**
 * @param {http} http
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 */
function(https, record, runtime, search, task, file) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function runImageLinkeUpdate(scriptContext) {
    	
     try{
    	 
    	
    	 
		 var scriptObj = runtime.getCurrentScript();	   
	     var pageNum = scriptObj.getParameter({name: 'custscript_item_int_number'});
	     
	     log.audit("Script parameter of custscript1" + pageNum);
	    
	     
		     if(!pageNum){
		    	 pageNum = 0;
		    	 log.debug('parameter shoudl be 0', pageNum);
		     }
		   
		    	     
		    log.debug('parameter value', pageNum);             
		  
             	
	            try{     	
	            	
	            	
	            	var mySearch = search.load({
	                    id: 'customsearch5801'
	                });
	                var myPagedData = mySearch.runPaged();
	                
	                log.debug({
	                    details: "Result Count: " + myPagedData.count
	                });
	                log.debug({
	                    details: "PageRange Array: " + myPagedData.pageRanges
	                });
	                log.debug({
	                    details: "Max Page Size: " + myPagedData.pageSize
	                });
	                log.debug({
	                    details: "Search Details: " + myPagedData.searchDefinition
	                });              
	                                
	               
	                
	         //       myPagedData.pageRanges.forEach(function(pageRange){
	                	
	            for (var p = parseInt(pageNum); p < myPagedData.pageRanges.length; p++) {
	               		  
	               log.debug('myPagedData.pageRanges.length', myPagedData.pageRanges.length);
	                	
	                 var myPage = myPagedData.fetch({index: p});
	                    
	                    if(myPage.isFirst){	
	                            log.debug('first', 'first page' + myPage.isFirst);  
	                      }               		  
	                    
	                    if(myPage.isLast){	
                            log.debug('last', 'last page' + myPage.isLast);  
                       } 
	                    
	                    //myPage.data.length
	                    	
	                        for (var j = 0; j < myPage.data.length; j++) {
	                        	
	                      	
	                        //get item details
	                        	
	                             var itemid = myPage.data[j].id;
	 	        		        var itemType = myPage.data[j].recordType;	
	        		        
	        		        var url = myPage.data[j].getValue({
	                            name: 'custitem_image1'
	                        });   
	        		        
	        		        log.debug('itemid', itemid);
	        		        log.debug('itemType', itemType);
	                    	
//	                        var league = myPage.data[j].getText({
//	                            name: 'custitem1'
//	                        });
	                        

	                    	log.debug('url', url);                        
	                      //"https://stormy-atoll-99029.herokuapp.com/pullimg?imgurl="+url
	                        
	  		        	 //process item 
			        	    try {
			                    var res = https.get({
			                        url: "https://stormy-atoll-99029.herokuapp.com/pullimg?imgurl="+url
			                    });
			            //        log.debug('GET SUCCEEDED: ' + url, 'response code: ' + res.code);
			              //      log.debug('GET SUCCEEDED: ' + url, 'response code: ' + res.body);
			                  
			                 
			               	  record.submitFields({
				                    type: itemType, 
				                    id: itemid,
				                    values: {
				                    	custitem_pulled_sca_image: true
				          
				                    },
				                    options: {
				                        enableSourcing: false,
				                        ignoreMandatoryFields : true
				                    }
				                });	
			            
			                    
			                } catch (e) {
			                //    if (e.name == 'SSS_UNKNOWN_HOST') {
			                        log.debug('GET FAILED' + url, JSON.stringify(e));
			                    //   continue;
			                 //   }
		
			                }
			                
			                //finish processing the item if link is found
	/*		                if(res.code != 404){
			                	
			                	log.debug('Found image', 'item_name: ' + item_name );  
			                               	
			                	
			                	//submit image links
			                	  record.submitFields({
					                    type: itemType, 
					                    id: itemid,
					                    values: {
					                    	custitem_pulled_sca_image: true
					                  
					                    },
					                    options: {
					                        enableSourcing: false,
					                        ignoreMandatoryFields : true
					                    }
					                });	               	
			                	
			                	
			                  }
		*/	                
			                var usageRemaining = scriptObj.getRemainingUsage();
					                log.debug('usageRemaining', usageRemaining);			               
					               
					                try {				                	
					               	
				                     //   if (usageRemaining <= 900 && stopInt < 2) 					                	
					                	 if(usageRemaining <= 8900){  
					                		 
					                		log.debug('page and record amount', 'total records'+ myPage.data.length + '  page'+ p);
				                        	
				                        //	log.debug('rescheudling script', 'rescheudling script');
				                        	
				                            var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
				                            scriptTask.scriptId = scriptObj.id;
				                            scriptTask.deploymentId = scriptObj.deploymentId;
				                            scriptTask.params = {custscript_item_int_number: parseInt(p)};
				                            
				                             var scriptTaskId = scriptTask.submit();                                
				                             var taskStatus = task.checkStatus(scriptTaskId);
				                            
				                            log.audit('taskStatus.status', taskStatus.status);
				                            
				                            
				                            return true;
				                        }
				                    }
				                    catch (e) {
				                        log.error('Error during schedule: ' + JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining, p);
				                    }
				                    
				                    
	                        
	                      
	                    
	                         }//ends page loop
	                        
	                       
	                    
	                }//ends page loop          
	        
		        
		        }
		        catch (e) {
		            log.error('Error during working: ' + JSON.stringify(e), '');
		        }          	
    	    
    	
     }
     catch (e) {
         log.error('Error during start: ' + JSON.stringify(e), '');
     }
    	
     
    }

    return {
        execute: runImageLinkeUpdate
    };
    
    
});
