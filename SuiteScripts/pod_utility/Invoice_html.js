/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       09 Apr 2014     ubaig
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
            CustomLeagueSearch: "customsearch355",
            CustomProdTypeSearch: "customsearch358"
        },
        ItemField: {
            League1: "custitem1",
            ProductType: "custitem_prodtype"
        }
    }
};


function main(request, response) {
    try {

        //multiselect.css is pasted directly on code
        //
        var htmlDependencies = "<link rel='stylesheet' type='text/css' href='https://ajax.googleapis.com/ajax/libs/jqueryui/1/themes/blitzer/jquery-ui.css' />";
        htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.js'></script>";
        htmlDependencies += "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js'></script>";
        htmlDependencies += "<script type='text/javascript' src='https://system.sandbox.netsuite.com/core/media/media.nl?id=2847&c=3500213&h=d432e9ed661c251c9011&_xt=.js'></script>";
        htmlDependencies += "<script type='text/javascript' src='https://system.sandbox.netsuite.com/core/media/media.nl?id=4356&c=3500213&h=804dec7a6abcb0a7a6ea&_xt=.js'></script>";

        /*external-script*/
        htmlDependencies += "<script type='text/javascript' src='https://system.sandbox.netsuite.com/core/media/media.nl?id=3055&c=3500213&h=5529a1069f191d64413c&_xt=.js'></script>";

        /* jquery.jtable.min.js */
        htmlDependencies += "<script type='text/javascript' src='https://system.sandbox.netsuite.com/core/media/media.nl?id=3356&c=3500213&h=903a9c17861c0b0550cf&_xt=.js'></script>";

        //jquery.jtable.clientbinding.js
        htmlDependencies += "<script type='text/javascript' src='https://system.sandbox.netsuite.com/core/media/media.nl?id=3656&c=3500213&h=bc2eddfb6bb68846da6a&_xt=.js'></script>";

        var indexPage = nlapiRequestURL('https://system.sandbox.netsuite.com/core/media/media.nl?id=3255&c=3500213&h=7d9d2bbc10fb04085ad2&_xt=.html');
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
    catch (e) {
        //Show error for now
        response.write("Error: " + e.name + ", " + e.message);
    }
}


function addMultiselectDropdown(label, id, searchResults, fieldNameToGet) {
    var html = "<select data-value='multiselect' multiple='multiple' id='" + id + "' name='" + id + "' size='5'>";
    if (!!searchResults) {
        searchResults.forEach(function (searchResult) {
            if (!!fieldNameToGet)
                html += ("<option value='" + searchResult.getValue(fieldNameToGet, null, 'group') + "'>" + searchResult.getText(fieldNameToGet, null, 'group') + "</option>");
            else
                html += ("<option value='" + searchResult.getId() + "'>" + searchResult.getValue('name') + "</option>");
        });
    }
    else {
        //Do nothing
    }
    html += "</select>";
    return html;
}

