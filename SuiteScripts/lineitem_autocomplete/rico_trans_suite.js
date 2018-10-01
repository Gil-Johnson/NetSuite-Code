/**
 * Created by smehmood on 2/10/2016.
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
 * RicoTransSuite class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var RicoTransSuite = (function () {
    return {
        /**
         * main method
         */
        main: function (request, response) {
            if (request.getMethod() === 'GET') {

                var searchText = request.getParameter('searchtext');
                nlapiLogExecution('debug', 'searchtext', searchText);
                var available;
                var isDiscontinued;
                var cols = [];
                var autoCompleteLabel;
                var itmNameIndex = cols.push(new nlobjSearchColumn('itemid'));
                cols.push(new nlobjSearchColumn('custitem_discontinued'));
                cols.push(new nlobjSearchColumn('custitem_custom'));
                cols.push(new nlobjSearchColumn('salesdescription'));
                cols.push(new nlobjSearchColumn('custitem_discontinued'));
                cols.push(new nlobjSearchColumn('quantityavailable'));
                cols.push(new nlobjSearchColumn('custitem_nextrcptdate'));
                cols.push(new nlobjSearchColumn('quantityavailable', 'CUSTITEM_SUBCOMPONENTOF'));
                var teamIndex = cols.push(new nlobjSearchColumn('formulatext').setFormula("CASE{custitem1}WHEN 'NFL' THEN 'A'WHEN 'MLB' THEN 'B'WHEN 'College' THEN 'C'WHEN 'NBA' THEN 'D'WHEN 'NHL' THEN 'E'ELSE 'Z' END"));
                cols.push(new nlobjSearchColumn('custitem2'));
                cols.push(new nlobjSearchColumn('custitem1'));

                //var srch = nlapiSearchRecord('item', '3298', [new nlobjSearchFilter('itemid', null, 'startswith', searchText)], cols);

                //Loading the search instead of creating it to preserve the sort order.
                var search = nlapiLoadSearch('item','3298');
                search.addFilter(new nlobjSearchFilter('itemid', null, 'startswith', searchText));
                var srch = search.runSearch().getResults(0,1000);

                var data = [];

                if (!!srch && srch.length > 0) {
                    //for (var i = srch.length -1; i >=0; i--) {
                    for (var i = 0; i < srch.length; i++) {
                        /*available = !!srch[i].getValue('quantityavailable') ? parseFloat(srch[i].getValue('quantityavailable')) : 0;
                        available = available + (!!srch[i].getValue('quantityavailable', 'CUSTITEM_SUBCOMPONENTOF') ? parseFloat(srch[i].getValue('quantityavailable', 'CUSTITEM_SUBCOMPONENTOF')) : 0);*/
                        available = srch[i].getValue('formulanumeric');
                        isDiscontinued = srch[i].getValue('custitem_discontinued');
                        autoCompleteLabel = srch[i].getValue('itemid') + '_' + srch[i].getValue('salesdescription') + '-' + available + '-' + srch[i].getValue('custitem_custom') + '-' + srch[i].getValue('custitem_discontinued');

                        data.push({
                            "value": srch[i].getId(),
                            "label": autoCompleteLabel,
                            "dataObject": {
                                "itemid": srch[i].getValue('itemid'),
                                "desc": srch[i].getValue('salesdescription'),
                                "available": available,
                                "isDiscontinued": isDiscontinued,
                                "custitem_custom": srch[i].getValue('custitem_custom'),
                                "nextReceiptDate": srch[i].getValue('custitem_nextrcptdate')
                            }
                        });
                    }
                }

                var json = JSON.stringify(data);
                var callback = request.getParameter('callback');

                if (!!callback) {
                    json = callback + '(' + json + ')';
                }
                response.write(json);
            }
        }
    };
})();

/**
 * This is the main entry point for RicoTransSuite suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function RicoTransSuiteSuiteletMain(request, response) {
    return RicoTransSuite.main(request, response);
}
