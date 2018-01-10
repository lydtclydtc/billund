'use strict';

const renderEnums = require('billund-enums').render;

module.exports = function*(config) {
    const routerConfig = config.routerConfig;
    if (!routerConfig) {
        return {
            result: ''
        };
    }
    const unsafeStr = JSON.stringify(routerConfig);
    const safeStr = encodeURIComponent(unsafeStr);
    return {
        result: `<script class="lego-router-config">window.${renderEnums.KEY_ROUTER_CONFIG}=JSON.parse(decodeURIComponent("${safeStr}"))</script>`
    };
};