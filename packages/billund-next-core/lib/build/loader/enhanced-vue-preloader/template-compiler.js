'use strict';

const path = require('path');
const fs = require('fs');
const compiler = require('vue-template-compiler');
const hash = require('hash-sum');

function getContent(template) {
    if (!template) {
        this.emitWarning(new Error(`no template content find in ${this.resourcePath}`));
        return '';
    }
    return template.src ? fs.readFileSync(path.resolve(this.resourcePath, `../${template.src}`), {
        encoding: 'utf-8'
    }) : template.content;
}

function extractWidgets(content, widgetVariables, isServer) {
    widgetVariables = widgetVariables || [];

    const rets = {};

    const compile =
        isServer && compiler.ssrCompile ?
        compiler.ssrCompile :
        compiler.compile;
    compile(content, {
        modules: [{
            preTransformNode(el) {
                const tag = el.tag;
                if (widgetVariables.indexOf(tag) === -1) return el;

                const attrsMap = el.attrsMap;
                const isKeystone = !!(attrsMap && attrsMap.keystone && attrsMap.keystone === 'true');

                if (!rets[tag]) {
                    rets[tag] = [];
                }
                rets[tag].push({
                    tag,
                    keystone: isKeystone
                });
                return el;
            }
        }]
    });
    Object.keys(rets).forEach((key) => {
        rets[key] = rets[key].map((item, index) => {
            return Object.assign(item, {
                id: hash(`${this.resourcePath}-${item.tag}-${index}`)
            });
        });
    });
    return rets;
}

module.exports = {
    getContent,
    extractWidgets
};