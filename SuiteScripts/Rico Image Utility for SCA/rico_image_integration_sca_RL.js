/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/file'],
/**
 * @param {record} record
 */
function(record, search, file) {
	
	  
    function doPost(requestBody) {   	 
    	
    //	log.debug('made it in', JSON.stringify(requestBody));
    	
    //	var request = JSON.parse(requestBody);
 
    	var error = 'Sucessfuly Created file'; 
    	log.debug('requestBody', requestBody);
    	log.debug('requestBody', requestBody.filename);
    	log.debug('requestBody', requestBody.filecontents);
    	
    //	return;
    	
    	
    	try{
    	
    		var fileObj = file.create({
    		    name: requestBody.filename,
    		    fileType: file.Type.PNGIMAGE,
    		    contents: requestBody.filecontents,
    		//    description: 'This is a plain text file.',
    		//    encoding: file.Encoding.UTF8,
    		    folder: 4812899,
    		    isOnline: true
    		});
    		
    	//	fileObj.folder = 3103739;
            var id = fileObj.save();
    
    	
    	
    	}catch(e){
    		log.debug('error', JSON.stringify(e));  
    		error = JSON.stringify(e);
    	}
    	
    	return error;
    	
    	    	

    }

   

    return {
   //     'get': doGet,
   //     put: doPut,
        post: doPost,
   //     'delete': doDelete
    };
    
});
