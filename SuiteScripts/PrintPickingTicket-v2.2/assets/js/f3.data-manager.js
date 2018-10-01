/**
 * Created by zshaikh on 9/1/2015.
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
 * DataManager class to handle Data Communication between UI and Server
 *  - Fetch Partners
 *  - Fetch Customers
 *  - Fetch Locations
 *  - Search SalesOrders
 *  - Cache Data
 */
function DataManager(type) {

    var suiteletScriptId = 'customscript_ppt_api_suitelet';
    var suiteletDeploymentId = 'customdeploy_ppt_api_suitelet';
    var _serverUrl = null;
    var _type = type;

    var getServerUrl = function() {

        if (!_serverUrl) {
            _serverUrl = window.apiSuiteletUrl;
            _serverUrl += '&type=' + _type; // append type
        }

        return _serverUrl;
    };

    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
    })();




    function getSalesOrdersFromServer(params, startIndex, callback) {
        console.log('getSalesOrdersFromServer()');


        var suiteletUrl = getServerUrl();
        var options = {
            'action': 'get_salesorders'
        };

        console.log('startIndex: ',startIndex);

        params.startIndex = startIndex;

        var filters = {
            'params': JSON.stringify(params)
        };

        console.log('filters: ',filters);

        $.extend(options, filters);

        jQuery.get(suiteletUrl, options, function (result) {
            console.log('jquery complete: ', arguments);

            if (result.status_code === 200) {

                _.each(result.data, function (item, key) {
                    item.guid = guid();
                    item.recid = item.guid;
                    item.mainline = !item.item;

                });

                //Set the total committed value in the sales order main line
                _.chain(result.data)
                    .where({mainline:true})
                    .each(function(item,key) {
                        console.log(item);

                        var totalCommittedValue = 0;
                        var lineItems = _.chain(result.data)
                                            .where({id:item.id})
                                            .each(function(lineItem,index) {
                                                totalCommittedValue += parseInt(lineItem.quantity_committed);
                                            });

                        item.quantity_committed = totalCommittedValue;
                    });

            } else {
                // TODO : show an error message
                console.error('error while fetching data from server: ', arguments);
            }

            callback && callback(result);

        });
    }

    function getPartnersFromServer (callback) {

        var suiteletUrl = getServerUrl();

        jQuery.get(suiteletUrl, {'action': 'get_partners'}, function (result) {
            console.log('getPartners(); // jquery complete: ' , arguments);

            callback && callback(result);

        });

    }


    function getProductTypesFromServer (callback) {

        var suiteletUrl = getServerUrl();

        jQuery.get(suiteletUrl, {'action': 'get_product_types'}, function (result) {
            console.log('getPartners(); // jquery complete: ' , arguments);

            callback && callback(result);

        });

    }


    function getLocationsFromServer (callback) {

        var suiteletUrl = getServerUrl();

        jQuery.get(suiteletUrl, {'action': 'get_locations'}, function (result) {
            console.log('getLocations(); // jquery complete: ' , arguments);

            callback && callback(result);

        });

    }


    function getLeaguesFromServer (callback) {

        var suiteletUrl = getServerUrl();
        var options = {'action': 'get_leagues'};

        jQuery.get(suiteletUrl, options, function (result) {
            console.log('getLeaguesFromServer(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }


    function getTeamsFromServer (params, callback) {

        var suiteletUrl = getServerUrl();
        var options = {'action': 'get_teams'};
        var filters = {
            params: JSON.stringify(params)
        };

        $.extend(options, filters);

        jQuery.get(suiteletUrl, options, function (result) {
            console.log('getTeamsFromServer(); // jquery complete: ' , arguments);

            callback && callback(result);
        });

    }



    function split2(items, groupBy, pageSize, pageIndex) {
        console.log('split 2()');

        //var pageSize = 200;
        var pickedItemsCount = 0;
        //var pageIndex =  0;
        var pageWiseRecords = {};
        var clonedItems = _.clone(items);
        var clonedItemLength = clonedItems.length;

        while (pickedItemsCount < clonedItemLength) {

            console.log('pickedItemsCount: ', pickedItemsCount);
            console.log('clonedItemLength: ', clonedItemLength);


            var records = _.chain(clonedItems).drop(pickedItemsCount).take(pageSize);

            console.log('records.length: ', records.value().length);

            //if ( records && records.length ) {
            //for (var i = records.length - 1; i >= 0; i--) {
            //    // if it is mainline, then splice
            //    if (!records[i].item) {
            //        records.splice(i, records.length - 1);
            //        break;
            //    }
            //}

            var mainlineCounter = pickedItemsCount + pageSize;
            //var clonedItemsStarter = clonedItemLength - mainlineCounter;
            for (var i = mainlineCounter; i < clonedItemLength; i++) {
                var obj = clonedItems[i];
                // if it is new salesorder, then stop here
                if (!obj.item) {
                    break;
                }
                else {
                    // if it is lineitem of prev salesorder
                    // then add in records array.
                    records.push(obj);
                }
            }


            var unwrappedRecords = records.value();
            console.log('records.length: ', unwrappedRecords.length);

            pickedItemsCount += unwrappedRecords.length;
            pageWiseRecords[pageIndex++] = unwrappedRecords;

            console.log('pageIndex: ', pageIndex);

            //}
        }

        return pageWiseRecords;
    }


    /**
     * Get SalesOrders from server filtered by 'params'
     * @param params {obj} key value pairs of filters
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of salesorder
     */
    this.getSalesOrders = function(params, pageIndex, callback) {

        var cacheKey = _type + '_' + _.values(params).join('_');
        var data = $.jStorage.get(cacheKey);

        if (data && data[pageIndex]) {
            callback && callback(data[pageIndex]);
        }
        else {

            if ( !data) {
                data = {};
            }

            var startIndex = 0;
            if ( data[pageIndex - 1] ) {
                startIndex = _.chain(data).values().flatten().size().value();
            }

            getSalesOrdersFromServer(params, startIndex, function(result) {

                if (result.status_code === 200) {

                    var itemsPerPage = 525;
                    var items = result.data;

                    // break items into pages
                    var splittedItems = split2(items, 'id', itemsPerPage, pageIndex);


                    data = _.extend(data, splittedItems);

                    var currentPageData = data[pageIndex] || [];

                    console.log('splittedItems: ', splittedItems);
                    console.log('data: ', data);
                    console.log('page: ', pageIndex);
                    console.log('data[page]: ', currentPageData);

                    var oneSecond = 1000;
                    var oneMinute = 60 * oneSecond;
                    var oneHour = 60 * oneMinute;

                    $.jStorage.set(cacheKey, data, {TTL: oneHour});
                    //$.jStorage.setTTL(cacheKey, oneHour);

                    callback && callback(currentPageData);

                } else {
                    // TODO : show an error message
                    console.error('error while fetching data from server: ', arguments);
                }

            });
        }
    };


    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    this.getPartners = function(callback) {

        var cacheKey = 'partners';
        var data = $.jStorage.get(cacheKey);

        if (!! data ) {
            callback && callback(data);
        }
        else {
            getPartnersFromServer(function(data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    };



    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    this.getProductTypes = function(callback) {

        var cacheKey = 'product_types';
        var data = $.jStorage.get(cacheKey);

        if (!! data ) {
            callback && callback(data);
        }
        else {
            getProductTypesFromServer(function(data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    };


    /**
     * Get Locations from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of location
     */
    this.getLocations = function (callback) {

        var cacheKey = 'locations';
        var data = $.jStorage.get(cacheKey);

        if (!! data ) {
            callback && callback(data);
        }
        else {
            getLocationsFromServer(function(data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    };


    /**
     * Get Locations from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of location
     */
    this.getLeagues = function (callback) {
        console.log('getLeagues();');

        var cacheKey = 'leagues';
        var data = $.jStorage.get(cacheKey);

        if (!! data ) {
            callback && callback(data);
        }
        else {
            getLeaguesFromServer(function(data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    };


    /**
     * Get Locations from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of location
     */
    this.getTeams = function (options, callback) {

        options = options || {};

        var cacheKey = 'teams_' + options.league_id;
        var data = $.jStorage.get(cacheKey);

        if (!! data ) {
            callback && callback(data);
        }
        else {
            getTeamsFromServer(options, function(data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    };


    /**
     * Description of method DataManager
     * @param parameter
     */
    this.getCustomers = function (params, callback) {
        try {

            var suiteletUrl = getServerUrl();

            var options = {
                'action': 'get_customers'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            jQuery.get(suiteletUrl, options, function (result) {
                console.log('getCustomers(); // jquery complete: ' , arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());

            callback && callback(null);
        }
    };


    /**
     * Description of method DataManager
     * @param parameter
     */
    this.getItems = function (params, callback) {
        try {

            var suiteletUrl = getServerUrl();

            var options = {
                'action': 'get_items'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            jQuery.get(suiteletUrl, options, function (result) {
                console.log('getCustomers(); // jquery complete: ' , arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());

            callback && callback(null);
        }
    };


    this.submit = function(data, callback) {

        var suiteletUrl = getServerUrl();
        var options = {
            'action': 'submit'
        };

        $.extend(options, {'params': JSON.stringify(data)});

        jQuery.post(suiteletUrl, options, function (result) {
            console.log('submit(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    };
}


