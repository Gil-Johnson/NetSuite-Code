var data = JSON.parse('[{"value":"","text":""},{"value":"-119","text":"Ink & Toner"},{"value":"-157","text":"Knowledge Base"},{"value":"-148","text":"More Options"},{"value":"153","text":"PHOTOGRAPHY : Camcorders"},{"value":"138","text":"PHOTOGRAPHY : Digital Cameras"},{"value":"-114","text":"Sales"},{"value":"-117","text":"Technology"},{"value":"157","text":"Technology : Camcorders"},{"value":"155","text":"Technology : Cameras"},{"value":"143","text":"Technology : Fax/All-In-One Machines"},{"value":"98","text":"Technology : Phones"},{"value":"-101","text":"Welcome to Honeycomb Manufacturing"}]');

for (var i = 0; i < data.length; i++) {
	var info = data[i];
	if (info.text.indexOf(':') <= -1) {
		var rec = nlapiCreateRecord('customrecord_f3ws_site_categories', {recordmode : 'dynamic'});
		if (info.text.length > 0 && info.value.length > 0) {
			rec.setFieldValue('custrecord_f3ws_site_categories_name', info.text);
			rec.setFieldValue('custrecord_f3ws_site_categories_id', info.value);
			var savedRecord = nlapiSubmitRecord(rec);
		}
	}
}

for (var i = 0; i < data.length; i++) {
	var info = data[i];
	if (info.text.indexOf(':') > -1) {
		var parts = info.text.split(':');
		var parentName = parts[0].trim();
		console.log(parentName);
		var x = data.filter(function(o) {return o.text == parentName;});
		console.log(x);
		if (!!x && x.length > 0) {
			var parentId = x[0].value;
			console.log(parentId);
			for (var j = 1; j < parts.length; j++) {
				console.log(parts[j]);
				var rec = nlapiCreateRecord('customrecord_f3ws_site_categories', {recordmode : 'dynamic'});
				rec.setFieldValue('custrecord_f3ws_site_categories_name', parts[j]);
				rec.setFieldValue('custrecord_f3ws_site_categories_id', info.value);
				rec.setFieldValue('custrecord_f3ws_site_categories_parentid', parentId);
				var savedRecord = nlapiSubmitRecord(rec);
			}
		}
	}
}
