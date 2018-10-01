/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       08 Feb 2013     zahmed
 *
 */
var context = nlapiGetContext();
var isCsvOrWebService = false;
var isUserInterface = false;

function userEventBeforeLoad(type, form, request){
    if(nlapiGetContext().getExecutionContext() == 'userinterface' && (type == 'create' || type == 'edit' || type == 'copy')){
        // jquery 1.7.2.js
        var jqueryJs = "/core/media/media.nl?id=13&c=3500213&h=7e8bfb617fb0e16e2470&_xt=.js"; 
        // jquery UI.css
        var jqueryUiCss = "/core/media/media.nl?id=14&c=3500213&h=8c9cd4283b52c80f965c&_xt=.css";
        // jquery UI.js
        var jqueryUiJs = "/core/media/media.nl?id=15&c=3500213&h=8d1bf2ca46bafb370748&_xt=.js"; 
        
        // include libraries
        var html = "<script type='text/javascript' src='"+ jqueryJs +"'></script>";
        html += "<link rel='stylesheet' href='"+ jqueryUiCss +"'/>";
        html += "<script type='text/javascript' src='"+ jqueryUiJs +"'></script>";
        html += "<script type='text/javascript'>";
        html += "var j = {};";
        html += "j.home = jQuery.noConflict();";
                
        html += "function _dialog() {";
        html += "j.home('#mymodal').show();";
        html += "j.home('#mymodal').dialog({";
        //html += "minWidth: 200,";
        html += "width: '400px',";
        html += "modal: true,";
        html += "resizable: false,";
        html += "draggable: false,";
        // start hide close button from dialog
        html += "closeOnEscape: true,";
        //html += "closeOnEnter: true,";
        html += "open: function(event, ui) {";
        html += "j.home('.ui-dialog-titlebar-close').hide();";
        html += "}";
        // end hide close button from dialog
        html += "}).height('auto');";
					
        html += "}";
			
        html += "function modalCloseButton(){";
        html += "j.home('#mymodal').dialog('close');";
        html += "}";

        html += "</script>";
        html += '<div id="mymodal" title="Warning" style="display:none;"></div>';
        var custField = form.addField('custpage_customfield', 'inlinehtml');
        custField.setDefaultValue(html);
    }
}

function userEventBeforeSubmit(type){
    //nlapiLogExecution('DEBUG', 'Type', context.getExecutionContext());
    if(type == 'create' || type == 'edit'){
        switch(context.getExecutionContext()){
            case 'csvimport':
            case 'webservices':
                isCsvOrWebService = true;
                break;
            case 'userinterface':
                isUserInterface = true;
                break;
        }
        if(isUserInterface || isCsvOrWebService)
        {
            // load the record which is being submitting
            var loadSubmittingRecord = nlapiGetNewRecord();
            // load customer and item values from current record
            var customer = loadSubmittingRecord.getFieldValue(ITEM_SOURCING.FieldName.CUSTOMER_ID);
            var itemNumber = loadSubmittingRecord.getFieldValue(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID);
            // load customer and item text from current record
            var customerTxt = loadSubmittingRecord.getFieldText(ITEM_SOURCING.FieldName.CUSTOMER_ID);
            var itemNumberTxt = loadSubmittingRecord.getFieldText(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID);
            searchCustomerItemCombination(customer, itemNumber, customerTxt,itemNumberTxt,type);
        }
    }
}

// search the cutomer and item combination in custom record type
function searchCustomerItemCombination(customer,itemNumber, customerTxt, itemNumberTxt,type){
    // searching criteria for fliter
    var filters = new Array();
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.CUSTOMER_ID, null, 'is', customer);
    filters[filters.length] = new nlobjSearchFilter(ITEM_SOURCING.FieldName.ITEM_NUMBER_ID, null, 'is', itemNumber);
    
    // search result
    var searchResult = [];
    searchResult = nlapiSearchRecord(ITEM_SOURCING.INTERNAL_ID, null, filters, null);        
    // if record is already exists, throw the error
    if(searchResult != null  && searchResult.length > 0) {
        if(type=='edit'){
            if(searchResult[0].getId() == nlapiGetRecordId())
                return;
        }
        throwError(customerTxt,itemNumberTxt);
    }
}

// custom error thrown to prevent the submitting of current record
function throwError(customer, item){
    var message = 'DEV ERR:: Customer: "'+customer +'" is already associated with Item: "'+ item +'"'+ '.';
    message += isUserInterface == true?' Go back and change the combination.':'';
    message += isCsvOrWebService == true?' Import CSV.':'';
    var err = nlapiCreateError('DEV78',message,true);
    throw err;
}