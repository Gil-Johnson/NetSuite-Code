/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       11 Jun 2018     sergioarce
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function getHotMarketImages(request, response){

try {
	

		
		
		nlapiLogExecution('debug', 'SCA HotMarket By League');
		var internalid = request.getParameter('internalid');
		//Production
		var filters = new Array();
		filters.push(new nlobjSearchFilter('internalid', null, 'is', internalid));
		

		var itemSearch = nlapiSearchRecord('folder', '6016', filters);
		
		
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
					var colValue6 = result.getText(searchCols[2]);
					
					
				}
				
				
					searchArray[z].push({
					URL: colValue0,
					NAME: colValue1,
					FOLDER: colValue2,
					FOLDERNAME: colValue6,
					Date_Created: colValue3,
					Last_Modified: colValue4,
					Size: colValue5
					
					});
			}
		}
		
		var json = JSON.stringify(searchArray);
		nlapiLogExecution('debug', 'about to send JSON string');
      
      
		var callback = 'hotmarketByLeague'; // or you could pass this in as a param
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


