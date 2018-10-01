/**
 * Created by Hassan on 4/17/14.
 */

var Constant = {
    Config: {
        EnableLogging: true,
        CookieExpiry: 60 //cookie alive for an hour
    },
    LogLevel: {
        Debug: "DEBUG",
        Error: "ERROR"
    },
    File: {
        IndexHtml: 269495,
        Bootstrap_css: 322760,
        Jtable_css: 322765,
        Jtable_css_blue: 322764,
        AdminIndexHtml: 322865,
        AdminScript: 322766
    },
    ImageUrl: {
        Bg_thead: "https://system.na3.netsuite.com/core/media/media.nl?id=322960&c=3500213&h=7af51e577f187949c0d6",
        Close: "https://system.na3.netsuite.com/core/media/media.nl?id=322964&c=3500213&h=8323c604d3d568eee148",
        Column_asc: "https://system.na3.netsuite.com/core/media/media.nl?id=323059&c=3500213&h=2304c6538fb58eec78c4",
        Column_dsc: "https://system.na3.netsuite.com/core/media/media.nl?id=323060&c=3500213&h=8f086a717a562e097239",
        Column_sortable: "https://system.na3.netsuite.com/core/media/media.nl?id=323061&c=3500213&h=e347964556ef71ead4ed",
        Delete: "https://system.na3.netsuite.com/core/media/media.nl?id=323063&c=3500213&h=522b7a64dd607c8545c2",
        Edit: "https://system.na3.netsuite.com/core/media/media.nl?id=322967&c=3500213&h=9e75bffb2cc5d6a6d4f4",
        Loading: "https://system.na3.netsuite.com/core/media/media.nl?id=322966&c=3500213&h=93908fbc38b5311d6113",
        NoImageFound: "https://system.na3.netsuite.com/core/media/media.nl?id=322859&c=3500213&h=fdbf128d89b9d8a8a09b"
    },
    NsField: {
        Id: "id",
        InternalId: "internalid",
        InternalIdNumber: "internalidnumber",
        Vendor: {
            VendorUsername: "custentity_vendor_username",
            VendorPassword: "custentity_vendor_password",
            VendorLoginHash: "custentity_vendor_login_hash",
            VendorName: "entityid",
            VendorSessionTime: "custentity_vendor_session_start_time",
            Email: "email"
        },
        PurchaseOrder: {
            Entity: "entity",
            MainLine: "mainline",
            PONumber: "tranid",
            ShipDate: "custbody_poshipdate",
            VendorOrderStatus: "custbody_vendor_order_status",
            Date: "trandate",
            AmountUnbilled: "amountunbilled",
            ExpectedReceiptDate: "expectedreceiptdate",
            Quantity: "quantity",
            Rate: "rate",
            ShipQuantityReceived: "quantityshiprecv",
            VendorAddress: "billaddress",
            CancelDate: "custbody_cncldate",
            Warehouse: "location",
            ReceiveBy: "duedate",
            ShipToAddress: "custbody_poshiptoaddress",
            Item: "item",
            QuantityBilled: "quantitybilled",
            Description: "description",
            QuantityReceived: "quantityreceived",
            IsClosed: "isclosed",
            Upc: "custcol_upccodeonpos",
            Sku: "custcolskuonpo",
            RetailPrice: "custcol_rtlonpo",
            Email: "email",
            CreatedBy: "createdby",
            Status: "status",
            ItemType: "itemtype",
            ShippingInstruction: "custbody_poshippinginstructions",
            Memo: "memo"
        },
        PendingChanges: {
            PurchaseOrderId: "custrecord_po_ch_id",
            NewShipDate: "custrecord_po_ch_new_shipdate",
            VendorId: "custrecord_vp_vendor_id",
            ChangeRequestDate: "custrecord_po_change_req_date",
            PoCreationDate: "custrecord_po_creation_date",
            ChangeAccepted: "custrecord_po_ch_accepted",
            OrderNumber: "custrecord_po_ch_order_number",
            NewCancelDate: "custrecord_po_ch_new_canceldate",
            NewReceiveByDate: "custrecord_po_ch_new_rec_by_date",
            Comments: "custrecord_po_ch_comments"
        },
        PendingChangesDetail: {
            Item: "custrecord_po_ch_item",
            NewQty: "custrecord_po_ch_new_quantity",
            NewRate: "custrecord_po_ch_new_rate",
            ChangeParentId: "custrecord_changes",
            NewReceiptDate: "custrecord_po_ch_new_receipt_date"
        },
        Item: {
            ThumbnailImage: "custitemthumbnail_image",
            HighResImage: "custitem_highresimage",
            RequiresHologram: "custitem_reqhlgrm",
            HologramType: "custitem_hlgrmtp",
            HologramImage: "custrecord_hlgrmimage",
            ProductionFile: "custitem_productionfile"
        },
        Employee: {
            Email: "email"
        }
    },
    NsLineItem: {
        PendingChangesDetail: "recmachcustrecord_changes",
        Item: "item"
    },
    NsValue: {
        True: "T",
        False: "F",
        PurchaseOrder: {
            Status: {
                PendingSupervisorApproval: "PurchOrd:A",
                PendingReceipt: "PurchOrd:B",
                RejectedBySupervisor: "PurchOrd:C",
                PartiallyReceived: "PurchOrd:D",
                PendingBillingPartiallyReceived: "PurchOrd:E",
                PendingBill: "PurchOrd:F",
                FullyBilled: "PurchOrd:G",
                Closed: "PurchOrd:H"
            },
            ItemType: {
                Description: "Description"
            }
        }
    },
    NsRecordType: {
        Vendor: "vendor",
        PurchaseOrder: "purchaseorder",
        PendingChanges: "customrecord_vp_pending_changes",
        PendingChangesDetail: "customrecord_vp_ch_list",
        Employee: "employee",
        Item: "item"
    },
    Response: {
        Status: {
            Ok: "OK",
            Error: "ERROR"
        },
        ErrorMessages: {
            InvalidRequest: "There seems to be some error on your request, please try again.",
            InvalidLoginCredentials: "The credentials you've entered do not match any vendor record, if you think its an error, please contact us.",
            UnexpectedError: "We've encountered an unexpected error, please try again later.",
            TroubleLoadingRecords: "We are having trouble loading records, please try again later.",
            PurchaseOrderNotBalanced: "The current purchase order is manually changed and so can not handle changes.",
            LoginFromAnotherLocation: "You have signed-in from another location.",
            VendorsNotFound: "Vendors not found.",
            PoDetailsNotFound: "This purchase order does not seems to have any details.",
            UnableToRejectChanges: "We are unable to reject the changes, please try again later.",
            UnableToAcceptChanges: "We are unable to accept the changes, please try again later."
        }
    },
    Cookie: {
        LoginHash: "NS-LOGIN-HASH",
        VendorId: "NS-VENDOR-ID",
        VendorName: "NS-VENDOR-NAME"
    },
    OrderStatus: {
        New: {Display: "NEW", Value: "3"},
        ReadPendingChanges: {Display: "READ/PENDING CHANGES", Value: "4"},
        ReadUnaccepted: {Display: "READ/UNACCEPTED", Value: "8"},
        Accepted: {Display: "ACKNOWLEDGED", Value: "1"},
        Rejected: {Display: "CHANGES REJECTED", Value: "6"},
        Unprocessed: {Display: "UNPROCESSED", Value: "7"}, //If change, make it default on pendingChanges record => (AcceptChanges) as well
        InTransit: {Display: "IN TRANSIT", Value: "2"},
        Unassigned: {Display: "UNPROCESSED", Value: "@NONE@"},
        ReadUnacknowledged: {Display: "READ/UNACKNOWLEDGED", Value: "5"},
        Acknowledged: {Display: "ACKNOWLEDGED", Value: "1"}
    },
    EmailTemplate: {
        SenderEmpId: 14767,
        ChangesRequestByVendor: {
            Subject: "Changes requested by vendor",
            Body: "Changes has been requested on PO # {0}, please review the changes at your earliest."
        },
        ChangesRejectedByAdmin: {
            Subject: "Changes rejected by admin",
            Body: "Changes has been rejected on PO # {0}."
        },
        ChangesAcceptedByAdmin: {
            Subject: "Changes accepted by admin",
            Body: "Your requested changes on PO # {0} has been accepted by the admin, please accept the PO at your earliest."
        },
        POAcceptedByVendor: {
            Subject: "PO accepted by vendor",
            Body: "Your PO # {0} has been accepted by the vendor."
        }
    },
    AdminPanel: {
        FormName: "Admin Panel",
        PageTemplateField: "custpage_page_template"
    },
    PdfFileName: "Rico_PO_{0}.pdf"
};
