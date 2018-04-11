'use strict';

const _ = require('lodash');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const babelTypes = require('babel-types');
const generate = require('babel-generator').default;

const cache = require('../common/cache');

module.exports = function(content) {
    const options = cache.get(this.resourcePath);
    if (!(options && options.widgetInfos && Object.keys(options.widgetInfos).length)) return content;

    const widgetInfos = _.cloneDeep(options.widgetInfos);
    const ast = babylon.parse(content, {
        sourceType: 'module' // default: "script"
    });
    /*
    	目前只做局部模块的查询,billund不希望被使用到全局模块中
     */
    traverse(ast, {
        ObjectExpression(nodePath) {
            if (!nodePath.parentPath.isExportDefaultDeclaration()) return;

            const properties = nodePath.node.properties || [];
            const cmpProperty = properties.find((property) => {
                return property.key.name === 'components' || property.key.value === 'components';
            });
            if (!cmpProperty) return;

            const newProps = (cmpProperty.value.properties || []).reduce((arr, property) => {
                const value = property.value;
                if (!babelTypes.isIdentifier(value)) return arr;

                const key = property.key;
                const variable = babelTypes.isIdentifier(key) ? key.name : key.value;
                if (!(widgetInfos[variable] && widgetInfos[variable].length)) return arr;

                const toProps = widgetInfos[variable].map((item) => {
                    const callee = babelTypes.memberExpression(value, babelTypes.identifier('getComponent'));
                    const func = babelTypes.callExpression(callee, []);
                    return babelTypes.objectProperty(babelTypes.stringLiteral(item.id), func);
                });
                return arr.concat(toProps);
            }, []);
            cmpProperty.value.properties = newProps;
        }
    });

    return generate(ast, {}).code;
}