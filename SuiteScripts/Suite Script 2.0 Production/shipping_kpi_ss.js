/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/record', 'N/runtime', 'N/search'],
/**
 * @param {email} email
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 */
function(email, record, runtime, search) {
   
    /**
     * Definition of the Scheduled script trigger point.
     *
     * @param {Object} scriptContext
     * @param {string} scriptContext.type - The context in which the script is executed. It is one of the values from the scriptContext.InvocationType enum.
     * @Since 2015.2
     */
    function execute(scriptContext) {
    	
    	try{
    	
    	  var shippingArray = [];      	 
    	
    	  getShippingData('customsearch3936', 'today', shippingArray);
    	  getShippingData('customsearch3937', 'month', shippingArray);    	  
    	  getShippingData('customsearch3935', 'bo_not_shipped', shippingArray);
    	  getShippingData('customsearch3934', 'com_not_shipped', shippingArray);
    	  getShippingData('customsearch3933', 'overcommitted', shippingArray);   	  
    	     	  
    	  log.debug('shippingArray', shippingArray.length);   
    	  
    	} catch (e) {
            log.error('Error retriving shipping results: ' + JSON.stringify(e));
        }
    	 
    	  
    	  try{
    		  
    		  var shippingKpiRec = record.create({
    			    type: 'customrecord_shipping_kpi_record', 
    			    isDynamic: true,
    			    defaultValues: {
    					    	
    			    } 
    			}); 
    		  
    		    var recordId = shippingKpiRec.save({
                  enableSourcing: false,
                  ignoreMandatoryFields: true
               });
    		    
    		   log.debug('record created', recordId); 
    		    
    	  }catch (e) {
              log.error('Error creating custom shipping KPI record: ' + JSON.stringify(e));
          }	  
    	  
    		    
    		    try{
    		    
    	
		        var objRecord = record.load({
		    	    type: 'customrecord_shipping_kpi_record', 
		    	    id: parseInt(recordId),
		    	    isDynamic: true,
		    	});
		        
		  	  shippingArray.forEach( function (Kpi, index) {   		  
  			    
			      log.debug('shippingArray' + index, Kpi.name + ' : ' + Kpi.location + ' : ' + Kpi.amount +' : ' + Kpi.field);
			      
			      if(Kpi.name == 'overcommitted'){
			    	  Kpi.amount = parseInt(Kpi.amount); 
			    	  
			      }else{
			    	  
			    	  Kpi.amount = parseFloat(Kpi.amount).toFixed(2);
			    	  
			      }
			      
			      objRecord.setValue({
			    	    fieldId: Kpi.field,
			    	    value:  Kpi.amount,
			    	    ignoreFieldChange: true
			    	});
			     
			  });        
		    
    		    	
    	       objRecord.save();
    		    	
    		    	
    	    		    
    	  }catch (e) {
              log.error('Error setting vlaues for shipping KPI record: ' + JSON.stringify(e));
          } 
    	  
   
    }

    return {
        execute: execute
    };
    
    function getShippingData(serchId, objName, shippingArray){
    	
    	log.debug('entering search' + serchId);
    	
    	
    	try{
    	
    	 var mySearch = search.load({
             id: serchId
         });
    	
    	 mySearch.run().each(function(result) { 
    		 
         var amount = 0;   
         var location = 0;        
       	  
       	  if(serchId == 'customsearch3937' || serchId == 'customsearch3936'){
       	  
       	   amount = result.getValue({
                 name: 'amount',
                 summary: search.Summary.SUM 
             });
       	   
       	 location = result.getText({
             name: 'location',
             summary: search.Summary.GROUP	 
         });
       	  
       	  }
       	  else if(serchId == 'customsearch3935' || serchId == 'customsearch3934'){
       		  
       		amount = result.getValue({
                  name: 'formulacurrency',
                  summary: search.Summary.SUM 
              });
       		
       	    location = result.getText({
             name: 'location',
             summary: search.Summary.GROUP	 
            });
       		  
       	  }
       	  else{
       		  
       		amount = result.getValue({
                name: 'formulanumeric',
                summary: search.Summary.SUM 
              });
       		  
       	  }
       	  
       	  // Warehouses/locations 3	Drop Ship , 2 Heath Springs, 1 Niles, and 4 Off-Site
       	  
          var fieldid = '';
          
       	  if(objName == 'today' && location == 'Niles'){       		  
       		fieldid = 'custrecord_niles_total_shipped';	       	      		  
       	  }else if(objName == 'today' && location == 'Heath Springs'){       		  
       		fieldid = 'custrecord_hs_total_shipped';       		       		  
       	  }else if(objName == 'today' && location == 'Drop Ship'){       		  
       		fieldid = 'custrecord_ds_total_shipped';       		       		  
       	  }else if(objName == 'month' && location == 'Niles'){       		  
       		fieldid = 'custrecord_niles_total_month_date';       		       		  
       	  }else if(objName == 'month' && location == 'Heath Springs'){       		  
       		fieldid = 'custrecord_hs_total_month_date';       		       		  
       	  }else if(objName == 'month' && location == 'Drop Ship'){       		  
       		fieldid = 'custrecord_ds_total_month_date';       		       		  
       	  }else if(objName == 'overcommitted'){       		  
       		fieldid = 'custrecord_total_overcommitted';       		       		  
       	  }else if(objName == 'bo_not_shipped' && location == 'Niles'){       		  
       		fieldid = 'custrecord_niles_total_bo_not_shipped';       		       		  
       	  }else if(objName == 'bo_not_shipped' && location == 'Heath Springs'){       		  
       		fieldid = 'custrecord_hs_total_bo_not_shipped';       		       		  
       	  }else if(objName == 'bo_not_shipped' && location == 'Drop Ship'){       		  
       		fieldid = 'custrecord_ds_total_bo_not_shipped';       		       		  
       	  }else if(objName == 'com_not_shipped' && location == 'Niles'){       		  
       		fieldid = 'custrecord_niles_total_com_not_shipped';       		       		  
       	  }else if(objName == 'com_not_shipped' && location == 'Heath Springs'){       		  
       		fieldid = 'custrecord_hs_total_com_not_shipped';       		       		  
       	  }else if(objName == 'com_not_shipped' && location == 'Drop Ship'){       		  
       		fieldid = 'custrecord_ds_total_com_not_shipped';       		       		  
       	  }else{
       		log.error('no filed name identified: ' + serchId + '  error: ' + JSON.stringify(e));
       	  }
       	        	       
       	  
       	log.debug('fieldid', fieldid);
       	
       	   var shippingKpi  = {name: objName, location:location, amount:amount, field:fieldid};    	  
       	  
       	     
       	    shippingArray.push(shippingKpi);
       	   
             
        //     log.debug('location', location + ' amount: ' + amount );
          
             return true;
         });  
    	} catch (e) {
            log.error('Error during running search: ' + serchId + '  error: ' + JSON.stringify(e));
        }
    	
    	
    	return shippingArray;
    	
    }  
   
    
});
