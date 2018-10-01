/**

 * @NApiVersion 2.x

 * @NScriptType Restlet

 * @NModuleScope SameAccount

 */

define(['N/record','N/search'],
function(record, search) {
function doGet(context) {   
       log.debug("logged in");
       return 'True';
       
}   

return {
        'get': doGet,
};

});