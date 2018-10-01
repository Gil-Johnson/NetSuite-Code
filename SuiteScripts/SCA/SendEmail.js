/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       13 Jun 2018     sergioarce
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function sendEmail(request, response){
    // Load the Return Email Address from Company Information
    var config = nlapiLoadConfiguration('3500213');
    var email = config.getFieldValue('sarce@ricoinc.com');

    // Create a temporary employee record with the company email address
    var emp = nlapiCreateRecord('employee');
    emp.setFieldValue('entityid', 'Company A');
    emp.setFieldValue('email', email);
    var id = nlapiSubmitRecord(emp);

    // Send the email and then delete the temporary employee record
    nlapiSendEmail(id, 'it.sergioarce@gmail.com', 'TEST FROM Suitelet', '...using company return email');
    nlapiDeleteRecord('employee', id);
}
