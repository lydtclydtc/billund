'use strict';

const path = require('path');
const Koa = require('koa');
const Billund = require('billund');
const meta = require('./mods/renderplugins/meta/index.js');
const staticResource = require('./mods/renderplugins/staticresource/index.js');

const app = new Koa();
const legoConfig = require('./package.json').legoconfig;

try {
    const billundFunc = Billund.init({
        actionDir: path.resolve(__dirname, legoConfig.actiondir),
        actionNameRegex: new RegExp(legoConfig.actionRegExp),
        widgetDir: path.resolve(__dirname, legoConfig.serverdist),
        widgetNameRegex: /\.(js)$/,
        vendors: {
            react: '<%- PkgName %>/react.js',
            vue: '<%- PkgName %>/vue.js'
        },
        renderPlugins: {
            header: [meta, staticResource]
        }
    });
    app.use(billundFunc);
    app.listen(8080);
    console.log('listening 8080 server start!');
} catch (e) {
    console.error(e);
    process.exit(1);
}