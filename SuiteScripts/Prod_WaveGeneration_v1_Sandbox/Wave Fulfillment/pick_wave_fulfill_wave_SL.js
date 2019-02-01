/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 
 CHG0061966 S52 Contract- Loan Activity Report - Off by one month kbn1118
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

    function getResultsAndParse(contractId) {
        var jsonObj = {};
        var contractRecord;
        var claimVoucherSearch;
        var loanPaymentSearch;
        var claimVoucherRecordJsonObj;
        var loanPaymenRecordJsonObj;

        // Contract Info
        contractRecord = Search.lookupFields({
            type: 'customrecord_seco_contract',
            id: contractId,
            columns: [
                'name',
                'custrecord_seco_contract_number',
                'custrecord_seco_contract_vid_payment_id'
            ]
        });

        var today = new Date();
        contractRecordJsonObj = {
            borrower: contractRecord.name,
            loanNum: contractRecord.custrecord_seco_contract_number,
            vendorId: contractRecord.custrecord_seco_contract_vid_payment_id,
            currentDate: (today.getMonth()+1) + '/' + today.getDate() + '/' + today.getFullYear(),  //because getMonth starts at 0 having to add 1 to show the correct month kbn1118
          
            loanActivityResults: []
        };

        // Claims Info
        claimVoucherSearch = Search.create({
            type: 'customrecord_seco_claim_voucher',
            columns: [
                {
                    name: 'custrecord_seco_cv_date_paid',
                    sort: Search.Sort.ASC
                },
                'internalid',
                'custrecord_seco_cv_total_claim_amount',
                'custrecord_seco_vchr_balance',
                'custrecord_seco_vchr_appl_to_interest'
            ],
            filters: [{
                name: 'custrecord_seco_cv_date_paid',
                operator: Search.Operator.ISNOTEMPTY
            },
            {
                name: 'custrecord_seco_claim_contract',
                operator: Search.Operator.IS,
                values: contractId
            }]
        });

        claimVoucherSearch.run().each(function claimResults(claim) {
            contractRecordJsonObj.loanActivityResults.push({
                internalid: claim.getValue('internalid'),
                datePaid: claim.getValue('custrecord_seco_cv_date_paid'),
                amountDisbursed: '$' + formatCurrency(claim.getValue('custrecord_seco_cv_total_claim_amount') || '0.00'),
                amountCollected: '$0.00',
                appliedToPrincipal: '$0.00',
                appliedToInterest: '$' + formatCurrency(claim.getValue('custrecord_seco_vchr_appl_to_interest') || '0.00'),
                currentBalance: '$' + formatCurrency(claim.getValue('custrecord_seco_vchr_balance') || '0.00')
            });

            return true;
        });

        // Loan Payment Info
        loanPaymentSearch = Search.create({
            type: 'customrecord_seco_loan_payment',
            columns: [
                {
                    name: 'custrecord_seco_loan_pmt_date',
                    sort: Search.Sort.ASC
                },
                'internalid',
                'custrecord_seco_loan_pmt_amount',
                'custrecord_seco_loan_pmt_appl_principal',
                'custrecord_seco_loan_pmt_appl_interest',
                'custrecord_seco_loan_pmt_result_balance'
            ],
            filters: [{
                name: 'custrecord_seco_loan_pmt_contract',
                operator: Search.Operator.IS,
                values: contractId
            }]
        });

        loanPaymentSearch.run().each(function paymentResults(payment) {
            contractRecordJsonObj.loanActivityResults.push({
                internalid: payment.getValue('internalid'),
                datePaid: payment.getValue('custrecord_seco_loan_pmt_date'),
                amountDisbursed: '$0.00',
                amountCollected: '$' + formatCurrency(payment.getValue('custrecord_seco_loan_pmt_amount') || '0.00'),
                appliedToPrincipal: '$' + formatCurrency(payment.getValue('custrecord_seco_loan_pmt_appl_principal') || '0.00'),
                appliedToInterest: '$' + formatCurrency(payment.getValue('custrecord_seco_loan_pmt_appl_interest') || '0.00'),
                currentBalance: '$' + formatCurrency(payment.getValue('custrecord_seco_loan_pmt_result_balance') || '0.00')
            });

            return true;
        });

        // Sort each row by date
        contractRecordJsonObj.loanActivityResults.sort(function(a, b) {
            var aDatePaid = new Date(a.datePaid);
            var bDatePaid = new Date(b.datePaid);
            var comparator = aDatePaid - bDatePaid;

            if (comparator === 0) {
                return a.internalid - b.internalid;
            }

            return comparator;
        });

        jsonObj.contractRecord = contractRecordJsonObj;

        return jsonObj;
    }

    function renderRecordToPdfWithTemplate(context, jsonObj) {
        var renderer = Render.create();
        renderer.setTemplateByScriptId('CUSTTMPL_SECO_LOAN_REPORT');
        renderer.addCustomDataSource({
            format: Render.DataSource.OBJECT,
            alias: 'contract',
            data: jsonObj.contractRecord
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
            value: 'filename="SECO - ID: ' + jsonObj.contractRecord.borrower + ' - LoanActivityStatusReport.pdf"'
        });

        renderer.renderPdfToResponse(context.response);
    }

    function generateContractPDF(context) {
        var request = context.request;
        var contractId = request.parameters.contractId;
        var jsonObj = getResultsAndParse(contractId);
        renderRecordToPdfWithTemplate(context, jsonObj);
    }

    function formatCurrency(number) {
        return parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    }

    return {
        onRequest: generateContractPDF
    };
});