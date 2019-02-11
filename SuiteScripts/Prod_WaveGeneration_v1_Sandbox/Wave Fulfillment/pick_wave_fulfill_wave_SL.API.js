/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record',  'N/search', 'N/email', 'N/runtime', '/SuiteScripts - Globals/lodash', 'N/url', 'N/https'],

function(record, search, email, runtime, lodash, url, https) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	
	 if (context.request.method === 'GET'){	
		 
		//put error handling for no values===============================

		 try{
	    	
	    	//retrive parameters 
			 var waveid = context.request.parameters.waveid; 
			 var orderid = context.request.parameters.id; 
			 var itemsToFullArray = []; 
			 var ordersToFullfillArray = [];
			 var kitMembers = [];
			 var index = 0;

			 log.debug('waveid', waveid);	
			 log.debug('orderid ', orderid);

			 if(!waveid && !orderid){
				 context.response.write('error please contact your NetSuite admin');
				 return;
			 }

			 //run search for all orders with a certain wave 
			var itemsToFulfill = search.load({
				id: 'customsearch_fulfill_wave_orders',
			});

			itemsToFulfill.filters.push( search.createFilter({
				join: 'binnumber',
				name: 'custrecord_current_wave',
				operator: search.Operator.IS,
				values: waveid
			})); 


			itemsToFulfill.run().each(function(result) {
	    	   	 
				var id = result.id;

			//	log.debug('item bin', result.id);

				var binnumber = result.getValue({
					name: 'binnumber'
				});
				var binonhandavail = result.getValue({
					name: 'binonhandavail'
				});
		
				itemsToFullArray.push({item: id, binnumber: binnumber,binonhandavail:binonhandavail , index:index});
				index++;
				
				return true;
			
		   });


			log.debug('itemsToFullArray', JSON.stringify(itemsToFullArray));


			//run search to pull all orders with wave
			var ordersToFullfill = search.load({
				id: 'customsearch6586',
			});

				ordersToFullfill.filters.push( search.createFilter({
					join: 'transaction',
					name: 'custbody_current_wave',
					operator: search.Operator.IS,
					values: waveid
				})); 

				if(orderid){
					//log.debug('orderid filter', orderid);
					ordersToFullfill.filters.push( search.createFilter({
						join: 'transaction',
						name: 'internalid',
						operator: search.Operator.IS,
						values: orderid
					})); 
				}

		//algo to check if parent is kit if so is next kit member stop adding parent when the next item is not kit parent 


			ordersToFullfill.run().each(function(result) {
	    	   	 
				var id = result.id;		
				var itemType = result.getValue({
					name: 'type'
				});

				log.debug('item types', itemType);

				var orderid = result.getValue({
					join: 'transaction',
					name: 'internalid'
				});

				
				var orderline = result.getValue({
					join: 'transaction',
					name: 'line'
				});

				var qty = result.getValue({
					join: 'transaction',
					name: 'quantity'
				});

				var qtyCommitted = result.getValue({
					join: 'transaction',
					name: 'quantitycommitted'
				});

				var iskitmember = result.getValue({
					name: 'formulatext'
				});

				var memberitem = result.getValue({
					name: 'memberitem'
				});
				var memberquantity  = result.getValue({
					name: 'memberquantity'
				});
				var membertype  = result.getValue({
					name: 'membertype'
				});
					
				//if it a kitmbr from fromula put in a new array with orderline item and qtycommited
				if(iskitmember == 'kitmbr'){
					//push to kitMembers 
				
					kitMembers.push({
						item: id,
						qtyCommitted: Math.abs(qtyCommitted),
						line: orderline,
					
					});

					log.debug('is kit member', id);
					//dont know if this . will work
					return true;
				}

				try{
					kitMembers = _.uniqBy(kitMembers, 'line');
				}catch(e){
					log.error('error on _unigBy', JSON.stringify(e));
				}

				var inArray = "";  

				if(itemType == 'Assembly') {

				  inArray = _.find(ordersToFullfillArray, { 'orderline': orderline, 'item': id });

				} 

				log.debug('is kit member', id + ' iskitmember: '+ iskitmember);
			
				//exclude assembly members
				if(!inArray) { 

					
					//need to check if it's a kit 
				if(memberitem && itemType == 'Kit'){

					var qtyNeeded =  Math.abs(memberquantity)  * Math.abs(qtyCommitted);
					var itemData = checkBins(itemsToFullArray, memberitem, qtyNeeded);
					log.debug('kit members',  memberitem + ' qty:'+ qtyNeeded + ' kit array:' + JSON.stringify(kitMembers));
					//search for duplicate kit member entrys and then remove them via remove_
					var kitOrderLine =  _.find(kitMembers, { 'item': memberitem , 'qtyCommitted': Math.abs(qtyNeeded)});
					if(kitOrderLine){
						try{
						_.remove(kitMembers, {line: kitOrderLine.line});
						}catch(e){
							log.error('error on _remove', JSON.stringify(e));
						}
				    }

					log.debug('kit members after removal', JSON.stringify(kitMembers));
					//if found remove from array
					  

						var itemObj = {
							item: memberitem, 
							orderline: kitOrderLine.line,
							orderid: orderid, 
							qtyCommitted: qtyNeeded, 
							binString: itemData.binString, 
							parentId: id, 
							parentQtyCom: qtyCommitted, 
							memberQty: memberquantity, 
							qtyFulfilled: itemData.qtyFulfilled,
							bins: itemData.bins
						};

					}else{

						var qtyNeeded =  Math.abs(qtyCommitted);
						var itemData = checkBins(itemsToFullArray, id, qtyNeeded);

						var itemObj = {
							item: id, 
							orderline:orderline,
							orderid: orderid, 
							qtyCommitted: qtyNeeded, 
							binString: itemData.binString, 
							qtyFulfilled: itemData.qtyFulfilled,
							bins: itemData.bins
						};

					}
				

					if(itemData.binString){

					  ordersToFullfillArray.push(itemObj);

					}

				}

				return true;
			
		   });

		  log.debug('ordersToFullfillArray', JSON.stringify(ordersToFullfillArray));

			//consolidate item fulfillments based on sales order
			var grouped = _.groupBy(ordersToFullfillArray, function(IF) {
			return IF.orderid;
			});
	
			log.debug('grouped array', JSON.stringify(grouped));
			

			var result = Object.keys(grouped).map(function (key) {
				return { key: key, value: grouped[key] };
			  });

			  log.debug('result', JSON.stringify(result)); 
			  //log.audit('result', result.length); 

			
	

			//chunk into 20 orders per request
			var chuckedData = _.chunk(result, 5);

		    for (var i = 0; i < chuckedData.length; i++) {

				var parameters = {orders: JSON.stringify(chuckedData[i])};

				log.debug('orders chuncked' + i , JSON.stringify(chuckedData[i]));

                                           
				https.post({url: 'https://forms.netsuite.com/app/site/hosting/scriptlet.nl?script=602&deploy=1&compid=3500213_SB1&h=7e567987d2c02cc5677f', body: parameters});

	          }  

	
		 }catch(e){
			 
			 var error = log.error("error", JSON.stringify(e));
			
		 }
	 		         
	                  
	       context.response.write('<script> window.history.back() </script>');
	    		 
		 	 		
		 }else{
			 
		 }

		 function checkBins(itemsToFullArray, id, qtyNeeded){

			var itemData = {};
			itemData.qtyFulfilled = 0;
			itemData.binString = "";
			itemData.bins = [];
			var qtyUnfulfilled = 0;
			var qtyToFulfill = qtyNeeded;
			var qtyFulfilled = 0;
			//keep a counter of qty fulfilled it is inaccurate
		
			//find all bin objects and pull them out    ||   pulls an array of objects
			var itemBins = _.filter(itemsToFullArray, function(o) { return o.item === id && o.binonhandavail > 0;});
			if(!itemBins){
				return;
			}
			itemBins = _.sortBy(itemBins, ['binonhandavail']);

			//loop through item bins   script is over fulfilling taking qty from second bin when it doesn't need it
			
			itemBins.forEach(function (item) {

			if(qtyToFulfill >= 0){ //prevent overfulfillment

				log.debug('item data', 'item:' +  id + ' qtyToFulfill: '+qtyToFulfill+ ' item.binnumber: ' + item.binnumber + ' item.binonhandavail: ' + item.binonhandavail);
			
				//check if bin can fulfill all quantity 
				var avilableQty = item.binonhandavail;

				qtyUnfulfilled = Math.abs(qtyToFulfill) - Math.abs(avilableQty);
			
				if(qtyUnfulfilled <= 0){
					qtyFulfilled = Math.abs(qtyToFulfill);
				}else{
				qtyFulfilled = Math.abs(qtyToFulfill) - Math.abs(qtyUnfulfilled);
				}

				itemsToFullArray[item.index].binonhandavail = Math.abs(itemsToFullArray[item.index].binonhandavail) - Math.abs(qtyFulfilled);	
				itemData.bins.push({bin: item.binnumber, qty:  Math.abs(qtyFulfilled)});		

				if(itemData.binString){
					itemData.binString =  item.binnumber + '(' + Math.abs(qtyFulfilled) + ')' + ',' + itemData.binString;
				}else{
					itemData.binString =  item.binnumber + '(' + Math.abs(qtyFulfilled) + ')' ;
				}


				log.debug('itemData.binString: ' + itemData.binString);

				if(qtyUnfulfilled <= 0){ // whenever picked from multiple bins qty fullfilled is wrong
					itemData.qtyFulfilled = Math.abs(qtyNeeded);
					qtyToFulfill  = 0;
					return ;
				}else{
					itemData.qtyFulfilled =   Math.abs(qtyNeeded) - Math.abs(qtyUnfulfilled);
					qtyToFulfill =  Math.abs(qtyUnfulfilled);
				}

			}

			});

			return itemData;
			
		 }

    }

    return {
        onRequest: onRequest
    };
    
});