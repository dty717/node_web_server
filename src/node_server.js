
const http = require('http');
var https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

const userDir = path.resolve(__dirname, 'user');
const userExampleDir = path.resolve(__dirname, 'user_example');

if (!fs.existsSync(userDir)) {
    fs.cpSync(userExampleDir, userDir, { recursive: true });
    // Reload the program
    if (require.main === module) {
        // Clear require cache for all user modules
        Object.keys(require.cache).forEach((key) => {
            if (key.startsWith(userDir)) {
                delete require.cache[key];
            }
        });
    }
}

const { router } = require('./routing/Router');
const config = require('./user/config/config');
const Builder = require('./building/Builder');
const loadHttpsCertification = require('./certification/httpsLoad.js');
var WebSocketServer = require('websocket').server;

const basePath = path.resolve(__dirname, '../');
router.setBasePath(basePath)

const builder = new Builder(path.resolve(__dirname));
builder.building()

const { loadRoutingMap } = require('./user/RoutingMapLoad');
loadRoutingMap(router.routingMap)

require("./user/main.js")
require("./user/controller/mainRouter");

const server = http.createServer((req, res) => {
    // Routing
    router.handleRequest(req, res);
});

// Start server
server.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}/`);
});

const httpsOptions = loadHttpsCertification();

const httpsServer = https.createServer(httpsOptions, (req, res) => {
    // Routing
    router.handleRequest(req, res);
});

// Start HTTPS server
httpsServer.listen(config.httpsPort, () => {
    console.log(`HTTPS Server running at https://localhost:${config.httpsPort}/`);
});

require('./middlewares/WebSocketServer.js');
