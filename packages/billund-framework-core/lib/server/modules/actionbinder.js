'use strict';

const isDev = (process.env.LEGO_ENV === 'development' || process.env.LEGO_ENV === 'dev' || process.env.BILLUND_ENV === 'development' || process.env.BILLUND_ENV === 'dev');

const path = require('path');
const _ = require('lodash');
const legoUtils = require('billund-utils');
const decache = require('decache');
const convert = require('koa-convert');

const gaze = require('gaze');

/*
    watch变化的文件路径
    router实例
 */
let watchFiles = [];
let routerIns = null;
let watched = false;
/*
    url2ActionConfig的数据设计：
    key: url[String],
    value: actonConfig {
        actionPath: [String], // action的路径
        action: [GeneratorFunction], // 用以执行的迭代器函数
        routerConfig: String // routerConfig路径
    }
 */
let url2ActionConfig = null;
let initedConfig = null;

/**
 * 初始化router
 *
 * @param  {Array} actions - controler层的列表
 */
function initRouter() {
    const url2Path = {};
    const router = require('koa-router')();

    /**
     * 向router中注册url & action
     *
     * @param  {String} url - router的路径
     * @param  {GeneratorFunction} actionConfig - 执行函数
     * @param  {String} actionPath - actino路径
     */
    function registUrlToAction(url, actionConfig, actionPath) {
        if (!(url && actionConfig && actionConfig.action)) return;

        if (url2Path[url]) throw new Error(`duplicate define router url: ${url}`);

        url2Path[url] = true;
        let staticRc = null;
        const actionPathDir = path.resolve(actionPath, '../');
        if (actionConfig.routerConfig) {
            staticRc = path.resolve(actionPathDir, actionConfig.routerConfig);
        }

        let injector = function* injector(next) {
            yield next;
            /*
                 如果有routerConfig的话
                 是一个字符串，那么是相对的路径，目前只有这种情况才能解决代码解析的问题
             */
            if (this.legoConfig) {
                // 优先判断routerConfigPath
                if (this.legoConfig.routerConfigPath) {
                    let rcPath = '';
                    if (path.isAbsolute(this.legoConfig.routerConfigPath)) {
                        rcPath = this.legoConfig.routerConfigPath;
                    } else {
                        rcPath = path.resolve(actionPathDir, this.legoConfig.routerConfigPath);
                    }
                    this.legoConfig.staticRouterConfig = require(rcPath);
                    if (isDev) {
                        collectFileAndChildren(rcPath);
                    }
                } else if (staticRc) {
                    this.legoConfig.staticRouterConfig = require(staticRc);
                }
            }
        };
        let action = actionConfig.action;
        if (initedConfig && initedConfig.koa2) {
            injector = convert(injector);
            action = convert(actionConfig.action);
        }
        router.register(url, ['get', 'post'], [injector, action]);
        /*
            如果是dev的话，加入watchFile
        */
        if (isDev) {
            collectFileAndChildren(actionPath);
            collectFileAndChildren(staticRc);
        }
    }

    Object.keys(url2ActionConfig).forEach((url) => {
        const actionConfig = url2ActionConfig[url];
        const actionPath = actionConfig.actionPath;
        registUrlToAction(url, actionConfig, actionPath);
    });

    routerIns = router.routes();
    if (!watched) {
        watchFilesChange();
        watched = true;
    }
}

/**
 * 更新widgets信息
 */
function updateRouter() {
    watchFiles.forEach((file) => {
        decache(file);
        console.log(`${file} decache.`);
    });
    initRouter();
}

/**
 * watch文件的变更
 */
function watchFilesChange() {
    watchFiles.forEach((file) => {
        gaze(file, function(err) {
            if (err) {
                console.warn(err);
                console.log(`watch ${file} file fail`);
                return;
            }
            this.on('changed', () => {
                updateRouter();
            });
        });
    });
}

/**
 * 收集当前文件和它的引用文件
 *
 * @param  {String} pathname - 当前文件
 */
function collectFileAndChildren(pathname) {
    if (!pathname) return;
    // 如果已经监听过，不做收集
    if (watched) return;
    // 因为超过调用上限的问题，不监听node_modules下的变化
    if (/\/node_modules\//.test(pathname)) return;

    const findedIndex = watchFiles.findIndex((filePath) => {
        return filePath === pathname;
    });
    const isExisted = findedIndex !== -1;
    if (!isExisted) {
        const list = [pathname];
        let children = [];
        try {
            children = require.cache[pathname].children;
        } catch (e) {
            children = [];
        }
        if (children && children.length) {
            children.forEach((child) => {
                const childFindedIndex = watchFiles.findIndex((filePath) => {
                    return filePath === child.filename;
                });
                if (childFindedIndex === -1) {
                    collectFileAndChildren(child.filename);
                }
            });
        }
        watchFiles = watchFiles.concat(list);
    }
}

/**
 * 准备action的map
 *
 * @param  {Object} config - 对应的配置项目
 * @return {Object}
 */
function prepareUrl2ActionConfig(config) {
    /*
        优先判断url2ActionConfig
     */
    let ret = {};
    if (config.url2ActionConfig) {
        ret = Object.assign({}, config.url2ActionConfig);
    }
    const storeActionPaths = legoUtils.common.getFilteredFiles(config.actionDir, {
        nameRegex: config.nameRegex
    });
    (storeActionPaths || []).forEach((action) => {
        let actionConfig = null;
        try {
            actionConfig = require(action);
        } catch (e) {
            console.error(e);
            return true;
        }

        // 如果没有要的属性,就过滤掉
        if (!(actionConfig && actionConfig.url)) return true;

        const urls = _.isArray(actionConfig.url) ? actionConfig.url : [actionConfig.url];

        urls.forEach((url) => {
            ret[url] = Object.assign({
                actionPath: action
            }, actionConfig);
        });
    });
    return ret;
}

/**
 * 绑定对应的action到routers中
 *
 * @param  {Object} config - 对应的配置项目,字段如下:
 * {
 *      actionDir: [String], // action的文件夹名称
 *      url2ActionConfig: [Object], // action的url与actionConfig的映射
 *      nameRegex: [Regex|String] // 名称的正则
 *      fallbackUrl: [String] // 降级的url
 * }
 */
function bindActionRouter(config) {
    if (!(config && (config.actionDir || config.url2ActionConfig))) throw new Error('missing actionDir or url2ActionConfig config in lego framework');

    initedConfig = Object.assign({}, config);
    url2ActionConfig = prepareUrl2ActionConfig(config);
    initRouter();
}

function getRouter() {
    return routerIns;
}

module.exports = {
    getRouter,
    bindActionRouter
};
