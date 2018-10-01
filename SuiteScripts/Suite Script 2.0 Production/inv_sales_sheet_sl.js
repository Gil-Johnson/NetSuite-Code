/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/format', 'N/record', 'N/ui/serverWidget', 'N/search', '/SuiteScripts - Globals/moment', 'N/error', 'N/runtime', 'N/render', 'N/xml', 'N/https'],
/**
 * @param {file} file
 * @param {format} format
 * @param {record} record
 * @param {serverWidget} serverWidget
 */
function(file, format, record, ui, search, moment, error, runtime, render, xml, https) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
function onRequest(context) {
    	
    	 if (context.request.method === 'GET') {      		 
    		 
    	    		 
    		 try{
    	
    		 var teamName = context.request.parameters.teamtxt;    	
    		 var prodTypetxt = context.request.parameters.prodtypetxt;
    		 
    		 
    		 var itemIds = context.request.parameters.items;
    		 
    		 var itemFilters = itemIds.split(",");
    		 
    		 log.debug("itemIds", itemFilters.length);
//    		 log.debug("teamid", teamid);
   		     log.debug("teamtxt", teamName);
//    		 log.debug("prodTypeid", prodTypeid);   	
   		     log.debug("prodTypetxt", prodTypetxt); 
    		 
		//	 log.debug('team_name', team_name);
		//	 return;
			 
			 var mySearch = search.load({
                 id: 'customsearch4668',
              });
			 
			 if(itemFilters){				 
	    		 mySearch.filters.push(search.createFilter({
	    			 name: 'internalid',
	                 operator: 'ANYOF',
	                 values: itemFilters
	             }));  
				 }
			 
					 
			var body = "<table>";
			 
		//	 var body = "<div>";
			
			var searchResult = mySearch.run().getRange({
			    start: 0,
			    end: 300
			    });
	//testing perfromance		
	  var startTime = new Date().getTime();
	  
	  log.debug('entering search');
			
	  for (var i = 0; i < searchResult.length; i++) {
    			
		 //     log.debug('i',  i);
		       var lastResult = false;
		       var numLastResult = parseInt(searchResult.length) - parseInt(i);
		       
		       if(numLastResult == 1){		    	   
		    	   lastResult = true;
		    	   }  
		    		  		  
		       var name = searchResult[i].getValue({
 		            name: 'itemid'
 		        });
		       
		       var nameEscaped = xml.escape({
				      xmlText : name 
				    });
 		        
		       
 		        var upccode = searchResult[i].getValue({
 		            name: 'upccode'
 		        });
 		        if(!upccode){
 		        	upccode = "";
 		           }
 		        
 		       var quantityavailable = searchResult[i].getValue({
		            name: 'custitem_invfeednumber'
		        });
 		       if(!quantityavailable){
 		    	  quantityavailable = "";
 		       }
 		       
 		      var leadTime = searchResult[i].getValue({
		            name: 'custitem_itemcommittime'
		        });
 		      if(!leadTime){
 		    	 leadTime = "";
 		      }
 		      
 		     var salesDes = searchResult[i].getValue({
		            name: 'salesdescription'
		        });
 		    var salesDesEscaped = "";
 		    
 		    if(salesDes){
 		        salesDesEscaped = xml.escape({
			      xmlText : salesDes  
			    });
 		    }
 		    
 		    
 		   var nextRecDate = searchResult[i].getValue({
	            name: 'custitem_nextrcptdate'
		        });
 		   
		    var nextRecDateEscaped = "";
		    
		    if(nextRecDate){
		    	nextRecDateEscaped = xml.escape({
			      xmlText : nextRecDate  
			    });
		    }
		   
 		        		       
	       var highResImage = searchResult[i].getValue({
	            name: 'custitem_image1'  //custitem_image1  //custitemthumbnail_image //custitem_highresimage
	        });
	       
	        if(!highResImage){
 		    	   
 		    	  highResImage = 'http://shopping.netsuite.com/core/media/media.nl?id=2905368&c=3500213&h=a68b151ce82e9483348b';
 		    	   
 		       }
 		       
	     //custitemthumbnail_image  custitem_highresimage
	       var imgLink = xml.escape({
		      xmlText : highResImage  
		    });		       
 		  	      		  		       
 		       
 		  if(i % 2 == 0 && lastResult == true){
 			  
 			 // log.debug('i % 2 == 0 && lastResult == true', i);
 			body += "<tr>"+
		    	"<td><img src=' " + imgLink + " \' height='89' width='120'> </img></td>" + 
			    " <td><b>Name:</b>"+nameEscaped+"<br></br><b>UPC:</b>"+upccode+"<br></br><b>Qty Aval:</b>"+quantityavailable+"<br></br><b>Est. Build Time:</b>"+leadTime+"days<br></br><b>Next Receipt Date:</b>"+nextRecDateEscaped+"<br></br><br></br>"+salesDesEscaped+"</td>" +
			    "</tr>";
		    	
 		   }else if(i % 2 == 0){  			 
 	
 			body += "<tr >"+
		    	"<td><img src='" + imgLink + " \' height='89' width='120'> </img> </td>" + 
			    "<td> <b>Name:</b> " + nameEscaped + "<br></br> <b>UPC:</b> " + upccode + "<br></br> <b>Qty Aval:</b> " + quantityavailable + " <br></br> <b>Est. Build Time: </b>" + leadTime + " days  <br></br><b>Next Receipt Date:</b>"+nextRecDateEscaped+"<br></br><br></br>" + salesDesEscaped + "</td>" ;
		    	
     	  }else{	
 		//	 log.debug('is an odd number', i);
 	            body +=  "<td><img src='" + imgLink + " \' height='89' width='120'> </img> </td> " + 
			    "<td> <b>Name:</b> " + nameEscaped + "<br></br> <b>UPC:</b> " + upccode + "<br></br> <b>Qty Aval:</b> " + quantityavailable + " <br></br> <b>Est. Build Time: </b>" + leadTime + " days  <br></br><b>Next Receipt Date:</b>"+nextRecDateEscaped+"<br></br><br></br>" + salesDesEscaped + "</td>" +
 			    "</tr>";
 	            
 		      }  			        
 		     
 		// log.debug('i',  i);
 		        
 		 };			
 		 
 		
 		 log.debug("entering pdf generator code.");
    	 	
 		 var endTime = new Date().getTime();
 		 log.debug('search time', (endTime - startTime) + "ms");
 		  
   			body += "</table>" ;
   			
   		//	var globalVar = /\s/g;

   		//	body = body.replaceAll(globalVar,"X");
   			
   			log.debug("char length", body.length);
      		 
 	//	   body += "</div>" ; 
    	//	 log.debug(' body',  body);
    	//	 return;
			 
    	//	 var newItemTbl = xml.escape({
		//		    xmlText : body
		//	 });	
   			if(!teamName){
   				
   				teamName = prodTypetxt;
   			}
    	     var today = moment().format('MM/DD/YYYY');
    	  	     
			 var xmlStr = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                 + "<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n"
                 + "<pdf lang=\"ru-RU\" xml:lang=\"ru-RU\">\n" + "<head>\n"
                 + "<link name=\"russianfont\" type=\"font\" subtype=\"opentype\" "
                 + "src=\"NetSuiteFonts/verdana.ttf\" " + "src-bold=\"NetSuiteFonts/verdanab.ttf\" "
                 + "src-italic=\"NetSuiteFonts/verdanai.ttf\" " + "src-bolditalic=\"NetSuiteFonts/verdanabi.ttf\" "
                 + "bytes=\"2\"/>\n" 
                 +  "<style>\n"
                 +  "table {width:100%; align:center; padding-top: 18px; }\n"  
                 +  "td {border-bottom:thick solid black; align:center; line-height:120%}\n" 
                 + "img {height:110; width:100}\n"
                 +  "</style>>\n"
                 + "<macrolist>\n"
                 +	"<macro id=\"myheader\">\n"
                 +   "<table width=\"100%\" font-size=\"14\"> <tr>\n"
                 +     "<td align=\"left\">  <img alt=\"Rico Inc\" src=\"http://shopping.netsuite.com/core/media/media.nl?id=2614770&amp;c=3500213&amp;h=6f574de01367d3b3235d\" style=\"width: 140px; height: 110px;\"> </img> </td>\n"
                 +	   "<td align=\"right\"> <b>Sales Inventory Report for:</b>  " + today + "</td> \n"
                 +   "</tr>\n"
                 +   "<tr> <td line-height=\"130%\" align=\"left\" colspan=\"2\" background-color=\"black\" color=\"white\"><b> PRODUCT INVENTORY AND IMAGES </b>\n"
                 +   "</td> </tr>\n"
                 +  "</table>\n"        
                 +  "</macro>\n"
                 +	"<macro id=\"myfooter\">\n"
                 +	"<p font-size=\"12\" align=\"right\">\n"
                 +	"Page <pagenumber/> of <totalpages/>\n"
                 +  "</p>\n"
                 +  "</macro>\n"               
                 +  "</macrolist>\n" 
                 + "<style>\n"
                 + "td{letter-spacing: normal;}\n"
                 + "</style>\n"
                 + "</head>\n"
                 + "<body header=\"myheader\" header-height=\"42mm\" footer=\"myfooter\" footer-height=\"15mm\" font-family=\"Helvetica\" font-size=\"11\">" + body  + "</body>\n" + "</pdf>";
			 	
			
			 log.debug("finished xml string.");
			 
			 var startTime1 = new Date().getTime();
			 
			
			 var pdfFile = render.xmlToPdf({
	                xmlString: xmlStr
	            });
			 
			 
			 log.debug("finished creating pdf file");
			 
		//	 var renderer = render.create();
	//		 renderer.templateContent = xmlStr;			 
	//		 var newfile = renderer.renderAsPdf();	
			 
	//		 newfile.name = teamName + "_" + today + '.pdf';
			 
			// pdfFile.name = teamName + "_" + today + '.pdf';
			 
			 
			 pdfFile.name = "inventory_sales_sheet_" + today + '.pdf';
			 
			 var endTime1 = new Date().getTime();
	 		 log.debug('create file time', (endTime1 - startTime1) + "ms");
		 		
		    context.response.writeFile(pdfFile);
		    
           }catch(e){
				 
				 log.debug('error', JSON.stringify(e));
			 }
			
    	 }

    }

   

    return {
        onRequest: onRequest
    };
    
});
