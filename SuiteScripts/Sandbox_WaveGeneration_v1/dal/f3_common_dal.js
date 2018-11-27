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
        getDSIUsers: function () {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            cols.push(new nlobjSearchColumn('name'));
            cols.push(new nlobjSearchColumn('internalId'));
            
            // load data from db
            records = nlapiSearchRecord('customlist_dsi_user', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            var result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        },

        getOrderChannels: function () {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            cols.push(new nlobjSearchColumn('name').setSort(false));

            // load data from db
            records = nlapiSearchRecord('customrecord_order_channels', null, filters, cols);

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
            var isSubstituteForQuantityAvailableCol = new nlobjSearchColumn('formulanumeric').setFormula('{custitem_is_substitute_for.quantityavailable}');
            var substituteQuantityAvailableCol = new nlobjSearchColumn('formulanumeric').setFormula('{custitem_substitute.quantityavailable}');
            var internalImageCol = new nlobjSearchColumn('formulatext').setFormula("CASE \nWHEN {isinactive} = 'T' OR {isinactive} = 'Yes' THEN '<img src=\"'||{custitemthumbnail_image}||'\">'|| '<div style=\"color:red;font-size: 24pt;font-family: Helvetica;\">Inactive</div>' \nWHEN {custitem_discontinued} = 'T' OR {custitem_discontinued} = 'Yes' THEN '<img src=\"'||{custitemthumbnail_image}||'\">'|| '<div style=\"color:red;font-size: 24pt;font-family: Helvetica;\">Discontinued</div>' \nWHEN  {custitem_status} = 'On Hold' THEN '<img src=\"'||{custitemthumbnail_image}||'\">'|| '<div style=\"color:red;font-size: 24pt;font-family: Helvetica;\">' || {custitem_status} || '</div>' \nWHEN  {custitem_status} = 'Canceled' THEN '<img src=\"'||{custitemthumbnail_image}||'\">'|| '<div style=\"color:red;font-size: 24pt;font-family: Helvetica;\">' || {custitem_status} || '</div>' \nWHEN  {custitem_status} = 'Approved' THEN '<img src=\"'||{custitemthumbnail_image}||'\">'|| '<div style=\"color:blueviolet;font-size: 24pt;font-family: Helvetica;\">' || {custitem_status} || '</div>' \nWHEN  {custitem_status} = 'Completed' THEN '<img src=\"'||{custitemthumbnail_image}||'\">'|| '<div style=\"color:forestgreen;font-size: 24pt;font-family: Helvetica;\">' || {custitem_status} || '</div>' \nELSE '<img src=\"'||{custitemthumbnail_image}||'\">'|| '<div style=\"color:black;font-size: 24pt;font-family: Helvetica;\">' || {custitem_status} || '</div>' \nEND");
            cols.push(new nlobjSearchColumn('name').setSort());
            cols.push(new nlobjSearchColumn('salesdescription'));
            cols.push(new nlobjSearchColumn('quantityavailable'));
            cols.push(new nlobjSearchColumn('custitem_buildableqty'));
            cols.push(new nlobjSearchColumn('custitem_is_substitute_for'));
            cols.push(new nlobjSearchColumn('custitem_substitute'));
            cols.push(new nlobjSearchColumn('quantityonorder'));
            cols.push(isSubstituteForQuantityAvailableCol);
            cols.push(internalImageCol);


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
                var itemsSearchId = 3200;
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
            var recordsMap = {}; records.forEach(function (r) {
                recordsMap[r.getId()] = r;
            });
            var result = baseTypeDAL.getObjects(records).map(function(r) {
                F3.Util.Utility.logDebug('record', JSON.stringify(r));
                var record = recordsMap[r.id];
                if (r.custitem_is_substitute_for) {
                    r.custitem_is_substitute_for.quantityavailable = record.getValue(isSubstituteForQuantityAvailableCol);
                }
                if (r.custitem_substitute) {
                    r.custitem_substitute.quantityavailable = record.getValue(substituteQuantityAvailableCol);
                }
                r.custitem_internalimagethumb = record.getValue(internalImageCol) || '';
                return r;
            });
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

