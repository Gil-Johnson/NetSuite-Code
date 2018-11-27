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
 * FoldersDAL class that has the functionality
 * of fetching files and folders information
 */
var FoldersDAL = function () {

    var baseTypeDAL = new F3.Storage.BaseTypeDAL();

    return {

        /**
         * getMedia method
         */
        getMedia: function (fileIds) {

            var result = [];
            var records = null;
            var filters = [];
            var cols = [];

            filters.push(new nlobjSearchFilter('internalid', 'file', 'anyof', fileIds));

            cols.push(new nlobjSearchColumn('name', 'file'));
            cols.push(new nlobjSearchColumn('url', 'file'));
            cols.push(new nlobjSearchColumn('filetype', 'file'));

            // load data from db
            records = nlapiSearchRecord('folder', null, filters, cols);

            // serialize data
            var jsonConverterTimer = F3.Util.StopWatch.start('Convert objects to json manually.');
            var result = baseTypeDAL.getObjects(records);
            jsonConverterTimer.stop();

            return result;
        }
    };
};
