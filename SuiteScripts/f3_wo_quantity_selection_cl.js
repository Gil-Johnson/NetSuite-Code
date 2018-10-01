/*function pageInit(type) {

    jQuery("#assemblyitem_display").bind("blur", function() {
        console.log("assemblyitem_display blur called");
        //setTimeout(function() {jQuery("#quantity_formattedValue").focus();}, 100);
    });


    jQuery("#assemblyitem_display").bind("change", function() {
        console.log("assemblyitem_display change called");
    });

    jQuery("#assemblyitem_display").bind("focusout", function() {
        console.log("assemblyitem_display focusout called");
    });


    jQuery("#hddn_assemblyitem_fs").bind("change", function() {
        console.log("hddn_assemblyitem_fs change called");
    });
    jQuery("#hddn_assemblyitem_fs").bind("blur", function() {
        console.log("hddn_assemblyitem_fs blur called");
    });
    jQuery("#hddn_assemblyitem_fs").bind("focusout", function() {
        console.log("hddn_assemblyitem_fs focusout called");
    });

}*/


function lineInit() {
    setTimeout(function() {jQuery("#quantity_formattedValue").focus();}, 100);
    return true;
}

