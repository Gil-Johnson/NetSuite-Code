var SO_SplittingDao = (function() {
    return {
        INTERNAL_ID: 'customrecord_so_splitting',
        FieldName: {
            MAIN_SO_INTERNAL_ID: 'custrecord_main_so_internal_id',
            MAIN_SO_NUMBER: 'custrecord_main_so_number',
            EXECUTION_CONTEXT: 'custrecord_so_splitting_exec_cntxt',
            SO_SPLITTING_STATUS: 'custrecord_so_splitting_status',
            SPLITTED_SO_IDS: 'custrecord_splitted_so_ids',
            SPLITTED_SO_NUMBERS: 'custrecord_splitted_so_numbers',
            SO_SLITTING_ERROR: 'custrecord_so_splitting_error',
            RETRY_ATTEMPTS_REMAINING: 'custrecord_so_splitting_retry_attempts',
            ERROR_JSON: 'custrecord_so_splitting_error_json'
        },
        getById: BaseDao.getById,
        getAll: BaseDao.getAll,
        getByStatus: function(statuses) {
            var filters = [];
            filters.push(new nlobjSearchFilter(this.FieldName.SO_SPLITTING_STATUS, null, 'anyof', statuses));
            return this.getAll(filters);

        },
        getBySOInternalIdAndStatus: function(status, soInternalId) {
            var filters = [];
            filters.push(new nlobjSearchFilter(this.FieldName.MAIN_SO_INTERNAL_ID, null, 'is', soInternalId));
            filters.push(new nlobjSearchFilter(this.FieldName.SO_SPLITTING_STATUS, null, 'is', status));
            return this.getAll(filters);

        },
        getOtherDuplicateRecords: function(status, recordId, soInternalId) {
            var filters = [];
            filters.push(new nlobjSearchFilter('internalid', null, 'noneof', [recordId]));
            filters.push(new nlobjSearchFilter(this.FieldName.MAIN_SO_INTERNAL_ID, null, 'is', soInternalId));
            filters.push(new nlobjSearchFilter(this.FieldName.SO_SPLITTING_STATUS, null, 'is', status));
            return this.getAll(filters);

        },
        getObject: BaseDao.getObject,
        getSearchColumns: BaseDao.getSearchColumns,
        upsert: BaseDao.upsert,
        remove: BaseDao.remove
    };
})();