/**
 * Created by wahajahmed on 5/22/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * SO_Splitting_Manager class that has the functionality of
 */
var SO_Splitting_Manager = (function () {



    /**
     * Get all line items distinct locations in provided sales order
     * @param salesOrderObj
     * @returns {Array}
     */
    function getAllLocation(salesOrderObj){
        var temp = [];
        var linesCount = salesOrderObj.getLineItemCount('item');
        for(var lineNumber=1;lineNumber<=linesCount;lineNumber++){
            var tempLoc = salesOrderObj.getLineItemValue('item', 'location', lineNumber);
            if(temp.indexOf(tempLoc) == -1){
                temp.push(tempLoc);
            }
        }
        return temp;
    }

    /**
     * Determine either SO have split or not on the basis of locations count
     * @param locationArray
     * @returns {boolean}
     */
    function isNewSOGenerate(locationArray) {
        var length = locationArray.length;
        if(length==1) {
            return false;
        }
        return true;
    }

    /**
     * Keep the lines of provided location from salesorder and delete all others
     * @param salesOrder
     * @param locationToKeep
     */
    function removeLineItems(salesOrder, locationToKeep) {
        for (var line = salesOrder.getLineItemCount('item'); line>=1; line--) {
            var tempLoc = salesOrder.getLineItemValue('item', 'location', line);
            if(tempLoc != locationToKeep) {
                salesOrder.removeLineItem('item', line);
            }

        }
    }

    /**
     * Set custom ship date field for newly created SOs used to sort SO records in PPT
     * @param record
     * @param shipDate
     */
    function setCustomShipDate(record, shipDate){
        if(!!shipDate){
            record.setFieldValue('custbody_sortingshipdate', shipDate);
        }
    }

    /**
     * Send email about error occurred during splitting of SO
     * @param mainSoId
     * @param soNumber
     * @param error
     * @param environment
     */
    function sendEmailAboutErrorOccurred(mainSoId, soNumber, error, environment) {
        try {
            var emailSubject = "Error occurred during splitting of SalesOrder: " + soNumber;
            var emailBody = getEmailBody(mainSoId, soNumber, error, environment);
            //var errorEmailReceivingAddress = 'jayc@ricoinc.com';
            var errorEmailReceivingAddress = 'wahajahmed@folio3.com';
            var authorId = 5; // Here 5 is id of jay's customer

            nlapiSendEmail(authorId, errorEmailReceivingAddress, emailSubject, emailBody);
        }
        catch (ex) {
            nlapiLogExecution('ERROR', 'error in sendEmailAboutErrorOccurred(mainSoId, soNumber, error) method', ex.toString());
            throw ex;
        }
    }

    /**
     * Delete newly Generated sales orders due to failure in main SO update
     * @param strSOIds
     */
    function deleteNewlyGeneratedSalesOrders(mainSOInternalId, strSOIds) {
        var soIds = strSOIds.split(",");
        if(!!soIds && soIds.length > 0) {
            for (var i = 0; i < soIds.length; i++) {
                var soId = soIds[i];
                if(!!soId) {
                    try {
                        nlapiDeleteRecord('salesorder', soId);
                    }
                    catch (ex) {
                        nlapiLogExecution('ERROR', 'Error in deleting New Sales Order', 'MainSOId=' + mainSOInternalId + '  >>  NewSOId=' + soId + '  >>  Error=' + ex.message);
                    }
                }
            }
        }
    }

    /**
     * Get sales order screen url
     * @param environment
     */
    function getSalesOrderScreenUrl(environment) {
        var salesOrderUrl = 'https://system.netsuite.com/app/accounting/transactions/salesord.nl?id=';
        if(environment === 'SANDBOX') {
            salesOrderUrl = 'https://system.sandbox.netsuite.com/app/accounting/transactions/salesord.nl?id=';
        }
        return salesOrderUrl;
    }

    /**
     * Create body of email to be sent on error occurred during splitting of SO
     * @param mainSoId
     * @param soNumber
     * @param error
     * @param environment
     * @returns {string}
     */
    function getEmailBody(mainSoId, soNumber, error, environment) {
        var body = '';
        body += '<p>';
        body += 'Error occurred during splitting of SalesOrder: ';
        body += '       <a href="' + getSalesOrderScreenUrl(environment) + mainSoId + '" target="_blank">';
        body += '           <b>' + soNumber + '</b>';
        body += '       </a>';
        body += '</p>';
        body += '</br></br></br>';
        body += '<p>';
        body += '   <b>Error Details:</b>  ' + error;
        body += '</p>';
        return body;
    }

    return {
        /**
         * Check Either Sales Order applied to splitting
         * @param soInternalId
         * @param salesOrderObj
         * @param executionContext
         */
        handleSOSplittingCriteria: function (soInternalId, salesOrderObj, executionContext) {

            if(this.checkSOAlreadyExistInQueue(soInternalId)) {
                return;
            }

            if(!salesOrderObj) {
                salesOrderObj = nlapiLoadRecord('salesorder', soInternalId);
            }

            var locations = [];
            locations = getAllLocation(salesOrderObj);
            nlapiLogExecution("DEBUG", 'All locations',locations.toString());
            var isNewSOCreate = isNewSOGenerate(locations);
            nlapiLogExecution("DEBUG", 'isNewSOCreate',isNewSOCreate);
            if(isNewSOCreate) {
                var soNumber = salesOrderObj.getFieldValue('tranid');
                var data = {};
                data[SO_SplittingDao.FieldName.MAIN_SO_INTERNAL_ID] = soInternalId;
                data[SO_SplittingDao.FieldName.MAIN_SO_NUMBER] = soNumber;
                data[SO_SplittingDao.FieldName.EXECUTION_CONTEXT] = executionContext;
                data[SO_SplittingDao.FieldName.SO_SPLITTING_STATUS] = CONSTANTS.SOSplittingStatues.Pending;
                var recordId = SO_SplittingDao.upsert(data);
                nlapiLogExecution("DEBUG", 'Record inserted into SO splitting queue',"Inserted record Id=" + recordId);
            }
        },

        /**
         * Split sales order
         * @param soInternalId
         * @param salesOrderObj
         */
        splitSalesOrder: function (soInternalId, soNumber, salesOrderObj, executionContext) {
            var context = nlapiGetContext();
            var isCsvImport = false;
            var isWebService = false;
            var externalIdFlag = true;
            var status = 0;
            var errorMessage = '';
            var customErrorMessage = '';
            var strIds = '';
            var strNums = '';
            var locations = null;
            var totalLocationsFound = null;
            //nlapiLogExecution("DEBUG", 'tranid_w', salesOrderObj.getFieldValue('tranid'));

            try {

                if(executionContext == 'csvimport'){
                    isCsvImport = true;
                }
                else if(executionContext == 'webservices'){
                    isWebService = true;
                }
                else if(executionContext == 'webstore') {
                    isWebService = true;
                }


                if(!salesOrderObj) {
                    salesOrderObj = nlapiLoadRecord('salesorder', soInternalId);
                }
                locations = getAllLocation(salesOrderObj);
                totalLocationsFound = locations;
                nlapiLogExecution("DEBUG", 'All locations',locations.toString());
                var isNewSOCreate = isNewSOGenerate(locations);
                nlapiLogExecution("DEBUG", 'isNewSOCreate',isNewSOCreate);
                var newSalesOrders = [];
                if(isNewSOCreate) {
                    var externalId = salesOrderObj.getFieldValue('externalid');

                    // remove main body ware house from list of all warehouses
                    var main_so_body_warehouse = salesOrderObj.getFieldValue('location');
                    var index_of_body_warehouse = locations.indexOf(main_so_body_warehouse);
                    if (index_of_body_warehouse > -1) {
                        locations.splice(index_of_body_warehouse, 1);
                    }

                    // Create new SOs for warehouses other other than main body warehouse
                    for(var i=0;i<locations.length;i++){
                        var location = locations[i];
                        nlapiLogExecution('DEBUG', 'location: ', location);

                        var createRecord = nlapiCopyRecord('salesorder', soInternalId);

                        createRecord.setFieldValue('orderstatus', 'B');
                        createRecord.setFieldValue('location', location);
                        createRecord.setFieldValue('custbody_split_so_generated_from', soInternalId);

                        removeLineItems(createRecord, location);

                        //region set on hold field
                        var customerId = salesOrderObj.getFieldValue('entity');
                        setHoldField(customerId, createRecord);
                        //endregion

                        // handling external id preserved to prevent duplicate via webservice
                        if((isCsvImport || isWebService) && externalIdFlag){
                            if(externalId) {
                                createRecord.setFieldValue('externalid', externalId);
                            }
                            externalIdFlag = false;
                        }

                        newSalesOrders.push(createRecord);
                    }

                    for (var i = 0; i < newSalesOrders.length; i++) {
                        var createRecord = newSalesOrders[i];
                        var id;
                        try{
                            var mainshipDate = salesOrderObj.getFieldValue('shipdate');
                            setCustomShipDate(createRecord, mainshipDate);
                            createRecord.setFieldValue('shipdate', mainshipDate);
                            createRecord.setFieldValue(COMMON.TO_BE_SPLIT, 'F');
                            id = nlapiSubmitRecord(createRecord, true);
                            strIds += id + ',';
                            strNums += createRecord.getFieldValue('tranid') + ',';
                        }catch(ex){
                            deleteNewlyGeneratedSalesOrders(soInternalId, strIds);
                            errorMessage = ex.toString();
                            customErrorMessage = 'Error in Creating New Sales Order:  ' + 'MainSOId=' + soInternalId + '  >>  Error=' + ex.toString();
                            status = CONSTANTS.SOSplittingStatues.ErrorDuringSplitting;
                            nlapiLogExecution('ERROR', 'Error in Creating New Sales Order', 'MainSOId=' + soInternalId + '  >>  Error=' + ex.toString());
                            throw ex;
                        }
                        nlapiLogExecution('DEBUG', 'new so created', id);

                        /*try{
                            workOrderDataTransition(id);
                         }catch(ex){
                            errorMessage = ex.message;
                            customErrorMessage = 'Error in workOrderDataTransition of Newly Created Sales Order:  ' + 'MainSOId=' + soInternalId + '  >>  NewSOId=' + id + '  >>  Error=' + ex.message;
                            status = CONSTANTS.SOSplittingStatues.ErrorDuringWorkOrderDataTransitionProcess;
                            nlapiLogExecution('ERROR', 'Error in workOrderDataTransition of Newly Created Sales Order', 'MainSOId=' + soInternalId + '  >>  NewSOId=' + id + '  >>  Error=' + ex.message);
                            throw ex;
                         }*/
                    }

                    try{
                        salesOrderObj = nlapiLoadRecord('salesorder', soInternalId);
                        //Remove line items from main so having warehouse other than main body warehouse
                        removeLineItems(salesOrderObj, main_so_body_warehouse);
                        salesOrderObj.setFieldValue('custbody_split_generated_so_ids', strIds);
                        salesOrderObj.setFieldValue(COMMON.TO_BE_SPLIT, 'F');
                        nlapiSubmitRecord(salesOrderObj, false);
                    }catch(ex){
                        deleteNewlyGeneratedSalesOrders(soInternalId, strIds);
                        errorMessage = ex.toString();
                        customErrorMessage = 'Error in Updating Main SO:  ' + 'MainSOId=' + soInternalId + '  >>  NewlyGeneratedSplitSOsIds=' + strIds + '  >>  Error=' + ex.toString();
                        if(!!errorMessage && errorMessage.indexOf(CONSTANTS.SOSplittingOccurredMessage.AtleastOneLineFulfilled) > -1) {
                            status = CONSTANTS.SOSplittingStatues.Error;
                        } else {
                            status = CONSTANTS.SOSplittingStatues.SplittedWithErrors;
                        }
                        nlapiLogExecution('ERROR', 'Error in Updating Main SO', 'MainSOId=' + soInternalId + '  >>  NewlyGeneratedSplitSOsIds=' + strIds + '  >>  Error=' + ex.toString());
                        throw ex;
                    }

                    if(executionContext == "webstore") {
                        var mainSo = soInternalId;
                        var soNums = strIds;
                        if(!!soNums) {
                            soNums = soNums.split(",");
                            soNums.forEach(function(so) {
                                if(!!so) {
                                    nlapiSubmitField("salesorder", so, "memo", "web_" + mainSo);
                                }
                            });
                        }
                    }

                    /*try{
                        workOrderDataTransition(soInternalId);
                    }catch(exception){
                        errorMessage = ex.message;
                        customErrorMessage = 'Error in workOrderDataTransition of Main Sales Order:  ' + 'MainSOId=' + soInternalId + '  >>  Error=' + ex.message;
                        status = CONSTANTS.SOSplittingStatues.ErrorDuringWorkOrderDataTransitionProcess;
                        nlapiLogExecution('ERROR', 'Error in workOrderDataTransition of Main Sales Order', 'MainSOId=' + soInternalId + '  >>  Error=' + ex.message);
                        throw ex;
                    }*/

                    status = CONSTANTS.SOSplittingStatues.Splitted;
                }
                else {
                    status = CONSTANTS.SOSplittingStatues.AlreadySplitted;
                }

            } catch(ex){
                if(status == 0) {
                    errorMessage = ex.toString();
                    customErrorMessage = 'Error in Overall Splitting Process:  ' + 'MainSOId=' + soInternalId + '  >>  Error=' + ex.toString();
                    status = CONSTANTS.SOSplittingStatues.Error;
                    nlapiLogExecution('ERROR', 'Error in Overall Splitting Process', 'MainSOId=' + soInternalId + '  >>  Error=' + ex.toString());
                }
                sendEmailAboutErrorOccurred(soInternalId, soNumber, customErrorMessage, context.getEnvironment());
            }

            var result = {};
            result.status = status;
            result.splittedSOIds = strIds;
            result.splittedSONumbers = strNums;
            result.errorMessage = errorMessage;
            result.customErrorMessage = {customError: customErrorMessage, locations: totalLocationsFound};
            return result;
        },
        /**
         * Check if sales order already exist in splitting queue
         * @param soInternalId
         */
        checkSOAlreadyExistInQueue: function(soInternalId) {
            var exist = false;
            var existingRecords = SO_SplittingDao.getBySOInternalIdAndStatus(CONSTANTS.SOSplittingStatues.Pending, soInternalId);
            if(!!existingRecords && existingRecords.length > 0) {
                nlapiLogExecution("DEBUG", 'RecordAlreadyInQueue', 'InternalId='+soInternalId);
                exist = true;
            }
            return exist;
        },
        /**
         * Check if any similar duplicate sales order record already exist in splitting queue
         * Note: This might be inserted due to some unknown errors or bombardment of insertion request from BULK Approval dashboard
         * @param soInternalId
         */
        getDuplicateSOAlreadyExistInQueue: function(recordId, soInternalId) {
            var existingRecords = SO_SplittingDao.getOtherDuplicateRecords(CONSTANTS.SOSplittingStatues.Pending, recordId, soInternalId);
            return existingRecords;
        }
    };
})();