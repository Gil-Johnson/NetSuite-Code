/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 May 2018     sergioarce
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function teambyleague(request, response){
	try {
		
		nlapiLogExecution('debug', 'SCA Items By Team');
		var league1 = request.getParameter('custitem1_1');
		var league2 = request.getParameter('custitem1_2');
		var league3 = request.getParameter('custitem1_3');
		var league4 = request.getParameter('custitem1_4');
		var league5 = request.getParameter('custitem1_5');
		
		var leagues = [league1, league2, league3, league4, league5];

		//Production
		
		var filters = new Array();
		

        //nlapiSetRedirectURL('EXTERNAL', '#your redirecting suitelet URL', null, null, params);

		filters.push(new nlobjSearchFilter('custitem1', null, 'is', leagues));
		
		var itemSearch = nlapiSearchRecord('item', '5977', filters);
		
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
					var colValue2 = result.getText(searchCols[2]);
				}
				
				
					searchArray[z].push({
					Team1: colValue0,
					FullDESCRIPTION: colValue1,
					League: colValue2
					});
			}
		}
		
		var json = JSON.stringify(searchArray);
		nlapiLogExecution('debug', 'about to send JSON string');
      
      
		var callback = 'teamByLeague'; // or you could pass this in as a param
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

