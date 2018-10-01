/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Jul 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function getItemStatus(request, response){
	try {
		nlapiLogExecution('debug', 'Web App RCAD Suitelet');
		
		var cols = [];
		
        cols.push(new nlobjSearchColumn('name'));
        var filters = new Array();
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
		
		
		var itemSearch = nlapiSearchRecord('customlist_itemstatus', null, filters, cols);
		nlapiLogExecution('debug', itemSearch.length);
		var searchArray = [];
		
		
		if (itemSearch && itemSearch.length != 0) {
			for (var i = 0; i < itemSearch.length; i++){
					//var colValue = result.getValue(searchCols[i]);
					
					
					var searchresult = itemSearch[ i ];
					   var record = searchresult.getId( );
					 //  var rectype = searchresult.getRecordType( );
					   var name = searchresult.getValue( 'name' );
				  
					   searchArray.push({
							ID: record,
							NAME: name 
							});
				}
			}
		
		
		var json = JSON.stringify(searchArray);
		nlapiLogExecution('debug', 'about to send JSON string');
		response.write(json);
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