/**
 * Created by ubaig on 11/9/2014.
 * A general purpose constants file to be used as a common point for constants or hard code values
 * -
 * Referenced By:
 * -
 * -
 * -
 * Dependencies:
 * -
 * -
 * -
 * -
 */

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        for (var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    };
}

var netsuiteBaseUrl = nlapiGetContext().environment === 'PRODUCTION' ? "https://system.na1.netsuite.com" : "https://system.sandbox.netsuite.com";

var WotpUtilityCommon = {
    Strings: {
        Title: "Work Order Tracking Project",
        ScriptStart: "<script type='text/javascript' src='",
        ScriptEnd: "'></script>"
    },
    CustomLists : {
        Operations: 'customlist_opseq' //'customrecord_operations_seq'
    },
    CurrentOperations: {
        None: '@NONE@'
    },
    BundleInfo: {
        Id: "suitebundle" + nlapiGetContext().getSetting('SCRIPT', 'custscript_wotp_utility_bundle_id')
    },
    FileIds: {
        MainHtml: 'wotp_utility_html.html'
    },
    ApiUrls: {
        WotpUtilityApiUrl: netsuiteBaseUrl + nlapiResolveURL('SUITELET', 'customscript_wotp_utility_api', 'customdeploy_wotp_utility_api')
    },
    Suitelets: {
        Main: {
            Id: "customscript_wotp_utility_suitelet_sl",
            DeploymentId: "customdeploy_wotp_utility_suitelet_sl"
        },
        Api: {
            Id: 'customscript_wotp_utility_api',
            DeploymentId: 'customdeploy_wotp_utility_api'
        }
    },
    Buttons : {
        SubmitterId : "submitter"
    },
    ClientScripts: {
        SuiteletClientScript: {
            Id: "customscript_wotp_utility_clientscript"
        },
        CliendScriptFcMapping3: {
            Id: "customscript_fc_mapping_cs_3"
        }
    },
    Fields: {
        WorkOrderTrackingSearchId: 'custrecord_ssearch'
    },
    SavedSearches: {
        MainWorkOrderSearch: 'customsearch1784',
        DetailWorkOrderSearch: 'customsearch1804',
        EmployeeSavedSearchId: 'customsearch_wotp_emp_ssearch'
    },
    Records: {
        CustomRecordWotp: 'customrecord_wotp_emp_ssearch'
    },
    getFileUrl: function () {
        try {
            var bundleId = WotpUtilityCommon.BundleInfo.Id;
            nlapiLogExecution('DEBUG', 'value of bundleId', bundleId);
            if (!bundleId || bundleId.length <= 0 || bundleId.toString() === 'suitebundlenull' || bundleId === 'suitebundle9090') {
                return "SuiteScripts/wotp_utility/";
            } else {
                return "SuiteBundles/Bundle " + bundleId.replace('suitebundle', '') + '/';
            }
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during main getFileUrl', e.toString());
        }
    },
    /**
     * Gets Fixed hard coded values for Operations
     * @returns {string}
     */
    getFixedOperations: function() {
        return '<span class="main-operations" ><option value=\'\'>- None -</option><option value="21">Assembly</option><option value="26">Blister Packing</option><option value="3">Clear Coating</option><option value="36">Complete</option><option value="7">Die Cutting</option><option value="1">Digital Printing</option><option value="33">Embossing (Leather)</option><option value="32">Embossing Prep (Leather)</option><option value="10">Engraving</option><option value="5">Gluing</option><option value="23">Golf Ball Printing</option><option value="6">Guillotine Cutting</option><option value="16">Heat Transfer</option><option value="24">Kentex</option><option value="35">King International</option><option value="4">Laminating</option><option value="17">Metal Processing</option><option value="22">Offset Printing</option><option value="25">Outsourced Printing</option><option value="15">Oven</option><option value="27">Package in Clamshell</option><option value="30">Plastic Die-Cut State Sign</option><option value="28">Plotter Cut</option><option value="11">Processing</option><option value="29">Purchase in Order in Place</option><option value="18">Screen Prep</option><option value="2">Screen Printing</option><option value="20">Sewing</option><option value="34">Shipped to Niles</option><option value="9">Shrink Wrap</option><option value="12">Sonic Welding</option><option value="19">Sublimation</option><option value="31">Sublimation Printing</option><option value="14">Transfer Paper Printing</option><option value="8">Weeding</option><option value="13">Zund</option></span>';
    }
}