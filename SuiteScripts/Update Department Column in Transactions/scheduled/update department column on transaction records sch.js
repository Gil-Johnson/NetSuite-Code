/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function main()
{
    try
    {
        var columns = new Array();
        var context = nlapiGetContext();
        nlapiLogExecution('DEBUG','script started at','started');
        var result = nlapiSearchRecord(null,1412);
        nlapiLogExecution('DEBUG','result',result.length);
        if(result)
        {
            for(var i = 0; i < 100; i++)
            {
                //nlapiLogExecution('DEBUG','result',result.length);
                nlapiLogExecution('DEBUG','department',result[i].getValue('department','item'));
                nlapiLogExecution('DEBUG','item',result[i].getValue('item'));
                var item = result[i].getValue('item');
                var department = result[i].getValue('department','item');

                nlapiLogExecution('DEBUG','record type: ' + result[i].getRecordType(),'record id: ' + result[i].getId());
                var rec = nlapiLoadRecord(result[i].getRecordType(),result[i].getId());
                var lineno = rec.findLineItemValue('item','item',item);
                nlapiLogExecution('DEBUG','lineno',lineno);
                rec.setLineItemValue('item','department',lineno,department);
                var recid = nlapiSubmitRecord(rec);
                nlapiLogExecution('DEBUG','recId',recid);
                if (context.getRemainingUsage() <= 1000)
                {                   
                    var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(),null);
                    nlapiLogExecution('DEBUG', 'Script rescheduled', 'status: ' + status);
                    return;
                }

                 // var recId = result[i].getValue('internalid',null,'group');
            }
        }
    }
    catch(ex)
    {
        nlapiLogExecution('ERROR','error in func main',ex.toString());
    }
}
