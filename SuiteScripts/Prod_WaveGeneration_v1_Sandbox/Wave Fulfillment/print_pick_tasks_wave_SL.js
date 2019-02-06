/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 
 */
define(['N/search',
    'N/record',
    'N/render'
],
function (Search,
    Record,
    Render
) {
    // eslint-disable-line func-names

    'use strict';

    function getResultsAndParse(waveid) {
        var jsonObj = {};
        
        // Contract Info
        waveRecord = Search.lookupFields({
            type: 'customrecord_wave',
            id: Math.abs(waveid),
            columns: [
                'name',
            ]
        });

        var today = new Date();
        waveRecordJsonObj = {
            wavename: waveRecord.name,
            pickRecords: []
        };

        // Claims Info
        pickRecordSearch = Search.create({
            type: 'customrecord_pick_task',
            columns: [
                {
                    name: 'custitem_primarybin',
                    join: 'custrecord_pick_task_item'
                },
                'custrecord_pick_task_item',
                'custrecord_wave_pick_quantity',
            ],
            filters: [
            {
                name: 'custrecord_pick_task_wave',
                operator: Search.Operator.IS,
                values: waveid
            }]
        });

        pickRecordSearch.run().each(function claimResults(pick) {
            waveRecordJsonObj.pickRecords.push({
                primarybin: pick.getValue('custitem_primarybin', 'custrecord_pick_task_item'),
                item: pick.getValue('custrecord_pick_task_item'),
                qty: pick.getValue('custrecord_wave_pick_quantity')
            });

            return true;
        });

        jsonObj.waveRecord = waveRecordJsonObj;

        return jsonObj;
    }

    function renderRecordToPdfWithTemplate(context, jsonObj) {

        log.debug('in pdf function', jsonObj);
        var renderer = Render.create();
        renderer.setTemplateByScriptId('CUSTTMPL_113_3500213_SB1_286');
        renderer.addCustomDataSource({
            format: Render.DataSource.OBJECT,
            alias: 'waverecord',
            data: jsonObj.waveRecord
        });

        context.response.addHeader({
            name: 'Content-Type',
            value: 'application/pdf'
        });
        context.response.addHeader({
            name: 'Content-Disposition',
            value: 'inline'
        });
        context.response.addHeader({
            name: 'Content-Disposition',
            value: 'filename="Rico - ID: ' + jsonObj.waveRecord.wavename + ' - PickItems.pdf"'
        });

        renderer.renderPdfToResponse(context.response);
    }

    function generateContractPDF(context) {
        var request = context.request;
        var waveid = request.parameters.waveid;
        log.debug('wave id', waveid);
        var jsonObj = getResultsAndParse(parseInt(waveid));
        log.debug('jsonObj', jsonObj);
        renderRecordToPdfWithTemplate(context, jsonObj);
    }


    return {
        onRequest: generateContractPDF
    };
});