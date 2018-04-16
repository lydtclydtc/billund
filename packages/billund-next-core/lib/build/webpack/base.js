'use strict';

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

        const configs = pageConfigFinder.getConfigs(this.appConfig);

        const ret = {};
        configs.forEach((config) => {
            ret[config.relativePath] = config.absolutePath;
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

    getExternals() {
        const appConfig = this.appConfig;
        const isServer = this.isServer;
        const buildConfig = appConfig.build || {};
        if (isServer) {
            const serverConfig = buildConfig.server || {};
            const externals = serverConfig.externals || [];
            const ignores = serverConfig.ignores || [];
            const ret = {};
            externals.forEach((external) => {
                console.log(external);
                ret[external] = {
                    commonjs: external,
                    commonjs2: external
                };
            });

            const ignoreModule = require.resolve('../ignore');
            ignores.forEach((ignore) => {
                ret[ignore] = {
                    commonjs: ignoreModule,
                    commonjs2: ignoreModule
                };
            });
            return ret;
        } else {
            return {};
        }
    }

    getBabelLoader() {
        return {
            loader: require.resolve('babel-loader'),
            options: {
                babelrc: false,
                presets: ['es2015-node', 'stage-0'],
                cacheDirectory: false,
                plugins: [
                    'add-module-exports',
                    'transform-object-assign',
                    'array-includes'
                ]
            }
        };
    }

    getPageConfigRule() {
        const loader = require.resolve('../loader/page-config-loader/index');
        const entries = this.getEntries();
        const include = Object.keys(entries).map((key) => {
            return entries[key];
        }).filter((val) => {
            return !!val;
        });
        return {
            include,
            use: loader
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

    getVueRule() {
        const isServer = this.isServer;
        const jsPreloader = require.resolve('../loader/vue-preloader/script');
        const htmlPreloader = require.resolve('../loader/vue-preloader/template');

        const enancedVueLoader = this.getEnancedVueLoader();
        const vueLoader = {
            loader: require.resolve('vue-loader'),
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

    getWidegetRule() {
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

    getJsRule() {
        const babelLoader = this.getBabelLoader();
        return {
            test: /\.(js)$/,
            use: [babelLoader]
        };
    }

    getConfig() {
        const entries = this.getEntries();
        const output = this.getOutput();
        const pageConfigRule = this.getPageConfigRule();
        const vueRule = this.getVueRule();
        const widgetRule = this.getWidegetRule();
        const jsRule = this.getJsRule();
        const externals = this.getExternals();

        const config = {
            entry: entries,
            output,
            module: {
                rules: [jsRule, pageConfigRule, vueRule, widgetRule]
            },
            externals,
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