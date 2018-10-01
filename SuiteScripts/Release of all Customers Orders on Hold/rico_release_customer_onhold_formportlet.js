function releaseCustOnHoldForm(portlet, column){
    
    // set title of portlet
    portlet.setTitle(COMMON.PORTLET.REL_CUST_ONHOLD_FORM.TITLE);
    // bind client script with form portlet
    portlet.setScript(COMMON.SCRIPT.CL_RELEASE_CUSTOMER_ON_HOLD_FORM_PORTLET_ID);
    // add div on portlet by inlinehtml to increase the height of portlet
    //var fld = portlet.addField('divfield','inlinehtml');
    //fld.setDefaultValue("<div id='divfield_elem' style='height: 300px; width: 32px;'></div>");
    // set suitelet url on form submit button
    var url = nlapiResolveURL('SUITELET', COMMON.SCRIPT.SU_RELEASE_CUSTOMER_ON_HOLD_ID, COMMON.SCRIPT.SU_DEPLOYMENT_RELEASE_CUSTOMER_ON_HOLD_ID);
    portlet.setSubmitButton(url,'Submit');
}