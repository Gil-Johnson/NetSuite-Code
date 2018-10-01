function postMainFun(arg) {
    var result = {};
    
    if (arg.oper === 'schema') {
        if (arg.action === 'metadata') {
            if (arg.subAction === 'all') {
                result = JSON.parse('{"collection":[{"internalid":"cashrefund","label":"Cash Refund","subLists":[],"joins":[]},{"internalid":"cashsale","label":"Cash Sale","subLists":[],"joins":[]},{"internalid":"companycustomer","label":"Company Customer","subLists":[],"joins":[]},{"internalid":"contact","label":"Contact","subLists":[{"internalid":"addressbook","label":"Address Book"}],"joins":[{"internalid":"message","label":"Messages"},{"internalid":"task","label":"Event"}]},{"internalid":"creditmemo","label":"Credit Memo","subLists":[],"joins":[]},{"internalid":"customer","label":"Customer","subLists":[{"internalid":"addressbook","label":"Address Book"}],"joins":[{"internalid":"task","label":"Event"}]},{"internalid":"customerdeposit","label":"Customer Deposit","subLists":[],"joins":[]},{"internalid":"customerpayment","label":"Customer Payment","subLists":[],"joins":[]},{"internalid":"customerrefund","label":"Customer Refund","subLists":[],"joins":[]},{"internalid":"inventoryitem","label":"Inventory Item","subLists":[{"internalid":"price1","label":"Price1"}],"joins":[]},{"internalid":"invoice","label":"Invoice","subLists":[],"joins":[]},{"internalid":"item","label":"Item","subLists":[],"joins":[]},{"internalid":"noninventoryitem","label":"Non Inventory Item","subLists":[{"internalid":"price1","label":"Price1"}],"joins":[]},{"internalid":"pricelevel","label":"Price Level","subLists":[],"joins":[]},{"internalid":"purchaseorder","label":"Purchase Order","subLists":[],"joins":[]},{"internalid":"estimate","label":"Quotes","subLists":[],"joins":[]},{"internalid":"salesorder","label":"Sales Order","subLists":[{"internalid":"item","label":"Items"}],"joins":[{"internalid":"customer","label":"Customer"}]},{"internalid":"salesorder","label":"Sales Order (T)","subLists":[{"internalid":"item","label":"Items"}],"joins":[{"internalid":"customer","label":"Customer"}]},{"internalid":"serviceitem","label":"Service Item","subLists":[{"internalid":"price1","label":"Price1"}],"joins":[]},{"internalid":"task","label":"Task","subLists":[],"joins":[{"internalid":"companycustomer","label":"Customer"}]}]}');
            } else {
                result = JSON.parse('{"collection":[{"internalid":"cashrefund","label":"Cash Refund","subLists":[],"joins":[]},{"internalid":"cashsale","label":"Cash Sale","subLists":[],"joins":[]},{"internalid":"companycustomer","label":"Company Customer","subLists":[],"joins":[]},{"internalid":"contact","label":"Contact","subLists":[{"internalid":"addressbook","label":"Address Book"}],"joins":[{"internalid":"message","label":"Messages"},{"internalid":"task","label":"Event"}]},{"internalid":"creditmemo","label":"Credit Memo","subLists":[],"joins":[]},{"internalid":"customer","label":"Customer","subLists":[{"internalid":"addressbook","label":"Address Book"}],"joins":[{"internalid":"task","label":"Event"}]},{"internalid":"customerdeposit","label":"Customer Deposit","subLists":[],"joins":[]},{"internalid":"customerpayment","label":"Customer Payment","subLists":[],"joins":[]},{"internalid":"customerrefund","label":"Customer Refund","subLists":[],"joins":[]},{"internalid":"inventoryitem","label":"Inventory Item","subLists":[{"internalid":"price1","label":"Price1"}],"joins":[]},{"internalid":"invoice","label":"Invoice","subLists":[],"joins":[]},{"internalid":"item","label":"Item","subLists":[],"joins":[]},{"internalid":"noninventoryitem","label":"Non Inventory Item","subLists":[{"internalid":"price1","label":"Price1"}],"joins":[]},{"internalid":"pricelevel","label":"Price Level","subLists":[],"joins":[]},{"internalid":"purchaseorder","label":"Purchase Order","subLists":[],"joins":[]},{"internalid":"estimate","label":"Quotes","subLists":[],"joins":[]},{"internalid":"salesorder","label":"Sales Order","subLists":[{"internalid":"item","label":"Items"}],"joins":[{"internalid":"customer","label":"Customer"}]},{"internalid":"salesorder","label":"Sales Order (T)","subLists":[{"internalid":"item","label":"Items"}],"joins":[{"internalid":"customer","label":"Customer"}]},{"internalid":"serviceitem","label":"Service Item","subLists":[{"internalid":"price1","label":"Price1"}],"joins":[]},{"internalid":"task","label":"Task","subLists":[],"joins":[{"internalid":"companycustomer","label":"Customer"}]}]}');
            }
        }
    }
    return result;
}