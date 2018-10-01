/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function main(request, response) {

 nlapiLogExecution("DEBUG", "main called", "");

    var output = "<span style='color:#e51937'>Some error occurred while associating your PO #, please contact: 1-855-608-4618 for customer support.</span>";
    try {
        var confirmationNum = request.getParameter("soNum");
        var poNum = request.getParameter("poNum");
        var custId = request.getParameter("custId");
        var shipDate = request.getParameter("shipDate");
        var comments = request.getParameter("comments");
        var cancelDate = request.getParameter("cancelDate");

        if (!!confirmationNum && !!poNum && !!custId && !!shipDate) {
            var so = nlapiSearchRecord("salesorder", null, [new nlobjSearchFilter("entity", null, "is", custId), new nlobjSearchFilter("memo", null, "is", confirmationNum)]);
            if (!!so && so.length > 0) {

                var customer = nlapiLoadRecord("customer", custId),
                customForm = null;
                if (!!customer) {
                    customForm = customer.getFieldValue("custentity_defaultsalesorderform");
                }

                var nextSo = nlapiSearchRecord("salesorder", null, [new nlobjSearchFilter("entity", null, "is", custId), new nlobjSearchFilter("memo", null, "is", "web_" + so[0].getId())]);

                //If this order is not splitted for multiple warehouses
                var isSplitOrder = !!nextSo && nextSo.length > 0;
                nlapiLogExecution("DEBUG", "isSplitOrder", isSplitOrder);

                if (!isSplitOrder) {
                    nextSo = so;
                }

                nextSo.forEach(function (newSo) {
                    nlapiLogExecution("DEBUG", "child so", newSo.getId());
                    nlapiSubmitField("salesorder", newSo.getId(), "otherrefnum", poNum);
                    nlapiSubmitField("salesorder", newSo.getId(), "memo", confirmationNum);
                    nlapiSubmitField("salesorder", newSo.getId(), "shipdate", shipDate);
                    nlapiSubmitField("salesorder", newSo.getId(), "orderstatus", "A"); //A => Pending Approval
                    nlapiSubmitField("salesorder", newSo.getId(), "paymentmethod", null); //Remove credit card details

                    if (!!comments) {
                        var existingComments = nlapiLookupField("salesorder", newSo.getId(), "custbody_ptcmnt")
                            nlapiSubmitField("salesorder", newSo.getId(), "custbody_ptcmnt", existingComments + "\r\n\r\n***Web Store Comment***\r\n" + unescape(comments));
                    }
                    if (!!cancelDate) {
                        nlapiSubmitField("salesorder", newSo.getId(), "custbody_cncldate", cancelDate);
                    }

                    if (!!customForm) {
                        nlapiSubmitField("salesorder", newSo.getId(), "customform", customForm);
                    }
                });
                nlapiLogExecution("DEBUG", "parentSo", so[0].getId());
                if (isSplitOrder) {
                    nlapiDeleteRecord("salesorder", so[0].getId());
                }
                output = "";
            }
        }

    } catch (e) {
        //output = e.name + ", " + e.message;
        nlapiLogExecution("ERROR", e.name, e.message);
    }
    response.write(output);
}
