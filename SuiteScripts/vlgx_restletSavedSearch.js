var SEARCHMODULE;
 
/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 *@NModuleScope Public
 */
define(['N/search'], runRestlet);
 
//********************** MAIN FUNCTION **********************
/*
This Restlet has a singular use - accept an internal ID of a NetSuite saved search
and run it, printing the results into a JSON object in the format of
				{data: [array of JSON object made up of saved search rows]}

This fetches the results 1000 records per page of the given saved search. The internal script ID needs to be recorded
and set within the customer's configuration settings

The GET parameters that this restlet will accept are as follows:
searchId
option

The above two parameters can have multiple instances (which result in an array of those two parameters) to allow for multiple saved searches to be used and futureproofing options. To utilize multiple saved searches, it is required that the searches have a common column between them (IE - both have itemID or bomID) in order to combine them. Adding an option parameter of 'removeCommonKey' will result in that column being pruned from the results before they are returned and ultimately end up in a CSV import file.

Currently available options(case insensitive):
-deleteCommonKey
-start_1		*The number after the underscore is variable
-numPages_2		*The number after the underscore is variable

netsuiteSearches.csv searchId examples
-Use one saved search (normal case): 88
-Use two saved searches (advanced boms): 88&89
-Use two saved searches and remove the shared key: 88&89|deleteCommonKey

To break a saved search down into smaller chunks to avoid a timeout, the start_ and numPages_ parameters can be utilized
-The below two lines are an example of breaking a saved search call into two pages (NOTE: this will break usage with using multiple saved searches!)
--88|start_1&numPages_2
--88|start_2&numPages_2
*/
function runRestlet(search){
	SEARCHMODULE = search;
    
	var returnObj = {};
    	returnObj.get = doGet;
    	returnObj.post = doPost;
    	returnObj.put = doPut;
	returnObj.delete = doDelete;
	return returnObj;
}
 
function doGet(restletBody){
    log.debug("GET Params", restletBody);
	
	var options = [];
	if(Array.isArray(restletBody.option)){
		options = restletBody.option;
	}else{
		if(restletBody.option != null){
			options.push(restletBody.option);
		}
	}
	
	var searchIds = [];
	if(Array.isArray(restletBody.searchId)){
		searchIds = restletBody.searchId;
	}else{
		if(restletBody.searchId != null){
			searchIds.push(restletBody.searchId);
		}		
	}

	var results;

	//Possible options
	var deleteCommonKey = false;
  	var start = 0;
  	var numPages = 0;
	if(options.length > 0){
		for(var opt in options){
			if(options[opt].toUpperCase() == "deleteCommonKey".toUpperCase()){
				deleteCommonKey = true;
			}else if(options[opt].substr(0, 5) == "start"){
              	start = options[opt].split("_")[1];
            }else if(options[opt].substr(0, 8) == "numPages"){
              	numPages = options[opt].split("_")[1];
            }
		}
	}

	if(searchIds.length > 1){
		var before = new Date().getTime();
		results = combineManySearches(searchIds, deleteCommonKey);
		var after = new Date().getTime();
		log.debug('Time elapsed', after - before);
	}else{
		results = readSearch(searchIds, start, numPages);
	}
	
	
	log.debug('Total output rows', results.length);
  	var returnJson = {"data":results};
    	return returnJson;
}

//If a commonKey is not found between searches then the result will default to an empty array
function combineManySearches(searchIdArray, deleteCommonKey){
	var combinedResults = readSearch(searchIdArray[0], -1, -1);
	
	for(var i = 0; i < searchIdArray.length - 1; i++){
		combinedResults = combineSearches2(combinedResults, readSearch(searchIdArray[i + 1], -1, -1), deleteCommonKey);
	}
	
	return combinedResults;
}

function combineSearches(searchOne, searchTwo, deleteCommonKey){
	var commonKey = findCommonKey(searchOne, searchTwo);
	if(commonKey == null){
		return [];
	}
	var results = [];

	for(var i = 0; i < searchOne.length; i++){
		var s1 = searchOne[i];
		for(var x = 0; x < searchTwo.length; x++){
			var s2 = searchTwo[x];
			if(s1[commonKey] == s2[commonKey]){
				var result = {};
				for(var key in s2){
					result[key] = s2[key] 
				}
				for(var key in s1){
					result[key] = s1[key] 
				}
				if(deleteCommonKey){
					delete result[commonKey];
				}
				results.push(result);
			}
		}
	}
	
	return results;
}

