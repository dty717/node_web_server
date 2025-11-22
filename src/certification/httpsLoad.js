const fs = require('fs');
const path = require('path');
const { user_path } = require('../../globalConfig');
const config = require('../' + user_path + '/config/config');

/**
 * Load HTTPS certification files based on user_path configuration.
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