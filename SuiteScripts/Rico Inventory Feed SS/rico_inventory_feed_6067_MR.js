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
  	  
    function getInputData() {
       	
    	return {
    		
    		type: 'search',
    		id: 6067
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
    	
    //	log.debug('item id', item.id);
    //	log.debug('rec type', item.recordType);
    	log.debug('item id', item.values['GROUP(internalid)'].value);
    	log.debug('new feed value', item.values['MIN(formulanumeric)']);
    	
    	
   // 	var nsType = getNSType(item.values.type.value);
    	
    	try{
    	
    	var itemRecord = record.load({
		    type: record.Type.ASSEMBLY_ITEM, 
		    id: item.values['GROUP(internalid)'].value,
		    isDynamic: false,
		});
    	
    	}catch(e){
    		
    		JSON.stringify(e);
    	}
    	
    	itemRecord.setValue({
    		fieldId:'custitem_invfeednumber',
    		value: item.values['MIN(formulanumeric)'],
    		ignoreFieldChange: true
    	});
    	  
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
