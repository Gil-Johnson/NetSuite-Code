/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Feb 2014     hakhtar
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */


var Constants = {
	Netsuite: {
		SavedSearch: {
			CustomLeagueSearch: "customsearch1263",
			CustomProdTypeSearch: "customsearch1262"
		},
		ItemField: {
			League1: "custitem1",
			ProductType: "custitem_prodtype"
		}
	}
};


function main(request, response){
	try {
			
		//multiselect.css is pasted directly on code
		var htmlDependencies = "<link rel='stylesheet' type='text/css' href='https://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/blitzer/jquery-ui.css' />";
		htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js'></script>";
		htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js'></script>";
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=251023&c=3500213&h=8635201cdea44c761771&_xt=.js'></script>";
        /*xdr.js to create cors ajax call on IE*/
        htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=265187&c=3500213&h=b440904bfd82bf83e37a&_xt=.js'></script>";
		
		/*external-script*/
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=2592684&c=3500213&h=f28a6ba7714b4d9ea27a&_xt=.js'></script>";

		/* jquery.jtable.min.js */
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=251020&c=3500213&h=9e524a6e7e21359c400f&_xt=.js'></script>";
		//jquery.jtable.clientbinding.js
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=253198&c=3500213&h=dfa297e9a0365119e0e5&_xt=.js'></script>";
				
		var indexPage = nlapiRequestURL('https://system.netsuite.com/core/media/media.nl?id=2592683&c=3500213&h=4697ec03e3faad60d7f6&_xt=.html');
		var indexPageValue = indexPage.getBody();
			 
		var leagues = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.CustomLeagueSearch);
		var leaguesSelectHtml = addMultiselectDropdown('Leagues', 'league', leagues, Constants.Netsuite.ItemField.League1);
			
		var teamSelectHtml = addMultiselectDropdown('Teams', 'team', null);
		
		var prodTypes = nlapiSearchRecord(null, Constants.Netsuite.SavedSearch.CustomProdTypeSearch);
		var prodTypeHtml = addMultiselectDropdown('Product Type', 'prod-type', prodTypes, Constants.Netsuite.ItemField.ProductType);
			
		indexPageValue = indexPageValue.replace('#LEAGUES#', leaguesSelectHtml)
								   .replace('#TEAMS#', teamSelectHtml)
								   .replace('#PROD_TYPE#', prodTypeHtml);
		
		response.write(htmlDependencies + indexPageValue);
	}
	catch(e) {
		//Show error for now
		response.write("Error: " + e.name + ", " + e.message);
	}
}


function addMultiselectDropdown(label, id, searchResults, fieldNameToGet) {
	var html = "<select data-value='multiselect' multiple='multiple' id='" + id + "' name='" + id + "' size='5'>";
	if(!!searchResults) {
		searchResults.forEach(function(searchResult) {
			if(!!fieldNameToGet)
				html += ("<option value='" + searchResult.getValue(fieldNameToGet, null, 'group') + "'>" + searchResult.getText(fieldNameToGet, null, 'group') +"</option>");
			else
				html += ("<option value='" + searchResult.getId() + "'>" + searchResult.getValue('name') +"</option>");
		});
	}
	else {
		//Do nothing
	}
	html += "</select>";
	return html;
}
