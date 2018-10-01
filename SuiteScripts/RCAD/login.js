/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       06 Jun 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function loginSuitelet(request, response){
	nlapiLogExecution('debug', 'Begin Login Suitlet');
	
	var email = request.getParameter('email');
	var password = request.getParameter('password');
	
	var filters = new Array();
	filters.push(new nlobjSearchFilter('email', null, 'is', email));
	//Aqui veremos que lo primero es el tipo de categoria
	//Lo segundo es el id de la save search
	//Tercero seria el parametro que le estamos pasando en este caso el email
	
	//Sandbox  
	//var employeeSearchRoles = nlapiSearchRecord('employee', '5040', filters);

	//Production
	var employeeSearchRoles = nlapiSearchRecord('employee', '5087', filters);
	
	var searchArrayRoles = new Array();
	if (employeeSearchRoles && employeeSearchRoles.length != 0) {
		for (var x = 0; x < employeeSearchRoles.length; x ++) {
			searchArrayRoles[x] = new Array();
			var resultR = employeeSearchRoles[x];
			var searchColsR = resultR.getAllColumns();
			for (var a = 0; a < searchColsR.length; a++){
				var colValueR = resultR.getValue(searchColsR[a]);
				searchArrayRoles[x].push(colValueR);
				
				
				
			}
		}
		//response.write('Your id is :'+empid);
		//response.write('Your role# is :'+role);
		
		
		
		
	}
	
	
	//Sandbox 
	//var employeeSearch = nlapiSearchRecord('employee', '5035', filters);

	//Production
	var employeeSearch = nlapiSearchRecord('employee', '5085', filters);
	
	var searchArray = new Array();
	var test = "this is a test";
	if (employeeSearch && employeeSearch.length != 0) {
		for (var z = 0; z < employeeSearch.length; z ++) {
			searchArray[z] = new Array();
			var result = employeeSearch[z];
			var searchCols = result.getAllColumns();
			 
			for (var i = 0; i < searchCols.length; i++){
				var colValue = result.getValue(searchCols[i]);
				searchArray[z].push(colValue);
				var name = result.getValue(searchCols[0]);
				var empid = result.getValue(searchCols[3]);
				var role = result.getValue(searchCols[4]);
				
				
			}
		}
		//response.write('Your id is :'+empid);
		//response.write('Your role# is :'+role);
		
		
		var json = JSON.stringify(searchArray);
		var json2 = JSON.stringify(searchArrayRoles);
		var json3 =json+"%"+json2
		nlapiLogExecution('debug', 'about to send JSON string');
		response.write(json3);
	
		
		//Aqui le mandas a imprimir en mi herramienta
		
		
	}
	
	
}
