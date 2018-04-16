'use strict';

const path = require('path');

module.exports = {
    entry: {
        test: path.resolve(__dirname, './assest/test.pageconfig.json')
    },
    output: {
        path: path.join(__dirname, './dist/server/'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    presets: ['es2015-node', 'stage-0'],
                    cacheDirectory: false
                }
            }]
        }, {
            test: /\.pageconfig\.json/,
            use: [{
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    presets: ['es2015-node', 'stage-0'],
                    cacheDirectory: false
                }
            }, {
                loader: require.resolve('../../lib/build/loader/page-config-loader/index')
            }]
        }, {
            test: /\.vue$/,
            use: [{
                loader: 'vue-loader',
                options: {
                    preLoaders: {
                        js: require.resolve('../../lib/build/loader/vue-preloader/script'),
                        html: require.resolve('../../lib/build/loader/vue-preloader/template')
                    }
                }
            }, {
                loader: require.resolve('../../lib/build/loader/enhanced-vue-preloader/index'),
                options: {
                    widgetRegExp: /\.widget\.json/
                }
            }]
        }, {
            test: /\.widget\.json/,
            use: [{
                loader: 'babel-loader',
                options: {
                    babelrc: false,
                    presets: ['es2015-node', 'stage-0'],
                    cacheDirectory: false
                }
            }, {
                loader: require.resolve('../../lib/build/loader/widget-loader/index')
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