var APBSUtilityCustomList = function(internalId) {
	return {
		INTERNAL_ID: internalId,
		FieldName: {
			NAME: 'name'
		},
		getAll: APBSUtilityBaseType.getAll,
		getObject: APBSUtilityBaseType.getObject,
		getSearchColumns: APBSUtilityBaseType.getSearchColumns
	};
};

var APBSUtilityLists = (function() {
	return {
		STATUS: APBSUtilityCustomList('customlist_APBSUtilitystatus')
	};
})();