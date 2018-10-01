function getEmail(params) {
    try {
     var customerId = params.getParameter('id');
     var filters = new Array();
     filters.push(new nlobjSearchFilter('entityid', null, 'is', customerId));
            nlapiLogExecution('ERROR','emil',customerId );
      var searchRecord = nlapiSearchRecord('customer',null,filters,null);
      customerId =searchRecord[0].getId();
            nlapiLogExecution('ERROR','GERE',"" );
      var customerRecord = nlapiLoadRecord('customer',customerId);
      var email = customerRecord.getFieldValue("email");
      response.write(email);
    //return customerRecord.getFieldValue("email");
     } catch (e) {
     nlapiLogExecution('ERROR','Error',e);
    }
}
