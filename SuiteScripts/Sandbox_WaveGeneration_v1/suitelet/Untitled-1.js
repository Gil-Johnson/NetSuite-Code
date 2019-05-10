COMMON = (function () {
    return {
        SCRIPT: {
            CL_PRINT_BOM_FOR_PORTLET: 'customscript_printbom_cl_tim',
            CL_PRINT_FUNCTIONALITY_FOR_SUITELET: 'customscript_bom_print_function_cl_tim',
            SL_PRINT_BOM_SCRIPT: 'customscript_printbom_sl_tim',
            SL_PRINT_BOM_SCRIPT_DEPLOY: 'customdeploy_printbom_sl_deploy_tim'
        },

        FormField: {
            warehouseField: 'custpage_selectwarehouse',
            endDateField: 'custpage_selectenddate',
            isPostback: 'custpage_ispostback',
            pageNumber: 'custpage_pagenumber',
            productId: 'custpage_productid'
        },
        
        SUBLIST: {
            CUSTOMER_SOS: {
                INTERNAL_ID : 'custpage_printsublist',
                TITLE : 'Select BOM',
                ColumnFieldName : {
                    CHKBOX_BOM_SELECT: 'custselectbom',
                    TEXT_END_DATE_ID: 'bomenddate',
                    VALUE_PRODUCT_TYPE: 'bomprodtypevalue',
                    TEXT_PRODUCT_TYPE: 'bomprodtype',
                    TEXT_PRODUCT_COUNT: 'bomproductcount',
                    TEXT_PRODUCT_QTY: 'bomproductquantity',

                    TEXT_WORK_ORDER: 'bomworkorder',
                    TEXT_COMMENTS: 'bomworkordercomments'
                }
            }
        },

        SAVED_SEARCH: {
            WORK_ORDERS_TO_PRINT: 'customsearch_wo_to_print_tim',
            WORK_ORDERS_TO_PRINT_DETAIL: 'customsearch_wo_to_print_tim_detail'
        },

        //netsuiteUrl: "https://system.sandbox.netsuite.com",
        netsuiteUrl: "https://3500213.app.netsuite.com",

        //bundleUrl: "https://system.sandbox.netsuite.com/c.3500213/suitebundle707073/",
        bundleUrl: "https://3500213.app.netsuite.com/c.3500213/suitebundle707073/",
        dependencies: {
            xdrJs: "Common/xdr.js"
        },

        //For SandBox Folder Id is
        //PDF_CABINET_FOLDER_ID: 297270,
        PDF_CABINET_FOLDER_ID: 380330,

        //PDF_CABINET_FOLDER: "https://system.sandbox.netsuite.com/c.3500213/suitebundle707073/PdfFolder/",
        PDF_CABINET_FOLDER: "https://3500213.app.netsuite.com/c.3500213/suitebundle707073//PdfFolder/",

        PDF_FORM_TEMPLATE_ID: 185,

        //IMG_AJAX_LOADER: "https://system.sandbox.netsuite.com/c.3500213/suitebundle707073/Common/img/ajax-loader-large.gif",
        IMG_AJAX_LOADER: "https://3500213.app.netsuite.com/c.3500213/suitebundle707073//Common/img/ajax-loader-large.gif",

        BTN_SUBMITTER_ID: 'submitter',
        INLINEHTML_INLINE_SCRIPT_ID: 'custpage_myscript',
        SELECT_SELECTED_PAGE_ID: 'selectedpage',
        SERVER_COMMANDS_ID: 'server_commands'
    };
})();