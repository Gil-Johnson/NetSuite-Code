/* 
 * This script close a specific sales order
 */

// refrence from help: to close sales order => NetSuite Basics : Working with Transactions : Voiding, Deleting, or Closing Transactions

function closeSalesOrder(request, response){
    // get sales order id from query string
    var soId = request.getParameter('soid');
    var searchId = request.getParameter('searchid');
    if(isValidValue(soId) && isValidValue(searchId)){
        try{
            // load sales order
            var soRec = nlapiLoadRecord('salesorder', soId);
            var totalLines = soRec.getLineItemCount('item');
            // to close the sales order: in all line items, set checkbox named closed to true
            for(var line = 1; line <= totalLines; line++){
                soRec.setLineItemValue('item', 'isclosed', line, 'T');
            }
        
            nlapiSubmitRecord(soRec, true);
            //redirectToPage(response, searchId);
            nlapiLogExecution('DEBUG', 'closeSalesOrder', 'Sales Order Id: ' + soId);
            redirectToPage(response, soId);
        //response.writeLine('Salesorder has been closed.')
        }
        catch(ex)
        {
            nlapiLogExecution('ERROR', 'Error in manipulating salesorder', ex);
            response.writeLine(ex);
        }
    }else{
        response.writeLine('Invalid salesorder id.');
    }
}

function isValidValue(value){
    return !(value == '' || value == null || typeof value == 'undefined');
}

function redirectToPage(response, sid){
    var form = nlapiCreateForm('Redirecting...');
    var inlinehtmlField = form.addField('custpage_redirect', 'inlinehtml');
    var reloadPageScript = '';
    reloadPageScript += "<script type = 'text/javascript'>";
    // returning back to the saved search
    //reloadPageScript += "window.location.href = '/app/common/search/searchresults.nl?searchid=" + sid + "'";
    // returning back to the ssales order
    reloadPageScript += "window.location.href = '/app/accounting/transactions/salesord.nl?id=" + sid + "&whence='";
    reloadPageScript += "</script>";
    inlinehtmlField.setDefaultValue(reloadPageScript);
    response.writePage(form);
}