//Not sure if this is faster than 'combineSearches' or the other way around, so keeping it for now
function combineSearches2(searchOne, searchTwo, deleteCommonKey){
	var commonKey = findCommonKey(searchOne, searchTwo);
	if(commonKey == null){
		return [];
	}
  	
	var results = [];
	var mapOne = makeMap(searchOne, commonKey);
	var mapTwo = makeMap(searchTwo, commonKey);	

	for(var key in mapOne){
		var arrayOne = mapOne[key];
		var arrayTwo = mapTwo[key];

		for(var x = 0; x < arrayOne.length; x++){
			for(var y = 0; y < arrayTwo.length; y++){
				var comboObj = {};
				for(var key in arrayOne[x]) comboObj[key] = arrayOne[x][key];
				for(var key in arrayTwo[y]) comboObj[key] = arrayTwo[y][key];
				if(deleteCommonKey){
					delete comboObj[commonKey];
				}
				results.push(comboObj);
			}
		}
	}
	return results;
}

function findCommonKey(searchOne, searchTwo){
	var commonKey = "No common key found";
	for(var key in searchOne[0]){
		for(var key2 in searchTwo[0]){
			if(key == key2){
				log.debug('Matching key', key);
				commonKey = key;
				return commonKey;
			}
		}
	}
}

function makeMap(searchResult, commonKey){
	var map = [];
	for(var i = 0; i < searchResult.length; i++){
		var s1 = searchResult[i];
		if(map[s1[commonKey]] == null){
			map[s1[commonKey]] = [];
		}
		map[s1[commonKey]].push(s1);
	}
	return map;
}

function readSearch(searchId, start, numPages){
	var startPage = 0;
	start = start - 1;
	
	if(start == null || numPages == null){
		start = 0;
		numPages = 0;
    }
	
	var mySearch = SEARCHMODULE.load({
		id: searchId
	});
	var resultSet = mySearch.runPaged({
		pageSize: 1000
	});
	
	if(numPages > 0 && resultSet.pageRanges.length >= numPages){
		numPages = resultSet.pageRanges.length / numPages;
		startPage = start * numPages;
	}
	
	try{
		//This catches the exception that arises when a saved search gives no results
		//Result: output an empty array within the "data" JSON property
		var pageResults = resultSet.fetch({
			index: startPage
		});	
	}catch(ex){
		return [];
	}
  
  	var pageRows = pageResults.data;
	var resultArray = [];
  	
  	for(var i = 0; i < resultSet.pageRanges.length; i++){
		readPage(pageRows, resultArray);
		if(!pageResults.isLast){
			pageResults = pageResults.next();
			pageRows = pageResults.data;  
		}
      	if(numPages > 0 && i >= numPages - 1){
        	break;
      	}
	}
	return resultArray;
}

function readPage(pageRows, jsonOutput){
  	for (var i = 0; i < pageRows.length; i++) {
	      	var jsonObj = {};
	      	for(var x = 0; x < pageRows[i].columns.length; x++){
			var columnLabel = pageRows[i].columns[x].label;
			var columnData = pageRows[i].getText(pageRows[i].columns[x]);
			if(columnData == null){
			  columnData = pageRows[i].getValue(pageRows[i].columns[x]);
			}
		  	jsonObj[columnLabel] = columnData;
		}
      	jsonOutput.push(jsonObj);
    }
}
 
function doPost(restletBody){
    log.debug('Called from POST', restletBody);
    return "Hello from POST.\nData received:\n" + JSON.stringify(restletBody);
}
 
function doPut(restletBody){
    log.debug('Called from PUT', restletBody);
    return "Hello from PUT.\nData received:\n" + JSON.stringify(restletBody);
}
 
function doDelete(restletBody){
    log.debug('Called from DELETE', restletBody);
    return "Hello from DELETE.\nData received:\n" + JSON.stringify(restletBody);
}
