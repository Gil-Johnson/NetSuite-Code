/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/error', 'N/record', 'N/search', 'N/runtime', 'N/email'],
/**
 * @param {error} error
 * @param {record} record
 * @param {search} search
 */
function(error, record, search, runtime, email) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function getBinId(binnumber){

        var binid = "";

        var binsearch = search.load({
            id: 'customsearch7163',
        });

        binsearch.filters.push( search.createFilter({
                name: 'binnumber',
                operator: search.Operator.IS,
                values: binnumber
        })); 

            binsearch.run().each(function(result) {
	    	   	 
                binid = result.id;
                
            });


        return binid;

    }

    function afterSubmit(context) {

        
try{

        if (context.type === context.UserEventType.DELETE){
            log.debug('context.type', context.type); 
            return;
        }   

        log.debug('context.type', context.type); 
       
       
                
            var assembly_build = context.newRecord;
            var assembly_build_Id = assembly_build.id;
              
            
            var woId = assembly_build.getValue({
                fieldId: 'createdfrom'
            });
        
      
            var tranText = assembly_build.getText({
                fieldId: 'createdfrom'
            });
        
            if(!tranText){
                return;
            }

            var binnumbers = assembly_build.getValue({
                fieldId: 'binnumbers'
            });

            var binnumbersArray = ""
            
            if(binnumbers.indexOf('(') > -1){

                binnumbersArray = binnumbers.split("(");

            }else{

                binnumbersArray =   binnumbers.split(",");

            }
            
            log.debug('binnumbers', binnumbersArray[0]);
   
            //ensure we have a work order associated with the assemblybuild
            if(tranText.indexOf('Work Order') > -1){

                var wofieldLookUp = search.lookupFields({
                    type: search.Type.TRANSACTION,
                    id: woId,
                    columns: ['createdfrom']
                });  

                if(!wofieldLookUp.createdfrom[0].text){
                    return;
                }
               
              //check if we have a sale sorder with the work order
              if(wofieldLookUp.createdfrom[0].text.indexOf('Sales Order') > -1)  {

                log.debug('binnumbersArray[0] v 2', binnumbersArray[0]);
                var binid = getBinId(binnumbersArray[0]);
                log.debug('binid', JSON.stringify(binid));
                

                log.debug('wofieldLookUp', JSON.stringify(wofieldLookUp));
                  
                var soRecord = record.load({
                    type: record.Type.SALES_ORDER, 
                    id: wofieldLookUp.createdfrom[0].value,
                    isDynamic: false,
                });

                    //find the line item with the wo order id
                    var lineNumber = soRecord.findSublistLineWithValue({
                        sublistId: 'item',
                        fieldId: 'woid',
                        value: woId
                    });

                    log.debug('line number', JSON.stringify(lineNumber));

                    log.debug('binid', JSON.stringify(binid));

                    soRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_mto_bin',
                        line: parseInt(lineNumber),
                        value: binid
                    });	

                    try{

                soRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
            }catch(e){

                log.error(error.name, JSON.stringify(e));
            }

               //set assembly build bin on line of sales order


              }
              
            }
            
        } catch (e) {
        
        } 
        

    }

    return {
      //  beforeLoad: beforeLoad,
      //  beforeSubmit: beforeSubmit,
       afterSubmit: afterSubmit
    };
    
});
