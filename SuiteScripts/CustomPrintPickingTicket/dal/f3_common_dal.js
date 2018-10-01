/**
 * Created by zshaikh on 8/31/2015.
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
 * CommonDAL class that has the functionality of
 */
var CommonDAL = (function () {
    var baseTypeDAL = new F3.Storage.BaseTypeDAL();



    function loadItemSearch(itemsSearchId) {

        var result = {
            success: false,
            savedSearch: null
        };

        try {

            result.savedSearch = nlapiLoadSearch(null, itemsSearchId);
            result.success = true;

        } catch (e) {
            F3.Util.Utility.logException('CommonDAL.loadItemSearch();', e.toString());
        }

        return result;
    }



    return {



        /**
         * Get all partners from db
         */
        getProductTypes: function () {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            cols.push(new nlobjSearchColumn('name').setSort(false));

            // load data from db
            records = nlapiSearchRecord('customrecord_producttypes', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            var result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        },

        /**
         * Get all partners from db
         */
        getPartners: function () {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            cols.push(new nlobjSearchColumn('firstname'));
            cols.push(new nlobjSearchColumn('lastname'));
            cols.push(new nlobjSearchColumn('companyname'));
            cols.push(new nlobjSearchColumn('isperson'));

            // load data from db
            records = nlapiSearchRecord('partner', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            var result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        },

        /**
         * Get all partners from db
         */
        getItems: function (options) {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            //cols.push(new nlobjSearchColumn('isperson').setSort());
            //cols.push(new nlobjSearchColumn('firstname').setSort());
            //cols.push(new nlobjSearchColumn('lastname'));
            //cols.push(new nlobjSearchColumn('companyname').setSort());
            cols.push(new nlobjSearchColumn('name').setSort());


            if (!!options) {
                var query = options.query;
                if (F3.Util.Utility.isBlankOrNull(query) == false) {
                    //filters.push(['firstname', 'startswith', query]);
                    //filters.push('or');
                    //filters.push(['lastname', 'contains', query]);
                    //filters.push('or');
                    //filters.push(['companyname', 'startswith', query]);
                    //filters.push('or');
                    //filters.push(['email', 'contains', query]);
                    //filters.push('or');

                    //filters.push(['isinactive', 'is', 'F']);
                    //filters.push('and');
                    //filters.push(['custitem_discontinued', 'is', 'F']);
                    //filters.push('and');

                    filters.push(new nlobjSearchFilter('name', null, 'startswith', query));
                }
            }

            //Get current loggedin user employee id and get the saved search flag
            var loggedInUserId = nlapiGetContext().getUser();

            F3.Util.Utility.logDebug('Loggedin UserId',loggedInUserId);

            //Load the employee record
            var employee =  nlapiLoadRecord('employee',loggedInUserId);
            var isSavedSearch = employee.getFieldValue('custentity_savedsearch');

            F3.Util.Utility.logDebug('Employee',isSavedSearch);

            if(isSavedSearch == "F") {
                var itemsSearchId = "customsearch2676";
                var loaded = loadItemSearch(itemsSearchId);

                F3.Util.Utility.logDebug('saved_search', itemsSearchId);
                loaded.savedSearch.addFilters(filters);
                loaded.savedSearch.setColumns(cols);
                var search = loaded.savedSearch.runSearch();
                var resultSet = search.getResults(0, 50);
                records = _.flatten(resultSet);
            }
            else {
                F3.Util.Utility.logDebug('load_from_db');

                // load data from db
                filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
                records = nlapiSearchRecord('item', null, filters, cols);
            }


            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            var result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        },


        /**
         * Get all partners from db
         */
        getCustomers: function (options) {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            cols.push(new nlobjSearchColumn('isperson').setSort());
            cols.push(new nlobjSearchColumn('firstname').setSort());
            cols.push(new nlobjSearchColumn('lastname'));
            cols.push(new nlobjSearchColumn('companyname').setSort());
            cols.push(new nlobjSearchColumn('entityid'));


            if (!!options) {
                var query = options.query;
                if (F3.Util.Utility.isBlankOrNull(query) == false) {
                    filters.push(['firstname', 'startswith', query]);
                    filters.push('or');
                    //filters.push(['lastname', 'contains', query]);
                    //filters.push('or');
                    filters.push(['companyname', 'startswith', query]);
                    //filters.push('or');
                    //filters.push(['email', 'contains', query]);
                    filters.push('or');
                    filters.push(['entityid', 'is', query]);
                }
            }


            // load data from db
            records = nlapiSearchRecord('customer', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            var result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        },

        /**
         * Get all partners from db
         */
        getLocations: function () {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            filters.push(new nlobjSearchFilter('makeinventoryavailable', null, 'is', 'T'));

            cols.push(new nlobjSearchColumn('name'));

            // load data from db
            records = nlapiSearchRecord('location', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            var result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        },

        /**
         * Get all partners from db
         */
        getLeagues: function () {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

            cols.push(new nlobjSearchColumn('name'));

            // load data from db
            records = nlapiSearchRecord('customrecord5', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        },

        /**
         * Get all partners from db
         */
        getTeams: function (league_id) {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

            if(!!league_id) {
                filters.push(new nlobjSearchFilter('custrecord7', null, 'anyof', [league_id]));
            }

            cols.push(new nlobjSearchColumn('name'));

            // load data from db
            records = nlapiSearchRecord('customrecord4', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        }
    };
})();

