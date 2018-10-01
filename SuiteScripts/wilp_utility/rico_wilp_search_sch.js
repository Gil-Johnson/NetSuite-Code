/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       03 Feb 2014     Ubaid Baig
 *
 */

var WILP_SCH_Constants = {
    ApiUrls: {
        scanFolders: "http://images.ricoinc.com/webimages/", //URL changed as per Jay's email  "http://images.ricoinc.com/Licensed/Licensed%20Images/WEBIMAGES/",
        rootLink: "http://images.ricoinc.com"
    },
    Setting: {
        LoggingEnabled: false, //Log messages on console
        ShowAssocItem: false, //Show associated items on UI for the selected item,
        ScheduledScriptId : "customscript_rico_wilp_sch",
		ScheduledScriptDeploymentId : "customdeploy_rico_wilp_sch",
        Hours: 63
    },
    SavedSearch: {
        MainProductSearch: "customsearch1459" //"customsearch_wilp_search_test" //customsearch1459
    },
    ImageSearch: {
        ImageFields: //need to see this first, if not found then ignore this.
            ["thumbnail_image",
            "item_display_thumbnail1",
            "item_display_thumbnail2",
            "item_display_thumbnail3",
            "item_display_thumbnail4",
            "item_display_image1",
            "item_display_image2",
            "item_display_image3",
            "item_display_image4",
            "item_high_res_image",
            "item_high_res_image2",
            "item_high_res_image3",
			"item_high_res_image4"],
        FieldsMap: //need to see this first, if not found then ignore this.
        {       "thumbnail_image" : "custitemthumbnail_image",
                "item_display_thumbnail1": "custitem_thumbnail1",
                "item_display_thumbnail2" : "custitemitem_display_thumbnail2",
                "item_display_thumbnail3" : "custitemitem_display_thumbnail3",
                "item_display_thumbnail4" : "custitemitem_display_thumbnail4",
                "item_display_image1" : "custitem_image1",
                "item_display_image2" : "custitemitem_display_image2",
                "item_display_image3" : "custitemitem_display_image3",
                "item_display_image4" : "custitemitem_display_image4",
                "item_high_res_image" : "custitem_highresimage",
                "item_high_res_image2" : "custitemitem_high_res_image2",
                "item_high_res_image3" : "custitemitem_high_res_image3",
				"item_high_res_image4" : "custitemitem_high_res_image4"}

    },
    Param:{
        CustomScriptInternalId: "custscriptinternalid"
    }
};

/**
 * keeps a reference to the links that we have processed
 * @type {Array}
 */
var processedLinks = [];

var globalLinks = {};

/**
 * Folders that we don't need to process
 * @type {string[]}
 */
var foldersToExclude = ['webimages', 'WEBIMAGES', 'Licensed%20Images', 'Process%20Documentation', '[To Parent Directory]', 'Process Documentation', 'NCAA'];

/**
 * Custom Logging method.
 * @param data1
 * @param data2
 * @param data3
 */
function customLogger(data1, data2, data3){
    if (!window.console) {
        nlapiLogExecution(data1, data2, data3);
    }
    else {
        console.log(data1 + ' ' + data2 + ' ' + data3);
    }
}

/**
 * Searches for image in the scanned directories.
 * @param thumbnailImage
 * @returns {boolean}
 */
function searchImage(thumbnailImage) {

    var objectFound = null;

    if (!thumbnailImage || thumbnailImage.length <= 0) {
        return objectFound;
    }

    objectFound = globalLinks[thumbnailImage];

    // if there are no elements make it null
    if (!!objectFound) {

    }
    else {
        objectFound = null;
    }

    return objectFound;
}

/**
 * Create complete image URL.
 * @param urlPart
 * @returns {*}
 */
function getImage(urlPart) {
    return  WILP_SCH_Constants.ApiUrls.rootLink + urlPart;
}

/**
 *
 * @param record
 * @returns {Array}
 */
