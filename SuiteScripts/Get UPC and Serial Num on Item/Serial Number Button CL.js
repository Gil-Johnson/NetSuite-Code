function clientFieldChanged(type, name, linenum) {
    if(name == COMMON.CHKBOX_CUSTOM_ID){
        var sNum = nlapiGetFieldValue(COMMON.SERIAL_NUMBER_ASSIGNED_ID);
        if(nlapiGetField(COMMON.BTN_SERIAL_NUMBER_ID)){
            if(isValidValue(sNum) && sNum == 'F'){
                if(nlapiGetFieldValue(COMMON.CHKBOX_CUSTOM_ID) == 'T'){
                    nlapiDisableField(COMMON.BTN_SERIAL_NUMBER_ID, false);
                    var bottomReserveSerialNumBtn = document.getElementById('secondary'+COMMON.BTN_SERIAL_NUMBER_ID);
                    var classDisBtn = document.getElementById(COMMON.BTN_SERIAL_NUMBER_ID).parentElement.parentElement.className;
                    bottomReserveSerialNumBtn.disabled = false;
                    bottomReserveSerialNumBtn.parentElement.parentElement.className = classDisBtn;
                }
                else{
                    nlapiDisableField(COMMON.BTN_SERIAL_NUMBER_ID, true);
                    var bottomReserveSerialNumBtn = document.getElementById('secondary'+COMMON.BTN_SERIAL_NUMBER_ID);
                    var classDisBtn = document.getElementById(COMMON.BTN_SERIAL_NUMBER_ID).parentElement.parentElement.className;
                    bottomReserveSerialNumBtn.disabled = true;
                    bottomReserveSerialNumBtn.parentElement.parentElement.className = classDisBtn;
                }
            }
        }
    }
    
    var user = nlapiGetUser();
    
 //   if(user == 17834){
    
    var itemStatus = nlapiGetFieldValue('custitem_status');
    
    if(name == 'custitem_status' && itemStatus == 11){     	 
    	
           
        var newDate = moment().format('MM/DD/YYYY');
      	   
        newDate = addWeekdays(newDate, 3);
        
        newDate =  moment(newDate).format('MM/DD/YYYY');
        
        nlapiSetFieldValue('custitem_dateneeded', newDate);       	
    	
    }  
    //}
    
}

function isValidValue(value){
    return !(value == null || value == '' || typeof value == 'undefined');
}
function addWeekdays(date, days) {
	  date = moment(date); // use a clone
	  while (days > 0) {
	    date = date.add(1, 'days');
	    // decrease "days" only if it's a weekday.
	    if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
	      days -= 1;
	    }
	  }
	  return date;
	}