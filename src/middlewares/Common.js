const time_zone_shift = 1000 * 60 * (- new Date().getTimezoneOffset());

function sleep(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
function _time_(time) {
    return new Date(time.getTime() + time_zone_shift)
}


function byteToInt(e, scale = 1) {
    var value;
    var sign = (e >> 8) & (1 << 7);
    var x = ((((e >> 8) & 0xFF) << 8) | ((e & 0xff) & 0xFF));
    if (sign) {
        value = (0xFFFF0000 | x) / scale;  // fill in most significant bits with 1's
    } else {
        value = e / scale;
    }
    return value;
}

module.exports = { _time_, sleep, byteToInt }