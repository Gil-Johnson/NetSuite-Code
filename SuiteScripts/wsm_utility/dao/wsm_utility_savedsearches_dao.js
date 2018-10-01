var WsmUtilitySavedSearches = (function () {
    return {
        INTERNAL_ID: 'customrecord_IISyncUtilitysavedsearches',
        FieldName: {
            RECORD_TYPE: 'custrecord_fc_sss_recordtype',
            RECORD_INTERNAL_ID: 'custrecord_fc_sss_recordinternalid',
            SAVED_SEARCH: 'custrecord_fc_sss_savedsearch'
        },
        getById: WsmUtilityBaseType.getById,
        getAll: WsmUtilityBaseType.getAll,
        getObject: WsmUtilityBaseType.getObject,
        getSearchColumns: WsmUtilityBaseType.getSearchColumns,
        upsert: WsmUtilityBaseType.upsert,
        remove: WsmUtilityBaseType.remove
    };
})();