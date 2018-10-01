/**
 * Created by zshaikh on 5/29/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * Data Access Class for Items Record
 * @returns {BaseTypeDAL}
 * @constructor
 */
F3.Storage.ItemsDAL = function() {
    var currentDal = new F3.Storage.BaseTypeDAL();

    // fields list
    // https://system.na1.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2015_1/script/record/salesorder.html
    currentDal.INTERNAL_ID = F3.Storage.ItemsDAL.INTERNAL_ID;
    currentDal.FieldName = F3.Storage.ItemsDAL.FieldName;

    currentDal.getInventoryItems = function() {

        var result = null;
        this.INTERNAL_ID = 'inventoryitem';

        var filterFormula = "CASE WHEN NVL(FLOOR({quantityavailable}),0) <> NVL(FLOOR({custitem_invfeednumber}), 0) " +
            "THEN '1' ELSE '0'END";

        var filters = [];
        filters.push(new nlobjSearchFilter('type', null, 'anyof', ["InvtPart"]));
        filters.push(new nlobjSearchFilter('custitem_prodtype', null, 'noneof', ["108"])); // Raw Material
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_hassubcomponent', 'custitem_prodtype', 'is', 'F'));
        filters.push(new nlobjSearchFilter('formulatext', null, 'is', '1').setFormula(filterFormula));



        // todo: undo following code, its only for testing purpose.
        //filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ["161417"])); // subcomponent: false




        var cols = [];
        cols.push(new nlobjSearchColumn('internalid'));
        cols.push(
            new nlobjSearchColumn('formulanumeric')
                .setFormula('NVL(FLOOR({quantityavailable}),0)').setLabel('quantity_available'));
        cols.push(
            new nlobjSearchColumn('formulanumeric')
                .setFormula('NVL(FLOOR({custitem_invfeednumber}),0)').setLabel('inventory_feed_number'));

        result = this.getAll(filters, cols);


        return result;

    };


    currentDal.getKitItems = function() {

        F3.Util.Utility.log('DEBUG', 'getKitItems();', '');

        this.INTERNAL_ID = 'kititem';

        var filters = [];
        filters.push(new nlobjSearchFilter('type', null, 'anyof', ["Kit"]));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));



        // todo: undo following code, its only for testing purpose.
        //filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ["118732"])); // subcomponent: false




        var cols = [];
        cols.push(new nlobjSearchColumn('internalid', null, 'GROUP'));
        cols.push(new nlobjSearchColumn('formulanumeric', null, 'MIN')
            .setFormula('FLOOR(NVL(({memberitem.quantityavailable}/{memberquantity}),0))')
            .setLabel('quantity_available'));
        cols.push(
            new nlobjSearchColumn('formulanumeric', null, 'GROUP')
                .setFormula('NVL(FLOOR({custitem_invfeednumber}), 0)')
                .setLabel('inventory_feed_number'));


        var lineItems = this.getAllRecords(filters, cols);
        var filteredLineItems = _.filter(lineItems, function(item) {
            return item.inventory_feed_number != item.quantity_available;
        });

        F3.Util.Utility.log('DEBUG', 'total kit line items: ', lineItems.length);
        F3.Util.Utility.log('DEBUG', 'total filtered kit line items: ', filteredLineItems.length);

        //lineItems = _.take(lineItems, 100);
        //F3.Util.Utility.log('DEBUG', 'kit line items: ', JSON.stringify(lineItems));

        return filteredLineItems;
    };


    currentDal.getAssemblyItemsWithSubComponents = function() {

        this.INTERNAL_ID = 'assemblyitem';

        var filters = [];
        filters.push(new nlobjSearchFilter('type', null, 'anyof', ["Assembly"]));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_hassubcomponent', 'custitem_prodtype', 'is', 'T'));





        // todo: undo following code, its only for testing purpose.
        //filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ["26140"])); // subcomponent: true








        var cols = [];
        cols.push(new nlobjSearchColumn('internalid', null, 'GROUP'));
        cols.push(new nlobjSearchColumn('formulanumeric', null, 'MIN').setFormula('FLOOR(NVL(({memberitem.quantityonhand}/{memberquantity}),0))').setLabel('quantity_calculated'));
        cols.push(new nlobjSearchColumn('formulanumeric', null, 'GROUP').setFormula('NVL(FLOOR({custitem_invfeednumber}), 0)').setLabel('inventory_feed_number'));
        cols.push(new nlobjSearchColumn('quantityavailable', null, 'MAX').setLabel('quantity_available'));

        var lineItems = this.getAllRecords(filters, cols);
        var filteredLineItems = _.filter(lineItems, function(item) {
            return item.inventory_feed_number != Math.round(item.quantity_available) + Math.round(item.quantity_calculated);
        });

        F3.Util.Utility.log('DEBUG', 'total assembly line items: ', lineItems.length);
        F3.Util.Utility.log('DEBUG', 'total filtered assembly line items: ', filteredLineItems.length);

        //lineItems = _.take(lineItems, 100);
        //F3.Util.Utility.log('DEBUG', 'assembly line items: ', JSON.stringify(lineItems));

        return filteredLineItems;

    };


    currentDal.getAssemblyItemsWithoutSubComponents = function() {

        this.INTERNAL_ID = 'assemblyitem';

        var filters = [];
        filters.push(new nlobjSearchFilter('type', null, 'anyof', ["Assembly"]));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter('custrecord_hassubcomponent', 'custitem_prodtype', 'is', 'F'));
        filters.push(new nlobjSearchFilter('formulatext', null, 'is', '1')
            .setFormula("CASE WHEN NVL(FLOOR({quantityavailable}),0) <> NVL(FLOOR({custitem_invfeednumber}), 0) THEN '1' ELSE '0'END"));







        // todo: undo following code, its only for testing purpose.
        //filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ["60325"])); // subcomponent: false





        var cols = [];
        cols.push(new nlobjSearchColumn('internalid'));
        cols.push(new nlobjSearchColumn('formulanumeric').setFormula('NVL(FLOOR({quantityavailable}),0)').setLabel('quantity_available'));
        cols.push(new nlobjSearchColumn('formulanumeric').setFormula('NVL(FLOOR({custitem_invfeednumber}),0)').setLabel('inventory_feed_number'));

        var lineItems = this.getAll(filters, cols);

        return lineItems;

    };


    currentDal.getItemsWithEmptyInventoryFeedNumber = function() {

        F3.Util.Utility.log('DEBUG', 'getItemsWithEmptyInventoryFeedNumber();', '');

        this.INTERNAL_ID = 'item';

        var filters = [];
        filters.push(new nlobjSearchFilter('type', null, 'anyof', ["Kit", "Assembly", "InvtPart"]));
        filters.push(new nlobjSearchFilter('custitem_invfeednumber', null, 'isempty'));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));




        // todo: undo following code, its only for testing purpose.
        // kit item, invitem, assemblyitem:false, assemblyitem:true
        //filters.push(new nlobjSearchFilter('internalid', null, 'anyof', ["118741", "6652", "147763", "26586"]));



        var cols = [];
        cols.push(new nlobjSearchColumn('internalid'));

        var lineItems = this.getAll(filters, cols);

        F3.Util.Utility.log('DEBUG', 'total kit line items: ', lineItems.length);

        return lineItems;
    };


    currentDal.getInactiveItems = function() {

        F3.Util.Utility.log('DEBUG', 'getItemsWithEmptyInventoryFeedNumber();', '');

        this.INTERNAL_ID = 'item';

        var filters = [];
        filters.push(new nlobjSearchFilter('type', null, 'anyof', ["Kit", "Assembly", "InvtPart"]));
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'T'));
        filters.push(new nlobjSearchFilter('custitem_invfeednumber', null, 'notequalto', '0'));

        var cols = [];
        cols.push(new nlobjSearchColumn('internalid'));

        var lineItems = this.getAll(filters, cols);

        F3.Util.Utility.log('DEBUG', 'total kit line items: ', lineItems.length);

        return lineItems;
    };

    return currentDal;
};


F3.Storage.ItemsDAL.INTERNAL_ID = 'item';
F3.Storage.ItemsDAL.FieldName = {
    INTERNALID: 'internalid'
};
