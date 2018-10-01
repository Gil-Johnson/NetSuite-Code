COMMON = (function(){
    return {
        SCRIPT:{
            SU_RELEASE_CUSTOMER_ON_HOLD_ID: 'customscript_rel_cust_order_su',
            SU_DEPLOYMENT_RELEASE_CUSTOMER_ON_HOLD_ID: 'customdeploy_rel_cust_order_su_dep',
            CL_RELEASE_CUSTOMER_ORDER_ID: 'customscript_rel_cust_order_cl',
            CL_RELEASE_CUSTOMER_ORDER_SO_ID: 'customscript_rel_cust_order_so_cl',
            CL_RELEASE_CUSTOMER_ON_HOLD_FORM_PORTLET_ID: 'customscript_rel_cust_order_portlet_cl',
            SU_CUSTOMER_DASHBOARD_SO_ON_HOLD_ID: 'customscript_rel_cust_dashboard_su',
            SU_DEPLOYMENT_CUSTOMER_DASHBOARD_SO_ON_HOLD_ID: 'customdeploy_rel_cust_dashboard_su_dep',
            SS_RELEASE_ALL_ON_HOLD_SOS_ID: 'customscript_rel_all_onhold_sos_sch',
            SS_DEPLOYMENT_RELEASE_ALL_ON_HOLD_SOS_ID: 'customdeploy_rel_all_onhold_sos_sch_dep'
        },
        
        SUBLIST:{
            ON_HOLD_ENTERIES:{
                INTERNAL_ID : 'onholdsoenteries',
                TITLE : 'Customers',
                ColumnFieldName : {
                    CHKBOX_CUSTOMER_SELECT_ID: 'custselectoption',
                    TEXT_CUST_CUSTOMER_NAME_ID: 'custname',
                    TEXT_TOTAL_ONHOLD_SOS_ID: 'totalsos',
                    TEXT_TOTAL_ONHOLD_SOS_AMOUNT_ID: 'totalamount',
                    TEXT_CUST_CUSTOMERID_ID: 'customerid',
                    TEXT_SHIP_DATE_ID: 'shipdate'
                }
            },
            CUSTOMER_SOS:{
                INTERNAL_ID : 'customersos',
                TITLE : 'Sales Orders',
                ColumnFieldName : {
                    CHKBOX_CUSTOMER_SELECT_SOS_ID: 'custselectso',
                    URL_CUSTOMER_SO_VIEW_ID: 'customerview',
                    URL_CUSTOMER_DASHBOARD_ID: 'customerdashboard',
                    TEXT_SO_CUSTOMER_NAME_ID: 'customername',
                    TEXT_SO_SHIP_DATE_ID: 'soshipdate',
                    TEXT_SO_NUMBER_ID: 'sonumber',
                    TEXT_SO_PO_NUMBER_ID: 'soponumber',
                    TEXT_SO_TOTAL_ID: 'sototal',
                    TEXT_SO_ON_HOLD_ID: 'soonhold',
                    TEXT_SO_ID: 'soid',
                    // for customer dashboard
                    TEXT_SO_TRAN_DATE_ID: 'sotrandate'
                }
            }
        },
        
        PORTLET : {
            REL_CUST_ONHOLD_FORM:{
                TITLE: "Release Customer SO's On Hold"
            },
            REL_CUST_DASHBOARD_ONHOLD_FORM:{
                TITLE: "Release Customer SO's On Hold - Customer Dashboard"
            }
        },
        //PORTLET_TITLE: "Release Customer SO's On Hold",
        
        // form portlet cl
        BTN_SECONDARY_SUBMITTER_ID: 'secondarysubmitter',
        
        // Customers List
        CHKBOX_PAGE_REQUEST_ID: 'ispagereq', 
        
        INLINEHTML_INLINE_SCRIPT_ID: 'custpage_myscript',
        SELECT_SELECTED_CUSTOMER_PAGE_ID: 'selectedcustomerpage',
        TEXT_TOTAL_FOUND_ID: 'totalfound',
        TEXT_CUSTPAGE_HIDDEN_ID: 'cuspage_hidden',
        
        BTN_SUBMITTER_ID: 'submitter',
        SERVER_COMMANDS_ID: 'server_commands',
        
        // frameElement.id
        
        // SOs List
        CHKBOX_IS_SO_REQUEST_ID: 'issoereq',
        TEXT_SO_CUSTOMERID_ID: 'custid',
        TEXT_CUSTOMER_ON_HOLD_SOS_ID: 'custonholdsos',// where????
        
        SELECT_SELECTED_SO_PAGE_ID: 'selectedsopage',
        TEXT_CUSTOMER_TOTAL_ON_HOLD_SOS_ID: 'custtotalsos',
        
        // customer dashboard url
        CUSTOMER_DASHBOARD_URL_ID: '/app/center/card.nl?sc=-69&entityid=',


        SALES_ORDER:{
            FieldName:{
                CHKBOX_ON_HOLD_ID: 'custbody_onhold',
                CHKBOX_RELEASE_FROM_HOLD_ID: 'custbody_relfromhold'
            }
        },
        
        SAVED_SEARCH:{
            SYSTEM_ORDERS_ON_HOLD_ID:'customsearch_sublistordersonhold_2',
            SYSTEM_ORDERS_ON_HOLD_CUSTOMER_DASHBOARD_ID:'customsearch_sublistordersonhold_2_2'
            //SYSTEM_ORDERS_ON_HOLD_CUSTOMER_DASHBOARD_ID:'customsearch_sublistordersonhold_2_2_2'
        },
        
        // hidden field for scheduled script
        CHKBOX_RELEASE_ALL_ID: 'releaseallchkbx',
        CHKBOX_RELEASE_ALL_CUST_DASHBOARD_ID: 'releaseallcustdashchkbx',
        BTN_RELEASE_ALL_ID: 'custpage_relallsos',
        
        TO_BE_RELEASED_ID: 'custentity_tobereleased',
        
        // customer dashboard
        // url parameter
        CUSTOMER_ID: 'customerid'
    };
})();