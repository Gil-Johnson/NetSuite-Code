/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error', 'N/ui/dialog'],
    function(error, dialog) {

        function validateLine(context) {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;

            if (sublistName === 'item' || sublistName === 'expense')
            {

                var department = currentRecord.getCurrentSublistValue({sublistId: sublistName, fieldId: 'department'});
                var location = currentRecord.getCurrentSublistValue({sublistId: sublistName, fieldId: 'location'});
               
                if (!department || !location){

                    var options = {
                        title: "Message",
                        message: "Please enter a value for both department and warehouse"
                     };
                     function success(result) {
                        console.log("Success with value " + result);
                    }
                    function failure(reason) {
                        console.log("Failure: " + reason);
                    }
             
                    dialog.alert(options).then(success).catch(failure);

                        return false;
                }

            }  
            return true;
        }
     
        return {

            validateLine: validateLine,
           
        };
    });