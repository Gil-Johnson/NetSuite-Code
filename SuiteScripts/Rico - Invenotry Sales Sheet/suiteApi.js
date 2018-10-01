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
		

    		
		outResponse["Result"] = Constants.Response.Result.Ok;
		outResponse["Version"] = Constants.Response.api_version;
		var method = request.getParameter("method");

		if(method == 'getTeamsByLeagueIds') {
			
			
			var leagueIds = JSON.parse(request.getParameter("leagueIds"));
			outResponse["teams"] = "[]";
			
			//Check if we have required params
			if(!!leagueIds && leagueIds.length > 0) {
				var teams = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.CustomTeamSearch, new nlobjSearchFilter(Constants.Netsuite.ItemField.League1, null, 'anyof', leagueIds), new nlobjSearchColumn(Constants.Netsuite.ItemField.Team1, null, 'group'));
				
				var teamRecords = [];
				if(!!teams) {
					teams.forEach(function(team) {
						teamRecords[teamRecords.length] = {
							value : team.getValue(Constants.Netsuite.ItemField.Team1, null, 'group'),
							name : team.getText(Constants.Netsuite.ItemField.Team1, null, 'group')
						};
					});
				}
				outResponse["teams"] = JSON.stringify(teamRecords);
			}
		}
        else if(method == 'searchTable') {
        	
        
        	var context = nlapiGetContext();
            var teams = request.getParameter("teams");
            var leagues = request.getParameter("leagues");
            var prodTypes = request.getParameter("producttypes");

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

    }
    catch(e) {
        outResponse["Result"] = Constants.Response.Result.Error;
        outResponse["Message"] = "Some error has occurred while loading records";
		//outResponse["Message"] = e.name + ", " + e.message;
	}
    if(method == 'getTeamsByLeagueIds') {
	response.write(JSON.stringify(outResponse));
    }else if(method == 'searchTable') {
    	nlapiLogExecution('DEBUG', 'test', 'testing' + method);
    	PrintInvoiceHTMLPDF();
    	
    }
    
    
}

function PrintInvoiceHTMLPDF(){
	
	
	var renderer = nlapiCreateTemplateRenderer();
	var templateFile = nlapiLoadFile(27);
	var templateString = templateFile.getValue();	
	renderer.setTemplate(templateString);
	//renderer.addRecord('record', salesOrder);
	var xml = renderer.renderToString();
	var file = nlapiXMLToPDF(xml);
	
	nlapiLogExecution('DEBUG', 'xml', xml);
	response.setContentType('PDF', 'test.pdf');
	response.write(file.getValue());

}


function escapeXML(str){
    // Fix issue with < and > not displaying properly in text fields
		if(str == null)
		    return '';
		str = str.replace(/&lt;/ig,'REPLACELT').replace(/&gt;/ig,'REPLACEGT');
		str = nlapiEscapeXML(str).replace(/REPLACELT/ig,'&lt;').replace(/REPLACEGT/ig,'&gt;');
		return str;
}

function addCommas(nStr){
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while(rgx.test(x1)){
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}





