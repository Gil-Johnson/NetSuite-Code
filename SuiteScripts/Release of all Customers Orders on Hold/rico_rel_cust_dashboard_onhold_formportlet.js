function releaseCustOnHoldSOForm(portlet, column, entityId){
    var url = nlapiResolveURL('SUITELET', COMMON.SCRIPT.SU_CUSTOMER_DASHBOARD_SO_ON_HOLD_ID, COMMON.SCRIPT.SU_DEPLOYMENT_CUSTOMER_DASHBOARD_SO_ON_HOLD_ID);
    url += '&' + COMMON.CUSTOMER_ID + '=' + entityId;
    url = url + '&popup=F';
    url = url + '&ifrmcntnr=T';
    var html = '<iframe id="snavPortlet" style="height: 250px; width: 99%" frameborder="0" src="' + url + '"></iframe>';

    portlet.setTitle(COMMON.PORTLET.REL_CUST_DASHBOARD_ONHOLD_FORM.TITLE);

    portlet.setHtml(html);
}