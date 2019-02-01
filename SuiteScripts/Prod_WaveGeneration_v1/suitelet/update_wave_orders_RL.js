/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/record', 'N/error', 'N/search'],
    function(record, error, search) {

        function _get(restletBody){

            log.debug('get data', 'passed authenication');
            log.debug('post data', JSON.stringify(restletBody));

            var orders  = restletBody.orders;
            var wave_rec_id = restletBody.waveid;

            var orderFilters = orders.split(",");

            for ( var x = 0; x < orderFilters.length; x++ ) {

                record.submitFields({
                    type: record.Type.SALES_ORDER,
                    id: orderFilters[x],
                    values: {
                        custbody_current_wave: wave_rec_id,
                        custbody_cleared_wave: wave_rec_id,
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                }); 

            }


            record.submitFields({
                type: 'customrecord_wave',
                id: wave_rec_id,
                values: {
                    custrecord_orders_marked: true,
                    custrecord_wave_status: 2
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            }); 

        };
     
    
        return {
            get: _get,
          //  delete: _delete,
         //   post: post,
           // put: put
        };
    });