function performUpdate(record) {

    var recordId = record.getId();

    var imageData = [];

    var fields = record.getAllColumns().filter(function(obj) {
        return WILP_SCH_Constants.ImageSearch.ImageFields.indexOf(obj.getLabel()) > -1;
    });

  //  customLogger('DEBUG', 'fields'  , fields);
    var allImages = true;
    var thumbnailImage = true;
    var lookForCount = 0;
    var foundCount = 0;
    //if we found the thumbnail image, then we will proceed further.
    //search for other image types
    //skip the 0th/first image
    for (var index = 0; index < fields.length; index++) {

        try {        	     	
        	
            var imageValue = record.getValue(fields[index]);            
                      

            var remoteImage = null;

            if (imageValue != null && imageValue.length > 0) {
                lookForCount++;

                remoteImage = searchImage(imageValue);

                if (remoteImage != null && remoteImage.length > 0) {

                    foundCount++;
                    allImages = allImages && true;
                    var inputData = {
                        "fieldName": fields[index].label,
                        "url" : remoteImage
                    };

                    imageData.push(inputData);
                }
                else {
                    //if this was first image i.e. Thumbnail Image, break from here.
                    if (index == 0) {
                        thumbnailImage = false;
                    }
                    break;
                }
            }
        }
        catch(e){
            customLogger('ERROR', 'Id = ' + recordId  , JSON.stringify(e));
        }


    }

    //customLogger('DEBUG', 'Id = ' + recordId + ' , Thumbnail ' + (thumbnailImage ? 'Found' : 'Not Found')  , record.getId());

    //customLogger('DEBUG', 'Id = ' + recordId + ' , All Images ' + (lookForCount == foundCount ? 'Found' : 'Not Found')  , record.getId());

    //customLogger('DEBUG', 'imageData = ', JSON.stringify(imageData));
    
	// thumbnail image was found and there are other images too
    if (thumbnailImage == true && lookForCount > 1  && lookForCount == foundCount) {
        //if we have found all images, only then we will proceed

        var total = imageData.length;
        try {

            //customLogger('DEBUG', 'Loading record', '');
            //we load record based on its type.
            var itemRecord = nlapiLoadRecord(record.getRecordType(), record.getId());

            //customLogger('DEBUG', 'record loaded', '');
            for (var i = 0; i < total; i++) {
                //Lets proceed further now.

                customLogger('DEBUG', 'Id = ' + recordId + ' , Setting Field = ' + imageData[i].fieldName ,'Value = ' + WILP_SCH_Constants.ImageSearch.FieldsMap[imageData[i].fieldName]);
                //Fields Map is used to get the actual name of the item.
                itemRecord.setFieldValue(WILP_SCH_Constants.ImageSearch.FieldsMap[imageData[i].fieldName], getImage(imageData[i].url));
            }

            nlapiSubmitRecord(itemRecord);
            customLogger('DEBUG', 'Id = ' + recordId + ' , Record successfully Saved.'  , record.getId());
        }
        catch(e){
            customLogger('ERROR', 'Error during set/save record Id = ' + recordId , JSON.stringify(e));
        }

    }
    else {
        //customLogger('DEBUG', 'No images found for id = ', record.getId());
        imageData = null;
    }

    return imageData;
}


