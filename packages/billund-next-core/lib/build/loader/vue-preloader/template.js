'use strcit';

const _ = require('lodash');
const jsdom = require('jsdom');

const cache = require('../common/cache');

module.exports = function(content) {
    const options = cache.get(this.resourcePath);
    if (!(options && options.widgetInfos && Object.keys(options.widgetInfos).length)) return content;

    const widgetInfos = _.cloneDeep(options.widgetInfos);

    const dom = new jsdom.JSDOM(content);
    const doc = dom.window.document;
    Object.keys(widgetInfos).forEach((tag) => {
        const eles = Array.prototype.slice.call(doc.querySelectorAll(tag));
        if (!(eles && eles.length)) return;

        const items = widgetInfos[tag];

        eles.forEach((el, index) => {
            const item = items[index];

            const innerHtml = el.innerHTML;
            const names = el.getAttributeNames();
            const node = doc.createElement(item.id);
            node.innerHTML = innerHtml;

            names.forEach((name) => {
                node.setAttribute(name, el.getAttribute(name));
            });
            node.setAttribute('_widget_id', item.id);
            el.replaceWith(node);
        });
    });

    return doc.body.innerHTML;
}