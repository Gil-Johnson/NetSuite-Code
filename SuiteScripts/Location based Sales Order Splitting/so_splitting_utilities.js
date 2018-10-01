/**
 * Created by wahajahmed on 5/22/2015.
 */

var StringUtil = (function () {
    return {
        trim: function (str) {
            return str.replace(/^\s+|\s+$/g, '');
        },
        ltrim: function (str) {
            return str.replace(/^\s+/, '');
        },
        rtrim: function (str) {
            return str.replace(/\s+$/, '');
        },
        isEmpty: function (str) {
            return str == null || typeof(str) == 'undefined' || str.length == 0;
        },
        isEmptyIgnoreSpace: function(str) {
            return this.isEmpty(str) || (str != null && this.trim(str) == '');
        },
        escapeJson: function (str) {
            //str = str.repace(/\'/g, '\'');
        }
    };
})();

/**
 * FCLogger class that has the functionality of logging throughout the system.
 */
var FCLogger = (function () {
    return {
        /**
         * info
         */
        log: function (type, shortInfo, longInfo) {
            if (!!FCLogger.log) {
                nlapiLogExecution(type, shortInfo, longInfo);
            }
        },
        /**
         * debug
         */
        debug: function (shortInfo, longInfo) {
            if (!!FCLogger.log) {
                nlapiLogExecution('DEBUG', shortInfo, longInfo);
            }
        },
        /**
         * error
         */
        error: function (shortInfo, longInfo) {
            if (!!FCLogger.log) {
                nlapiLogExecution('ERROR', shortInfo, longInfo);
            }
        }
    };
})();
