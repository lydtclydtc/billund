'use strict';

const path = require('path');

module.exports = {
    entry: {
        page: path.resolve(__dirname, './assest/page.vue'),
        test: path.resolve(__dirname, './assest/test.vue')
    },
    output: {
        path: path.join(__dirname, './dist/server/'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [{
            test: /\.vue$/,
            use: [{
                loader: require.resolve('../../lib/build/loader/enhanced-vue-preloader/index'),
                options: {
                    widgetRegExp: /\.widget\.json/
                }
            }]
        }]
    },
    resolve: {
        // 添加后缀名顺序
        extensions: ['.js', '.jsx', '.vue', '.less']
    },
    target: 'node',
    devtool: false
};