/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
    customLogger('DEBUG', 'Start', 'Inside SS');
    try {
        var parameter,
            hours,
            threshold = 4,
            paramInternalId,
            ctx = nlapiGetContext();
        customLogger('DEBUG', 'Log', 'Getting parameter');
        parameter = ctx.getSetting('SCRIPT', WILP_SCH_Constants.Param.CustomScriptInternalId);
        customLogger('DEBUG', 'parameter value', parameter);
        if (!!parameter) {
            paramInternalId = parseInt(parameter);
        }

        customLogger('DEBUG', 'Starting Scan', 0);
        //scan the directories
        scanDirectory(null, null);

        return;

        customLogger('DEBUG', 'Ending Scan', 0);
       
        do {

            try {
                // Fetching next 1000 records
                var column = new Array();
                var currentTime = new Date();
                var currentTimeDiff = new Date();
                currentTimeDiff.setHours(currentTime.getHours() - WILP_SCH_Constants.Setting.Hours);

                var filterExpression = [
                    ['internalidnumber', 'greaterthan', (paramInternalId == null) ? 0 : paramInternalId]
                ];

                var records = nlapiSearchRecord(null, WILP_SCH_Constants.SavedSearch.MainProductSearch, filterExpression, null);

                if (records != null) {

                    customLogger('AUDIT', 'Total records fetcheds', records.length);

                    // processing records
                    for (var j = 0; j < records.length; j++) {

                        var id = records[j].getId();
                        //customLogger('Emergency', 'index', j + ' item id = ' + id);

                        if (j == 0) {
                            customLogger('AUDIT', '1st ProductId', id);
                        }

                        if (j >= records.length - 1) {
                            customLogger('AUDIT', 'Last ProductId', id);
                            paramInternalId = id;
                        }

                        var custDetails = {};

                        try {
                            performUpdate(records[j]);
                        }
                        catch (e) {
                            customLogger('DEBUG', 'Error during performUpdate for id =', id);
                        }

                        var usageRemaining = ctx.getRemainingUsage();

                        try {
                            if (usageRemaining <= 900) {
                                var params = new Array();
                                params['custscriptinternalid'] = id;
                                customLogger("Audit", 'Scheduled', id);
                                
                                customLogger('DEBUG', 'scheudled script params', params.toString());
                                nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
                                return false;
                            }
                        }
                        catch (e) {
                            customLogger('ERROR', 'Error during schedule: ' + JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining, id);
                        }

                        //customLogger('Emergency', 'index', j + ' productId  ' + id + ' usageLimt  ' + usageRemaining);
                    }
                }
            }
            catch (e) {
                customLogger('ERROR', 'Error during working: ' + JSON.stringify(e), '');
            }


        } while (records != null);

    }
    catch (e) {
        customLogger('ERROR', 'Error during start: ' + JSON.stringify(e), '');
    }
}


function cleanUrl(finalUrl) {
    if (finalUrl.charAt(finalUrl.length - 1) != '/') {
        finalUrl = finalUrl + '/';
    }
    return finalUrl;
}
/**
 * Scans images for remote server
 * @param jsonRequest
 * @param id
 * @param isMaster
 * @returns {string}
 */
function scanDirectory(jsonRequest, id, urlPart, folderObject) {

    //customLogger('DEBUG', 'inside scan dir', urlPart);

    var finalUrl = WILP_SCH_Constants.ApiUrls.scanFolders + (!!urlPart ? urlPart : '');

    //customLogger('DEBUG', 'inside scan dir starting URL = ', finalUrl);
    var res = null;
/*    try {
        customLogger('DEBUG', 'start cleanUrl', 'start cleanUrl');
        finalUrl = cleanUrl(finalUrl);
        customLogger('DEBUG', 'finalUrl for nlapiRequestURL', finalUrl);
        res = nlapiRequestURL(finalUrl);
        customLogger('DEBUG', 'end nlapiRequestURL', 'end nlapiRequestURL');
    }
    catch(e) {
        customLogger('ERROR', 'error during fetch ', finalUrl);
    }
    */
  
    
    for (var x = 0; x < 4; x++) {
        try {
        	 finalUrl = cleanUrl(finalUrl);
        	 res = nlapiRequestURL(finalUrl);        	 
        	 customLogger('DEBUG', 'GET SUCCEEDED ', 'GET SUCCEEDED ' + finalUrl);           
            break;
        } catch (e) {
           // if (e.name == 'SSS_UNKNOWN_HOST') {
            	customLogger('ERROR','GET FAILED. RETRIES ' + x, 'GET FAILED. RETRIES ' + x);
                continue;
          //  }

        }
    }; 
    
 

    if (res != null) {

        customLogger('DEBUG', 'w inside scan dir url fetched: ', finalUrl);
        var data = res.getBody();
        customLogger('DEBUG', 'res', res);
        customLogger('DEBUG', 'w data', data);
        var allLinks = data.match(/HREF="([^"]*")/g);
        customLogger('DEBUG', 'allLinks.length', allLinks.length);
        var linksLength = allLinks.length;

        for (var i = 0; i < linksLength; i++){

            if (processedLinks.length <= 0) {
                //if this is root item
                processedLinks.push({"root": []});
            }
            customLogger('DEBUG', 'before processLink', finalUrl);
            processLink(allLinks[i], !!folderObject ? folderObject : processedLinks[0]);
            customLogger('DEBUG', 'after processLink', finalUrl);
        }

        allLinks = null;
    }

}

