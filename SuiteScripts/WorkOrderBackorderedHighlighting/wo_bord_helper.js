/**
 * Created by sameer on 9/28/15.
 *
 * This is a helper cs that will highlight back ordered Items in Work Flow.
 */
try{
    jQuery( document ).ready(function() {
        var css = '<style type="text/css">  #item_splits .custom-highlight { color: red !important; }  </style>';
        var d = document.createElement('div'); d.innerHTML = css; document.body.appendChild(d);
        var dat = jQuery('#item_splits tbody .uir-machine-row'), lineNumber, num, backOrderedColumnIndex = 3;
        for(lineNumber = 0; lineNumber < dat.length; lineNumber++) {
            num = parseFloat(jQuery(jQuery(dat[lineNumber]).children('td')[backOrderedColumnIndex]).html().trim());
            if(!isNaN(num) && parseFloat(num) > 0) {
                jQuery(dat[lineNumber]).find('*').addClass('custom-highlight');
            }
        }
        var btn = jQuery('#tbl_item_clear :button');
        btn.click(function() {
            customCancelButton();
        });
    });
} catch(e) {
    if(!!console) {
        console.log(e.toString());
    }
}

function customCancelButton() {
    var totalLines = nlapiGetLineItemCount('item'),
        lineNumber,
        _lineNumber = [],
        _remove = [],
        record;
    for (lineNumber = 1; lineNumber <= totalLines; lineNumber++) {
        record = parseFloat(nlapiGetLineItemValue('item', 'quantityavailable', lineNumber)) - parseFloat(nlapiGetLineItemValue('item', 'quantity', lineNumber));

        if (record < 0) {
            _lineNumber.push(lineNumber);
        } else {
            _remove.push(lineNumber);
        }
    }
    highlightLines(_lineNumber, _remove);
}

function highlightLines(arr, removeCl) {
    setTimeout(function () {
        for (var i = 0; i < arr.length; i++) {
            jQuery('#item_row_' + arr[i]).children('td').addClass('custom-highlight');
        }
        for (var i = 0; i < removeCl.length; i++) {
            jQuery('#item_row_' + removeCl[i]).children('td').removeClass('custom-highlight');
        }
    }, 200);
}