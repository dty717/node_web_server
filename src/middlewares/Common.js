const time_zone_shift = 1000 * 60 * (- new Date().getTimezoneOffset());

function getLeastSquaresStats(x_values, y_values) {
    let x_sum = 0;
    let y_sum = 0;
    let xy_sum = 0;
    let xx_sum = 0;
    let count = x_values.length;

    if (count !== y_values.length) {
        throw new Error("The parameters values_x and values_y need to have the same size!");
    }
    if (count === 0) {
        return { slope: 0, intercept: 0, r: 0, rSquared: 0 };
    }

    // Calculate sums
    for (let i = 0; i < count; i++) {
        x_sum += x_values[i];
        y_sum += y_values[i];
        xx_sum += x_values[i] * x_values[i];
        xy_sum += x_values[i] * y_values[i];
    }

    // Calculate means
    const x_mean = x_sum / count;
    const y_mean = y_sum / count;

    // Calculate slope (m) and intercept (b)
    const slope = (count * xy_sum - x_sum * y_sum) / (count * xx_sum - x_sum * x_sum);
    const intercept = y_mean - slope * x_mean;

    // Calculate R-squared (coefficient of determination)
    let sum_of_squared_residuals = 0; // RSS (Residual Sum of Squares)
    let total_sum_of_squares = 0; // SST (Total Sum of Squares)

    for (let i = 0; i < count; i++) {
        const predicted_y = slope * x_values[i] + intercept;
        const residual = y_values[i] - predicted_y;
        const deviation_from_mean = y_values[i] - y_mean;

        sum_of_squared_residuals += residual * residual;
        total_sum_of_squares += deviation_from_mean * deviation_from_mean;
    }

    const rSquared = 1 - (sum_of_squared_residuals / total_sum_of_squares);
    // R is the square root of R-squared, with the same sign as the slope
    const r = Math.sqrt(rSquared) * (slope >= 0 ? 1 : -1);

    return { slope, intercept, r, rSquared };
}

function _getAttribute(obj, pathString, defaultValue = null) {
    // Splits "x.a.b.c" into ['x', 'a', 'b', 'c'] and traverses the object
    const parts = pathString.split('.');
    let current = obj;
    for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return defaultValue; // Path does not exist
        }
    }
    return current;
}

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

module.exports = { _time_, sleep, byteToInt, getLeastSquaresStats, _getAttribute }