const http = require('http');
const url = require('url');
const fs = require('fs');
const {router} = require('./routing/Router');
const config = require('./user/config/config');
const path = require('path');
const Builder = require('./building/Builder');
const { loadRoutingMap } = require('./user/RoutingMapLoad');

const basePath = path.resolve(__dirname, '../');
router.setBasePath(basePath)

const builder = new Builder(path.resolve(__dirname));
builder.building()
loadRoutingMap(router.routingMap)


require("./user/main.js")

const server = http.createServer((req, res) => {

    // Routing
    router.handleRequest(req, res);
});

// Start server
server.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}/`);
});
