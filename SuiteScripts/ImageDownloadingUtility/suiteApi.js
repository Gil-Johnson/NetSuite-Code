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
			WebImageDownloadUtility: "customsearch1261",
			CustomLeagueSearch: "customsearch1263",
			CustomTeamSearch: "customsearch1264"
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
		nlapiLogExecution('Debug','Testing','In suitelet');
		outResponse["Result"] = Constants.Response.Result.Ok;
		outResponse["Version"] = Constants.Response.api_version;
		var method = request.getParameter("method");
        nlapiLogExecution('Debug','Got Parameter','Method is '+method);

		if(method === 'getTeamsByLeagueIds') {
			var leagueIds = JSON.parse(request.getParameter("leagueIds"));
            //nlapiLogExecution('Debug','Got Parameter','leagueIds is '+leagueIds);
			outResponse["teams"] = "[]";
			
			//Check if we have required params
			if(!!leagueIds && leagueIds.length > 0) {
				var teams = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.CustomTeamSearch, new nlobjSearchFilter(Constants.Netsuite.ItemField.League1, null, 'anyof', leagueIds), new nlobjSearchColumn(Constants.Netsuite.ItemField.Team1, null, 'group'));
                //nlapiLogExecution('Debug','Got Search','teams is '+JSON.stringify(teams));
				var teamRecords = [];
				if(!!teams) {
                    nlapiLogExecution('Debug','in if','got data');
					teams.forEach(function(team) {
						teamRecords[teamRecords.length] = {
							value : team.getValue(Constants.Netsuite.ItemField.Team1, null, 'group'),
							name : team.getText(Constants.Netsuite.ItemField.Team1, null, 'group')
						};
					});
				}
				outResponse["teams"] = JSON.stringify(teamRecords);
				nlapiLogExecution('Debug','outResponse["teams"]',outResponse["teams"]);
			}
		}
        else if(method === 'searchTable') {
        	var context = nlapiGetContext();
            var teams = request.getParameter("teams");
            var leagues = request.getParameter("leagues");
            var prodTypes = request.getParameter("producttypes");
            nlapiLogExecution('Debug','Got Parameter','teams is '+teams+"leagues is "+leagues+"producttypes is "+prodTypes);
            var filtersValues = {
                team: !!teams && teams != 'null' ? JSON.parse("[" + teams + "]") : null ,
                league: !!leagues && leagues != 'null'? JSON.parse("[" + leagues + "]") : null,
                prodType: !!prodTypes && prodTypes != 'null' ? JSON.parse("[" + prodTypes + "]") : null
            };
            var filters = [];

            if(!!filtersValues.team)
                filters.push(new nlobjSearchFilter(Constants.Netsuite.ItemField.Team1, null, 'anyof', filtersValues.team));
            if(!!filtersValues.league)
                filters.push(new nlobjSearchFilter(Constants.Netsuite.ItemField.League1, null, 'anyof', filtersValues.league));
            if(!!filtersValues.prodType)
                filters.push(new nlobjSearchFilter(Constants.Netsuite.ItemField.ProductType, null, 'anyof', filtersValues.prodType));

            var savedSearch = [];
            var lastId = 0;
            var records = [];
            var internalIdFilterIndex = filters.length;
            do {
                lastRecord = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.WebImageDownloadUtility, filters);
                if(lastRecord != null){
                    lastId = lastRecord[lastRecord.length-1].getId();
                    savedSearch = savedSearch.concat(lastRecord);
                }
                filters[internalIdFilterIndex] = new nlobjSearchFilter('internalidnumber', null, 'greaterthan', lastId);
            }
            while(!!lastRecord && context.getRemainingUsage() > 1)

            if(!!savedSearch) {
                savedSearch.forEach(function(srchRecord) {
                    records.push({
                        "internalid" : srchRecord.getId(),
                        "itemnumber" : srchRecord.getValue('itemid'),
                        "description" : srchRecord.getValue('salesdescription'),
                        "upc" : srchRecord.getValue('upccode'),
                        "thumbnail" : srchRecord.getValue('custitemthumbnail_image'),
                        "discontinued": srchRecord.getValue('custitem_discontinued')
                    });
                });
            }

            //Sort array by itemnumber
            records.sort(function(a, b) {
                var obj1 = a.itemnumber.toUpperCase();
                var obj2 = b.itemnumber.toUpperCase();
                return (obj1 < obj2) ? -1 : (obj1 > obj2) ? 1 : 0;
            });

            outResponse["TotalRecordCount"] = !!savedSearch ? savedSearch.length : 0;
            outResponse["Records"] = records;
        }
        else if(method == 'searchById') {
            var ids = request.getParameter("searchIds");
            nlapiLogExecution('Debug','Got Parameter','searchIds is '+ids);

            var filtersValues = {
                ids: !!ids && ids != 'null' ? JSON.parse("[" + ids + "]") : null
            };
            var filters = [];

            if(!!filtersValues.ids)
                filters.push(new nlobjSearchFilter(Constants.Netsuite.ItemField.internalId, null, 'anyof', filtersValues.ids));

            var savedSearch = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.WebImageDownloadUtility, filters);
            
            var records = [];
            if(!!savedSearch) {
                for(var i=0; i < savedSearch.length; i++) {
                    var tempItem = {};
                    var cols = savedSearch[i].getAllColumns();
                    var line = [];
                    cols.forEach(function(c) {
                        
                        var key = c.getLabel() || c.getName();
                        key = key.split(' ').join(''); //Remove spaces
                        tempItem[key] = savedSearch[i].getText(c) || savedSearch[i].getValue(c); 
                    });

                    records.push(tempItem);
                }
            }
            outResponse["TotalRecordCount"] = !!savedSearch ? savedSearch.length : 0;
            outResponse["Records"] = records;
        }
    }
    catch(e) {
        outResponse["Result"] = Constants.Response.Result.Error;
        outResponse["Message"] = "Some error has occurred while loading records";
		//outResponse["Message"] = e.name + ", " + e.message;
	}
    nlapiLogExecution('Debug','Final result',JSON.stringify(outResponse));
    //response.setContentType(outResponse)
	response.write(JSON.stringify(outResponse));
    nlapiLogExecution('Debug','Final Response','Sent Response');


}
