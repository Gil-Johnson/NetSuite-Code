/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Mar 2014     hakhtar
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
			CustomLeagueSearch: "customsearch1350",
			CustomProdTypeSearch: "customsearch1349"
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
		//
		var htmlDependencies = "<link rel='stylesheet' type='text/css' href='https://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/blitzer/jquery-ui.css' />";
		htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js'></script>";
		htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js'></script>";
		
		/*jquery.multiselect.min.js*/
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=269285&c=3500213&h=b8f68314c66168c28ae9&_xt=.js'></script>";
		
		/*external-script*/
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=269284&c=3500213&h=ba7ce6ecc90dc8e4e968&_xt=.js'></script>";

		/* jquery.jtable.min.js */
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=269281&c=3500213&h=daca7bcc19ef86c5f65c&_xt=.js'></script>";
		//jquery.jtable.clientbinding.js
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=269287&c=3500213&h=bee74c22813222693624&_xt=.js'></script>";
				
		var indexPage = nlapiRequestURL('https://system.netsuite.com/core/media/media.nl?id=269283&c=3500213&h=56e9c10c80cfd4899e9a&_xt=.html');
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

