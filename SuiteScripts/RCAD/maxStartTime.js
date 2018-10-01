/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       23 Jun 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function maxStartTime(request, response){
	nlapiLogExecution('debug', 'Begin Login Suitlet');
	
	
	//Aqui veremos que lo primero es el tipo de categoria
	//Lo segundo es el id de la save search
	//Tercero seria el parametro que le estamos pasando en este caso el email
	var userid = request.getParameter('userid');
	var filters = new Array();
	filters.push(new nlobjSearchFilter('custrecord_time_user', null, 'is', userid));
	//Sandbox 
	//var employeeSearch = nlapiSearchRecord('customrecord_time_record', '5036', filters);
	
	//Production
	var employeeSearch = nlapiSearchRecord('customrecord_time_record', '5088', filters);
	
	
	var searchArray = new Array();
	
	if (employeeSearch && employeeSearch.length != 0) {
		for (var z = 0; z < employeeSearch.length; z ++) {
			searchArray[z] = new Array();
			var result = employeeSearch[z];
			var searchCols = result.getAllColumns();
			for (var i = 0; i < searchCols.length; i++){
				var colValue = result.getValue(searchCols[i]);
				
				
				
				var notename = result.getValue(searchCols[0]);
				var internalId = result.getValue(searchCols[1]);
				var name = result.getText(searchCols[2]);
				var empid = result.getText(searchCols[3]);
				var date = result.getValue(searchCols[4]);
				var itemId = result.getValue(searchCols[5]);
				
			}
			
			
			searchArray[z].push({NoteName: notename, InternalID: internalId, Name: name, User: empid, Date: date, ItemId: itemId});
			
		}
		
		//nlapiLogExecution('DEBUG', 'Your id is :'+internalId+', This: '+itemId);
		

		var json = JSON.stringify(searchArray);
		nlapiLogExecution('DEBUG', 'about to send JSON string');
		
		//Begin
		json = json.replace(/[\[\]']+/g,'');
		
		var myTasks2 = JSON.parse("[" + json + "]");
		var col2 = [];
		for (var i = 0; i < myTasks2.length; i++) {
		col2= myTasks2[0];
		}
		var test = JSON.stringify(col2);
		var test2 =  JSON.parse("[" + test + "]");

		var col3 = [];
		for (var key in test2) {
		       if (test2.hasOwnProperty(key)) {
		       	/*
		    	   response.write(test2[key].NoteName);
		    	   response.write(test2[key].InternalID);
		    	   response.write(test2[key].Name);
		    	   response.write(test2[key].User);
		    	   response.write(test2[key].Date);
		    	   response.write(test2[key].ItemId);
		          */
		          
		          
		       }
		       col3=[test2[key].NoteName, test2[key].InternalID, test2[key].Name, test2[key].User, test2[key].Date, test2[key].ItemId];
		    }
		    
		
		   
		   for (var e = 0; e < col3.length; e++) { 
			   response.write(col3[e]+",");
		   	}

		//End
		   
		//response.write(json);
		//Aqui le mandas a imprimir en mi herramienta
		
		
	}
}
