'use strict';

const path = require('path');
const glob = require('glob');
const constants = require('../../common/constants.js');
const pageConfigFinder = require('../../common/page-config-finder');

function* defaultAction() {
    return Object.assign({}, constants.DEFAULT_LEGO_CONFIG);
}

function findPageConfigs(dir, pattern) {
    return glob.sync(pattern, {
        cwd: dir
    });
}

/**
 * 匹配页面配置
 *
 * @param  {Object} config - 查询配置
 * {
 *      dir: [String], pc所在的文件夹
 *      pattern: [String], glob的pattern
 *      serverDist: [String] server端的打包地址
 *      browserDist: [String] browser端打包地址
 * }
 * @return {Array}
 */
function matchPageConfigs(config) {
    if (!config) throw new Error('missing page-config-matcher config');
    if (!config.pageConfigDir) throw new Error('missing pageConfigDir in page-config-matcher config');
    if (!config.pageConfigPattern) throw new Error('missing pageConfigPattern in page-config-matcher config');
    if (!config.serverDist) throw new Error('missing serverDist in page-config-matcher config');
    if (!config.browserDist) throw new Error('missing browserDist in page-config-matcher config');

    const files = pageConfigFinder.getFiles(config);

    /*
        pageConfig的字段如下:
        {
            url: [String|Array], // 当前node端url的地址
            action: [String], // node端入口路径
            page: [String], // page层的vue文件
            router: [String], // router地址,
            store: [String], store地址，
            staticMethods: [String] // 静态方法！只有前端能使用的方法
        }
     */
    return files.reduce((arr, file) => {
        /*
            需要额外解析出
            serverEntry
            browserEntry
            同时必须对必须字段做基本的检查 & 兼容
         */
        const serverEntryPath = path.resolve(config.serverDist, path.relative(config.pageConfigDir, file));
        const browserEntryPath = path.resolve(config.browserDist, path.relative(config.pageConfigDir, file));
        let serverEntry = null;
        try {
            serverEntry = require(serverEntryPath);
        } catch (e) {
            throw new Error(`require serverEntry failed in ${file},please check built bundle in ${serverEntryPath}`);
        }
        if (!serverEntry.url) throw new Error(`no url defined in ${file}`);
        if (!serverEntry.action) {
            serverEntry.action = defaultAction;
        }
        if (!serverEntry.page) throw new Error(`no page defined in ${file}`);
        if (serverEntry.layout) {
            serverEntry.layout = path.resolve(file, serverEntry.layout);
        }

        return Object.assign(serverEntry, {
            file,
            browserEntryPath
        });
    }, []);
}

module.exports = {
    matchPageConfigs
};