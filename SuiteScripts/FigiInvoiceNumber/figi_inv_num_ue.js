/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       22 Jul 2014     hakhtar
 *
 */

var FIGI_INV_CONSTANTS = {
    FigiInvFormId: "248",
    FigiInvNumField: "custbody_figisinvoiceno"
};

/**
 * After submit event handler
 * @param type		type of operation
 */
function figiAfterSubmit(type) {
	try {
		if (type.toString() === "create" &&
            nlapiGetFieldValue("customform") === FIGI_INV_CONSTANTS.FigiInvFormId) {
			var invNum = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId())
							.getFieldValue("tranid");
			
			if (!!invNum) {
                nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(),
                    FIGI_INV_CONSTANTS.FigiInvNumField, "F" + invNum.substr(invNum.length - 5));
	        }
        }
	}
	catch (e) {
		nlapiLogExecution("ERROR", e.name, e.message);
	}
}
