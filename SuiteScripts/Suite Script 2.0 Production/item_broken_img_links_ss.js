/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/http', 'N/record', 'N/runtime', 'N/search', 'N/task'],
/**
 * @param {http} http
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 * @param {task} task
 */
function(http, record, runtime, search, task) {
   
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
	     
	   //  log.audit("Script parameter of custscript1" + pageNum);
	    
	     
		     if(!pageNum){
		    	 pageNum = 0;
		    	 log.debug('parameter shoudl be 0', pageNum);
		     }
		   
		    	     
		    log.debug('parameter value', pageNum);             
		  
             	
	            try{     	
	            	
	            	
	            	var mySearch = search.load({
	                    id: 'customsearch4824'
	                });
	                var myPagedData = mySearch.runPaged();
	                
	              //  log.debug({ details: "Result Count: " + myPagedData.count });
	                
	                
	           
	                
	         //       myPagedData.pageRanges.forEach(function(pageRange){
	                	
	            for (var p = parseInt(pageNum); p < myPagedData.pageRanges.length; p++) {
	               		  
	         //      log.debug('myPagedData.pageRanges.length', myPagedData.pageRanges.length);
	                	
	                 var myPage = myPagedData.fetch({index: p});
	                    
	                    if(myPage.isFirst){	
	                            log.debug('first', 'first page ' + myPage.isFirst);  
	                      }               		  
	                    
	                    if(myPage.isLast){	
                            log.debug('last', 'last page ' + myPage.isLast);  
                       }       
	                  
                        
	 	              
	                    	
	                        for (var j = 0; j < myPage.data.length; j++) {
	                        	
	                        	         	
	                        	                                  	
	                        //get item details
	                        	
	                        var itemid = myPage.data[j].id;
	        		        var itemType = myPage.data[j].recordType;	
	        		        
	        		               		        
	        		         var url = 'http://images.ricoinc.com/webimages/';  
		   		        	 var main_url = 'http://images.ricoinc.com/webimages/';
		   		        	 var thumb_url = 'http://images.ricoinc.com/webimages/';
		   		        	 
		   		        	 var folder = "";	                    	
	                    	
	                    //	log.debug('id', myPage.data.id + ' page: ' + p);                    	
	                    	
	                        var league = myPage.data[j].getText({
	                            name: 'custitem1'
	                        });
	                        

	                        var item_name = myPage.data[j].getValue({
	                            name: 'itemid'
	                        });
	                        

	                        var isCustom = myPage.data[j].getValue({
	                            name: 'custitem_custom'
	                        });
	                        
	                                               
	                        if(league == "NBA" || league == "NFL" || league == "MLB" || league == "NHL"){
	                        	folder = league;
	                        	
	                        }else if(league == "College"){
	                        	folder = 'NCAA';
	                        	
	                        }else{
	                        	folder = 'Custom';
	                        }
	                        
//	                
	   		        	 
	  		        	  main_url =  main_url + folder + '/' + item_name + '_main.jpg'; 
	  		        	  thumb_url = thumb_url + folder + '/' + item_name + '_thumb.jpg';
	  		        	  url = url + folder + '/' + item_name + '.jpg';  
	  		        	  
	  		        	log.debug("after loop 5");   
	                        
	  		        	 //process item 
			        	    try {
			        	    	
			        	    	log.debug("after loop 6");   
			                    var res = http.get({
			                        url: main_url
			                    });
			                    log.debug('GET SUCCEEDED: ' + url, 'response code: ' + res.code);
			                    
			                 			                    
			                } catch (e) {
			                //    if (e.name == 'SSS_UNKNOWN_HOST') {
			                        log.debug('GET FAILED' + url, JSON.stringify(e));
			                       
			                 //   }
		
			                }	
			                
			                var broken_img_link = 'no';
			             
			                //finish processing the item if link is found
			              if(res.code == 404 || res.code == 400){
			                	  
			            	  broken_img_link = 'yes';
			                	  
			                  }			                
			                
			             	log.audit('Found image' + 'response code ' + res.code, 'item id: ' + itemid + 'item_name: ' + item_name );  
                           	
		                	
		                	//submit item field broken img link
		                	
		                	try{
		                		var subid =   record.submitFields({
				                    type: itemType, 
				                    id: parseInt(itemid),
				                    values: {
				                    	custitem_broken_image_link: broken_img_link				                                	
				                    },
				                    options: {
				                        enableSourcing: false,
				                        ignoreMandatoryFields : true
				                    }
				                });	
		                		
		                		log.debug('subhmitted?', subid);
		                	}
		                	  catch (e) {
		      		            log.error('Error submitting record: ' + JSON.stringify(e), '');
		      		        } 
			                
			                
			                
			                
			                
			                var usageRemaining = scriptObj.getRemainingUsage();
					               			               
					                
					                try {     	
					               	
				                     					                	
					                	 if(parseInt(usageRemaining) < 1000){ 
					                		 
					                		log.debug('usageRemaining', usageRemaining);
					                	//	log.debug('page and record amount', 'total records'+ myPage.data.length + '  page'+ p);
				                        	
				                        //	log.debug('rescheudling script', 'rescheudling script');
				                        	
				                            var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
				                            scriptTask.scriptId = scriptObj.id;
				                            scriptTask.deploymentId = scriptObj.deploymentId;
				                            scriptTask.params = {custscript_item_int_number: parseInt(p)};
				                            
				                             var scriptTaskId = scriptTask.submit();                                  
				                            
				                             return false;
				                            
				                        }
				                    }
				                    catch (e) {
				                        log.error('Error during schedule: ' + JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining, p);
				                        return;
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
