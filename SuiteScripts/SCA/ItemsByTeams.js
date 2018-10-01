/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       02 May 2018     sergioarce
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function itemsbyteams(request, response){
	
	try {
		
		nlapiLogExecution('debug', 'SCA Items By Team');
		var team = request.getParameter('custitem2');
		//Production
		
		var filters = new Array();
		filters.push(new nlobjSearchFilter('custitem2', null, 'is', team));
		
		var itemSearch = nlapiSearchRecord('item', '5882', filters);
		
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
					var colValue4 = result.getText(searchCols[3]);
					
				}
				
				
					searchArray[z].push({
					NAME: colValue0,
					DESCRIPTION: colValue1,
					URL: colValue2,
					TEAMID: colValue3,
					TEAM: colValue4
					});
			}
		}
		
		var json = JSON.stringify(searchArray);
		nlapiLogExecution('debug', 'about to send JSON string');
      
      
		var callback = 'itemByTeam'; // or you could pass this in as a param
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

