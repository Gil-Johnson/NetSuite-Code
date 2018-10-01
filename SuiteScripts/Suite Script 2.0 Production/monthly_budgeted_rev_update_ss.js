/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	
    	 search.load({
             id: 'customsearch3868'
         }).run().each(function(result) {
        	 
            
            // 	var scrap_rec_id = result.id;                  
                
               var total_sales = result.getValue({
                    name: 'amount',
                    summary: search.Summary.SUM
                });
                
                var period = result.getValue({
                    name: 'postingperiod',
                    summary: search.Summary.GROUP
                });
             
                                
               log.debug('result', 'period:' + period+ 'sales:'+ total_sales);  
		               
		               var mySearch = search.load({
		                   id: 'customsearch4214',
		                });
		       		 
		       		   mySearch.filters.push(search.createFilter({
		                   name: 'custrecord_acc_period',
		                   operator: 'ANYOF',
		                   values: period
		               }));		       		   
		       		   
		       		  var searchResult = mySearch.run().getRange({
		                  start: 0,
		                  end: 1
		                  });
		       		  
		              for (var i = 0; i < searchResult.length; i++) {
		            	  
		            	  
		            	  log.debug(' searchResult[i].id',  searchResult[i].id);  
		            	  
		                  record.submitFields({
		                      type: 'customrecord_monthly_budgeted_rev_target',
		                      id: searchResult[i].id,
		                      values: {
		                      	custrecord_total_sales: total_sales
		                      },
		                      options: {
		                          enableSourcing: false,
		                          ignoreMandatoryFields : true
		                      }
		                  });             	  
		            	  
		            	 
		                 
		              }		               
               
               

        	    return true;
         
         });  	
    	

    }

    return {
        execute: execute
    };
    
});
