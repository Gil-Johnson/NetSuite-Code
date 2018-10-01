

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
                else if(action === 'get_product_types') {
                    //customrecord_producttypes
                    var productTypes = CommonDAL.getProductTypes();
                    result.data = productTypes;
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
            this.searchId = 'customsearch_reopensalesorders_2_2_2___3';
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
                custscript_cancellist: JSON.stringify(checkbox),
                salesorders: salesorders
            };

            F3.Util.Utility.logDebug('finalsubmittingdata', JSON.stringify(checkboxData));

            var rec = nlapiCreateRecord('customrecord_ppt_schedule');
            rec.setFieldValue('custrecord_cancel_list', JSON.stringify(checkboxData));
            rec.setFieldValue('custrecord_script_status', 'pending');
            nlapiSubmitRecord(rec, true);

            var status = nlapiScheduleScript('customscript_ppt_sch', 'customdeploy_ppt_sch');

            F3.Util.Utility.logDebug('schedule_script_status', status);

            return status;
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
                checkbox.approves.length <= 0 &&
                checkbox.emails.length <= 0 &&
                salesorders.lengh <= 0) {
                return;
            }

            // Governance Unit: 26
            var checkboxData = {
                custscript_orde_cancellist: JSON.stringify(checkbox),
                salesorders: salesorders
            };

            F3.Util.Utility.logDebug('finalsubmittingdata', JSON.stringify(checkboxData));

            var rec = nlapiCreateRecord('customrecord_order_review_schedule');
            rec.setFieldValue('custrecord_order_review_cancellist', JSON.stringify(checkboxData));
            rec.setFieldValue('custrecord_order_review_script_status', 'pending');
            nlapiSubmitRecord(rec, true);
            var status = nlapiScheduleScript('customscript_orde_review_form_sch', 'customdeploy_orde_review_form_sch');

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