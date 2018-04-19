'use strict';

const _ = require('lodash');
const {
    KEY_STORE_GLOBAL_STATE
} = require('../../../../common/constants');

/**
 * 生成对应的pageTitle
 *
 * @param {Object} config - 对应的配置
 * @return {Object}
 */
module.exports = function*(config) {
    config = config || {};
    const storeData = config.storeData && _.isObject(config.storeData) ? config.storeData : {};

    const unsafeStr = JSON.stringify(storeData);
    const safeStr = encodeURIComponent(unsafeStr);
    return {
        result: `<script class="lego-initial-state">window.${KEY_STORE_GLOBAL_STATE}=JSON.parse(decodeURIComponent("${safeStr}"))</script>`
    };
};