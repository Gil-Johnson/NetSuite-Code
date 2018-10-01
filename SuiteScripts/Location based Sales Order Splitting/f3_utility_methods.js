/**
 * Created by zahmed on 09-Jun-15.
 */

/**
 * Created by zahmed
 *
 * Class Name: Utility
 * -
 * Description:
 * - This class contains commonly used methods
 * -
 * Referenced By:
 * - Almost every script
 * -
 * Dependencies:
 * - None
 */
Utility = (function () {
    return {
        // this flag is used to disabled the log debug
        supressLogDebug: false,

        // Important: This is the method of other developer
        /**
         * Convert number to float
         *
         * @param {number,string,int} [num] string/integer/float number
         * @restriction returns 0 if num parameter is invalid
         * @return {float} floating number
         */
        parseFloatNum: function (num) {
            var no = parseFloat(num);
            if (isNaN(no)) {
                no = 0;
            }
            return no;
        },

        /**
         * This function returns the current date object along with time after converting it to the specified timezone/offset
         *
         * @param {number} offset number e.g. for pakistan +5
         * @return {date} returns date
         *
         * Note: There is no time difference between Coordinated Universal Time (UTC) and Greenwich Mean Time (GMT)
         */
        getDateUTC: function (offset) {
            var today = new Date();
            var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
            offset = parseInt(this.parseFloatNum(offset * 60 * 60 * 1000));
            today = new Date(utc + offset);
            return today;
        },

        /**
         * This function prints error logs in NetSuite server script or in browser console.
         *
         * @param {string} fn function name
         * @param {nlobjError|Error|string}  e NetSuite or JavaScript error object
         * @return {void}
         */
        logException: function (fn, e) {
            var err = '';
            if (e instanceof nlobjError) {
                err = 'System error: ' + e.getCode() + '\n' + e.getDetails();
            } else {
                err = 'Unexpected error: ' + e.toString();
            }
            if (!!window.console) {
                console.log('ERROR :: ' + fn + ' :: ' + err);
            } else {
                nlapiLogExecution('ERROR', fn, err);
            }
        },

        /**
         * This function prints debug logs in NetSuite server script or in browser console.
         * If b_logDebug is true then logs would be supressed
         *
         * @param {string} title
         * @param {string}  description
         * @return {void}
         *
         */
        logDebug: function (title, description) {
            if (this.supressLogDebug) {
                // supress debug
                return;
            }
            if (!!window.console) {
                console.log('DEBUG :: ' + title + ' :: ' + description);
            } else {
                nlapiLogExecution('DEBUG', title, description);
            }
        },

        // Important: This is the method of other developer
        isBlankOrNull: function (str) {
            return str == null || str == undefined || typeof(str) == 'undefined' || str == 'undefined' || (str + '').trim().length == 0;
        },

        /**
         * This function converts the number into the specified length by adding zeroes as prefix if needed
         * @param {number} num
         * @param {number} length
         * @returns {string}
         */
        leftPadNumber: function (num, length) {
            var str = '';
            if (!isNaN(num)) {
                num = parseInt(num);
                if (num >= 0) {
                    // conver number into string by making object
                    // because it crahses some places
                    var numArr = new String(num);
                    if (numArr.length < length) {
                        var diff = length - numArr.length;
                        for (var i = 0; i < diff; i++) {
                            str += '0';
                        }
                    }
                    str += num;
                }
            }
            return str;
        },

        // Important: This is the method of other developer
        addslashes: function (str) {
            return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        },

        // Important: This is the method of other developer
        /**
         * Calculate the size of object
         * @param {object} obj
         * @return {number} Returns the count of attributes of object at first level
         */
        objectSize: function (obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
        },

        // Important: This is the method of other developer
        /**
         * Get Empty string for null
         * @param data
         * @return {data, ''}
         */
        getBlankForNull: function (data) {
            var returnValue;
            if (this.isBlankOrNull(data)) {
                returnValue = '';
            } else {
                returnValue = data;
            }
            return returnValue;
        },

        /**
         * Check if NetSuite Account Type is One World
         * @return {boolean}
         */
        isOneWorldAccount: function () {
            return nlapiGetContext().getFeature('SUBSIDIARIES');
        },

        /**
         * Check if MultiLocation is enabled
         * @return {boolean}
         */
        isMultiLocInvt: function () {
            return nlapiGetContext().getFeature('MULTILOCINVT');
        },

        /**
         * Get account currencies
         * @returns {Object[]}
         */
        getAccountCurrencies: function () {
            var fils = [];
            var cols = [];
            var result;
            var currencyArr = [];

            // added filter for fetch only active currencies
            fils.push(new nlobjSearchFilter('isinactive', null, 'is', 'F', null));
            // columns sorted by name
            cols.push((new nlobjSearchColumn('name', null, null)).setSort(false));
            cols.push(new nlobjSearchColumn('symbol', null, null));
            try {
                result = nlapiSearchRecord('currency', null, fils, cols);
                if (!!result && result.length > 0) {
                    // make a JSON array for account currencies
                    result.forEach(function (currency) {
                        var obj = {};
                        obj.id = currency.getId();
                        obj.name = currency.getValue('name', null, null);
                        obj.symbol = currency.getValue('symbol', null, null);
                        currencyArr.push(obj);
                    });
                }

            } catch (ex) {
                this.logException('Utility.getAccountCurrencies', ex);
            }

            return currencyArr;
        },

        /**
         * remove double quotes from string's start and end
         * @param str
         * @return {string}
         */
        removeDoubleQuotes: function (str) {
            if (!this.isBlankOrNull(str)) {
                str = str.indexOf('"') === 0 && str.lastIndexOf('"') === str.length - 1 ? str.substr(1, str.length - 2) : str;
            }

            return str;
        },

        /**
         * It is a NetSuite Search APIs limitation that it will return only first 1000 record on searching
         * It is a customized method which returns more than 1000 recods according to the passing paramters
         * @param {string} recordType
         * @param {string|null} savedSearchId
         * @param {nlobjSearchFilter|nlobjSearchFilter[]|null} filters
         * @param {nlobjSearchColumn|nlobjSearchColumn[]|null} columns
         * @param {number|null} pages If pages is null then return all the records
         * @return {nlobjSearchResult[]|[]}
         */
        searchRecord: function (recordType, savedSearchId, filters, columns, pages) {
            var result = [];

            // check if pages is not null and a valid number
            if (pages !== null) {
                // if pages is not a number then set it to 1
                pages = !isNaN(pages) ? parseInt(pages) : 1;
            }
            var savedSearch;
            try {
                // load existing search if id exist
                if (!this.isBlankOrNull(savedSearchId)) {
                    savedSearch = nlapiLoadSearch(null, savedSearchId, filters, columns);
                } else {
                    // create search on the fly
                    savedSearch = nlapiCreateSearch(recordType, filters, columns);
                }
                //  get nlobjSearchResultSet for getting the sliced search results
                var runSearch = savedSearch.runSearch();
                var start = 0,
                    end = 1000;
                var page = 1;
                // it returns max 1000 records indexed from 0 to 999 or null if not found
                var chunk = runSearch.getResults(start, end);

                // check if rows exist or nor
                if (chunk !== null) {
                    // concatenating chunks of result
                    result = result.concat(chunk);
                    // if initial chunk size is 1000 it means that more record might be exist
                    // check pages if it is null then it return true or if pages exist iterates the loop accordingly
                    while (chunk.length === 1000 && (!!pages ? page < pages : true)) {
                        start += 1000;
                        end += 1000;
                        // getting another chunk
                        chunk = runSearch.getResults(start, end);
                        if (chunk !== null) {
                            result = result.concat(chunk);
                        }
                        // increment the page if pages exist
                        page = !!pages ? ++page : null;
                    }
                }
            } catch (e) {
                this.logException('Utility.searchRecord', e);
                this.throwError(e.getCode(), e.getDetails(), true);
            }

            return result;
        },

        /**
         * This function enabled or disabled the button in client script in NetSuite
         * When adding button on the form NetSuite adds two button one is the start of the form
         * and in the end of the form and ids of both the buttons are diffrent
         * @param {String} buttonId
         * @param {Boolean} isDisabled
         */
        disabledButton: function (buttonId, isDisabled) {
            // this methods enable/disbale the button/field which shows on the top of the form
            nlapiDisableField(buttonId, isDisabled);

            // nlapiDisableField only disbaled/enabled the button which shows on the top of the form
            // For the button which shows in the end of the form we disbaled/enabled the form by manipulating html

            // NetSuite suffix the secondary string in second button id so it is a extra handling
            var bottomReserveSerialNumBtn = document.getElementById('secondary' + buttonId);
            var classDisBtn = document.getElementById(buttonId).parentElement.parentElement.className;
            bottomReserveSerialNumBtn.disabled = isDisabled;
            bottomReserveSerialNumBtn.parentElement.parentElement.className = classDisBtn;
        },
        /**
         * Remove array element by value
         * e.g. var ary = ['three', 'seven', 'eleven']; removeA(ary, 'seven');
         * @param arr
         * @return {*}
         */
        removeArrayElementByValue: function (arr) {
            var what, a = arguments, L = a.length, ax;
            while (L > 1 && arr.length) {
                what = a[--L];
                while ((ax = arr.indexOf(what)) !== -1) {
                    arr.splice(ax, 1);
                }
            }
            return arr;
        },
        /**
         * Throw exception using NetSuite API
         * @param {string} code
         * @param {string} details
         * @param {boolean} supressEmail
         */
        throwError: function (code, details, supressEmail) {
            var err = nlapiCreateError(code, details, supressEmail);
            throw err;
        }
    };
})();