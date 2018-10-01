function pageInit(type)
{
    // hide the submit buttons
    var submitButton = document.getElementById('secondary' + COMMON.BTN_SUBMITTER_ID); 
    var trsubmit = document.getElementById('tdbody_secondary' + COMMON.BTN_SUBMITTER_ID); 
    trsubmit.style.display = 'none';
   
    var xfield = document.getElementById('tdrightcap_secondary' + COMMON.BTN_SUBMITTER_ID);
    xfield.style.display = 'none';
   
    var lfield = document.getElementById('tdleftcap_secondary' + COMMON.BTN_SUBMITTER_ID);
    lfield.style.display = 'none';
    submitButton.style.display = 'none';
    // explicitly submit the form to redirect the suitelet for displaying customer list
    submitButton.click();
}