/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
function beforeLoad(type)
{
    try
    {
        if(type == 'copy')
        {
            var lineCount = nlapiGetLineItemCount('item');
            for(var i=1;i<=lineCount;i++)
            {
                nlapiSelectLineItem('item',i);
                nlapiSetCurrentLineItemValue('item','custcol_woqty','');
                nlapiCommitLineItem('item');
            }
        }
    }
    catch(ex)
    {
        nlapiLogExecution('ERROR','error in func beforeLoad',ex.toString());
    }
}

