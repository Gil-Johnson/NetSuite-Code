function userEventBeforeLoad(type, form, request) {
	if (type == 'view') {
		var id = nlapiGetFieldValue('id');
		form.addButton('custpage_btnCreateWO', 'Create WO',
						'window.open(\'/app/site/hosting/scriptlet.nl?script=customscript_createwo_su&deploy=customdeploy_createwo_su&poid='
						+ id + '\');');
	}
}