/**
 * Checks if a node is file or folder
 * @param nodeName
 * @returns {boolean}
 */
function isFile(nodeName) {

    return nodeName.indexOf('.') >= 0;
}

/**
 * Gets name from the link
 * @param link
 * @param index
 * @returns {*}
 */
function getName(link, index) {
    return link.split('/')[link.split('/').length - index];
}

/**
 * Clean link and return
 * @param link
 * @returns {XML|string}
 */
function cleanLink(link) {
    return link.replace('HREF=', '').replace('"', '').replace('"', '');
}

/**
 * Processes given link and adds its data to global array
 * @param link
 * @param nodeToUpdate
 */
function processLink(link, nodeToUpdate){

    customLogger('DEBUG', 'inside processLink', '');

    link = cleanLink(link);
    var nodeName = getName(link, 2);

    if (isFile(nodeName) === true){
        //var obj = {};
        globalLinks[getName(link, 1)] = cleanLink(link);
        //globalLinks.push(obj);
    }
    else {

        if (foldersToExclude.indexOf(nodeName) >= 0) {
            //we don't need to process such links
            return;
        }

        var childNode = {};
        childNode[nodeName] = [];

        if (!!nodeToUpdate.root)
            nodeToUpdate.root.push(childNode);
        else
            nodeToUpdate.push(childNode);

        var obj = childNode;

        scanDirectoryInternal('','', nodeName, obj);
    }


}

/**
 * Processes Links
 * @param link
 * @param nodeToUpdate
 */
function processLinkInternal(link, nodeToUpdate){

    link = cleanLink(link);
    //customLogger('DEBUG', 'inside processLink', nodeToUpdate);

    var nodeName = getName(link, 1);

    if (foldersToExclude.indexOf(nodeName) >= 0) {
        //we don't need to process such links
        return;
    }

    if (isFile(nodeName) === true){
        //var obj = {};
        globalLinks[getName(link, 1)] = cleanLink(link);
        //globalLinks.push(obj);
    }
    else {
       //Do nothing!
    }


}

/**
 * Scans directorty
 * @param jsonRequest
 * @param id
 * @param urlPart
 * @param folderObject
 */
function scanDirectoryInternal(jsonRequest, id, urlPart, folderObject) {

    //customLogger('DEBUG', 'inside scan dir', urlPart);

    var finalUrl = WILP_SCH_Constants.ApiUrls.scanFolders + (!!urlPart ? urlPart : '');

    //customLogger('DEBUG', 'inside scan dir starting URL = ', finalUrl);
    var res = null;
    
    
/*    try {
        finalUrl = cleanUrl(finalUrl);

        res = nlapiRequestURL(finalUrl);
    }
    catch(e) {
        customLogger('ERROR', 'error during fetch ', finalUrl);
    }
 */   
    
    for (var x = 0; x < 4; x++) {
        try {
        	
        	 finalUrl = cleanUrl(finalUrl);
        	 res = nlapiRequestURL(finalUrl);        	 
        	 customLogger('DEBUG', 'GET SUCCEEDED ', 'GET SUCCEEDED ' + finalUrl);           
            break;
        } catch (e) {
           // if (e.name == 'SSS_UNKNOWN_HOST') {
            	customLogger('ERROR','GET FAILED. RETRIES ' + x, 'GET FAILED. RETRIES ' + x + 'final URL' + finalUrl);
                continue;
          //  }

        }
    }; 

    if (res != null) {

        //customLogger('DEBUG', 'inside scan dir url fetched: ', finalUrl);
        var data = res.getBody();
        var allLinks = data.match(/HREF="([^"]*")/g);

        //customLogger('DEBUG', 'starting processing links: ', allLinks.length);
        if ( allLinks != null) {
            var linksLength = allLinks.length;
            for (var i = 0; i < linksLength; i++){

                processLinkInternal(allLinks[i],folderObject);
            }
        }
        else {
            customLogger('ERROR', 'No links found under finalUrl = ', finalUrl);
        }

    }

}