/**
 * Created by zshaikh on 8/26/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * F3_PPT_ class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var F3BaseAPISuitelet = Fiber.extend(function () {

    'use strict';

    return {

        searchId: '',

        init: function (request, response) {

        },

        /**
         * main method
         */
        main: function (request, response) {
            F3.Util.Utility.logDebug('F3_PPT_API_Suitelet.main();');
            var mainRequestTimer = F3.Util.StopWatch.start('F3_PPT_API_Suitelet.main();');


            var result = {};
            var action = request.getParameter('action');
            var params = request.getParameter('params');
            var callback = request.getParameter('callback');
            var salesordersDAL = new SalesOrdersDAL();

            if (!!params) {
                params = JSON.parse(params);
            }

            F3.Util.Utility.logDebug('F3_PPT_API_Suitelet.main(); // action = ', action);
            F3.Util.Utility.logDebug('F3_PPT_API_Suitelet.main(); // params = ', JSON.stringify(params));

            try {
                if (action === 'get_salesorders') {

                    // fetch data from API.
                    var salesordersDALTimer = F3.Util.StopWatch.start('SalesOrdersDAL.getPending();');
                    var filters = params;

                    salesordersDAL.searchId = this.searchId;
                    var records = salesordersDAL.getPending(filters);
                    salesordersDALTimer.stop();

                    result.data = records;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';

                }
                else if (action === 'get_partners') {
                    var partners = CommonDAL.getPartners();
                    result.data = partners;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if (action === 'get_dsiusers') {
                    var dsiUsers = CommonDAL.getDSIUsers();
                    result.data = dsiUsers;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if(action === 'get_product_types') {
                    //customrecord_producttypes
                    var productTypes = CommonDAL.getProductTypes();
                    result.data = productTypes;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if(action === 'get_order_channels') {
                    var orderChannels = CommonDAL.getOrderChannels();
                    result.data = orderChannels;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if (action === 'get_locations') {
                    var locations = CommonDAL.getLocations();
                    result.data = locations;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if (action === 'get_leagues') {
                    var leagues = CommonDAL.getLeagues();
                    result.data = leagues;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if (action === 'get_teams') {
                    var teams = CommonDAL.getTeams(params.league_id);
                    result.data = teams;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if (action === 'get_customers') {
                    var customers = CommonDAL.getCustomers(params);
                    result.data = customers;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if (action === 'get_items') {
                    var items = CommonDAL.getItems(params);
                    result.data = items;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else if (action == 'get_customer_info') {
                    var customerId = request.getParameter('customer_id');
                    var items = CommonDAL.getCustomerInfo(customerId);
                    result.data = items;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                } 
                else if (action === 'submit') {

                    var data = params;
                    var salesorderData = data.salesorders;

                    //salesordersDAL.updateOrders(salesorderData);

                    this.submitSelectedRecords(data.checkbox, salesorderData);

                    result.data = true;
                    result.status_code = 200;
                    result.status = 'OK';
                    result.message = 'success';
                }
                else {
                    result.status_code = 400;
                    result.status = 'Bad Request';
                    result.message = "invalid parameters";
                }
            }
            catch (ex) {
                F3.Util.Utility.logException('F3_PPT_API_Suitelet.main();', ex.toString());

                result.status_code = 500;
                result.status = 'Internal server error';
                result.message = ex.toString();
            }

            var json = JSON.stringify(result);

            F3.Util.Utility.logDebug('this.searchId: ', this.searchId);
            F3.Util.Utility.logDebug('Response: ', json);

            if (!!callback) {
                json = callback + '(' + json + ')';
            }

            response.setContentType('JSON');
            response.writeLine(json);

            mainRequestTimer.stop();
        }
    };
});





var PPTAPISuitelet = F3BaseAPISuitelet.extend(function(base){

    return {
        init: function(request, response) {
            this.base = Fiber.proxy(base, this);
            this.base.init();
            this.searchId = 'customsearch_reopensalesorders_2_2_2__58';
            this.main(request, response);
        },

        submitSelectedRecords: function(checkbox, salesorders){
            // if all records are empty, then return
            if (checkbox.orders.length <= 0 &&
                checkbox.items.length <= 0 &&
             //   checkbox.prints.length <= 0 && 
                salesorders.lengh <= 0 ) 
             {
                return;
            }
   
            // Governance Unit: 26
            var checkboxData = {
                wavepicking_item_list: JSON.stringify(checkbox),
                salesorders: salesorders
            };

            F3.Util.Utility.logDebug('finalsubmittingdata', JSON.stringify(checkboxData));            
            F3.Util.Utility.logDebug('salesorders', JSON.stringify(checkbox.orders));
            
            var search = nlapiLoadSearch('item', 'customsearch7252');
        	var newFilter = new nlobjSearchFilter('internalid', 'transaction', 'anyOf', checkbox.orders);
        	search.addFilter(newFilter);
                	
        	var resultSet = search.runSearch();
        	
        	//nlapiLogExecution('DEBUG','SL testing' , resultSet.length );  	
        	
              var itemJSON = [];
      	    
        	  resultSet.forEachResult(function(searchresult)
        	  {
        	       var record = searchresult.getValue('internalid', null, 'group');
                   var itemtype = searchresult.getValue('type', null, 'group');                   
                   var itemtxt = searchresult.getValue( 'name', null, 'group');

                   var mtoBin = searchresult.getValue( 'custcol_mto_bin', 'transaction', 'group');
        	       var qtyCom = searchresult.getValue( 'quantitycommitted', 'transaction', 'sum');
              
                  var itemObj = {
    
                        itemNum:  itemtxt,
                        itemId : record,
                        qtyCommitted : qtyCom,
                        itemtype : itemtype,
                        mtoBin : mtoBin,

                    }
      
                    itemJSON.push(itemObj);

        	       nlapiLogExecution('DEBUG','json data' , JSON.stringify(itemJSON) ); 
        	 	   return true;                // return true to keep iterating
        	 	  
               });       
               
               nlapiLogExecution('DEBUG','json data' , JSON.stringify(itemJSON) ); 

               var kitArray = _.filter(itemJSON, { 'itemtype': 'Kit'});
               nlapiLogExecution('DEBUG','json data kitArray' , JSON.stringify(kitArray));
               
               //pull all kit memebrs out nd run kit memmber search
               var nonKitArray = _.filter(itemJSON, function(o) { return o.itemtype != 'Kit'; });
               nlapiLogExecution('DEBUG','json data nonKitArray' , JSON.stringify(nonKitArray)); 

               var kitsArray = kitArray.map(function (obj) {
                return obj.itemId;
              });

              nlapiLogExecution('DEBUG','kitArray.length' , kitArray.length); 

              if(kitArray.length >= 1){

                nlapiLogExecution('DEBUG','inside search' , 'in search'); 

                // run search woth kits as the filter
                var kitsearch = nlapiLoadSearch('item', 'customsearch7253');
                var newFilter = new nlobjSearchFilter('internalid', null, 'anyOf', kitsArray);
                kitsearch.addFilter(newFilter);
                var kitresultSet = kitsearch.runSearch();

                kitresultSet.forEachResult(function(searchresult)
                {
                     var record = searchresult.getValue('internalid');                  
                     var itemtxt = searchresult.getValue( 'name');
                     var memberitem = searchresult.getValue( 'memberitem');
                     var memberquantity = searchresult.getValue( 'memberquantity');

                     nlapiLogExecution('DEBUG','itemtxt for kit' , itemtxt); 
                    
                    //look in kitArray find parent qty// kits will nto have mto bins
                    var parent = _.find(kitArray, {'itemId': record , 'mtoBin': ""});

                    //found parent get qty com and * by member qty 
                    var memQty = parseInt(parent.qtyCommitted) * parseInt(memberquantity);
                    
                    //then look in array for member if member not in array push if it is add it
                    var itemInArray = _.find(nonKitArray, {'itemId': memberitem});

                    if(!itemInArray){

                        nonKitArray.push({
                            itemId : memberitem,
                            qtyCommitted : memQty,
                       
                        });

                    }else{

                        itemInArray.qtyCommitted = parseInt(itemInArray.qtyCommitted) + parseInt(memQty);

                    }
                    
                      return true;                
                     
                 });
                }


                 nlapiLogExecution('DEBUG','json nonKitArray 2 - finial' , JSON.stringify(nonKitArray) ); 
  
        	  
          	  var JSONobj = {	
          			  
        			  wavepicking_item_list: 
        				  {
        				   orders: checkbox.orders,
        				   items: itemJSON,			  
        				   dropship:checkbox.dropship,
        				   warehouse:checkbox.warehouse,
        				   user:checkbox.user	
        			  }
        	  };
           
//        	  nlapiLogExecution('DEBUG','json data' , JSON.stringify(JSONobj) ); 
            
            var columns = new Array();
            columns[0] = new nlobjSearchColumn( 'created');
            columns[1] = new nlobjSearchColumn( 'custrecord_wave_increment');        
            var waveRecords = nlapiSearchRecord( 'customrecord_wave', 'customsearch3886', null, columns );        
            var wave_name = 'WV_';
            var wave_increment = 0;
            var date = new Date();            
            if(checkbox.dropship == 1){
                wave_name = 'DSWV_';
            }
            for ( var i = 0; waveRecords != null && i < waveRecords.length; i++ )
            {
               var searchresult = waveRecords[ i ];
               var record = searchresult.getId( );
               var rectype = searchresult.getRecordType( );
               var createdDate = searchresult.getValue( 'created');
               var increment = searchresult.getValue( 'custrecord_wave_increment');         
              
               wave_increment = parseInt(increment) + 1;
               wave_name = wave_name + moment(date).format('MM/DD/YYYY')  + '_' + wave_increment;
               break;              
            }
            if(waveRecords == null) {     
               
                wave_increment = 1;
                wave_name = wave_name + moment(date).format('MM/DD/YYYY') + '_' + wave_increment;
            }

            
         // need to addlogic if there are no search results

            var rec = nlapiCreateRecord('customrecord_wave');
            rec.setFieldValue('custrecord_wave_data', JSON.stringify(JSONobj));
            rec.setFieldValue('name',  wave_name);
            rec.setFieldValue('custrecord_wave_increment', wave_increment);            
           // rec.setFieldValue('custrecord_wave_status', 1);
            rec.setFieldValue('custrecord_warehouse', checkbox.warehouse);
            
            if(checkbox.user != null || checkbox.user != ""){
            try{
            rec.setFieldValue('custrecord_assigned_user', checkbox.user);
            }catch(e){
            	nlapiLogExecution('error', JSON.stringify(e));
            }
            }
            
            rec.setFieldValue('custrecord_script_status', 'pending');
            var wave_rec_id = nlapiSubmitRecord(rec, true);
       
            
            var context1 = nlapiGetContext(); 

            var pickedarr = _.map(nonKitArray, function(o) { return _.pick(o, 'itemId' , 'qtyCommitted', 'mtoBin'); });
            
            var final = _.chunk(pickedarr, 30); 

            for (var i = 0; i < final.length; i++) {                           
               var data = JSON.stringify(final[i]);

               nlapiLogExecution('DEBUG', 'final[i]', JSON.stringify(final[i]));
               
              var url = 'https://forms.na3.netsuite.com/app/site/hosting/scriptlet.nl?script=601&deploy=1&compid=3500213&h=6b12921842a553e620f8';
              url += '&orders=' + encodeURIComponent(checkbox.orders);	
              url += '&waveid=' + encodeURIComponent(wave_rec_id);	
              url += '&user=' + encodeURIComponent(checkbox.user);	
              url += '&itemjson=' + encodeURIComponent(data);
              nlapiRequestURL(url); 		           	

          }  

          if(checkbox.orders.length < 80){

            for ( var x = 0; x < checkbox.orders.length; x++ ) {
               nlapiSubmitField('salesorder', checkbox.orders[x], ['custbody_current_wave', 'custbody_cleared_wave'] , [wave_rec_id, wave_rec_id]);
               nlapiLogExecution('DEBUG', 'remaining usage' + x, context1.getRemainingUsage());
             
               }
              // update to wave rec 
               nlapiSubmitField('customrecord_wave', wave_rec_id, ['custrecord_orders_marked'] , ['T']);
               
           }
           else{

            var posturl = 'https://3500213.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=609&deploy=1';
            posturl += '&waveid=' + encodeURIComponent(wave_rec_id);
            posturl += '&orders=' + encodeURIComponent(checkbox.orders);

            var cred = {
                account: '3500213',
                email: 'gjohnson@ricoinc.com',
                password: 'r5;NvcbuRR',
                role: '1027'
            }

            var headers = {"User-Agent-x": "SuiteScript-Call",
               "Authorization": "NLAuth nlauth_account=" + cred.account + ", nlauth_email=" + cred.email + 
                                ", nlauth_signature= " + cred.password + ", nlauth_role=" + cred.role,
               "Content-Type": "application/json"};


            nlapiRequestURL(posturl, null, headers);
 
        } 


            nlapiLogExecution('DEBUG', 'remaining usage', context1.getRemainingUsage());
         

            return 'pending';
        }
    };

});



var OrderReviewAPISuitelet = F3BaseAPISuitelet.extend(function(base){


    return {
        init: function(request, response){
            this.base = Fiber.proxy(base, this);
            this.base.init();
            this.searchId = 'customsearch_reopensalesorders_2_2_2___4';
            this.main(request, response);
        },

        submitSelectedRecords: function(checkbox, salesorders){
            // if all records are empty, then return
            if (checkbox.orders.length <= 0 &&
                checkbox.items.length <= 0 &&
                checkbox.prints.length <= 0 &&
                salesorders.lengh <= 0) {
                return;
            }

            // Governance Unit: 26
            var checkboxData = {
                custscript_orde_cancellist: JSON.stringify(checkbox),
                salesorders: salesorders
            };

            F3.Util.Utility.logDebug('finalsubmittingdata', JSON.stringify(checkboxData));
/*
            var rec = nlapiCreateRecord('customrecord_order_review_schedule');
            rec.setFieldValue('custrecord_order_review_cancellist', JSON.stringify(checkboxData));
            rec.setFieldValue('custrecord_order_review_script_status', 'pending');
            nlapiSubmitRecord(rec, true);
            var status = nlapiScheduleScript('customscript_orde_review_form_sch', 'customdeploy_orde_review_form_sch');
*/
            var status = 'pending';
            F3.Util.Utility.logDebug('schedule_script_status', status);


            return status;
        }
    };

    

});


/**
 * This is the main entry point for F3_PPT_ suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function F3_PPT_API_SuiteletMain(request, response) {

    var type = request.getParameter('type');

    if ( type === 'OrderReview') {
        return new OrderReviewAPISuitelet(request, response);
    }
    else {
        return new PPTAPISuitelet(request, response);
    }


}