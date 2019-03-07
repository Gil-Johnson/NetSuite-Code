/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error', 'N/search'],
    function(record, error, search) {
        function doValidation(args, argNames, methodName) {
            for (var i = 0; i < args.length; i++)
                if (!args[i] && args[i] !== 0)
                    throw error.create({
                        name: 'MISSING_REQ_ARG',
                        message: 'Missing a required argument: [' + argNames[i] + '] for method: ' + methodName
                    });
        }

        function put(restletBody) {
            
         try{
            var datain = restletBody;
            

            log.debug('put data', JSON.stringify(datain));


            var itemFulfillment = record.load({
                type: record.Type.ITEM_FULFILLMENT, 
                id: parseInt(datain.internalid),
                isDynamic: false,  
            });

            var numLines = itemFulfillment.getLineCount({
                sublistId: 'item'
            });	 

    
          
          for (var i = 0; i <= numLines-1; i++) {
              
           itemFulfillment.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_fulfillment_line_status',
                        line: parseInt(i),
                        value: parseInt(1)
            });	

              
          }

    
    
        //save record
                   try{ 

                   itemFulfillment.save({
                        enableSourcing : false,
                        ignoreMandatoryFields : true
                    });

                 
                }catch(e){

                        log.error('error while saving vendor', JSON.stringify(e));
                }
        
                  
            }catch(e){
					
                log.error('error in put', JSON.stringify(e));
                return e;
            }

                return datain;
        }
        return {
          //  get: _get,
          //  delete: _delete,
          //  post: post,
            put: put
        };
    });