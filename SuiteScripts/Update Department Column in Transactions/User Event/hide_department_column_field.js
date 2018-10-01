/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function beforeLoad(type,form)
{
    try
    {
        var itemSubList = form.getSubList('item');
        itemSubList.getField('department').setDisplayType('hidden');
		
		// if execution context is 'user interface' then hide this field, 
		// otherwise, this field value was not setting from csv import due to this hidden field code snippet 
        if(nlapiGetContext().getExecutionContext() == 'userinterface') {
            itemSubList.getField('commitinventory').setDisplayType('hidden');
		}
    }
    catch(ex)
    {
        nlapiLogExecution('ERROR','error in func beforeLoad',ex.toString());
    }
}

