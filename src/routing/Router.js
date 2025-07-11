const http = require('http');
const url = require('url'); // Import the 'url' module for parsing
const fs = require('fs');
const path = require('path');
const config = require('../user/config/config');
const RoutingMap = require('./RoutingMap');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

class Router {
    constructor() {
        this.routingMap = new RoutingMap()
    }
    
    get(path, handler) {
        this.routingMap.deleteRoute(path);
        this.routingMap.addRoute(path + "_*_" + 'GET', handler)
    }

    post(path, handler) {
        this.routingMap.deleteRoute(path);
        this.routingMap.addRoute(path + "_*_" + 'POST', handler)
    }

    put(path, handler) {
        this.routingMap.deleteRoute(path);
        this.routingMap.addRoute(path + "_*_" + 'PUT', handler)
    }

    delete(path, handler) {
        this.routingMap.deleteRoute(path);
        this.routingMap.addRoute(path + "_*_" + 'DELETE', handler)
    }

    all(path, handler) {
        this.routingMap.addRoute(path, handler)
    }

    setBasePath(basePath) {
        this.basePath = basePath
    }

    getBasePath() {
        return this.basePath;
    }
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url, true); // Parse the URL
        var pathname = parsedUrl.pathname; // Extract the pathname

        // Handle specific cases like '/favicon.ico' by serving a file from a configured path
        if (pathname === '/favicon.ico') {
            const faviconPath = path.join(this.basePath, config.favicon.path); // Adjust the path as needed
            fs.readFile(faviconPath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error loading favicon');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'image/x-icon');
            res.end(data);
            });
            return;
        }

        // if (pathname === '/') {
        //     pathname = "index"
        // }

        if (pathname.startsWith("/static")) {
            const staticFolderPath = path.join(this.basePath, 'src', 'user', 'static');
            const staticFilePath = path.join(staticFolderPath, pathname.replace('/static', ''));

            // Ensure the resolved path is within the static folder
            if (!staticFilePath.startsWith(staticFolderPath)) {
                res.statusCode = 403;
                res.end('Access denied');
                return;
            }
            fs.readFile(staticFilePath, (err, data) => {
                if (err) {
                    res.statusCode = 404;
                    res.end('Static file not found');
                    return;
                }
                const ext = path.extname(staticFilePath).toLowerCase();
                const contentType = mimeTypes[ext] || 'application/octet-stream';
                res.statusCode = 200;
                res.setHeader('Content-Type', contentType);
                res.end(data);
            });
            return;
        }

        var handler = this.routingMap.getHandler(pathname);
        if (handler) {
            handler(req, res);
        } else {
            handler = this.routingMap.getHandler(pathname + "_*_" + req.method);
            if (handler) {
                // && ((!handler.method) || handler.method.includes(req.method))
                handler(req, res);
            }
            else {
                res.statusCode = 404;
                res.end('Not Found');
            }

        }
        // // const handler = this.routes[method] && this.routes[method][pathname];
        // if (handler) {
        //     req.query = parsedUrl.query; // Attach query parameters to the request object
        //     handler(req, res);
        // } else {
        //     res.statusCode = 404;
        //     res.end('Not Found');
        // }
    }
}


function wrapJson_200_Response(fn) {
    return function (req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        const result = (typeof fn === 'function') ? fn() : fn;
        res.end(JSON.stringify(result));
    };
}

function wrapHtml_200_Response(fn) {
    return function (req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(fn());
    };
}


function wrapHtmlPlainText_200_Response(text) {
    return function (req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(text);
    };
}

function fileToHtml_200_Response(filePath) {
    return function (req, res) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Error loading favicon');
                return;
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        });
        return;
    };
}

const router = new Router();

module.exports = { router, wrapHtml_200_Response, wrapHtmlPlainText_200_Response, fileToHtml_200_Response, wrapJson_200_Response };