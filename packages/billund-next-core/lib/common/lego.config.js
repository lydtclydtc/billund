'use strict';

const path = require('path');

module.exports = {
    isDev: false,
    srcDir: process.cwd(),
    rootDir: process.cwd(),
    serverDist: path.resolve(this.rootDir, './serverDist/next/'), // server端打包地址
    browserDist: path.resolve(this.rootDir, './dist/next/'), // 浏览器端打包地址
    commonChunkName: 'next-vendor',
    commonChunkModules: ['billund-next', 'billund-next-core'],
    pageConfigDir: path.resolve(this.srcDir, './pageconfig/'),
    pageConfigPattern: '**/*.pageconfig.json',
    widgetRegExp: /\.widget\.json/
};