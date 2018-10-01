/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       28 Mar 2016     Gil Johnson
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function closeOrder(request, response){
	
	try{
	
	if (request.getMethod() == 'GET'){	
	
		var soId = request.getParameter('soId');
	         
		form = nlapiCreateForm('Close Order', true);
			
	    var recordIdField = form.addField('custpage_recordid', 'text');
		recordIdField.setDefaultValue(soId);
		recordIdField.setDisplayType('hidden');	
		
		//create drop down field for closed reason
	    var select = form.addField('selectfield', 'select', 'Reason For Closing');
	    select.addSelectOption('','');
	    select.addSelectOption('3','Backorderd');
	    select.addSelectOption('1','Customer Request');	    
	    select.addSelectOption('4','Missed Cancelled Date');
	    select.addSelectOption('5','Non Stocked Item');
	    select.addSelectOption('2','Order Below Min');
	    select.addSelectOption('6','Back Order Below Minimum');
	    select.addSelectOption('7','Sample Order not shipped');
	    select.setMandatory(true);		
           
	    
	    form.addSubmitButton('Close Order');    
	    response.writePage(form);       
	   
    
	}
	
	else {		
		
		var soRecId = request.getParameter('custpage_recordid');		
		var select = request.getParameter('selectfield');		
			
	    nlapiLogExecution('DEBUG', 'test', select);
	    
	    var salesOrderRecord = nlapiLoadRecord('salesorder', soRecId);
	    var numberOfItems = salesOrderRecord.getLineItemCount('item');
	    
	    for (var i = 1; i <= numberOfItems; i++) {
	          salesOrderRecord.setLineItemValue('item', 'isclosed', i, 'T');
	          
	    }
	    
	    salesOrderRecord.setFieldValue('custbody_closed_order_reason', select);
	    
	    
	    nlapiSubmitRecord(salesOrderRecord, false, true);
      
	    response.write('<script>window.close();</script>');
		
	}
	
}
	
  
catch(e){
	response.write(LogError(e));
}

}
function LogError(e){
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