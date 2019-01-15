/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
	
	  function getNSType(ns_type){
			
			if(ns_type == 'Assembly'){
				  ns_type= record.Type.ASSEMBLY_ITEM;			   
			   }
			   else if(ns_type == 'InvtPart'){
				 ns_type = record.Type.INVENTORY_ITEM;
			   }
			   else if (ns_type == 'Kit'){		      			   
				 ns_type = record.Type.KIT_ITEM;		      			   
			   }
			  else if (ns_type == 'NonInvtPart'){		      			   
				ns_type = record.Type.NON_INVENTORY_ITEM;		      			   
			   } 
			
			return ns_type;
			
		}
	  
	  
    function getInputData() {
    	return {
    		type: 'search',
    		id: 6839
    	}

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	log.debug('data' , context.value);
    	var item = JSON.parse(context.value);
    //	log.debug('values', item.id);
    	
    	
   // 	var nsType = getNSType(item.values.type.value);
    	
    	try{
    	
            var itemRecord = record.load({
                type: item.recordType, //record.Type.ASSEMBLY_ITEM, 
                id: parseInt(item.id),
                isDynamic: false,
            });
    	
    	}catch(e){
    		
    		JSON.stringify(e);
    	}
    	
    
        var numLines = itemRecord.getLineCount({
            sublistId: 'itemimages'
        });	 

        log.debug('numLines', numLines);

        if(numLines == 0){

            itemRecord.setValue({
                fieldId:'custitem_missing_sca_image',
                value: 2,
                ignoreFieldChange: true
            });

        }else{

            itemRecord.setValue({
                fieldId:'custitem_missing_sca_image',
                value: 1,
                ignoreFieldChange: true
            });


        }
    	 
    	 // no = 1    yes =2   storedisplayimage
       

         var recordId = itemRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
         });
    	   
    	   
    	
    
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
        var type = summary.toString();
        log.audit(type + ' Usage Consumed', summary.usage);
        log.audit(type + ' Concurrency Number ', summary.concurrency);
        log.audit(type + ' Number of Yields', summary.yields);
      
        var contents = '';
        summary.output.iterator().each(function(key, value) {
            contents += (key + ' ' + value + '\n');
            return true;
        });

    }

    return {
        getInputData: getInputData,
        map: map,
    //    reduce: reduce,
        summarize: summarize
    };
    
});