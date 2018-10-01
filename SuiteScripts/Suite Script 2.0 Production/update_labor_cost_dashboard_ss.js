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
    	
    	getManData();
    	getDISData();   	

    }
    
    function getManData(){
    	
    	 search.load({
             id: 'customsearch4617'
         }).run().each(function(result) {
        	 
               
                var period = result.getValue({
                    name: 'postingperiod',
                    summary: search.Summary.GROUP
                });
                
                var totalQuantity = result.getValue({
                    name: 'quantity',
                    summary: search.Summary.SUM
                });
                
           	   var totalLaborCost = result.getValue({	            		 
                  name: 'formulacurrency',
                  summary: search.Summary.SUM
                 });
             
           	       	          	               
           	    upDateLaborCost('MAN', period, totalQuantity, totalLaborCost);                 

        	    return true;        
         });  	
    	
    	
    }
    
    
    function getDISData(){
    	
   	 search.load({
            id: 'customsearch4677'
        }).run().each(function(result) {
       	 
              
               var period = result.getValue({
                   name: 'postingperiod',
                   summary: search.Summary.GROUP
               });
               
               var totalQuantity = result.getValue({
                   name: 'quantity',
                   summary: search.Summary.SUM
               });
               
          	   var totalLaborCost = result.getValue({	            		 
                 name: 'formulacurrency',
                 summary: search.Summary.SUM
                });
            
          	       	          	               
          	    upDateLaborCost('DIS', period, totalQuantity, totalLaborCost);                 

       	    return true;        
        });  	
   	
   	
   }
    
    function upDateLaborCost(laborClass, period, totalQuantity, totalLaborCost){
    	var laborClassFilter = null;
    	
    	if(laborClass == "MAN"){
    		laborClassFilter = 2;
    	}
    	else if(laborClass == "DIS"){
    		laborClassFilter = 1;
    	}
    	else{
    		log.error('no labor class found');
    		return;
    	}
    	
    //	log.debug('laborClassFilter', laborClassFilter);
    	
    //	log.debug('function data', period + ' // ' + totalQuantity + ' // ' + totalLaborCost);
    	
    	
    	    	
        var mySearch = search.load({
            id: 'customsearch4619',
         });
		 
		mySearch.filters.push(search.createFilter({
            name: 'custrecord_rico_labor_cost_ap',
            operator: 'ANYOF',
            values: period
        }));	
		   
	   mySearch.filters.push(search.createFilter({
            name: 'custrecord_labor_class',
            operator: 'ANYOF',
            values: laborClassFilter
        }));
		   
		  var searchResult = mySearch.run().getRange({
           start: 0,
           end: 1
           });
		  
       for (var i = 0; i < searchResult.length; i++) {
     	  
     	  
     	  log.debug('searchResult[i].id',  searchResult[i].id);  
     	  
           record.submitFields({
               type: 'customrecord168',
               id: searchResult[i].id,
               values: {
                  custrecord_rico_labor_total_cost: totalLaborCost,
                  custrecord_rico_labor_total_built: totalQuantity
               },
               options: {
                   enableSourcing: false,
                   ignoreMandatoryFields : true
               }
           }); 	            	 
          
       }	
    	
    	
    }

    return {
        execute: execute
    };
    
});
