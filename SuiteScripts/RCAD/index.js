/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       30 May 2017     AndrewH
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function indexF(request, response){
	try {
		nlapiLogExecution('debug', 'Web App Testing Suitelet');
		var userid = request.getParameter('userid');
		var searchid = request.getParameter('searchid');
		
		var filters = new Array();
		filters.push(new nlobjSearchFilter('custitem_actreqby', null, 'is', userid));
		
		//Sandbox 
		//var itemSearch = nlapiSearchRecord('item', '5034', filters);

		//Production
		var itemSearch = nlapiSearchRecord('item', '5090', filters);
		
		if (itemSearch && itemSearch.length != 0) {
			var searchArray = new Array();
			var counter = 0;
			for (var z = 0; z < itemSearch.length; z ++) {
				searchArray[z] = new Array();
				var result = itemSearch[z];
				var searchCols = result.getAllColumns();
				
				var counter = counter+1;
				for (var i = 0; i < searchCols.length; i++){
					var colValue = result.getValue(searchCols[i]);
					var colValue0 = result.getValue(searchCols[0]);
					var colValue1 = result.getValue(searchCols[1]);
					var colValue2 = result.getValue(searchCols[2]);
					var colValue3 = result.getValue(searchCols[3]);
					var colValue4 = result.getText(searchCols[4]);
					var colValue5 = result.getText(searchCols[5]);
					var colValue6 = result.getText(searchCols[6]);
					var colValue7 = result.getText(searchCols[7]);
					var colValue8 = result.getValue(searchCols[8]);
					var colValue9 = result.getValue(searchCols[9]);
					var colValue10 = result.getValue(searchCols[11]);
					var colValue11 = result.getValue(searchCols[12]);
					var colValue12 = result.getText(searchCols[13]);
					
					//highlights
					var colValue13 = result.getValue(searchCols[14]);
					var colValue14 = result.getValue(searchCols[15]);
					var colValue15 = result.getValue(searchCols[16]);
					
					
					
					
					
					var label = searchCols[i].getLabel();
					//var resultLabel = colValue + '|' + label;
					//var resultLabel = label + '=>' + colValue;
					//var resultLabel = label + '|' + colValue;
					
					
					//searchArray[z].push({label: colValue});
					//searchArray[z].push(resultLabel);
					/*if(colValue4 == 4){
						colValue4 = 'test1';
					}else if(colValue4 == 6){
						colValue4 = 'test2';
					}*/
					
				}
				
				//"<select class=\"itemLStatus\"><option selected disabled>'"+colValue4+"'</option></select>"
				// //Time: "<a id=\"'"+(colValue7)+'&'+(colValue9)+"'\" class=\"btn btn-success time postTime\"><span class=\"glyphicon glyphicon-play\"></span></a>",
				//var time = "<button type=\"button\" class=\"btn btn-success\">Start</button>";
				//searchArray[z].push({DATE_REQUESTED: colValue0, NAME: colValue1, DESCRIPTION: colValue2, DATE_NEEDED: colValue3, STATUS: colValue4, ASSIGNED_ARTIST: colValue5, ACTION_REQ_BY: colValue6, ID: (colValue7)+'.'+colValue8, Time: "time"+counter, Note: "notes"+counter});
				searchArray[z].push({
					DATE_NEEDED: colValue3,
					//NAME: "<a href=\"https://system.sandbox.netsuite.com/app/common/item/item.nl?id='"+colValue7+"'\" target=\"_blank\" >'"+colValue1+"'</a>",+
					NAME: "<a href=\"https://system.na3.netsuite.com/app/common/item/item.nl?id='"+colValue7+"'\" target=\"_blank\" >'"+colValue1+"'</a>",
					Time: "<a id=\"'"+(colValue7)+'&'+(colValue9)+"'\" class=\"btn btn-success time postTime '"+colValue7+"'\"><span class=\"glyphicon glyphicon-play\"></span></a>", 
					Note: "<a id=\"'" + colValue7 + "'\"  class=\"btn btn-warning notes notesAc '" + colValue7 + "NoteClass'\" data-toggle=\"modal\" data-target=\"#modalNotes\"><span class=\"glyphicon glyphicon-list-alt\"></span></a><span class=\"circle\">'" + colValue8 + "'</span>",
					DESCRIPTION: colValue2,
					Division: colValue10,
					Est: colValue11,
					STATUS: "<select id=\"'" + colValue7 +'ItemS'+"'\" class=\"itemLStatus\"><option selected disabled>'"+colValue4+"'</option></select>", 
					ACTION_REQ_BY: colValue6,
					Action: "<a id=\"'" + (colValue7)+'&'+(colValue12) + "'\" class=\"btn btn-info updateItemF\">Update</a>",
					ID: (colValue7)+'&'+(colValue9)+'.'+colValue8,
					statusT: colValue4,
					//Massive: "<label class=\"custom-control custom-checkbox\"><input id=\"'" + colValue7 + "'\" type=\"checkbox\" class=\"custom-control-input checkbox\"><span class=\"custom-control-indicator\"></span></label>"
					Massive: "<label class=\"custom-control custom-checkbox\"><input id=\"'" + (colValue7)+'&'+(colValue12) + "'\" type=\"checkbox\" class=\"custom-control-input checkbox\"><span class=\"custom-control-indicator\"></span></label>",
					DNV: colValue13, //Date Needed Value
					OO: colValue14, //On Order
					HO: colValue15 //Have Order
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
