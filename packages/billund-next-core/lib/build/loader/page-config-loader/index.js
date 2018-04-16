'use strict';

const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const babelTypes = require('babel-types');
const generate = require('babel-generator').default;

const FIELDS = ['url', 'action', 'page', 'router', 'store', 'staticMethods', 'layout'];
const FIELDS_REUQIRED = ['action', 'page', 'router', 'store', 'staticMethods'];

module.exports = function(source) {
    if (this.cacheable) this.cacheable();
    /*
        1.widget目前的配置都会是一个json，然后我们解出所有的值
        2.通过babel解析出所有的属性值
        3.生成对应的模板
     */
    let value = typeof source === 'string' ? JSON.parse(source) : source;
    value = JSON.stringify(value)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
    value = `module.exports = ${value}`;

    const ast = babylon.parse(value);
    const propertiesMap = {};
    traverse(ast, {
        MemberExpression(nodePath) {
            const isModuleExports = nodePath.node.object.name == 'module' && nodePath.node.property.name == 'exports';
            if (!isModuleExports) return;

            const parentPath = nodePath.findParent((pa) => pa.isAssignmentExpression());
            const exportsObj = parentPath.node.right;
            if (!babelTypes.isObjectExpression(exportsObj)) throw new Error(`error parsed ${this.resourcePath}`);

            const properties = exportsObj.properties || [];
            properties.forEach((property) => {
                const key = property.key.name || property.key.value;
                propertiesMap[key] = property.value;
            });
        }
    });

    // 进行校验，至少要有两个属性url,page
    if (!propertiesMap.url) {
        this.emitError(`not defined url in ${this.resourcePath}`);
        return '';
    }
    if (!propertiesMap.page) {
        this.emitError(`not defined page in ${this.resourcePath}`);
        return '';
    }

    const importNodes = FIELDS_REUQIRED.map((key) => {
        const fromPath = propertiesMap[key];
        if (!fromPath) return '';
        const keyNode = babelTypes.identifier(key);
        return babelTypes.importDeclaration(
            [babelTypes.importDefaultSpecifier(keyNode)], fromPath);
    }).filter((val) => {
        return !!val;
    });

    const exportProperties = FIELDS.map((key) => {
        const val = propertiesMap[key];
        if (!val) return '';

        const keyNode = babelTypes.identifier(key);
        const valNode = FIELDS_REUQIRED.indexOf(key) === -1 ? val : babelTypes.identifier(key);
        return babelTypes.objectProperty(keyNode, valNode);
    }).filter((val) => {
        return !!val;
    });
    const exportNode = babelTypes.exportDefaultDeclaration(babelTypes.objectExpression(exportProperties));

    const newProgram = babelTypes.program((importNodes || []).concat([exportNode]));

    traverse(ast, {
        Program(nodePath) {
            nodePath.replaceWith(newProgram);
        }
    });
    return generate(ast, {}).code;
};