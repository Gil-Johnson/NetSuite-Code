// sorting by bin
function sortArrayAscByBin(){
    return function(obj1, obj2){
        if (obj1.binItemText > obj2.binItemText) return 1;
        if (obj1.binItemText < obj2.binItemText) return -1;
        return 0;
    }
}

// sorting by item name/number
function sortArrayAscByItem(){
    return function(obj1, obj2){
        if (obj1.itemText > obj2.itemText) return 1;
        if (obj1.itemText < obj2.itemText) return -1;
        return 0;
    }
}

function isValidValue(value){
    return !(value == '' || value == null || typeof value == 'undefined');
}