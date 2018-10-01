function uncheck_displayinwebsite (){
nlapiSubmitField(nlapiGetRecordType(), nlapiGetRecordId(), 'isonline', 'F');
}