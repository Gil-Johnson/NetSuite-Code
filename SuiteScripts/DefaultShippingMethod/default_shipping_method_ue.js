/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       15 Aug 2014     hakhtar
 *
 */


function setDefaultShipMethodAfterSubmit(type){
  try {
	  nlapiLogExecution("DEBUG", "ShipMethod & carrier", nlapiGetFieldValue("shippingitem") + " & " + nlapiGetFieldValue("shippingcarrier"));
	  if (type == "create" || type == "edit") {
		  //Check shipping method, & set default to VUPS
		  if (!nlapiGetFieldValue("shippingitem")) {
			  nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), "shippingitem", "305");
			  nlapiLogExecution("DEBUG", "method set Done for record ID = " + nlapiGetRecordId());
		  }
		  
		  //Check shipping carrier, and set default to More
		  if (!nlapiGetFieldValue("shippingcarrier")) {
			  nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), "shippingcarrier", "nonups");
			  nlapiLogExecution("DEBUG", "carrier set Done for record ID = " + nlapiGetRecordId());
		  }
	  }
  }
  catch(e) {
	  nlapiLogExecution("ERROR", e.name, e.message);
  }
}
