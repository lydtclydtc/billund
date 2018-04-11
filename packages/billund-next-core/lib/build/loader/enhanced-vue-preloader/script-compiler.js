'use strict';

const path = require('path');
const fs = require('fs');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const babelTypes = require('babel-types');

function isWidgetPath(mp, regexp) {
    /*
        路径有三种形式：
        1.绝对路径
        2.相对路径
        3.npm包
     */
    try {
        const absolutePath = require.resolve(mp);
        return regexp.test(absolutePath);
    } catch (e) {

    }
    return regexp.test(mp);
}

function getContent(script) {
    if (!script) {
        this.emitWarning(`no script content find in ${this.resourcePath}`);
        return '';
    }
    return script.src ? fs.readFileSync(path.resolve(this.resourcePath, `../${script.src}`), {
        encoding: 'utf-8'
    }) : script.content;
}

function matchWidgets(content, options) {
    if (!content) return [];

    const widgetRegExp = options.widgetRegExp;
    const rets = [];

    const ast = babylon.parse(content, {
        sourceType: 'module' // default: "script"
    });
    traverse(ast, {
        CallExpression(nodePath) {
            const isRequire = nodePath.node.callee && nodePath.node.callee.name === 'require';
            if (!isRequire) return;

            const modulePath = nodePath.node.arguments[0].value;
            if (isWidgetPath(modulePath, widgetRegExp)) {
                const parentPath = nodePath.findParent((pa) => pa.isVariableDeclarator());
                if (!parentPath) return;
                const key = parentPath.node.id.name;
                rets.push(key);
            }
        },
        ImportDeclaration(nodePath) {
            const requireVal = nodePath.node.source.value;

            const specifiers = nodePath.node.specifiers;
            const isExportDefault = specifiers[0].type === 'ImportDefaultSpecifier';
            if (!isExportDefault) return;

            if (isWidgetPath(requireVal, widgetRegExp)) {
                const key = specifiers[0].local.name;
                rets.push(key);
            }
        }
    });
    return rets;
}

function matchWidgetVariablesInTemplate(content, widgets) {
    const rets = [];

    const ast = babylon.parse(content, {
        sourceType: 'module' // default: "script"
    });

    traverse(ast, {
        ObjectExpression(nodePath) {
            if (!nodePath.parentPath.isExportDefaultDeclaration()) return;

            const properties = nodePath.node.properties || [];
            const cmpProperty = properties.find((property) => {
                return property.key.name === 'components' || property.key.value === 'components';
            });
            if (!cmpProperty) return;

            const targetProps = cmpProperty.value.properties || [];
            targetProps.forEach((property) => {
                const value = property.value;
                if (!babelTypes.isIdentifier(value)) return;

                if (widgets.indexOf(value.name) === -1) return;

                const key = property.key;
                rets.push({
                    key: babelTypes.isIdentifier(key) ? key.name : key.value,
                    value: value.name
                });
            });
        }
    });

    return rets;
}

module.exports = {
    getContent,
    matchWidgets,
    matchWidgetVariablesInTemplate
};