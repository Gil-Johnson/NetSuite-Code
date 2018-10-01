/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/format','N/xml'],
/**
 * @param {record} record
 */
function(record, search, format, xml) {
   
    /**
     * Function called upon sending a GET request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.1
     */
    function doGet(requestParams) {
    	
    	items = [];
    	
    	var mySearch = search.load({
            id: 'customsearch4668',
         });
    	
    	var searchResult = mySearch.run().getRange({
		    start: 0,
		    end: 100
		    });
    	
  	  for (var i = 0; i < searchResult.length; i++) {
			
	        		  
	       var name = searchResult[i].getValue({
	            name: 'itemid'
	        });
	       
	       var nameEscaped = xml.escape({
			      xmlText : name 
			    });
	        
	        var upccode = searchResult[i].getValue({
	            name: 'upccode'
	        });
	        
	       var quantityavailable = searchResult[i].getValue({
	            name: 'quantityavailable'
	        });
	       
	      var leadTime = searchResult[i].getValue({
	            name: 'custitem_itemcommittime'
	        });
	      
	     var salesDes = searchResult[i].getValue({
	            name: 'salesdescription'
	        });
	     
	      var salesDesEscaped = xml.escape({
		      xmlText : salesDes  
		    });
	   
	        		       
	       var highResImage = searchResult[i].getValue({
	            name: 'custitem_highresimage'
	        });
	     //custitemthumbnail_image  custitem_highresimage
	       var imgLink = xml.escape({
		      xmlText : highResImage  
		    });  		       
	  
			 items.push([{itemid:nameEscaped,upccode:upccode,quantityavailable:quantityavailable,leadTime:leadTime,salesDes:salesDesEscaped,highResImage:imgLink}]);         
	        
	 };	
	 
	  var itemsOnPDF = JSON.stringify(items);
	  
	  
	  return itemsOnPDF;
	 
	 

    }

    /**
     * Function called upon sending a PUT request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPut(requestBody) {

    }


    /**
     * Function called upon sending a POST request to the RESTlet.
     *
     * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
     * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doPost(requestBody) {

    }

    /**
     * Function called upon sending a DELETE request to the RESTlet.
     *
     * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
     * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
     * @since 2015.2
     */
    function doDelete(requestParams) {

    }

    return {
        'get': doGet,
        put: doPut,
        post: doPost,
        'delete': doDelete
    };
    
});
