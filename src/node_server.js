
const http = require('http');
var https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { user_path } = require('../globalConfig');

const userDir = path.resolve(__dirname, user_path);
const userExampleDir = path.resolve(__dirname, 'user_example');

/**
 * Synchronously copies a directory recursively, handling potential errors gracefully.
 * @param {string} src - The source directory path.
 * @param {string} dest - The destination directory path.
 */
function copyDirSyncRecursive(src, dest) {
    // 1. Ensure destination directory exists
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
        console.log(`Created directory: ${dest}`);
    }

    // 2. Read contents of the source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        try {
            if (entry.isDirectory()) {
                // If it's a directory, recurse
                copyDirSyncRecursive(srcPath, destPath);
            } else {
                // If it's a file, copy it using a robust method
                fs.copyFileSync(srcPath, destPath);
                // console.log(`Copied file: ${destPath}`); // Optional logging
            }
        } catch (e) {
            console.error(`Error copying ${srcPath} to ${destPath}:`, e.message);
            // Decide whether to throw the error and stop, or continue copying other files
            // throw e; // Uncomment this to stop on the first error
        }
    }
}

// --- How to use it in your code ---
if (!fs.existsSync(userDir) || fs.readdirSync(userDir).length === 0) {
    try {
        // Replace the single problematic line with the custom function call
        copyDirSyncRecursive(userExampleDir, userDir);

    } catch (e) {
        console.error("An error occurred during the recursive copy process:", e);
    }

    console.log("userDir exists after operations:", fs.existsSync(userDir));

    // Reload the program logic remains the same
    if (require.main === module) {
        // ... (rest of your cache-clearing logic) ...
        Object.keys(require.cache).forEach((key) => {
            if (key.startsWith(userDir)) {
                delete require.cache[key];
            }
        });
    }
}

const { router } = require('./routing/Router');
const config = require('./' + user_path + '/config/config');
const Builder = require('./building/Builder');
const loadHttpsCertification = require('./certification/httpsLoad.js');
var WebSocketServer = require('websocket').server;

const basePath = path.resolve(__dirname, '../');
router.setBasePath(basePath)

const builder = new Builder(path.resolve(__dirname));
builder.building()

const { loadRoutingMap } = require('./' + user_path + '/RoutingMapLoad');
loadRoutingMap(router.routingMap)

require("./" + user_path + "/main.js")
require("./" + user_path + "/controller/mainRouter");


function getTrueLanIP() {
    const interfaces = os.networkInterfaces();

    // Regex to exclude common VPN/Virtual interface prefixes
    const excludeRegex = /(tun|tap|utun|vboxnet|vmnet|wg|docker)/i;

    for (const name of Object.keys(interfaces)) {
        // Skip if the interface name matches our "virtual/vpn" blacklist
        if (excludeRegex.test(name)) continue;

        for (const net of interfaces[name]) {
            // Look for IPv4, non-internal (not 127.0.0.1)
            if (net.family === 'IPv4' && !net.internal) {
                // Optional: Skip specific known VPN subnets if name filtering isn't enough
                if (net.address.startsWith('172.20.')) continue;

                return net.address;
            }
        }
    }
    return 'Not found';
}
const ip_address = getTrueLanIP();

const server = http.createServer((req, res) => {
    // Routing
    router.handleRequest(req, res);
});

// Start server
server.listen(config.port, () => {
    console.log(`Server running at http://${ip_address}:${config.port}/`);
});

const httpsOptions = loadHttpsCertification();

const httpsServer = https.createServer(httpsOptions, (req, res) => {
    // Routing
    router.handleRequest(req, res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () => {
    console.log(`HTTPS Server running at https://${ip_address}:${config.httpsPort}/`);
});

require('./middlewares/WebSocketServer.js');
