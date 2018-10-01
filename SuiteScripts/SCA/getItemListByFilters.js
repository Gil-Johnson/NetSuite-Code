/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       04 Jun 2018     sergioarce
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function getItemListByFilters(request, response){
try {
		
		nlapiLogExecution('debug', 'SCA Items By Team');
		
		
		var leaguesarray = request.getParameter("leagues");
		var teamsarray = request.getParameter("teams");
		var producttypearray = request.getParameter("producttypes");
		
		
		var filtersValues = {
				league: !!leaguesarray && leaguesarray != 'null'? JSON.parse("[" + leaguesarray + "]") : null,
                team: !!teamsarray && teamsarray != 'null' ? JSON.parse("[" + teamsarray + "]") : null ,
                prodType: !!producttypearray && producttypearray != 'null' ? JSON.parse("[" + producttypearray + "]") : null
            };

		//Production
		
		
		
		

		var filters = [];
		
		
		if(!!filtersValues.team)
			
			filters.push(new nlobjSearchFilter('custitem1', null, 'anyof', filtersValues.league));
		if(!!filtersValues.league)
        	filters.push(new nlobjSearchFilter('custitem2', null, 'anyof', filtersValues.team));
        if(!!filtersValues.prodType)
        	filters.push(new nlobjSearchFilter('custitem_prodtype', null, 'anyof', filtersValues.prodType));
        
		
        //nlapiSetRedirectURL('EXTERNAL', '#your redirecting suitelet URL', null, null, params);
        var itemSearch = nlapiSearchRecord('item', '5989', filters);
		
		if (itemSearch && itemSearch.length != 0) {
			var searchArray = new Array();
			var counter = 0;
			for (var z = 0; z < itemSearch.length; z ++) {
				searchArray[z] = new Array();
				var result = itemSearch[z];
				var searchCols = result.getAllColumns();
				
				var counter = counter+1;
				for (var i = 0; i < searchCols.length; i++){
					var colValue0 = result.getValue(searchCols[0]);
					var colValue1 = result.getValue(searchCols[1]);
					var colValue2 = result.getValue(searchCols[2]);
					var colValue3 = result.getValue(searchCols[3]);
					var colValue4 = result.getValue(searchCols[4]);
					var colValue5 = result.getValue(searchCols[5]);
					var colValue6 = result.getValue(searchCols[6]);
					var colValue7 = result.getValue(searchCols[7]);
					var colValue8 = result.getText(searchCols[8]);
					var colValue9 = result.getValue(searchCols[9]);
					var colValue10 = result.getText(searchCols[10]);
					var colValue11 = result.getValue(searchCols[11]);
					var colValue12 = result.getValue(searchCols[12]);
					
					var combination = colValue7+','+colValue11;
					
					if(colValue6 == ""){
						colValue6 = "http://images.ricoinc.com/webimages/NetSuiteSCA/NoImage_thumb.jpg";
					}
					
				}
				
				
					searchArray[z].push({
						"Internalid" : colValue0,
						"Image": "<img src=''"+colValue6+"'' width='250'>",
						//"Image": colValue6,
						"SKU" : colValue12,
	                     "Description" : colValue1,
	                     "UPC" : colValue2,
	                     "League": colValue8,
	                     "Team": colValue9,
	                     "Type": colValue10,
	                     "Discontinued" : colValue4,
	                     "Inactive": colValue5,
	                     "High_Res": colValue7,
	                     "Available" : colValue3,
	                     "Main_Img" : colValue11,
	                     "Thumb" : colValue6,
	                     "checkboxex": "<input type='checkbox' id='0719"+colValue0+"' style='display:;' class='imgurlsarray' onchange='selectCBclassTable(0719"+colValue0+")' value='"+colValue7+"' />"
	                     
	                     
	                     
	                     
					});
			}
		}
		
		var json = JSON.stringify(searchArray);
		nlapiLogExecution('debug', 'about to send JSON string');
      
      
		var callback = 'getResultsByFilters'; // or you could pass this in as a param
		//var result = getMyData();
     
        var strJson = callback+'(' + JSON.stringify(searchArray) + ');';
        response.setContentType('JAVASCRIPT');
		response.write(strJson);
	}
	catch (e) {
		logError(e);
	}
}

function logError(e){
	var errorMessage = '';
	
	if (e instanceof nlobjError){
		nlapiLogExecution('ERROR', e.getCode() , e.getDetails());
		errorMessage = e.getCode() + ': ' + e.getDetails();
	}
	else{
		nlapiLogExecution('ERROR',  'Unspecified', e.toString());
		errorMessage = e.toString();
	}
	
	return errorMessage;
}

