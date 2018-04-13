'use strict';

const path = require('path');
const _ = require('lodash');

const pageConfigFinder = require('../../common/page-config-finder');

class WebpackBaseConfig {
    constructor(config, extra) {
        this.appConfig = config;
        this.isDev = config.isDev;
        this.isServer = extra.isServer;

        this.entries = this.getEntries();
    }

    getEntries() {
        if (this.entries) return this.entries;

        const relativeFiles = pageConfigFinder.getFiles(this.appConfig);
        const dir = this.appConfig.pageConfigDir;

        const ret = {};
        relativeFiles.forEach((rf) => {
            const filePath = path.resolve(dir, rf);
            ret[rf] = filePath;
        });
        return ret;
    }

    getOutput() {
        const appConfig = this.appConfig;
        const isServer = this.isServer;
        const distPath = isServer ? appConfig.serverDist : appConfig.browserDist;
        const ret = {
            path: distPath,
            filename: '[name].js'
        };
        if (isServer) {
            ret.libraryTarget = 'commonjs2';
        }

        return ret;
    }

    getBabelLoader() {
        return {
            loader: 'babel-loader',
            options: {
                babelrc: false,
                presets: ['es2015-node', 'stage-0'],
                cacheDirectory: false
            }
        };
    }

    getEnancedVueLoader() {
        const loader = require.resolve('../loader/enhanced-vue-preloader/index');
        const widgetRegExp = this.appConfig.widgetRegExp;
        return {
            loader,
            options: {
                widgetRegExp
            }
        };
    }

    getVueRules() {
        const isServer = this.isServer;
        const jsPreloader = require.resolve('../loader/vue-preloader/script');
        const htmlPreloader = require.resolve('../loader/vue-preloader/template');

        const enancedVueLoader = this.getEnancedVueLoader();
        const vueLoader = {
            loader: 'vue-loader',
            options: {
                preLoaders: {
                    js: jsPreloader,
                    html: htmlPreloader
                }
            }
        };
        return {
            test: /\.vue$/,
            use: [vueLoader, enancedVueLoader]
        };
    }

    getWidegetRules() {
        const widgetRegExp = this.appConfig.widgetRegExp;
        const babelLoader = this.getBabelLoader();
        const widgetLoader = require.resolve('../loader/widget-loader/index');
        return {
            test: widgetRegExp,
            use: [babelLoader, {
                loader: widgetLoader
            }]
        };
    }

    getConfig() {
        const entries = this.getEntries();
        const output = this.getOutput();
        const vueRules = this.getVueRules();
        const widgetRules = this.getWidegetRules();

        const config = {
            entry: entries,
            output,
            module: {
                rules: [vueRules, widgetRules]
            },
            resolve: {
                extensions: ['.js', '.jsx', '.vue', '.less']
            }
        };
        if (this.isServer) {
            config.target = 'node';
        }

        return _.cloneDeep(config);
    }
}

module.exports = WebpackBaseConfig;