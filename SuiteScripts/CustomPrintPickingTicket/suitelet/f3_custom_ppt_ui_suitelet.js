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
            return "SuiteScripts/CustomPrintPickingTicket/assets/template.html";
        },

        getDependencyFileIds: function() {
            // v2.2
            var fileIds = [
                1498486, // bootstrap-datepicker3.min.css
                1498480, // ui.jqgrid-bootstrap.css
                1498477, // f3.ppt.css
                1498478, // f3.ppt.min.css

                1498495, // jquery-1.11.0.min.js
                1498494, // jquery.jqGrid.min.js
                1498493, // grid.locale-en.js

                1498511, // fiber.min.js
                1498512, // underscore-min.js
                1498496, // jstorage.js

                1498488, // f3.init.js
                1498492, // f3.ui-manager.js
                1498487, // f3.data-manager.js
                1498490, // f3.state-manager.js
                1498491, // f3.tooltip-manager.js

                1498489, // f3.ppt.min.js
                1498486, // bootstrap-datepicker.min.js
                1498498 // typeahead.jquery.min.js

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

                var suiteletScriptId = 'customscript_custom_ppt_api_suitelet';
                var suiteletDeploymentId = 'customdeploy_custom_ppt_api_suitelet';
                var apiSuiteletUrl = nlapiResolveURL('SUITELET', suiteletScriptId, suiteletDeploymentId, false);

                var data = nlapiLoadFile(this.getFileUrl());

                var getMediaTimer = F3.Util.StopWatch.start('foldersDAL.getMedia();');
                var foldersDAL = new FoldersDAL();

                /*
                var folderId = 733707;
                var filesInfo = foldersDAL.getMediaFilesByFolderId(folderId);
                */
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

                    F3.Util.Utility.logDebug('fileInfo.name', fileInfo.name);
                    F3.Util.Utility.logDebug('fileInfo.url', fileInfo.url);
                }

                var standaloneClass = (standalone ? 'page-standalone' : 'page-inline');

                indexPageValue = indexPageValue.replace('{{ type }}', this.type);
                indexPageValue = indexPageValue.replace('{{ title }}', this.title);
                indexPageValue = indexPageValue.replace('{{ apiSuiteletUrl }}', apiSuiteletUrl);
                indexPageValue = indexPageValue.replace(/{{ standaloneClass }}/gi, standaloneClass);

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
            this.title = 'Custom Print Picking Ticket in Bulk';
            this.type = 'PPT';
            this.main(request, response);
        }
    }
});


/**
 * This is the main entry point for F3_PPT_UI_Suitelet suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function F3PPTUISuiteletMain(request, response) {
    return new PPTUISuitelet(request, response);
}
