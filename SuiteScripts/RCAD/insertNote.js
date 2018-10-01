/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       07 Jul 2017     usermac
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 * 
 * 
 var taskTitle = 'Follow up regarding new Opportunity';
   var memo = 'test';
   var author = 18919;
var item = 178960;
   var record = nlapiCreateRecord( 'note');
   record.setFieldValue( 'title', taskTitle);
   record.setFieldValue( 'note', memo);
record.setFieldValue( 'item', 178960);
   id = nlapiSubmitRecord(record, false);
   
   
 */
function insertNote(request, response){

	try {
		var method = request.getMethod();
		if (method == 'POST') {
			nlapiLogExecution('debug', 'create note record suitelet triggered');
			
			   var json = request.getBody();
			   var dataObj = JSON.parse(json);
			
			   var taskTitle = dataObj.title;
			   var author = dataObj.id;
			   var item = dataObj.itemId;
			   
		
			   
				   var memo = dataObj.note;
				   var record = nlapiCreateRecord( 'note');
				   
				   
					record.setFieldValue( 'title', taskTitle);
				    record.setFieldValue( 'note', memo);
					record.setFieldValue( 'item', item);
					record.setFieldValue( 'author', author);
					
					item = nlapiSubmitRecord(record);
					//item = nlapiSubmitFields(record);
					//nlapiSubmitField(type, id, fields, values, doSourcing)
					nlapiLogExecution('debug', 'custom time record submitted', item);
					response.write(item);
					
		}
	}
	catch (e) {
		logError("Error: "+e);
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
