var APBSUtilityRecordsOut = (function() {
	return {
		INTERNAL_ID: 'customrecord_APBSUtilityrecords_out',
		FieldName: {
			RECORD_TYPE: 'custrecord_fc_sro_recordtype',
			INTERNAL_ID: 'custrecord_fc_sro_internalid',
			JSON: 'custrecord_fc_sro_recordjson',
			STATUS: 'custrecord_fc_sro_status',
			REQUESTED_BY: 'custrecord_fc_sro_requestedby',
			REQUESTED_AT: 'custrecord_fc_sro_requestedat'
		},
		Status: {
		    "New" : "1",
		    "InProcess" : "2",
		    "Completed" : "3",
		    "Failed" : "4"
		},
		getById: APBSUtilityBaseType.getById,
		getAll: APBSUtilityBaseType.getAll,
		getByStatus: function(status) {
			return this.getAll([new nlobjSearchFilter(this.FieldName.STATUS, null, 'is', status)]);
		},
		getObject: APBSUtilityBaseType.getObject,
		getSearchColumns: APBSUtilityBaseType.getSearchColumns,
		upsert: APBSUtilityBaseType.upsert,
		remove: APBSUtilityBaseType.remove
	};
})();
