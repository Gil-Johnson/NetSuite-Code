function mainFunction()
{
    var context = nlapiGetContext();
    var countInserted = 0;

    nlapiLogExecution('DEBUG', 'Scheduled Script called.', countInserted + ' records have been inserted.');
    if(context.getSetting('SCRIPT', 'custscript_count'))
        countInserted = parseInt(context.getSetting('SCRIPT', 'custscript_count'));

    var records = nlapiSearchRecord('transaction', '3288');
    for (i in records)
    {
		var toolingNumber = records[i].getValue('custcol_tooling_number');
		if (toolingNumber === "438") {		
			var record = nlapiLoadRecord('customrecord_tooling', toolingNumber);
			record.setFieldValue('custrecord_received', 'T');
			nlapiSubmitRecord(record);
		}
		//nlapiSubmitField('purchaseorder', records[i].getId(), 'custbody_onhold', 'F');
		
		/*if (i == 4) 
        {
            var params = [];
            params['custscript_count'] = countInserted + 10;
            nlapiLogExecution('DEBUG', 'Calling Script with parameters',
                'Count : ' + params['custscript_count']);
            nlapiScheduleScript(nlapiGetContext().getScriptId(), nlapiGetContext().getDeploymentId(), params);
            return;
        }*/
    }

}
