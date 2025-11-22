
var https = require('https');
var http = require('http');
var fs = require('fs');
const { user_path } = require('../../globalConfig');
const loadHttpsCertification = require('../certification/httpsLoad');
const config = require('../' + user_path + '/config/config');
var WebSocketServer = require('websocket').server;

// const httpsOptions = loadHttpsCertification();
const httpsOptions = {};

function handleWebRequest(request, response) {
    console.log("Received request for " + request.url);
    response.writeHead(404);
    response.end();
}

// If we were able to get the key and certificate files, try to
// start up an HTTPS server.
var webServer = null;

try {
    if (httpsOptions.key && httpsOptions.cert) {
        webServer = https.createServer(httpsOptions, handleWebRequest);
    }
} catch (err) {

    webServer = null;
}

if (!webServer) {
    try {
        webServer = http.createServer({}, handleWebRequest);
    } catch (err) {
        webServer = null;
        console.log(`Error attempting to create HTTP(s) server: ${err.toString()}`);
    }
}

// Spin up the HTTPS server on the port assigned to this sample.
// This will be turned into a WebSocket port very shortly.

webServer.listen(config.websocketPort, function () {
    console.log(`WebSocket server is listening on port ${config.websocketPort}`);
});


// Create the WebSocket server by converting the HTTPS server into one.

var wsServer = new WebSocketServer({
    httpServer: webServer,
    autoAcceptConnections: false
});

if (!wsServer) {
    console.log("ERROR: Unable to create WbeSocket server!");
}


/*

*/
module.exports = { wsServer }
