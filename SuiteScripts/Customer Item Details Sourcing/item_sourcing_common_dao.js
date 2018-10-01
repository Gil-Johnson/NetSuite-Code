COMMON = (function() {
    return {
        // trancsaction body fields
        
        SALE_HOLD_FIELD_ID:'custbody_onhold',
        CUSTOMER_CAT_ID:'custbody_custcat',
        TOTAL_EST_COMM_ID:'custbody_totalestcomm',
        TOTAL_EST_LEG_RYLTY_ID:'custbody_totalestleaguerlty',
        TOTAL_LINEITEMS_ID:'custbody_total_li',
        PREVIOUS_CUSTOMER_ID:'custbody_previouscustomer',
        COMMISSION_PERCENT_ID:'custbody_comlvl',
        
        TOTAL_SALES_VALUE_ID:'custbody_totalvalue',

        TO_BE_SPLIT: 'custbody_to_be_split',
        MESSAGE: 'custbody_message',

        // work order fields
        
        WO_DESCRIPTION_ID:'custbody_description',
        WO_UPC_CODE_ID:'custbody_upccode',
        WO_RETAIL_PRICE_ID:'custbody_retailprice',
        WO_CASE_PACK_ID:'custbody_casepack',
        WO_INNER_PACK_ID:'custbody_innerpack',
        WO_SKU_ID:'custbody_sku',
        
        // trancsaction columns fields
        
        HDN_COMM_PERCENT_ID:'custcol_commpercent',
        SPECIAL_PACKING_ID:'custcol_specialpackaging',
        REQ_REPROCESS_ID:'custcol_requiresreprocessing',
        RYLTY_HDN_PERCENT_ID:'custcol_royaltypercent',
        CASE_PACK_ID:'custcol_cspk',
        INNER_PACK_ID:'custcol_inpk',
        RETAIL_PRICE_ID:'custcol_rtlprc',
        UPC_ID:'custcol_upccode',
        CUSTOMER_SKU_ID:'custcol_custsku',
        
        SKU_ITEM_ID:'custcol_sku_item',
        
        ITEM_RATE_ID:'custcol_itemrate',
        
        // item fields
        
        TOTAL_DIST_RYLTY_ID:'custitem_totaldisrlty',
        TOTAL_NON_DIST_RYLTY_ID:'custitem_totalnondistrlty',
        DEFAULT_CUSTOMERSKU_ID:'custitem_custsku',
        DEFAULT_INNERPACK_ID:'custitem_inpk',
        DEFAULT_CASEPACK_ID:'custitem_cspk',
        DEFAULT_RETAILPRICE_ID:'custitem_rtlprc',
        
        // customer fields
        
        DEFAULT_SOFORM_ID:'custentity_defaultsalesorderform',
        CUST_HOLD_FIELD_ID:'custentity_onhold',
        CUST_CREDIT_LIMIT_ID:'custentity_credlim',
        CUST_COMMISSION_PERCENT:'custentity_comlvl',
        CUSTOMTER_ON_HOLD_ID:{
            AUTO:'1',
            ON:'2',
            OFF:'3'
        }
    };
})();
