function getVal(data) {
    var start = data.indexOf('>');
    var end = data.indexOf('<', 1);
    if (start >= 0 && end >= 0) {
        return data.substring(start + 1, end);
    }
}
function isBlankOrNull(str) {
    if (str == undefined || typeof(str) == 'undefined' || str == 'undefined' || str == null || str == '' || str == 'null' || str == '- None -') {
        return true;
    }
    else {
        return false;
    }
}