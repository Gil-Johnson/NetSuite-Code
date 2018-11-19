/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/email', 'N/runtime', 'N/task', 'N/https', '/SuiteScripts - Globals/lodash'],

function(record, search, email, runtime, task, https, lodash) {
	
   
    function afterSubmit(context) {
    	
//    	  if (context.type !== context.UserEventType.CREATE){ 
//    	    	 log.debug('context.type', context.type); 
//    	    	 return;
//    	     }
    	
    	  var scriptObj = runtime.getCurrentScript();
    
    	  log.debug('usageRemaining', scriptObj.getRemainingUsage());  	
    	  
    	  
    	  try{    	
    		  log.debug('step into try', 'step into try');  	
    		  
    	    	var wavePickRec = context.newRecord;
    	       	
    	    	 log.debug('step into try2', 'step into try2'); 
    	    	 
    	       	var item = wavePickRec.getValue('custrecord_pick_item');
    	          	       	
    	       	var bin = wavePickRec.getValue('custrecord_pick_bin');    	       	
    	       	
    	     	var binText = wavePickRec.getValue('custrecord_bin_text');
    	     	
    	    	var qtyAvl = wavePickRec.getValue('custrecord_quantity_picked');
    	     	       	
    	    	var waveId = wavePickRec.getValue('custrecord_pick_wave');
    	    	
    	    	log.debug('step into try3', 'step into try3');  
    	    	
    	    //  run search to return quantity of from all orders with the same wave record
    	    	
    	    	var orderObjects = retriveOrders(waveId, item, qtyAvl, binText);
    	    	
    	    	
    	    	
    	    	orderObjects.forEach(function (order)
    	    	{
    	    		if(parseInt(qtyAvl) > parseInt(order.qty)){ 
    	    			
    	    			order.qtyAvl =  parseInt(order.qty);
    	    			qtyAvl = parseInt(qtyAvl) - parseInt(order.qty);
    	    			
    	    		}else{
    	    			
    	    			order.qtyAvl =  parseInt(qtyAvl);
    	    			qtyAvl = 0;
    	    		} 	       	    	     
    	    			    
    	    	});
    	    	
    	    	log.debug('orderObjects', JSON.stringify(orderObjects));
    	    	
    	    	var ordArray = orderObjects.filter(function (el) {
    	    		  return el.qtyAvl > 0 ;
    	    		        
    	    		});
    	    	
    	    	log.debug('ordArray', JSON.stringify(ordArray));
    	    	
    	    	
    	    	var orderArr = _.chunk(ordArray, 40);   	    	
    	    	var suiteletURL = 'https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=428&deploy=1&compid=3500213&h=6aaa337259c4f665a589';
    	    	
    	    	
    	    	for (var i = 0; i < orderArr.length; i++) {
    	    		
    	    		suiteletURL += '&orders=' + JSON.stringify(orderArr[i]);
    	    		
    	    		var response = https.get({
    	    		    url: suiteletURL
    	    		});	
    	    		
    	    		
    	    		log.debug("res", response);   	    		
    	    		
    	    		
    	    	} 	    	
    	    		
	    		
    	    	
    	    	
    	       
    	       	
    	       	
    } catch (e) {
        var subject = 'Fatal Error: Unable to process pick wave task';
        var authorId = -5;
        var recipientEmail = 'gjohnson@ricoinc.com';
        email.send({
            author: authorId,
            recipients: recipientEmail,
            subject: subject,
            body: 'Fatal error occurred in script: ' + runtime.getCurrentScript().id + '\n\n' + JSON.stringify(e)
        });
    }
    
    
    log.debug('usageRemaining2', scriptObj.getRemainingUsage()); 
    
    	  }
 
    function retriveOrders(waveId, item, qtyAvl, bin){
    	
    	var ordersToFulfll = [];
    	
   	   
    	//run search for all items on waves to pick   	       	
	       	var orderSearch = search.load({
		         id: 'customsearch5062',
		      });     	
			
	     
			  orderSearch.filters.push(search.createFilter({
		         name: 'custbody_current_wave',
		         operator: 'is',
		         values: parseInt(waveId)
		     }));	     
			  
	       
			  orderSearch.filters.push(search.createFilter({
		         name: 'item',
		         operator: 'is',
		         values: parseInt(item)
		     }));       
			  
			  
			  orderSearch.run().each(function(result) {	
				  
				  var orderid = result.id;   
				      				     				  
				  var item_name = result.getValue({
		              name: 'item'
		           });
				  
				  var quantityOpen = result.getValue({
		              name: 'formulanumeric'
		           });	
				  
				  log.debug('item_name', item_name); 		  
                 
				 ordersToFulfll.push({orderid: orderid, item: item_name, qty: quantityOpen, qtyAvl: 0, bin:bin});				  
				  
				 return true;				  
				 
				  
			  	  });
    	
    	return ordersToFulfll;
    	
    }
  

    


    return {
     //   beforeLoad: beforeLoad,
     //   beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
