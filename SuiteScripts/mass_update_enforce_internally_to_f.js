function massUpdate (rec_type, rec_id)
{
var rec = nlapiLoadRecord(rec_type, rec_id);
rec.setFieldValue('enforceminqtyinternally', 'F');
nlapiSubmitRecord(rec);
}