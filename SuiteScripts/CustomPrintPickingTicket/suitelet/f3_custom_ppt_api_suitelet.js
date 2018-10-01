

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

                    F3.Util.Utility.logDebug('F3_PPT_API_Suitelet.main(); // action = ', action);

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
                else if (action === 'submit') {

                    F3.Util.Utility.logDebug('F3_PPT_API_Suitelet.main(); // submit = ', 'submit');

                    var data = params;
                    //var salesorderData = data.salesorders;

                    //salesordersDAL.updateOrders(salesorderData);

                    this.submitSelectedRecords(data.checkbox);

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
            this.searchId = 'customsearch_custom_ppt_saved_search';
            this.main(request, response);
        },

        submitSelectedRecords: function(checkbox){

            F3.Util.Utility.logDebug('submitSelectedRecords', JSON.stringify(checkbox));

            // if all records are empty, then return
            if (checkbox.prints.length <= 0) {
                return;
            }

            var context = nlapiGetContext();
            var email = context.getEmail();

            var saleOrderPrintIds = checkbox.prints;
            var rec = nlapiCreateRecord('customrecord_custom_ppt_schedule');

            rec.setFieldValue('custrecord_custom_ppt_print_list', JSON.stringify(saleOrderPrintIds));
            rec.setFieldValue('custrecord_custom_ppt_script_status', 'pending');
            rec.setFieldValue('custrecord_custom_ppt_email_address', email);
            nlapiSubmitRecord(rec, true);

            var status = nlapiScheduleScript('customscript_custom_ppt_scheduled', 'customdeploy_custom_ppt_scheduled');

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

    return new PPTAPISuitelet(request, response);
}