var APBSUtilityFieldMap = (function () {
    return {
        INTERNAL_ID: 'customrecord_APBSUtilityfieldmap',
        FieldName: {
            RECORD_TYPE: 'custrecord_fc_sfm_recordtype',
            FIELD_INTERNAL_ID: 'custrecord_fc_sfm_fieldinternalid',
            SF_RECORD_TYPE: 'custrecord_fc_sfm_sfrecordtype',
            SF_FIELD_INTERNAL_ID: 'custrecord_fc_sfm_sffieldinternalid'
        },
        getById: APBSUtilityBaseType.getById,
        getAll: APBSUtilityBaseType.getAll,
        getObject: APBSUtilityBaseType.getObject,
        getSearchColumns: APBSUtilityBaseType.getSearchColumns,
        upsert: APBSUtilityBaseType.upsert,
        remove: APBSUtilityBaseType.remove,
        getByNsSfType: function (nsRecordType, sfRecordType) {
            var fils = [ new nlobjSearchFilter(this.FieldName.RECORD_TYPE, null, 'is', nsRecordType),
                new nlobjSearchFilter(this.FieldName.SF_RECORD_TYPE, null, 'is', sfRecordType) ];
            return this.getAll(fils);
        },
        /**
         * Gets Mapped Sales Force Record type by NetSuite Record type
         * @param nsRecordType
         * @returns {*}
         */
        getMappedSfType: function (nsRecordType) {
            var filters = [ new nlobjSearchFilter(this.FieldName.RECORD_TYPE, null, 'is', nsRecordType)];
            var record = this.getAll(filters);

            if (!!record && record.length > 0) {
                return record[0][this.FieldName.SF_RECORD_TYPE];
            }

            return null;
        }
    };
})();
