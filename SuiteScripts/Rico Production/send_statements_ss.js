/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       10 May 2016     gjohnson
 *
 *////{{signature}}

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function sendStatement(type) {
	
	try{	
		
		var context = nlapiGetContext();
		
		var deploymentId = context.getDeploymentId();
	//	 nlapiLogExecution('DEBUG', 'deploymentId', deploymentId);  testing comment
		
		var kerri_signature = 'Yousuf Ahmed  <br> accountsreceivable@ricoinc.com <br> Direct: 847-779-5217';
	    var darlene_signature = 'Darlene Piwowarczyk <br> accountsreceivable@ricoinc.com <br> Direct: 847-779-5230 <br> Lock Box <br> 8030 Solutions Center <br> Chicago IL 60677-8000';
	   
	    var cusSearchId = 'customsearch3540';
	    var invSearchId = 'customsearch3542';
	    
	 	
		  if(deploymentId == 'customdeploy2'){	
			  
			  cusSearchId = 'customsearch3748';	
			  invSearchId = 'customsearch3749';
		  }	
		
		  var cuscolumns = new Array();
		      cuscolumns[0] = new nlobjSearchColumn( 'daysoverdue');
		      cuscolumns[1] = new nlobjSearchColumn( 'email', 'custentity_salesmanager');
		      cuscolumns[2] = new nlobjSearchColumn( 'email', 'partner');
		      cuscolumns[3] = new nlobjSearchColumn( 'email');
		      cuscolumns[4] = new nlobjSearchColumn( 'custentity_ar_rep'); 
		     
	  
	     var customers = nlapiSearchRecord( 'customer', cusSearchId, null, cuscolumns);
	     
	     
	     if(customers == null ){
	    	 
	    	 nlapiLogExecution('DEBUG', 'return on customers', 'returning no results');
	    	 return;
	    	 
	     }
		
	    nlapiLogExecution('DEBUG', 'customers.length', customers.length);
	     
	     
	     // Loop through all search results. When the results are returned, use methods
	     // on the nlobjinvoice object to get values for specific fields.
	     for ( var i = 0; customers != null && i < customers.length; i++ )
	     {	       	 
	    //remove return logic	 
	 //    	 if(i == 12){
	     		 
	 //    		 return;
	  //   	 } 	        
	       	 var ccemails = [];	
	    	 var recipients = [];
	     //	 var bccemails = '';		 		
	 	     var templateId = 0;	
	 	     
	    	    	  
		      var customer = customers[ i ];
		      var customerId = customer.getId( );
		      nlapiLogExecution('DEBUG', 'customerId', customerId);
		      var customer_daysOverdue = customer.getValue( 'daysoverdue' );
		      var partner_email = customer.getValue( 'email', 'partner');
		      var salesmgr_email = customer.getValue( 'email', 'custentity_salesmanager' );
		      var cus_email = customer.getValue('email');
		      var ar_rep_email = customer.getValue('custentity_ar_rep');
		      
		 //   nlapiLogExecution('DEBUG', 'cus email', cus_email);
		      
		 	 
		   	 var rec = new Array();
		   	 rec['entity'] = customerId;// internal id of the record 
		    
		      
		    //  bccemails = ar_rep_email;       
		      
		      //check days over due
			     
			  if(customer_daysOverdue >= 24){
				  
				//  nlapiSubmitField('customer', customerId, 'custentity_onhold', 2);
				  
				  nlapiLogExecution('DEBUG', 'days overdue > 24', customer_daysOverdue);
				  if(partner_email){
				  ccemails.push(partner_email);
				  }
				  ccemails.push(salesmgr_email);
				  ccemails.push('accountsreceivable@ricoinc.com');
				  templateId = 25;	  
				  
			  }
			  else if(customer_daysOverdue < 24 && customer_daysOverdue > 16){
				  
				 
				  
				  nlapiLogExecution('DEBUG', 'days overdue for 17', customer_daysOverdue);
				  
				  if(partner_email){
				  ccemails.push(partner_email);
				  }
				  
				  ccemails.push(salesmgr_email);
				  ccemails.push('accountsreceivable@ricoinc.com');
				  templateId = 21;	 
				  
			  }
			  else{
				  
				  nlapiLogExecution('DEBUG', 'days overdue 10 to 16', customer_daysOverdue);
				  
				  if(partner_email){
				  ccemails.push(partner_email);
				  ccemails.push('accountsreceivable@ricoinc.com');
				  }
				  templateId = 19;
				  
			  }
			  
			  
			  if(deploymentId == 'customdeploy2'){
				  
				  templateId = 20; 
				  nlapiSubmitField('customer', customerId, 'custentity_monthly_sent', 'T');	
				 
			  }
			  	      
		      var emailMerger = nlapiCreateEmailMerger(templateId);
		      emailMerger.setEntity('customer', customerId);
		      var mergeResult = emailMerger.merge(); 
		      var emailSubject = mergeResult.getSubject();
		      var emailBody = mergeResult.getBody();      
		     
               if (ar_rep_email == 6295){
		    	  
            	   emailBody1 = emailBody.replace('{{signature}}', darlene_signature); 
		      }
               else{
            	   
            	   emailBody1 = emailBody.replace('{{signature}}', kerri_signature); 
            	   
               }
		      
		      
			       var filters = new Array();
				   filters[0] = new nlobjSearchFilter( 'entity', null, 'is', customerId);
		     
				     
				    // Define search columns
				    var columns = new Array();
				    columns[0] = new nlobjSearchColumn( 'duedate');
				    columns[1] = new nlobjSearchColumn( 'trandate');
				    columns[2] = new nlobjSearchColumn( 'amount');
				    columns[3] = new nlobjSearchColumn( 'amountremaining');
				    columns[4] = new nlobjSearchColumn( 'amountpaid');
				    columns[5] = new nlobjSearchColumn( 'daysoverdue');
				    columns[6] = new nlobjSearchColumn( 'shipaddress');
				    columns[7] = new nlobjSearchColumn( 'otherrefnum');
				    columns[8] = new nlobjSearchColumn( 'tranid');
				    columns[9] = new nlobjSearchColumn( 'internalid', 'customer');
				  //  columns[10] = new nlobjSearchColumn( 'tranid');   
				   
				     
				     // Execute the search. You must specify the internal ID of the record type.
				     var invoices = nlapiSearchRecord( 'transaction', invSearchId, filters, columns );
				     
				     if(invoices == null ){
				    	 
				    	 nlapiLogExecution('DEBUG', 'Continue on Invoices', 'Skipping no results');
				    	 continue;
				    	 
				    	 
				     }
				     
				  //   nlapiLogExecution('DEBUG', 'invoices.length', invoices.length);
				     
				     
					var itmhtml = "<table class='table' style='width:100%;' border='0.2' cellpadding='3' cellspacing='0'>";
					itmhtml += "<tr>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>Type </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>Due Date </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>INV Date </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>INV # </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>PO # </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>Days <br> Past Due </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>INV Amount </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>Paid </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>Balance </td>";
					itmhtml += "<td style='color:#9c0006;font-size:10.0pt;background:#ffc7ce;font-weight:bold;font-family: Verdana, Geneva, sans-serif;'>Shipping <br> Address </td>";
					itmhtml += "</tr>";
				     
				     // Loop through all search results. When the results are returned, use methods
				     // on the nlobjinvoice object to get values for specific fields.
				     for ( var x = 0; invoices != null && x < invoices.length; x++ )
				     {
				    	 
				    
				      var invoice = invoices[ x ];
				      var record = invoice.getId( );
				      var rectype = invoice.getRecordType( );
				      var duedate = invoice.getValue( 'duedate');				      
				      var amount = invoice.getValue( 'amount');	      
				      var trandate = invoice.getValue( 'trandate');
				      var amountremaining = invoice.getValue( 'amountremaining');
				      var amountpaid = invoice.getValue( 'amountpaid');
				      var daysoverdue = invoice.getValue( 'daysoverdue');
				      var shipaddress = invoice.getValue( 'shipaddress');
				      var otherrefnum = invoice.getValue( 'otherrefnum');
				      var tranid = invoice.getValue( 'tranid'); 					
						
				      var tableHtml = "";
				      
				      if(rectype == 'invoice'){
				       tableHtml = "<td style='color:black;font-size:9.0pt;font-weight:400;vertical-align:top;font-family: Verdana, Geneva, sans-serif;'>";
				      }else{
				    	  
				    	tableHtml = "<td style='color:#006100;font-size:9.0pt;background:#c6efce;font-weight:400;vertical-align:top;font-family: Verdana, Geneva, sans-serif;'>";
				      }
						
						itmhtml += "<tr>";						
						itmhtml += tableHtml + rectype+"</td>";
					    itmhtml += tableHtml + duedate+"</td>";
					    itmhtml += tableHtml + trandate+"</td>";
					    itmhtml += tableHtml + tranid+"</td>";	
					    itmhtml += tableHtml + otherrefnum+"</td>";	
					    itmhtml += tableHtml + daysoverdue+"</td>";
					    itmhtml += tableHtml + "$"+ amount+"</td>";
					    itmhtml += tableHtml + "$"+ amountpaid+"</td>";
					    itmhtml += tableHtml + "$"+amountremaining+"</td>";
					    itmhtml += tableHtml + shipaddress+"</td>";
					    itmhtml += "</tr>";				
					    			  
										  
				     }
				     
				     itmhtml += "</table>";	
				     
				     emailBody2 = emailBody1.replace('{{itmhtml}}', itmhtml);
				     
				     				     
				     // Define search filters
				     var contactfilters = new Array();
				         contactfilters[0] = new nlobjSearchFilter( 'company', null, 'is', customerId);				     
				    // Define search columns
				    var contactcolumns = new Array();
				        contactcolumns[0] = new nlobjSearchColumn( 'email' );					     
				     // Execute the search. You must specify the internal ID of the record type.
				     var contacts = nlapiSearchRecord( 'contact', 'customsearch3543', contactfilters, contactcolumns );	
				     
				  //     nlapiLogExecution('DEBUG', 'contacts', contacts  + ' - ' + cus_email);
				     if(contacts == null && cus_email == ''){	     
				       
				    	    recipients.push(ar_rep_email);
				        	nlapiSubmitField('customer', customerId, 'custentity_no_contact', 'T');		        	
				        	
				        
				    	 
				     }					     
				     // Loop through all search results. When the results are returned, use methods
				     // on the nlobjSearchResult object to get values for specific fields.
				     for ( var v = 0; contacts != null && v < contacts.length; v++ )
				     {	
				    	 
				      var contact = contacts[ v ];
				      var contactrecord = contact.getId( );
				      var contact_email = contact.getValue( 'email' );					      
				  //    nlapiLogExecution('DEBUG', "contact_data", contact_email);				      
				      recipients.push(contact_email);	
				      
				     } 
				     
				     //recipients  ccemails
			        try{
				     
				     nlapiSendEmail(18099,recipients  , emailSubject, emailBody2, ccemails , null, rec); 	
			        }
				 	catch ( e )
					{
				   		if ( e instanceof nlobjError )
					    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() + ' customer: ' +  customerId);
					   	else
					   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
					} 
				     
		//		     nlapiSendEmail(18099, 'gjohnson@ricoinc.com' , emailSubject, emailBody2, null,  null, null);  
				     
				     if(deploymentId != 'customdeploy2'){
				     nlapiSubmitField('customer', customerId, 'custentity_statement_sent_week', 'T');
				     }
				   
					     
				     nlapiLogExecution('DEBUG', 'logs', 'usage remaining after email: ' + context.getRemainingUsage());
					    
				     if (context.getRemainingUsage() < 100) {
							nlapiLogExecution('DEBUG', 'logs', 'usage remaining at rescheduling: ' + context.getRemainingUsage());
							nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
							return;
						}	
				     
					   
     } //closes customer search loop  
	
	
	 }
	 
			catch ( e )
			{
		   		if ( e instanceof nlobjError )
			    nlapiLogExecution( 'DEBUG', 'system error', e.getCode() + '\n' + e.getDetails() );
			   	else
			   	nlapiLogExecution( 'DEBUG', 'unexpected error', e.toString() );
			} 
	
	
	
	

}
