'use strict';

const path = require('path');
const constants = require('../../common/constants.js');
const pageConfigFinder = require('../../common/page-config-finder');

function* defaultAction() {
    return Object.assign({}, constants.DEFAULT_LEGO_CONFIG);
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

    const configs = pageConfigFinder.getConfigs(config);

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
    return configs.map((oriConfig) => {
        if (!(oriConfig && oriConfig.serverBundle)) throw new Error(`require serverBundle failed in ${oriConfig.absolutePath}`);

        const serverBundle = oriConfig.serverBundle;
        const browserBundle = oriConfig.browserBundle;
        let serverEntry = null;
        try {
            serverEntry = require(serverBundle);
            serverEntry = serverEntry.default || serverEntry;
        } catch (e) {
            throw new Error(`require serverEntry failed in ${oriConfig.absolutePath},please check built bundle in ${serverBundle},
                error: ${e.stack}`);
        }
        if (!serverEntry.url) throw new Error(`no url defined in ${oriConfig.absolutePath}`);
        if (!serverEntry.action) {
            serverEntry.action = defaultAction;
        }
        if (!serverEntry.page) throw new Error(`no page defined in ${oriConfig.absolutePath}`);
        if (serverEntry.layout) {
            serverEntry.layout = path.resolve(oriConfig.absolutePath, serverEntry.layout);
        }

        const browserBundleForStyles = path.format(Object.assign({}, path.parse(browserBundle), {
            ext: '.css'
        }));

        return Object.assign({}, serverEntry, {
            file: oriConfig.absolutePath,
            browserBundle,
            browserBundleForStyles
        });
    });
}

module.exports = {
    matchPageConfigs
};