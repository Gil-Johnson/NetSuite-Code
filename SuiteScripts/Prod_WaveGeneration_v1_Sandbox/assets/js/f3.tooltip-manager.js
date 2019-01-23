/**
 * Created by zshaikh on 9/10/2015.
 */

/**
 * TooltipManager class to display tooltip on Customer and Item
 */
function TooltipManager(context) {

    var showingQuickViewFirstTime = true;
    context.showCustomerQuickView = function(customerId, lineid) {
        if(showingQuickViewFirstTime) {
            //console.log('first time showing customer tooltip');

            showingQuickViewFirstTime = false;
            //console.log('showing customer tooltip 1');
            try {
                displayCustomerQuickView(customerId, lineid);
            } catch (ex) {
                console.error(ex);
            }
            //displayCustomerQuickView(customerId, lineid);
            //setTimeout(function() {
            //    //console.log('showing customer tooltip 2');
            //    displayCustomerQuickView(customerId, lineid);
            //}, 5000);
        }
        else {
            displayCustomerQuickView(customerId, lineid);
        }
    };

    context.hideCustomerQuickView = function(customerId){

    };

    context.displayCustomerQuickView = function(customerId, lineid) {

        try {

            var success = false;
            var controlId = 'custname_anchor_' + lineid;
            var win = (typeof parent.getExtTooltip != 'undefined' && parent.getExtTooltip) ? parent : window;

            if (typeof win.getExtTooltip != 'undefined') {

                var tip = win.getExtTooltip(controlId, 'entity', 'DEFAULT_TEMPLATE', customerId, null);
                if (tip != undefined) {

                    // show tooltip after 2 seconds
                    //setTimeout(function () {
                        tip.show();
                    //}, 2000);

                    success = true;
                }
            }

            // if could not show tooltip
            // then try again after 2 seconds
            if ( success == false) {
                setTimeout(function () {
                    context.displayCustomerQuickView(customerId, lineid);
                }, 2000);
            }

        } catch (e) {
            //context.displayCustomerQuickView(customerId, lineid);
        }
    };

    context.showItemQuickView = function(itemid, lineid, event) {
        if(showingQuickViewFirstTime) {
            //console.log('first time showing item tooltip');

            showingQuickViewFirstTime = false;
            try { displayItemQuickView(itemid, lineid, event); } catch (ex) {}
            //displayItemQuickView(itemid, lineid);
            setTimeout(function() {
                displayItemQuickView(itemid, lineid, event);
            }, 5000);
        }
        else {
            displayItemQuickView(itemid, lineid, event);
        }
    };

    context.displayItemQuickView = function(itemid, lineid, event) {
        //alert('itemid=' + itemid + '    >>    lineid=' + lineid);

        var controlId = 'itemdesc_anchor_' + lineid;
        var win = (typeof parent.getExtTooltip != 'undefined' && parent.getExtTooltip) ? parent : window;
        if (typeof win.getExtTooltip != 'undefined') {
            var tip = win.getExtTooltip(controlId, 'ITEM', 'CONTACT_TEMPLATE', itemid, null);
            if (tip != undefined) {
                console.log('showing item tooltip');
                tip.onTargetOver(event);
            }
        }
    };

}