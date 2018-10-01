var WsmUtilityF3WSSiteCategoriesList = (function () {
    return {
        INTERNAL_ID: 'customrecord_f3ws_site_categories',
        FieldName: {
            RECORD_ID: 'custrecord_f3ws_site_categories_id',
            RECORD_NAME: 'custrecord_f3ws_site_categories_name',
            RECORD_PARENT_ID: 'custrecord_f3ws_site_categories_parentid',
            RECORD_IMAGE: 'custrecord_f3ws_site_categories_image',
            RECORD_THUMB: 'custrecord_f3ws_site_categories_thumb'
        },
        getById: WsmUtilityBaseType.getById,
        getAll: WsmUtilityBaseType.getAll,
        getObject: WsmUtilityBaseType.getObject,
        getSearchColumns: WsmUtilityBaseType.getSearchColumns,
        upsert: WsmUtilityBaseType.upsert,
        remove: WsmUtilityBaseType.remove
    };
})();