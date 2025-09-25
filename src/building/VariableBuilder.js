const fs = require('fs');
const path = require('path');

const htmlVarRegex = /<!--\s*var\((.*?)\)\s*-->([\s\S]*?)<!--\s*end\s*-->/g
const jsVarRegex = /\/\*+\s*var\s*\((.*?)\)\s*\*\/([\s\S]*?)\/\*+\s*end\s*\*\//g

class VariableBuilder {

    collectVarPlaceholders(content, filePath) {
        const htmlVarMatches = [...content.matchAll(htmlVarRegex)]
            .map(match => ({ match: match[0], key: match[1], value: match[2] }));

        const jsVarMatches = [...content.matchAll(jsVarRegex)]
            .map(match => ({ match: match[0], key: match[1], value: match[2] }));

        const varMatches = [...htmlVarMatches, ...jsVarMatches];

        if (varMatches.length > 0) {
            const jsFilePath = filePath.replace(/\.html$/, '.js');
            let jsContent = '';
            const className = path.basename(jsFilePath, '.js').replace(/^\w/, (c) => c.toUpperCase());

            if (fs.existsSync(jsFilePath)) {
                jsContent = fs.readFileSync(jsFilePath, 'utf-8');
            } else {
                fs.writeFileSync(jsFilePath, '', 'utf-8');
                console.log(className, 'Saved! in ', jsFilePath);
            }

            const constructorRegex = /constructor\s*\(\)\s*{([\s\S]*?)}/;
            const constructorMatch = jsContent.match(constructorRegex);

            let existingProperties = [];
            let existingPropertyMap = new Map();

            if (constructorMatch) {
                existingProperties = constructorMatch[0].match(/this\.(\w+)\s*=\s*`([^`]*)`;/g) || [];
                existingPropertyMap = existingProperties.reduce((map, prop) => {
                    const [, key, value] = prop.match(/this\.(\w+)\s*=\s*`([^`]*)`;/);
                    map[key] = value;
                    return map;
                }, {});
            }
            for (const varMatchesIndex in varMatches) {
                const {key, value} = varMatches[varMatchesIndex];
                if (!existingPropertyMap[key]) {
                    existingPropertyMap[key] = value;
                }else{
                    varMatches[varMatchesIndex].value = existingPropertyMap[key];
                }
            }

            const updatedProperties = Object.entries(existingPropertyMap)
                .map(([key, value]) => `        this.${key} = \`${value}\`;\n`)
                .join('');

            varMatches.forEach(({ key, value }) => {
                content = content.replace(
                    new RegExp(`<!--\\s*var\\(${key}\\)\\s*-->[\\s\\S]*?<!--\\s*end\\s*-->`, 'g'),
                    `<!-- var(${key}) -->${value}<!-- end -->`
                ).replace(
                    new RegExp(`/\\\*+\\s*var\\s*\\(${key}\\)\\s*\\\*/[\\s\\S]*?/\\\*+\\s*end\\s*\\\*/`, 'g'),
                    `/* var(${key}) */${value}/* end */`
                );
            });

            const constructorCode = `
    constructor() {
${updatedProperties}    }
`;

            const methodArgs = varMatches.map(({ key }) => `${key} = this.${key}`).join(', ');
            const methods = `
    generateHtml(${methodArgs}) {
        return \`${content.replace(/<!--\s*var\((.*?)\)\s*-->[\s\S]*?<!--\s*end\s*-->/g, (match, key) => {
            return `<!-- var(${key}) -->\${${key}}<!-- end -->`;
        }).replace(/\/\*+\s*var\s*\((.*?)\)\s*\*\/([\s\S]*?)\/\*+\s*end\s*\*\//g, (match, key) => {
            return `/* var(${key}) */\${${key}}/* end */`;
        }).replace(/(\\`|`)/g, (match) => (match === "`" ? "\\`" : "\\\\\\`"))}\`;
    }
`;
            jsContent = `class ${className} {\n${constructorCode}${methods}}\n\nmodule.exports = ${className};\n`;
            fs.writeFileSync(jsFilePath, jsContent, 'utf-8');
        }
        return {hasChanged:varMatches.length > 0, content};
    }
}

module.exports = VariableBuilder;