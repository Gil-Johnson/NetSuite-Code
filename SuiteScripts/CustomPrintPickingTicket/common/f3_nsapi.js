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
 * NS class that has the functionality of
 */


var ApiHelpers = function() {

    function convertArray(recs){
        var arr = [];
        if (recs && recs.length > 0) {

            // loop on all items and conver to json
            for (var x = 0; x < recs.length; x++) {
                arr.push(x.fields);
            }
        }
        return arr;
    }

    function convertSearchArray(recs){
        var arr = [];
        if (recs && recs.length > 0) {

            // fetch columns once only
            var cols = recs[0].getAllColumns();

            // loop on all items and conver to json
            for (var x = 0; x < recs.length; x++) {
                arr.push(convertSingleSearchObject (recs[x]));
            }
        }
        return arr;
    }

    function convertSingleSearchObject (row, cols) {
        var obj = null;
        if (row) {
            cols = typeof(cols) === 'undefined' ? row.getAllColumns() : cols;

            // fill basic fields
            obj = {
                _id: row.getId(),
                _type: row.getRecordType()
            };

            // loop on all columns and convert to json
            var nm = null, item = null;
            for (var x = 0; !!cols && x < cols.length; x++) {
                item = cols[x];
                nm = item.getLabel() || item.getName();
                obj[nm] = row.getValue(item);
            }
        }
        return obj;
    }

    return {
        /**
         * Convert either array of records or a single record passed in first parameter to JSON format
         * @param recs
         * @returns {Array} array of serialized object in json format
         */
        toJSON: function (recs, dataType) {
            if ( dataType === 'search') {
                if (_.isArray(recs) == true) {
                    return convertSearchArray(recs);
                }
                else {
                    return convertSingleSearchObject (recs);
                }
            }
            else {
                return convertArray(recs);
            }
        }
    }
};


var SearchApi = function() {
    return {
        type: null,
        createSearch: function (filters, columns) {
            console.log('createSearch', this.type, arguments);
        },
        loadSearch: function (id) {
            console.log('loadSearch', this.type,arguments);
        },
        lookupField: function (id, fields, text) {
            console.log('lookupField', this.type,arguments);
        },
        search: function (id, filters, columns) {
            console.log('search', this.type,arguments);
        }
    };
};

var NSApi = Fiber.extend(function () {
    return {

        type: null,

        /**
         * Init method
         */
        init: function () {

        },


        /**
         * Gets All records based on the filter you pass in
         * @param filters
         * @returns {Array}
         */
        get: function (type, filters, columns) {
            console.log('get', this.type,arguments);
        }
    };
});


Fiber.mixin(NSApi, SearchApi);



var SalesOrders = NSApi.extend(function(base){
    return {
        init: function() {
            base.type = 'salesorder';
        }
    }
});