'use strict';

const router = require('koa-router');
const convert = require('koa-convert');

let routerIns = null;
let initedConfig = null;

function initRouter() {
    if (!initedConfig) throw new Error('none pageConfigs finded');
    const urlRecords = {};
    const route = router();

    function register(url, pageConfig) {
        if (!pageConfig) throw new Error('initRouter error,pageConfig can not be empty');
        if (urlRecords[url]) throw new Error(`duplicate define router url: ${url}, files: ` +
            JSON.stringify([urlRecords[url], pageConfig.file]));
        /**
         * 前置处理函数,如果有legoConfig，那么在里面增加__next为true，来标识新老版本
         *
         * @param {Function} next
         */
        let processor = function*(next) {
            yield next;
            if (this.legoConfig) {
                this.legoConfig['__next'] = true;
                this.legoConfig['__pageConfig'] = pageConfig;
            }
        };
        let action = pageConfig.action;
        if (initedConfig.koa2) {
            processor = convert(processor);
            action = convert(action);
        }
        route.register(url, ['get', 'post'], [processor, action]);
        urlRecords[url] = pageConfig.file;
    }

    (initedConfig.pageConfigs || []).forEach((pc) => {
        if (!pc) throw new Error('initRouter error,pageConfig can not be empty');
        if (!pc.url) throw new Error(`no url defined in ${pc.file}`);
        register(pc.url, pc);
    });

    routerIns = route.routes();
}

/**
 * 绑定路由方法
 *
 * @param  {Object} config - 绑定配置路由信息
 * {
 *      koa2: [Boolean],来自koa2的配置
 *      pageConfigs: [Array] pageConfig的列表
 * }
 */
function bindRouter(config) {
    if (!config) throw new Error('bindRouter required config!');
    if (!(config.pageConfigs && config.pageConfigs.length)) throw new Error('no pageConfigs finded in bindRouter');

    initedConfig = config;
    initRouter();
}

function updateRouter(config) {
    if (initedConfig && initedConfig.pageConfigs && initedConfig.pageConfigs.length) {
        const decache = require('decache');
        initedConfig.pageConfigs.forEach((pageConfig) => {
            decache(pageConfig.serverBundle);
            console.log(`${pageConfig.file} decache.`);
        });
    }
    if (config) {
        initedConfig = config;
    }
    initRouter();
}

function getRouter() {
    return routerIns;
}

module.exports = {
    bindRouter,
    getRouter,
    updateRouter
};