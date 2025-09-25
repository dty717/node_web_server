const fs = require('fs');
const path = require('path');
const config = require('../user/config/config'); // Import the config file
const VariableBuilder = require('./VariableBuilder');
const variableBuilder = new VariableBuilder()

const htmlRegex = /<!--\s*const\((.*?)\)\s*-->([\s\S]*?)<!--\s*end\s*-->/g
const jsRegex = /\/\*+\s*const\s*\((.*?)\)\s*\*\/([\s\S]*?)\/\*+\s*end\s*\*\//g
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
        const changeableHtmlFileList = []
        const unchangeableHtmlFileList = [];
        const searchHtmlFiles = (dir) => {
            const files = fs.readdirSync(dir);
            files.forEach((file) => {
                const filePath = path.join(dir, file);
                if(filePath.includes('\\user\\static')||filePath.includes('/user/static')||
                    filePath.includes('\\user\\middleware')||filePath.includes('/user/middleware')){
                    return;
                }
                if (fs.statSync(filePath).isDirectory()) {
                    // Recursively search subdirectories
                    searchHtmlFiles(filePath);
                } else if (path.extname(file) === '.html') {
                    let content = fs.readFileSync(filePath, 'utf-8');

                    // Process "const" placeholders
                    content = content.replace(htmlRegex, (match, key, value) => {
                        if (config[key]) {
                            return `<!-- const(${key}) -->${config[key]}<!-- end -->`;
                        } else {
                            config[key] = value; // Add to config with the value from HTML
                            // return `<!-- const(${key}) -->${value}<!-- end -->`;
                            return match;
                        }
                    }).replace(jsRegex, (match, key, value ) => {
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
                    const result = variableBuilder.collectVarPlaceholders(content, filePath)
                    if(result.hasChanged){
                        content = result.content;
                        changeableHtmlFileList.push(filePath)
                    }else{
                        unchangeableHtmlFileList.push(filePath);
                        const jsFilePath = filePath.replace(/\.html$/, '.js');
                        if (fs.existsSync(jsFilePath)) {
                            fs.unlinkSync(jsFilePath);
                            console.log(`Deleted JS file: ${jsFilePath}`);
                        }
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

        // Process changeable HTML files
        changeableHtmlFileList.forEach((filePath) => {
            const relativePath = path.relative(path.resolve(this.basePath, "src"), filePath).replace(/\\/g, '/');
            const fileName = path.basename(filePath);
            const modulePath = path.relative(path.join(this.basePath, "user"), filePath).replace(/\\/g, '/').replace(new RegExp(fileName+"$"),"")
            const modulePathName = modulePath.replace(/\\/g,'/').replace(/\//g,'___')

            const moduleName =  path.basename(filePath, '.html');
            const routeName = modulePathName + moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
            const routeLowerName = modulePathName + moduleName.charAt(0).toLowerCase() + moduleName.slice(1);

            imports.push(`const ${routeName} = require('./${relativePath.replace(/\.html$/, '')}');`);
            newClasses.push(`const ${routeLowerName} = new ${routeName}()`);
            routes.push(`    routingMap.addRoute("/${modulePath + moduleName}", wrapHtml_200_Response(${routeLowerName}.generateHtml.bind(${routeLowerName})));`);
            routes.push(`    routingMap.addRoute("/${modulePath + moduleName}.html", wrapHtml_200_Response(${routeLowerName}.generateHtml.bind(${routeLowerName})));`);
            routes.push(`    routingMap.addRoute("/${modulePath + moduleName}.js", wrapHtml_200_Response(${routeLowerName}.generateHtml.bind(${routeLowerName})));`);
        });

        // Process unchangeable HTML files
        unchangeableHtmlFileList.forEach((filePath) => {
            const relativePath = path.relative(path.join(this.basePath, "user"), filePath).replace(/\\/g, '/');
            const fileName = path.basename(filePath);
            const modulePath = relativePath.replace(new RegExp(fileName+"$"),"")
            const modulePathName = modulePath.replace(/\\/g,'/').replace(/\//g,'___')

            const absolutePath = filePath.replace(/\\/g, '/');
            const moduleName = modulePath + path.basename(filePath, '.html');
            const routeLowerName = modulePathName + moduleName.charAt(0).toLowerCase() + moduleName.slice(1);

            if (config.htmlLoadingFromFile) {
                routes.push(`    routingMap.addRoute("/${moduleName}", fileToHtml_200_Response('${absolutePath}'));`);
                routes.push(`    routingMap.addRoute("/${moduleName}.html", fileToHtml_200_Response('${absolutePath}'));`);
            } else {
                routes.push(`    const ${routeLowerName} = fs.readFileSync('${absolutePath}');`);
                routes.push(`    routingMap.addRoute("/${moduleName}", wrapHtmlPlainText_200_Response(${routeLowerName}));`);
                routes.push(`    routingMap.addRoute("/${moduleName}.html", wrapHtmlPlainText_200_Response(${routeLowerName}));`);
            }
        });

        const newRoutingMapContent = `const fs = require('fs');
const { wrapHtml_200_Response, wrapHtmlPlainText_200_Response, fileToHtml_200_Response } = require('../routing/Router');
${imports.join('\n')}
${newClasses.join('\n')}


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
