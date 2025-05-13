const fs = require('fs');
const path = require('path');
const config = require('../user/config/config'); // Import the config file
const HtmlBuilder = require('./HtmlBuilder');
const htmlBuilder = new HtmlBuilder()

class Builder {
    constructor(basePath) {
        this.basePath = basePath;
    }
    building() {
        this.backupConfigFile();
        this.processHtmlFiles();
    }
    // Method to back up the config file
    backupConfigFile() {
        const configFilePath = path.resolve(this.basePath, './user/config/config.js');
        const backupFilePath = path.resolve(this.basePath, './user/config/config_bak.js');
        if (fs.existsSync(configFilePath)) {
            fs.copyFileSync(configFilePath, backupFilePath);
            console.log('Config file backed up to config_bak.js');
        } else {
            console.log('Config file does not exist, no backup created.');
        }
    }

    // Method to process HTML files
    processHtmlFiles() {
        var changeableHtmlFileList = []
        const searchHtmlFiles = (dir) => {
            const files = fs.readdirSync(dir);
            files.forEach((file) => {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isDirectory()) {
                    // Recursively search subdirectories
                    searchHtmlFiles(filePath);
                } else if (path.extname(file) === '.html') {
                    let content = fs.readFileSync(filePath, 'utf-8');

                    // Process "const" placeholders
                    content = content.replace(/<!--\s*const\((.*?)\)\s*-->([\s\S]*?)<!--\s*end\s*-->/g, (match, key, value) => {
                        if (config[key]) {
                            return `<!-- const(${key}) -->${config[key]}<!-- end -->`;
                        } else {
                            config[key] = value; // Add to config with the value from HTML
                            // return `<!-- const(${key}) -->${value}<!-- end -->`;
                            return match;
                        }
                    }).replace(/\/\*+\s*const\s*\((.*?)\)\s*\*\/([\s\S]*?)\/\*+\s*end\s*\*\//g, (match, key, value ) => {
                        if (config[key]) {
                            return `/* const(${key}) */${config[key]}/* end */`;
                        } else {
                            config[key] = value; // Add to config with the value from HTML
                            return match;
                        }
                    });
                    // Rewrite the config file with the updated attributes
                    const configFilePath = path.resolve(this.basePath, './user/config/config.js');
                    const updatedConfigContent = `module.exports = ${JSON.stringify(config, null, 4)};\n`;
                    fs.writeFileSync(configFilePath, updatedConfigContent, 'utf-8');

                    // Collect all "var" placeholders matches using match
                    const result = htmlBuilder.collectVarPlaceholders(content, filePath)
                    if(result.hasChanged){
                        content = result.content;
                        changeableHtmlFileList.push(filePath)
                    }
                    fs.writeFileSync(filePath, content, 'utf-8');
                }
            });
        };
        searchHtmlFiles(this.basePath); // Start searching from the base path
        console.log(changeableHtmlFileList);
        // Rewrite /RoutingMapLoad.js based on changeableHtmlFileList
        const routingMapLoadPath = path.resolve(this.basePath, "src", '../user/RoutingMapLoad.js');
        const imports = [];
        const newClasses = [];
        const routes = [];

        changeableHtmlFileList.forEach((filePath) => {
            const relativePath = path.relative(path.resolve(this.basePath, "src"), filePath).replace(/\\/g, '/');
            const moduleName = path.basename(filePath, '.html');
            const routeName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
            const routeLowerName = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);

            imports.push(`const ${routeName} = require('./${relativePath.replace(/\.html$/, '')}');`);
            newClasses.push(`const ${routeLowerName} = new ${routeName}()`);
            routes.push(`    routingMap.addRoute("/${routeName}", wrapHtml_200_Response(${routeLowerName}.generateHtml.bind(${routeLowerName})));`);
            routes.push(`    routingMap.addRoute("/${routeName}.html", wrapHtml_200_Response(${routeLowerName}.generateHtml.bind(${routeLowerName})));`);
            routes.push(`    routingMap.addRoute("/${routeName}.js", wrapHtml_200_Response(${routeLowerName}.generateHtml.bind(${routeLowerName})));`);
        });

        const newRoutingMapContent = `const fs = require('fs');
${imports.join('\n')}
${newClasses.join('\n')}

function wrapHtml_200_Response(fn) {
    return function (req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(fn());
    };
}

function loadRoutingMap(routingMap) {
${routes.join('\n')}
}

module.exports = { loadRoutingMap, wrapHtml_200_Response};
`;

        fs.writeFileSync(routingMapLoadPath, newRoutingMapContent, 'utf-8');
        console.log('RoutingMapLoad.js updated successfully.');
    }
}

module.exports = Builder;
