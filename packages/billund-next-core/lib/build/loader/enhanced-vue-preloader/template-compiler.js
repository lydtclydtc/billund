'use strict';

const path = require('path');
const fs = require('fs');
const hash = require('hash-sum');
const jsdom = require('jsdom');
const cwd = process.cwd();

function getContent(template) {
    if (!template) {
        this.emitWarning(new Error(`no template content find in ${this.resourcePath}`));
        return '';
    }
    return template.src ? fs.readFileSync(path.resolve(this.resourcePath, `../${template.src}`), {
        encoding: 'utf-8'
    }) : template.content;
}

function extractWidgets(content, widgetVariables) {
    const dom = new jsdom.JSDOM(content);
    const doc = dom.window.document;
    widgetVariables = widgetVariables || [];
    const rets = {};

    widgetVariables.forEach((variable) => {
        const tag = variable.key;
        const eles = Array.prototype.slice.call(doc.querySelectorAll(tag));
        if (!(eles && eles.length)) return;

        const arr = eles.map((el) => {
            const keystone = el.getAttribute('keystone');
            return {
                tag,
                variable: variable.value,
                keystone: !!keystone
            };
        });

        if (!rets[tag]) {
            rets[tag] = [];
        }
        rets[tag] = rets[tag].concat(arr);
    });

    const relativePath = path.relative(cwd, this.resourcePath);
    Object.keys(rets).forEach((key) => {
        rets[key] = rets[key].map((item, index) => {
            return Object.assign(item, {
                id: item.tag + '-' + hash(`${relativePath}-${item.tag}-${index}`)
            });
        });
    });

    return rets;
}

module.exports = {
    getContent,
    extractWidgets
};