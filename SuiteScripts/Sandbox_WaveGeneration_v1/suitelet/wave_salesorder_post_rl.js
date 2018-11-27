/**
 * @NApiVersion 2.x
 * @NScriptType restlet
 */
define([ 'N/record' ], function(record) {
   return {
      post : function(restletBody) {
         var restletData = restletBody.data;
         for (var orders in restletData) {
		           
        	 log.debug('orders', orders);
        	 log.debug('waveid', restletData.waveid);
         }
      }
   }
});