/**
 * Created by smehmood on 2/10/2016.
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
 * RicoTransCl class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var RicoTransCl = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function (type) {
            if ((type == 'create' || type == 'edit' || type == 'copy') && (!!$("#custcol_itemsearch") && $("#custcol_itemsearch").length > 0)) {
                nlapiDisableLineItemField('item', 'item', true);
                this.initAutoComplete();
            }
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @returns {Boolean} True to continue save, false to abort save
         */
        clientSaveRecord: function () {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Boolean} True to continue changing field value, false to abort value change
         */
        clientValidateField: function (type, name, linenum) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Void}
         */
        clientFieldChanged: function (type, name, linenum) {
            if (name == 'custcol_itemsearch') {
                console.log('field changed fired');
                //this.initAutoComplete();
            }
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @returns {Void}
         */
        clientPostSourcing: function (type, name) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientLineInit: function (type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to save line item, false to abort save
         */
        clientValidateLine: function (type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientRecalc: function (type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item insert, false to abort insert
         */
        clientValidateInsert: function (type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item delete, false to abort delete
         */
        clientValidateDelete: function (type) {

            return true;
        },

        initAutoComplete: function () {

            this.loadStyleAndCss();
            var baseUrl = window.location.origin;
            var path = nlapiResolveURL("suitelet", "customscript_lineitemautocompdp_suit", "customdeploy_lineitemautocompdp_suit");
            $("#custcol_itemsearch").autocomplete({
                    source: function (request, response) {
                        $.ajax({
                            url: baseUrl + path,
                            dataType: "jsonp",
                            data: {
                                searchtext: request.term
                            },
                            success: function (data) {
                                response(data);
                            }
                        });
                    },
                    minLength: 3,
                    position: { my: "left bottom", at: "left top", collision: "flip" },
                    select: function (event, ui) {
                        //console.log(arguments);
                        //console.log(ui.item.label + '-' + ui.item.value);
                        if(!!nlapiGetFieldValue('entity')) {
                            nlapiSetCurrentLineItemValue('item', 'item', ui.item.value);
                        }else {
                            alert('Please choose customer..');
                        }
                    },
                    open: function () {
                        $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
                        $('.ui-menu')
                            .width(1000).height(250).css('overflow','auto');
                        $('.ui-menu').css("position", "top");
                    },
                    close: function () {
                        $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
                    }
                })
                .data("ui-autocomplete")._renderItem = function (ul, item) {
                var dataObject = item.dataObject;
                var formattedText;
                /*formattedText = dataObject.itemid;
                formattedText = formattedText + '_' + dataObject.desc;
                formattedText = formattedText + '_' + dataObject.available;*/

                //for text color to be orange
                var textColor = "#ffa500";
                formattedText = dataObject.itemid;
                if (dataObject.available > 0) {
                  //dark green color
                  textColor = "#006400";
                }
                formattedText = formattedText + '|<span style="color:' + textColor + '; background-color: #d3d3d3;"><b>' + dataObject.available + '</b></span>';
                formattedText = formattedText + '|<span style="background-color: #d3d3d3;">' + dataObject.nextReceiptDate + '</span>';
                if (dataObject.custitem_custom === 'T') {
                    formattedText = formattedText + '|<span style="color:blue; background-color: #d3d3d3;">' + '( C )' + '</span>';
                }
                formattedText = formattedText + '|' + dataObject.desc;


                //formattedText = formattedText + '_' + dataObject.isDiscontinued;
                //formattedText = formattedText + '_' + dataObject.custitem_custom;

                if (dataObject.isDiscontinued === 'T') {
                    formattedText = '<span style="color:red">' + formattedText + '</span>';
                }

                // if (dataObject.custitem_custom === 'T') {
                //     //formattedText = dataObject.itemid + '_' + dataObject.available + '_' + 'next rec date' + '_'+  + '<span style="color:blue">' + '( C )' + '</span>' + '_' + dataObject.desc;
                //     formattedText = formattedText + '<span style="color:blue">' + '( C )' + '</span>';
                // }

                return $("<li></li>")
                    .data("ui-autocomplete", item)
                    .append("<a>" + formattedText + "</a>")
                    .appendTo(ul);
            };

            //jQuery( "#custcol_itemsearch" ).on( "autocompletechange", onAutoCompleteChange);
        },
        loadStyleAndCss: function () {

            if (document.getElementById('my_cust_css') == null) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.id = 'my_cust_css';
                link.href = 'https://jqueryui.com/resources/demos/style.css';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
        }
    };
})();


function log(message) {
    $("<div>").text(message).prependTo("#log");
    $("#log").scrollTop(0);
}


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function RicoTransClclientPageInit(type) {
    return RicoTransCl.clientPageInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function RicoTransClclientSaveRecord() {
    return RicoTransCl.clientSaveRecord();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function RicoTransClclientValidateField(type, name, linenum) {
    return RicoTransCl.clientValidateField(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function RicoTransClclientFieldChanged(type, name, linenum) {
    return RicoTransCl.clientFieldChanged(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function RicoTransClclientPostSourcing(type, name) {
    return RicoTransCl.clientPostSourcing(type, name);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function RicoTransClclientLineInit(type) {
    return RicoTransCl.clientLineInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function RicoTransClclientValidateLine(type) {

    return RicoTransCl.clientValidateLine(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function RicoTransClclientRecalc(type) {
    return RicoTransCl.clientRecalc(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function RicoTransClclientValidateInsert(type) {

    return RicoTransCl.clientValidateInsert(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function RicoTransClclientValidateDelete(type) {

    return RicoTransCl.clientValidateDelete(type);
}


function onAutoCompleteChange(event, ui) {
    console.log(event);
    console.log(ui);

    //if (ui != null && ui.item != null) {
    //
    //    try{
    //        var id = ui.item.id;
    //        var cust_ref_name = ui.item.cust_ref_name;
    //
    //
    //        nlapiSetCurrentLineItemValue('item','item', id);
    //        nlapiSetCurrentLineItemValue('item','custcol_opp_cust_ref_name', cust_ref_name);
    //    }
    //    catch(e){
    //        console.log(e);
    //    }
    //
    //}
}
