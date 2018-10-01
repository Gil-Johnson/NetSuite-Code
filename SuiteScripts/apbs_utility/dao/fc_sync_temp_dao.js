var APBSUtilityTemp = (function() {
	return {
		INTERNAL_ID: 'customrecord_APBSUtilitytemp',
		FieldName: {
			RECORD_TYPE: 'custrecord_fc_st_recordtype',
			INTERNAL_ID: 'custrecord_fc_st_internalid',
			IDS: 'custrecord_fc_st_ids'
		},
		getById: APBSUtilityBaseType.getById,
		getAll: APBSUtilityBaseType.getAll,
		getObject: APBSUtilityBaseType.getObject,
		getSearchColumns: APBSUtilityBaseType.getSearchColumns,
		upsert: APBSUtilityBaseType.upsert,
		remove: APBSUtilityBaseType.remove
	};
})();