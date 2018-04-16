'use strict';

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const storeUtil = require('./store');
const renderUtil = require('./render.js');
const parallel = require('./parallel.js');

/*
    渲染插件
 */
const baseMetaPlugin = require('./renderplugins/basemeta/index.js');
const pageTitlePlugin = require('./renderplugins/pagetitle/index.js');
const DEFAULT_HEADER_PLUGINS = [baseMetaPlugin, pageTitlePlugin];

const pageHtmlPlugin = require('./renderplugins/pagecontent/index.js');
const initialStatePlugin = require('./renderplugins/initialstate/index.js');
const iosFixedStylePlugin = require('./renderplugins/iosfixedstyle/index.js');
const backAutoRefreshPlugin = require('./renderplugins/backautorefresh/index.js');
const widgetPropsPlugin = require('./renderplugins/widgetprops/index.js');
const DEFAULT_BODY_PLUGINS = [
    pageHtmlPlugin,
    initialStatePlugin,
    iosFixedStylePlugin,
    backAutoRefreshPlugin,
    widgetPropsPlugin
];

const DEFAULT_LAYOUT = path.resolve(__dirname, '../../layout/default.html');

// 全局配置
let appConfig = null;
const layoutPath = {};

/**
 * 初始化方法
 *
 * @param  {Object} config - 配置对象:
 * {
 *      renderPlugins: [Object] // 渲染插件,一般会有header和body两个字段,对应不同的位置
 * }
 * @return {GeneratorFunction}
 */
function init(config) {
    if (!config) throw new Error('missing appConfig in core-worker init function');
    appConfig = config;

    const renderPlugins = appConfig.renderPlugins || {};
    const headerPlugins = DEFAULT_HEADER_PLUGINS.concat(renderPlugins.header || []);
    const bodyPlugins = DEFAULT_BODY_PLUGINS.concat(renderPlugins.body || []);
    appConfig.renderPlugins = {
        header: headerPlugins,
        body: bodyPlugins
    };
    return execute;
}

/**
 * 执行方法
 *
 * @param  {Object} context - koa上下文
 */
function* execute(context) {
    const legoConfig = context.legoConfig;
    legoConfig.storeData = Object.assign({}, legoConfig.storeData);

    // 原因是 如果storeData和params用了同一个数据,然后数据又注册进了Store，导致自身重复引用
    const originalStoreData = Object.assign({}, legoConfig.storeData);
    const pageConfig = legoConfig['__pageConfig'];

    const store = storeUtil.createStore(context, legoConfig.storeData, pageConfig.store || {});
    const pageHtml = yield renderUtil.render(context, pageConfig, store);
    const staticResources = getStaticResources(context, pageConfig);

    let pluginConfig = {
        noServerRender: !!legoConfig.noServerRender,
        allowShowEvenFailed: !!legoConfig.allowShowEvenFailed,
        pageHtml,
        store,
        storeData: originalStoreData,
        staticResources,
        options: legoConfig.options,
        widgetStates: legoConfig['__widgetStates']
    };
    /*
        接着，就是运行的核心流程了,通过各种plugins来生成html
        分为两种种plugins:
        header,
        body

        每个plugins暴露出来的都是一个GeneratorFunction,接收两个参数
        1.config - 当前执行配置，有以下几个基本字段:
            storeData: [Object], // 传给前端的全局数据,
            pageHtml: [String], // 生成的page-html
            staticResources: [Array], // 引用的静态资源,以entry和styles为区分
            options: [Object], // 对应的可选配置，可以自由拓展
        2.context - 上下文

        都要求返回一个Object内容,字段如下:
        {
            1.result: [String] // 字符串,会添加到html上
        }
     */
    const plugins = appConfig.renderPlugins;

    const headerPlugins = plugins.header || [];
    const bodyPlugins = plugins.body || [];

    const headerTasks = headerPlugins.map((fn) => {
        return function*() {
            return yield fn(pluginConfig, context);
        };
    });
    const bodyTasks = bodyPlugins.map((fn) => {
        return function*() {
            return yield fn(pluginConfig, context);
        };
    });

    const renderResult = yield {
        header: parallel(headerTasks, {
            fallback: null,
            timeout: 2000
        }),
        body: parallel(bodyTasks, {
            fallback: null,
            timeout: 2000
        })
    };

    let headerResults = renderResult.header;
    headerResults = headerResults.map((result) => {
        if (!(result && result.result)) return '';
        return result.result.result;
    });

    let bodyResults = renderResult.body;
    bodyResults = bodyResults.map((result) => {
        if (!(result && result.result)) return '';
        return result.result.result;
    });

    const layout = getLayout(pageConfig);
    context.body = ejs.render(layout, {
        headerResult: headerResults.join(''),
        bodyResult: bodyResults.join('')
    });
}

function getStaticResources(context, pageConfig) {
    const rets = [];
    if (appConfig.build && appConfig.build && appConfig.build.browser && appConfig.build.browser.commonChunkName) {
        rets.push({
            styles: `${appConfig.browserDist}${appConfig.build.browser.commonChunkName}.css`,
            entry: `${appConfig.browserDist}${appConfig.build.browser.commonChunkName}.js`
        });
    }
    rets.push({
        styles: `${pageConfig.browserBundleForStyles}`,
        entry: `${pageConfig.browserBundle}`
    });
    return rets;
}

function getLayout(pageConfig) {
    const templatePath = pageConfig.layout || DEFAULT_LAYOUT;
    let htmlStr = layoutPath[templatePath];
    if (!htmlStr) {
        htmlStr = fs.readFileSync(templatePath, {
            encoding: 'utf-8'
        });
        layoutPath[templatePath] = htmlStr;
    }
    return htmlStr;
}

function storeWidgetState(ctx, widgetId, state) {
    ctx.legoConfig['__widgetStates'] = Object.assign({}, ctx.legoConfig['__widgetStates'], {
        [widgetId]: state
    });
}

module.exports = {
    init,
    storeWidgetState
};