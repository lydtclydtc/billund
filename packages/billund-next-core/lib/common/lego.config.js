'use strict';

const path = require('path');
const cwd = process.cwd();

module.exports = {
    isDev: false,
    serverDist: path.resolve(cwd, './serverdist/next/'), // server端打包地址
    browserDist: path.resolve(cwd, './dist/next/'), // 浏览器端打包地址
    build: {
        server: {
            externals: ['billund-next', 'billund-next-core'],
            ignores: []
        },
        browser: {
            commonChunkName: 'next-vendor',
            commonChunkModules: ['billund-next', 'billund-next-core']
        }
    },
    pageConfigDir: path.resolve(cwd, './pageconfig/'),
    pageConfigPattern: '**/*.pageconfig.json',
    widgetRegExp: /\.widget\.json/
};