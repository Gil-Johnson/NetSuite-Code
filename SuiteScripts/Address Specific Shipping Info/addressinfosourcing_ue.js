function shipFieldSourceBeforeSubmit(){



try{
        var loc1 = nlapiGetLineItemValue('item', 'location', 1);
        var loc2 = nlapiGetLineItemValue('item', 'location', 2);

        var soNewRecord = nlapiGetNewRecord();
        var soOldRecord = nlapiGetOldRecord();

        if(soNewRecord==null){
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soNewRecord', 'soNewRecord is null');
        }

        if(soOldRecord==null){
            nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_soOldRecord', 'soOldRecord is null');
        }

        var loc1_new = soNewRecord.getLineItemValue('item', 'location', 1);
        var loc2_new = soNewRecord.getLineItemValue('item', 'location', 2);

        var loc1_old = soOldRecord.getLineItemValue('item', 'location', 1);
        var loc2_old = soOldRecord.getLineItemValue('item', 'location', 2);

        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location1', 'loc1=' + loc1);
        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_Location2', 'loc2=' + loc2);
        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_new', 'loc1_new=' + loc1_new);
        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_new', 'loc2_new=' + loc2_new);
        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc1_old', 'loc1_old=' + loc1_old);
        nlapiLogExecution('DEBUG', 'BeforeSubmit_f3_test_log_loc2_old', 'loc2_old=' + loc2_old);
    }
    catch(ex){
        nlapiLogExecution('ERROR', 'error in location logging', ex.message);
    }



    //Ignore for Webservices
    var context = nlapiGetContext().getExecutionContext();
    if(context == 'webservices' || context == 'userinterface')
        return;
    setShipFields();
}