function rltyandcomm_test(type, name)
{
/**
 * Royalty and Commission Accruals	
 * 
 * Version    Date            Author           Remarks
 * 1.00       09 Nov 2016    Frank Foster
 *
 * This After Submit script will calculate Royalties to a Customer Trnsactions and well and Commissions to a
 * Custom Transactions on Invoices and Credit Memos
 *
 */
try
{
	if (type == 'create' || type == 'edit')
	{
		//First make sure a Royalty transaction was not already created
		
		var recid = nlapiGetRecordId()
		nlapiLogExecution('Debug','Royalty Commission Accrual','Begin = ' + recid);
		var trantype1 = nlapiGetRecordType()
		var createdfrom = nlapiGetFieldValue('createdfrom')
		var partner = nlapiGetFieldValue('partner')
		var trandate = nlapiGetFieldValue('trandate')
//		var tranid = nlapiLookupField(trantype1, recid, 'tranid')//Doing a Lookup instead of nlapiGetFieldValue "To Be Generated" on Copy 
		var tranid = nlapiGetFieldValue('tranid')
		var trantype = trantype1[0].toUpperCase() + trantype1.slice(1) //Capitalizes
		if (trantype == 'Creditmemo' )
		{
			trantype = 'Credit Memo'
		}

		var entity = nlapiGetFieldValue('entity')
		var custcategory = nlapiLookupField('customer', entity, 'category')
		var currec = ""

		var prevtran = nlapiSearchRecord('customtransaction_royalty_fee', null, nlobjSearchFilter('custbody_parent_invoice', null, 'anyof', recid), null); 
		if (prevtran != null)
		{
			
			//Already processed - delete and reenter
			var prevroyalty = prevtran[0].getId()
			nlapiDeleteRecord('customtransaction_royalty_fee', prevroyalty)

			var prevtran_comm = nlapiSearchRecord('customtransaction_comm_accrual', null, nlobjSearchFilter('custbody_parent_invoice', null, 'anyof', recid), null); 
			if (prevtran_comm != null)
			{
				var prevcomm = prevtran_comm[0].getId()
				nlapiDeleteRecord('customtransaction_comm_accrual', prevcomm)
			}
		}
	
		var size = nlapiGetLineItemCount('item')
	
		//Lets first go thru the lines and build search tables for the line items - governance issues
		var errorfound = false

		//Build Royalty Cust array
		var roylcust_array = new Array();
		roylcust_array[0] = new Array(); //ID
		roylcust_array[1] = new Array(); //Royalty Vendor
		var roylcust_size = 0
		var rcc_entity = ''
		
		var filter_rcc = new Array();
		filter_rcc[0] = new nlobjSearchFilter('custrecord_rlc_customer', null, 'anyof', entity);
		var columns_rcc = new Array();
		columns_rcc[0] = new nlobjSearchColumn('custrecord_rlc_customercode');
		columns_rcc[1] = new nlobjSearchColumn('internalid').setSort(true);
		columns_rcc[2] = new nlobjSearchColumn('custrecord_rlc_licensor');
		var results_rcc = nlapiSearchRecord('customrecord_royliccustomer', null, filter_rcc, columns_rcc); 
		for (var r = 0; results_rcc != null && r < results_rcc.length; r++ )
		{
			if (r == 0)
			{
				rcc_entity = results_rcc[r].getValue('custrecord_rlc_customercode')
			}
			roylcust_array[0][r] = results_rcc[r].getValue('custrecord_rlc_licensor')
			roylcust_array[1][r] = results_rcc[r].getValue('custrecord_rlc_customercode')
			roylcust_size++
		}
	
		//Build Licensor array
		var licvend_array = new Array();
		licvend_array[0] = new Array(); //ID
		licvend_array[1] = new Array(); //Licensor Vendor

		var licvend_size = 0	
		var licensor_srch = nlapiSearchRecord('customrecord3', null, null, new nlobjSearchColumn('custrecord_licensor_vendor')); 
		for (var k = 0; licensor_srch != null && k < licensor_srch.length; k++ )
		{
			licvend_array[0][k] = licensor_srch[k].getId() 
			licvend_array[1][k] = licensor_srch[k].getValue('custrecord_licensor_vendor')
			licvend_size++
		}

		//Commission Array
		var comm_array = new Array();
		comm_array[0] = new Array(); //Comm ID
		comm_array[1] = new Array(); //Comm 

		var comm_size = 0
		var comsrch = nlapiSearchRecord('classification', null, null, new nlobjSearchColumn('custrecord_commissionpct')); 
		for (var c = 0; comsrch != null && c < comsrch.length; c++ )
		{
			comm_array[0][c] = comsrch[c].getId() 
			comm_array[1][c] = comsrch[c].getValue('custrecord_commissionpct')
			comm_size++
		}
	
		if (errorfound)
		{
			var today = nlapiDateToString(new Date());
		
			var fromaddr = '6';
			var toaddr = 'bradm@ricoinc.com';  
			var ccaddr = 'accounting@ricoinc.com';  

			var emailbody = "Failure on Royalty or Commission Calculation Routine: " + today + "\r\n" + errormessage
			nlapiSendEmail(fromaddr, toaddr, 'Royalty or Commission Calculation Routine', emailbody,ccaddr, null);
			nlapiLogExecution('Error','Royalty or Commission Calculation Routine',errormessage);
			return;
		}

		var lineno = 0
		var lineno_comm = 0
		for(x=1;x<=size;x++) 
		{
			//Fields to retrieve directly from current Line Item
			var itemid = nlapiGetLineItemValue('item', 'item', x)
			var itemflds = nlapiLookupField('item', itemid, ['custitem_nondistrlty1', 'custitem_distrlty1', 'custitem3', 'custitemcustitem_lic2',
				'custitem1']) //Team & Royalty
			var itemflds1 = nlapiLookupField('item', itemid, ['custitem2', 'custitemcustitem_team2'], true) //Team & Royalty

			//Get any 1icensor information - Changed 1/9/2017 by Rico -  get all directly from Item
//			var liccsor1 = nlapiGetLineItemValue('item', 'custcol_hiddenlicensorfield', x)
//			var liccsor2 = nlapiGetLineItemValue('item', 'custcol_hiddenlicensor2field', x)
			var liccsor1 = itemflds.custitem3 
			var liccsor2 = itemflds.custitemcustitem_lic2 

//			var league = nlapiGetLineItemValue('item', 'custcol_accrual_league', x)
			var league = itemflds.custitem1 

			var rrate_dist = itemflds.custitem_distrlty1  //Distributor Royalty Rate
			var rrate_nondist = itemflds.custitem_nondistrlty1 //Non-Distributor Royalty Rate
		
			if (!rrate_dist && !rrate_nondist)
			{
				var errormessage = 'No Royalty Rate for ' + trantype + '# ' + tranid + ' - Line# ' + x
				rrate_dist = '0%'
				rrate_nondist = '0%'
//				break;
			}

			//Default to Non-Distributor rate if not a Distributor
			if (custcategory == 1 || custcategory == 3)  // 1 - Distributor (Other), 3 - Distributor (Licensed Sports)
				var rrate1 = rrate_dist
			else
				var rrate1 = rrate_nondist

			var amount = nlapiGetLineItemValue('item', 'amount', x)
			var pct = rrate1.split("%")		
			var royalty1 = Number(amount) * (Number(pct[0] / 100))
			royalty1 = royalty1.toFixed(2)

			var royalty2 = 0
			var rrate2 = '0%' //Leave rate 2 at zero for now
			if (rrate2)
			{
				var pct = rrate2.split("%")		
				var royalty2 = Number(amount) * (Number(pct[0] / 100))
				royalty2 = royalty2.toFixed(2)
			}
					
			//Classifications
			var department = nlapiGetLineItemValue('item', 'department', x)
			var class = nlapiGetLineItemValue('item', 'class', x)
			var corpdiv = nlapiGetLineItemValue('item', 'custcol_cseg_corp_division', x)
			var prodtype = nlapiGetLineItemValue('item', 'custcol_cseg_product_type', x)
			var royaltyitemclass = nlapiGetLineItemValue('item', 'custcol_royaltyitm_class', x)
//			var accrulicensor = nlapiGetLineItemValue('item', 'custcol_accrual_licensor', x)
			var location1 = nlapiGetLineItemValue('item', 'location', x)
			if (!location1) //If no location, it's not show onthe form so go get it
			{
				if (createdfrom)
				{
					if (!currec)
					{
						currec = nlapiLoadRecord('salesorder', createdfrom)
					}
					location1 = currec.getLineItemValue('item', 'location', x)
				}
				
			}

			//Find Royalty Licensor Customer Codes
			var rcc_vendor = ''
			var rcc_vendor1 = ''
	
			if (x == 1)
			{
				var royaltyrec = nlapiCreateRecord('customtransaction_royalty_fee')
			}
			royaltyrec.setFieldValue('custbody_parent_invoice', recid)
			royaltyrec.setFieldValue('trandate', trandate)
			
			lineno++  
			royaltyrec.insertLineItem('line', lineno)
			royaltyrec.setLineItemValue('line', 'account', lineno, 259) //Royalty Expense 
			royaltyrec.setLineItemValue('line', 'entity', lineno, entity)
			royaltyrec.setLineItemValue('line', 'debit', lineno, royalty1)
			royaltyrec.setLineItemValue('line', 'custcol_accrualrrrate', lineno, rrate1)
			royaltyrec.setLineItemValue('line', 'memo', lineno, trantype + ' #' + tranid)
			royaltyrec.setLineItemValue('line', 'location', lineno, location1)
			royaltyrec.setLineItemValue('line', 'department', lineno, department)
			royaltyrec.setLineItemValue('line', 'custcol_accrual_league', lineno, league)
			royaltyrec.setLineItemValue('line', 'class', lineno, class)
			royaltyrec.setLineItemValue('line', 'custcol_cseg_corp_division', lineno, corpdiv)
			royaltyrec.setLineItemValue('line', 'custcol_cseg_product_type', lineno, prodtype)
			royaltyrec.setLineItemValue('line', 'custcol_royaltyitm_class', lineno, royaltyitemclass)
			royaltyrec.setLineItemValue('line', 'custcol_liamount', lineno, amount)
			royaltyrec.setLineItemValue('line', 'custcol_journalitem', lineno, itemid)
			if (rcc_entity)
			{
				royaltyrec.setLineItemValue('line', 'custcol_royaltyliccc', lineno, rcc_entity)
			}
			if (itemflds1.custitem2)
			{
				royaltyrec.setLineItemValue('line', 'custcol_team', lineno, itemflds1.custitem2)//Team 1
			}
			if (liccsor1) 
			{
				royaltyrec.setLineItemValue('line', 'custcol_accrual_licensor', lineno, liccsor1)				
			}

			lineno++
			royaltyrec.insertLineItem('line', lineno) 
			royaltyrec.setLineItemValue('line', 'account', lineno, 172)	// Accrued Royalties 			
			royaltyrec.setLineItemValue('line', 'credit', lineno, royalty1)
			royaltyrec.setLineItemValue('line', 'custcol_accrualrrrate', lineno, rrate1)
			royaltyrec.setLineItemValue('line', 'memo', lineno, trantype + ' #' + tranid)
			royaltyrec.setLineItemValue('line', 'location', lineno, location1)
			royaltyrec.setLineItemValue('line', 'department', lineno, department)
			royaltyrec.setLineItemValue('line', 'custcol_accrual_league', lineno, league)
			royaltyrec.setLineItemValue('line', 'class', lineno, class)
			royaltyrec.setLineItemValue('line', 'custcol_cseg_corp_division', lineno, corpdiv)
			royaltyrec.setLineItemValue('line', 'custcol_cseg_product_type', lineno, prodtype)
			royaltyrec.setLineItemValue('line', 'custcol_royaltyitm_class', lineno, royaltyitemclass)
			royaltyrec.setLineItemValue('line', 'custcol_liamount', lineno, amount)
			royaltyrec.setLineItemValue('line', 'custcol_journalitem', lineno, itemid)
			if (liccsor1) 
			{
				royaltyrec.setLineItemValue('line', 'custcol_accrual_licensor', lineno, liccsor1)
				for(k=0;k<=licvend_size-1;k++) 
				{
					if (licvend_array[0][k] == liccsor1)
					{
						var licvendor = licvend_array[1][k]
						royaltyrec.setLineItemValue('line', 'entity', lineno, licvendor)
						break;
					}

				}
			}
			
			if (itemflds1.custitem2)
			{
				royaltyrec.setLineItemValue('line', 'custcol_team', lineno, itemflds1.custitem2)//Team 1
			}

			if (itemflds1.custitemcustitem_team2)
			{
				royaltyrec.setLineItemValue('line', 'custcol_team', lineno, itemflds1.custitemcustitem_team2) //Team 2
			}

			if (liccsor1)
			{
				for(r=0;r<=roylcust_size-1;r++) 
				{
					if (roylcust_array[0][k] == liccsor1)
					{
						var rcc_vendor = roylcust_array[1][k]
						royaltyrec.setLineItemValue('line', 'custcol_royaltyliccc', lineno, rcc_vendor)
						break;
					}
				}
			}
			
			if (royalty2 != 0)
			{
				lineno++
				royaltyrec.insertLineItem('line', lineno)
				royaltyrec.setLineItemValue('line', 'account', lineno, 259) //Royalties
				royaltyrec.setLineItemValue('line', 'entity', lineno, entity) //Royalties
				royaltyrec.setLineItemValue('line', 'debit', lineno, royalty2)
				royaltyrec.setLineItemValue('line', 'custcol_accrualrrrate', lineno, rrate2)
				royaltyrec.setLineItemValue('line', 'memo', lineno, trantype + ' #' + tranid)
				royaltyrec.setLineItemValue('line', 'location', lineno, location1)
				royaltyrec.setLineItemValue('line', 'department', lineno, department)
				royaltyrec.setLineItemValue('line', 'custcol_accrual_league', lineno, league)
				royaltyrec.setLineItemValue('line', 'class', lineno, class)
				royaltyrec.setLineItemValue('line', 'custcol_cseg_corp_division', lineno, corpdiv)
				royaltyrec.setLineItemValue('line', 'custcol_cseg_product_type', lineno, prodtype)
				royaltyrec.setLineItemValue('line', 'custcol_royaltyitm_class', lineno, royaltyitemclass)
				royaltyrec.setLineItemValue('line', 'custcol_liamount', lineno, amount)
				royaltyrec.setLineItemValue('line', 'custcol_journalitem', lineno, itemid)
				if (rcc_entity)
				{
					royaltyrec.setLineItemValue('line', 'custcol_royaltyliccc', lineno, rcc_entity)
				}
				if (itemflds1.custitem2)
				{
					royaltyrec.setLineItemValue('line', 'custcol_team', lineno, itemflds1.custitem2) //Team 1
				}

				lineno++
				royaltyrec.insertLineItem('line', lineno)
				royaltyrec.setLineItemValue('line', 'account', lineno, 172)	
				royaltyrec.setLineItemValue('line', 'credit', lineno, royalty2)
	 			royaltyrec.setLineItemValue('line', 'custcol_accrualrrrate', lineno, rrate2)
				royaltyrec.setLineItemValue('line', 'memo', lineno, trantype + ' #' + tranid)
				royaltyrec.setLineItemValue('line', 'location', lineno, location1)
				royaltyrec.setLineItemValue('line', 'department', lineno, department)
				royaltyrec.setLineItemValue('line', 'custcol_accrual_league', lineno, league)
				royaltyrec.setLineItemValue('line', 'class', lineno, class)
				royaltyrec.setLineItemValue('line', 'custcol_cseg_corp_division', lineno, corpdiv)
				royaltyrec.setLineItemValue('line', 'custcol_cseg_product_type', lineno, prodtype)
				royaltyrec.setLineItemValue('line', 'custcol_royaltyitm_class', lineno, royaltyitemclass)
				royaltyrec.setLineItemValue('line', 'custcol_liamount', lineno, amount)
				royaltyrec.setLineItemValue('line', 'custcol_journalitem', lineno, itemid)
				if (liccsor2)
				{
					royaltyrec.setLineItemValue('line', 'custcol_accrual_licensor', lineno, liccsor2)
					for(k=0;k<=licvend_size-1;k++) 
					{
						if (licvend_array[0][k] == liccsor2)
						{
							var licvendor = licvend_array[1][k]
							royaltyrec.setLineItemValue('line', 'entity', lineno, licvendor)
							break;
						}

					}
				}

				if (itemflds1.custitem2)
				{
					royaltyrec.setLineItemValue('line', 'custcol_team', lineno, itemflds1.custitem2)//Team 1
				}
				if (itemflds1.custitemcustitem_team2)
				{
					royaltyrec.setLineItemValue('line', 'custcol_team', lineno, itemflds1.custitemcustitem_team2) //Team 2
				}
				if (liccsor2)
				{
					for(r=0;r<=roylcust_size-1;r++) 
					{
						if (roylcust_array[0][k] == liccsor1)
						{
							var rcc_vendor = roylcust_array[1][k]
							royaltyrec.setLineItemValue('line', 'custcol_royaltyliccc', lineno, rcc_vendor)
							break;
						}
					}
				}
			}
	
			royaltyrec.setFieldValue('transtatus', 'C')

			var commrate = ''
			var commclass = nlapiGetLineItemValue('item', 'class', x)
			for(c=0;c<=comm_size-1;c++) 
			{
				if (comm_array[0][c] == commclass)
				{
					commrate = comm_array[1][c]
					break;
				}
			}

			if (!commrate)  //Let no commission go for now
			{
				commrate = '0%'
			}
	
			var pct = commrate.split("%")		
			var commission = Number(amount) * (Number(pct[0] / 100))
			commission = commission.toFixed(2)

			if (x == 1)
			{
				var commrec = nlapiCreateRecord('customtransaction_comm_accrual')
			}
			commrec.setFieldValue('custbody_parent_invoice', recid)
			commrec.setFieldValue('trandate', trandate)

			lineno_comm++
			commrec.insertLineItem('line', lineno_comm)
			commrec.setLineItemValue('line', 'account', lineno_comm, 258) //Commission Outside Salesmn 
			commrec.setLineItemValue('line', 'entity', lineno_comm, entity)
			commrec.setLineItemValue('line', 'debit', lineno_comm, commission)
			commrec.setLineItemValue('line', 'memo', lineno_comm, trantype + ' #' + tranid + ' COMMISSION ACCRUAL')
			commrec.setLineItemValue('line', 'location', lineno_comm, location1)
			commrec.setLineItemValue('line', 'department', lineno_comm, department)
			commrec.setLineItemValue('line', 'class', lineno_comm, class)
			commrec.setLineItemValue('line', 'custcol_accrual_league', lineno_comm, league)
			commrec.setLineItemValue('line', 'custcol_cseg_corp_division', lineno_comm, corpdiv)
			commrec.setLineItemValue('line', 'custcol_cseg_product_type', lineno_comm, prodtype)
			commrec.setLineItemValue('line', 'custcol_liamount', lineno_comm, amount)
			commrec.setLineItemValue('line', 'custcol_journalitem', lineno_comm, itemid)
			if (rcc_entity)
			{
				commrec.setLineItemValue('line', 'custcol_royaltyliccc', lineno_comm, rcc_entity)
			}

			lineno_comm++
			commrec.insertLineItem('line', lineno_comm) 
			commrec.setLineItemValue('line', 'account', lineno_comm, 169)	// Accrued Commission
//			if (licvendor)
//			{
//				commrec.setLineItemValue('line', 'entity', lineno_comm, licvendor)
//
//			}
			commrec.setLineItemValue('line', 'entity', lineno_comm, partner)
			commrec.setLineItemValue('line', 'credit', lineno_comm, commission)
			commrec.setLineItemValue('line', 'memo', lineno_comm, trantype + ' #' + tranid + ' COMMISSION ACCRUAL')
			commrec.setLineItemValue('line', 'location', lineno_comm, location1)
			commrec.setLineItemValue('line', 'department', lineno_comm, department)
			commrec.setLineItemValue('line', 'class', lineno_comm, class)
			commrec.setLineItemValue('line', 'custcol_accrual_league', lineno_comm, league)
			commrec.setLineItemValue('line', 'custcol_cseg_corp_division', lineno_comm, corpdiv)
			commrec.setLineItemValue('line', 'custcol_cseg_product_type', lineno_comm, prodtype)
			commrec.setLineItemValue('line', 'custcol_liamount', lineno_comm, amount)
			commrec.setLineItemValue('line', 'custcol_journalitem', lineno_comm, itemid)
			if (itemflds1.custitemcustitem_team2)
			{
				commrec.setLineItemValue('line', 'custcol_team', lineno_comm, itemflds1.custitemcustitem_team2) //Team
			}

			commrec.setFieldValue('transtatus', 'C')
		}
		
		var royaltyrecid = nlapiSubmitRecord(royaltyrec)
		var commrecid = nlapiSubmitRecord(commrec)
		nlapiLogExecution('DEBUG', 'Royalty Commission Accrual', 'Remaining usage: ' + nlapiGetContext().getRemainingUsage());	
	}
}
catch (e)
{
	logError(e)
}


}

function logError(e){
	var errorMessage = '';
	var statuscode = '';
	
	if (e instanceof nlobjError){
		nlapiLogExecution('ERROR', e.getCode() , e.getDetails());
		statuscode = e.getCode() 
		errorMessage = e.getCode() + ': ' + e.getDetails();
	}
	else{
		nlapiLogExecution('ERROR',  'Unspecified', e.toString());
		statuscode = e.getCode() 
		errorMessage = e.toString();
	}
	
	var returnmessage = errorMessage
//	SendFailedEmail(statuscode, errorMessage)

	return errorMessage;
}
