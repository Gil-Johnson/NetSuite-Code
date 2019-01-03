/**
 * Created by zshaikh on 8/27/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * F3_PPT_UI_Suitelet class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */

var F3BaseUISuitelet = Fiber.extend(function () {
    return {

        title: '',
        type: '',

        // The `init` method serves as the constructor.
        init: function() {
        },


        /**
         * Description of method getFileUrl
         * @param parameter
         */
        getFileUrl: function () {
            return "SuiteScripts/Prod_WaveGeneration_v1/assets/template.html";
        },

        getDependencyFileIds: function() {
            // v2.2
            var fileIds = [
                3326912, // bootstrap-datepicker3.min.css
                3326908, // ui.jqgrid-bootstrap.css
                3326909, // f3.ppt.css
                3326911, // f3.ppt.min.css

                3326914, // jquery-1.11.0.min.js
                3326920, // jquery.jqGrid.min.js
                3326917, // grid.locale-en.js

                3326939, // fiber.min.js
                3326938, // underscore-min.js
                3326923, // jstorage.js

                3326924, // f3.init.js
                3326922, // f3.ui-manager.js
                3326918, // f3.data-manager.js
                3326921, // f3.state-manager.js
                3326919, // f3.tooltip-manager.js

                3326913, // f3.ppt.min.js
                3326926, // bootstrap-datepicker.min.js
                3326915 // typeahead.jquery.min.js
            ];

            return fileIds;
        },

        /**
         * Get request method
         * @param request
         * @param response
         */
        getMethod: function (request, response) {
            try {
                var getMethodTimer = F3.Util.StopWatch.start('F3_PPT_UI_Suitelet.getMethod();');
                var standaloneParam = request.getParameter('standalone');
                var standalone = standaloneParam == 'T' || standaloneParam == '1';
                
                var location = nlapiGetLocation();
                var user = nlapiGetUser();
                F3.Util.Utility.logDebug('location', location);

                var suiteletScriptId = 'customscriptwp__ppt_api_suitelet';
                var suiteletDeploymentId = 'customdeploywp_ppt_api_suitele';
                var apiSuiteletUrl = nlapiResolveURL('SUITELET', suiteletScriptId, suiteletDeploymentId, false);

                var data = nlapiLoadFile(this.getFileUrl());

                var getMediaTimer = F3.Util.StopWatch.start('foldersDAL.getMedia();');
                var foldersDAL = new FoldersDAL();
                var fileIds = this.getDependencyFileIds();
                var filesInfo = foldersDAL.getMedia(fileIds);
                getMediaTimer.stop();

                /* index.html */
                var indexPageValue = data.getValue();

                var templateData = {
                    resources: {}
                };

                for (var i in filesInfo) {
                    var fileInfo = filesInfo[i];
                    indexPageValue = indexPageValue.replace('{{ ' + fileInfo.name + ' }}', fileInfo.url);
                    
                 //   nlapiLogExecution('DEBUG', 'file names', 'file url: ' + fileInfo.url);
                }

                var standaloneClass = (standalone ? 'page-standalone' : 'page-inline');

                indexPageValue = indexPageValue.replace('{{ type }}', this.type);
                indexPageValue = indexPageValue.replace('{{ title }}', this.title);
                indexPageValue = indexPageValue.replace('{{ apiSuiteletUrl }}', apiSuiteletUrl);
                indexPageValue = indexPageValue.replace(/{{ standaloneClass }}/gi, standaloneClass);
                indexPageValue = indexPageValue.replace('{{ location }}', location);
                indexPageValue = indexPageValue.replace('{{ user }}', user);

                F3.Util.Utility.logDebug('indexPageValue', indexPageValue);
                F3.Util.Utility.logDebug('filesInfo', JSON.stringify(templateData));


                if (standalone === true) {
                    response.write(indexPageValue);
                }
                else {
                    var form = nlapiCreateForm(this.title);
                    var htmlField = form.addField('inlinehtml', 'inlinehtml', '');
                    htmlField.setDefaultValue(indexPageValue);
                    response.writePage(form);
                }


                getMethodTimer.stop();
            } catch (e) {
                F3.Util.Utility.logException('getMethod()', e);
                throw e;
            }
        },

        /**
         * main method
         */
        main: function (request, response) {

            this.getMethod(request, response);

        }
    };
});


var PPTUISuitelet = F3BaseUISuitelet .extend(function(base){
    return {
        init: function(request, response) {
            this.base = Fiber.proxy(base, this);
            this.base.init();
            this.title = 'Wave Generation Page';
            this.type = 'PPT';
            this.main(request, response);
        }
    }
});


var OrderReviewUISuitelet = F3BaseUISuitelet .extend(function(base) {
    return {
        init: function (request, response) {
            this.base = Fiber.proxy(base, this);
            this.base.init();
            this.title = 'Order Review Form';
            this.type = 'OrderReview';
            this.main(request, response);
        }
    }
});


/**
 * This is the main entry point for F3_PPT_UI_Suitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function WaveProcessingSuiteletMain(request, response) {
    return new PPTUISuitelet(request, response);
}


/**
 * This is the main entry point for F3_PPT_UI_Suitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function F3OrderReviewUISuiteletMain(request, response) {
    return new OrderReviewUISuitelet(request, response);
}