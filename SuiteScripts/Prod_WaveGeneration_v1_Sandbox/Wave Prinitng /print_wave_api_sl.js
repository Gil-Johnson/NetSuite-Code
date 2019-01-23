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
    	
    		 var waveid = context.request.parameters.waveid;    	
			 var printType = context.request.parameters.printtype;
			 var pdfToUse = "";
			 
			 if(printType == 'kanban'){
				  var pdfToUse = 3326952
			 }
				
			 try{
				var template = file.load({
					id: pdfToUse
				})

			}catch(e){

				log.debug('error loading file', JSON.stringify(e));
			}

				var renderer = render.create();
	
				renderer.templateContent = template.getContents();

				log.debug("template.getContents()", template.getContents());

				// var dataSource = {};
				
				// pageRenderer.addCustomDataSource({
				// 	format: render.DataSource.OBJECT,
				// 	alias: "ds",
				// 	data: dataSource
				// });
				
				var pdfFile = renderer.renderAsPdf();
			 
			    log.debug("finished creating pdf file");
			 
			  // pdfFile.name = "inventory_sales_sheet_" + today + '.pdf';
			 
		 		
		 //   context.response.renderPdf(pdfFile);
		      context.response.writeFile(pdfFile, true);
		    
           }catch(e){
				 
				 log.debug('error', JSON.stringify(e));
			 }
			
    	 }

    }



    return {
        onRequest: onRequest
    };
    
});
