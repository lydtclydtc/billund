'use strict';

const path = require('path');
const glob = require('glob');
const constants = require('../../common/constants.js');

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
    if (!config.dir) throw new Error('missing dir in page-config-matcher config');
    if (!config.pattern) throw new Error('missing pattern in page-config-matcher config');
    if (!config.serverDist) throw new Error('missing serverDist in page-config-matcher config');
    if (!config.browserDist) throw new Error('missing browserDist in page-config-matcher config');

    const files = findPageConfigs(config.dir, config.pattern);
    if (!(files && files.length)) throw new Error(`no page-config find in ${config.dir}, pattern is ${config.pattern}`);

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
        const serverEntryPath = path.resolve(config.serverDist, path.relative(config.dir, file));
        const browserEntryPath = path.resolve(config.browserDist, path.relative(config.dir, file));
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