/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record',  'N/format', '/SuiteScripts - Globals/moment'],
/**
 * @param {record} record
 */
function(record, format, moment) {
    
	function addWeekdays(date, days) {
		  date = moment(date); // use a clone
		  while (days > 0) {
		    date = date.add(1, 'days');
		    // decrease "days" only if it's a weekday.
		    if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
		      days -= 1;
		    }
		  }
		  return date;
		}
	
	 function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        
        var itemStatus = currentRecord.getValue({
   	        fieldId: 'custitem_status'
   	    });         
           
     //   alert(itemStatus);
           
           if (context.fieldId === 'custitem_status' && itemStatus == 11){
        	   
        	   var dateNeeded = currentRecord.getValue({
          	        fieldId: 'custitem_dateneeded'
          	    });
                  
               var newDate = moment().format('MM/DD/YYYY');
               
            //   alert(newDate);
        	   
               newDate = addWeekdays(newDate, 3);
               
               newDate =  moment(newDate).format('MM/DD/YYYY');
               
               newDate = format.parse({
	                value: newDate,
	                type: format.Type.DATE
	            });
        	   
               currentRecord.setValue({
                   fieldId: 'custitem_dateneeded',
                   value: newDate
               });
           }
       }

   

    return {
        fieldChanged: fieldChanged
    };
    
});
