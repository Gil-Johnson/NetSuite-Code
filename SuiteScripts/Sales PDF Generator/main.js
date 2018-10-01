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
			CustomLeagueSearch: "customsearch4945",
			CustomProdTypeSearch: "customsearch4946"
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
		htmlDependencies += "<script type='text/javascript' src='https://system.netsuite.com/core/media/media.nl?id=3045289&c=3500213&h=9dc10c35c5a3adc1cca9&_xt=.js'></script>";
        /*xdr.js to create cors ajax call on IE*/
        htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=3045385&c=3500213&h=85eec99794a63a56bd4b&_xt=.js'></script>";
		
		/*external-script*/
		htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=3045288&c=3500213&h=db9fe807932e8ed4e163&_xt=.js'></script>";

		/* jquery.jtable.min.js */
		htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=3045285&c=3500213&h=93d0286cdb69c8c4d5e1&_xt=.js'></script>";
		//jquery.jtable.clientbinding.js
		htmlDependencies += "<script type='text/javascript' src='https://system.na3.netsuite.com/core/media/media.nl?id=3045291&c=3500213&h=4a45efd56a7fa75df057&_xt=.js'></script>";
				
		var indexPage = nlapiRequestURL('https://system.na3.netsuite.com/core/media/media.nl?id=3045287&c=3500213&h=a2b889a3d5b66f327e45&_xt=.html');
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
