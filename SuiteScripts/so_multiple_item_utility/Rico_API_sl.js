/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 Feb 2014     hakhtar
 *
 */

var Constants = {
    Netsuite: {
        SavedSearch: {
            //WebImageDownloadUtility: "customsearch368",
            //CustomLeagueSearch: "customsearch355",
            //CustomTeamSearch: "customsearch359"
            WebImageDownloadUtility: "customsearch_itemsthatcanbeonsalesorde_9",
            CustomLeagueSearch: "customsearch_itemsthatcanbeonsalesorde_7",
            CustomTeamSearch: "customsearch_itemsthatcanbeonsalesorde_6"
        },
        ItemField: {
            League1: "custitem1",
            Team1: "custitem2",
            ProductType: "custitem_prodtype",
            internalId: "internalid"
        }
    },
    Response: {
        api_version: "1.04",
        Result: {
            Ok: "OK",
            Error: "ERROR"
        }
    }
};


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suite_api(request, response) {
    var outResponse = {};
    try {

        outResponse["Result"] = Constants.Response.Result.Ok;
        outResponse["Version"] = Constants.Response.api_version;
        var method = request.getParameter("method");

        if (method == 'getTeamsByLeagueIds') {

            var leagueIds = JSON.parse(request.getParameter("leagueIds"));

            outResponse["teams"] = "[]";

            //Check if we have required params
            if (!!leagueIds && leagueIds.length > 0) {
                var search = nlapiLoadSearch(null, Constants.Netsuite.SavedSearch.CustomTeamSearch);
                var expr = JSON.parse(JSON.stringify(search.getFilterExpression()));

                expr.forEach(function(r) {
                    if(typeof r == "object" && r.length == 2 && r[1] == "isempty") {
                        r.push("");
                    }
                    else if(typeof r == "object") {
                        r.forEach(function(rr) {
                            if(typeof rr == "object" && rr.length == 2 && rr[1] == "isempty") {
                                rr.push("");
                            }
                        });
                    }
                });

                search.setFilterExpression([expr, "AND", [Constants.Netsuite.ItemField.League1, 'anyof', leagueIds]]);

                var allSearchResults = search.runSearch();

                var context = nlapiGetContext();
                var lastId = 0, teams = [];
                do {
                    lastRecord = allSearchResults.getResults(lastId, lastId + 1000);
                    if (!!lastRecord && lastRecord.length > 0) {
                        lastId += 1000;
                        teams = teams.concat(lastRecord);
                    }
                }
                while (!!lastRecord && lastRecord.length > 0 && context.getRemainingUsage() > 1)

                var teamRecords = [];
                if (!!teams) {
                    teams.forEach(function (team) {
                        teamRecords[teamRecords.length] = {
                            value: team.getValue(Constants.Netsuite.ItemField.Team1, null, 'group'),
                            name: team.getText(Constants.Netsuite.ItemField.Team1, null, 'group')
                        };
                    });
                }
                outResponse["teams"] = JSON.stringify(teamRecords);
            }
        }
        else if (method == 'searchTable') {
            var context = nlapiGetContext();
            var teams = request.getParameter("teams");
            var leagues = request.getParameter("leagues");
            var prodTypes = request.getParameter("producttypes");
            var itemName = request.getParameter("itemName");

            var filtersValues = {
                team: !!teams && teams != 'null' ? JSON.parse("[" + teams + "]") : null,
                league: !!leagues && leagues != 'null' ? JSON.parse("[" + leagues + "]") : null,
                prodType: !!prodTypes && prodTypes != 'null' ? JSON.parse("[" + prodTypes + "]") : null,
                itemName: !!itemName && itemName != 'null' ? itemName : null
            };


            var savedSearch = [];
            var lastId = 0;
            var records = [];

            var search = nlapiLoadSearch(null, Constants.Netsuite.SavedSearch.WebImageDownloadUtility);
            var expr = JSON.parse(JSON.stringify(search.getFilterExpression()));

            expr.forEach(function(r) {
                if(typeof r == "object" && r.length == 2 && r[1] == "isempty") {
                    r.push("");
                }
                else if(typeof r == "object") {
                    r.forEach(function(rr) {
                        if(typeof rr == "object" && rr.length == 2 && rr[1] == "isempty") {
                            rr.push("");
                        }
                    });
                }
            });

            var filters = [];
            if (!!filtersValues.team) {
                filters.push([Constants.Netsuite.ItemField.Team1, 'anyof', filtersValues.team]);
            }
            if (!!filtersValues.league) {
                if(filters.length != 0)
                    filters.push("AND");
                filters.push([Constants.Netsuite.ItemField.League1, 'anyof', filtersValues.league]);
            }
            if (!!filtersValues.prodType) {
                if(filters.length != 0)
                    filters.push("AND");
                filters.push([Constants.Netsuite.ItemField.ProductType, 'anyof', filtersValues.prodType]);
            }
            if (!!filtersValues.itemName) {
                if(filters.length != 0)
                    filters.push("AND");
                filters.push(["itemid", 'startswith', filtersValues.itemName]);
            }


            if(!!filters && filters.length > 0) {
                expr = [expr, "AND", filters];
            }

            search.setFilterExpression(expr);

            var allSearchResults = search.runSearch();


            var lastId = 0;
            do {
                lastRecord = allSearchResults.getResults(lastId, lastId + 1000);
                if (!!lastRecord && lastRecord.length > 0) {
                    lastId += 1000;
                    savedSearch = savedSearch.concat(lastRecord);
                }
            }
            while (!!lastRecord && lastRecord.length > 0 && context.getRemainingUsage() > 1)

            if (!!savedSearch) {
                savedSearch.forEach(function (srchRecord) {
                    records.push({
                        "internalid": srchRecord.getId(),
                        "itemnumber": srchRecord.getValue('itemid'),
                        "description": srchRecord.getValue('salesdescription'),
                        "upc": srchRecord.getValue('upccode'),
                        "available": srchRecord.getValue('quantityavailable'),
                        "league": srchRecord.getValue('name'),
                        "team": srchRecord.getValue('custitem2'),
                        "mainimage": srchRecord.getValue('custitem_highresimage'),
                        "thumbnail": srchRecord.getValue('custitemthumbnail_image')
                    });
                });
            }

            //Sort array by itemnumber
            records.sort(function (a, b) {
                var obj1 = a.itemnumber.toUpperCase();
                var obj2 = b.itemnumber.toUpperCase();
                return (obj1 < obj2) ? -1 : (obj1 > obj2) ? 1 : 0;
            });

            outResponse["TotalRecordCount"] = !!savedSearch ? savedSearch.length : 0;
            outResponse["Records"] = records;
        }
    }
    catch (e) {
        nlapiLogExecution("ERROR", e.name, e.message);
        outResponse["Result"] = Constants.Response.Result.Error;
        outResponse["Message"] = "Some error has occurred while loading records";
        //outResponse["Message"] = e.name + ", " + e.message;
    }

    response.write(JSON.stringify(outResponse));
}

