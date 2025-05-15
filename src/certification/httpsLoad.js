const fs = require('fs');
const path = require('path');
const config = require('../user/config/config');

/**
 * Load HTTPS certification files based on user configuration.
 * @param {Object} config - Configuration object containing paths for key and certificate.
 * @returns {Object} An object containing the key and certificate.
 */
function loadHttpsCertification() {
    var httpsOptions = {
        key: null,
        cert: null
    };

    try {
        httpsOptions.key = fs.readFileSync(config.env.keyFilePath);
        try {
            httpsOptions.cert = fs.readFileSync(config.env.certFilePath);
        } catch (err) {
            httpsOptions.key = null;
            httpsOptions.cert = null;
        }
    } catch (err) {
        httpsOptions.key = null;
        httpsOptions.cert = null;
    }
    return httpsOptions;
}

module.exports = loadHttpsCertification;