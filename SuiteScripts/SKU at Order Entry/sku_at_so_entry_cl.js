function autoCompleteInit(type){
    if(nlapiGetLineItemField('item','custcol_sku_item')){
        var z = {};
        z.q = jQuery.noConflict();
        // style.css
        z.q('head').append('<link rel="stylesheet" href="/core/media/media.nl?id=271&c=3500213&h=4cf1d34cbc590cbefd09&_xt=.css" type="text/css" />');
        // jquery-ui-1.10.3.css
        z.q('head').append('<link rel="stylesheet" href="/core/media/media.nl?id=270&c=3500213&h=7b3de41f8761f725e6e8&_xt=.css" type="text/css" />');
        z.q('#custcol_sku_item').wrap('<div class="effectStatic" />'); // class : ui-widget
        z.q(function() { 
            z.q( "#custcol_sku_item" ).autocomplete({
                // suitelet for getting json
                source: "/app/site/hosting/scriptlet.nl?script=20&deploy=1&entity="+nlapiGetFieldValue('entity'),
                minLength: 3,
                select: function(event, ui){
                    if(ui.item){
                        if(ui.item.id){
                            nlapiSetCurrentLineItemValue('item', 'item', ui.item.id);
                        }
                    }
                }
            });
        });
    }
}