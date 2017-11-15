'use strict';

const isDev = (process.env.LEGO_ENV === 'development' || process.env.LEGO_ENV === 'dev' || process.env.BILLUND_ENV === 'development' || process.env.BILLUND_ENV === 'dev');

const _ = require('lodash');
const legoUtils = require('billund-utils');
const decache = require('decache');

const debug = require('debug');
const gaze = require('gaze');
const log = debug('billund-action-binder:info');

/*
    记录的action路径
    watch变化的文件路径
    router实例
 */
let storeActionPaths = null;
let watchFiles = [];
let routerIns = null;

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
     * @param  {GeneratorFunction} action - 执行函数
     */
    function registUrlToAction(url, action) {
        if (!(url && action)) return;

        if (url2Path[url]) throw new Error(`duplicate define router url: ${url}`);

        url2Path[url] = true;
        router.register(url, ['get', 'post'], [action]);
    }

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
            registUrlToAction(url, actionConfig.action);
        });
    });
    routerIns = router.routes();
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
    storeActionPaths.forEach((action) => {
        log(`${action} action update.`);
    });
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
 * 绑定对应的action到routers中
 *
 * @param  {Object} config - 对应的配置项目,字段如下:
 * {
 *      actionDir: [String], // action的文件夹名称
 *      nameRegex: [Regex|String] // 名称的正则
 *      fallbackUrl: [String] // 降级的url
 * }
 */
function bindActionRouter(config) {
    if (!(config && config.actionDir)) throw new Error('missing actionDir config in lego framework');

    storeActionPaths = legoUtils.common.getFilteredFiles(config.actionDir, {
        nameRegex: config.nameRegex
    });
    initRouter();
    /*
        新增功能，如果是开发环境
        那么watch action和它的引用文件，变更自动reload
     */
    if (isDev) {
        storeActionPaths.forEach((action) => {
            collectFileAndChildren(action);
        });
        watchFilesChange();
    }
}

function getRouter() {
    return routerIns;
}

module.exports = {
    getRouter,
    bindActionRouter
};