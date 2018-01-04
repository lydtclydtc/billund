'use strict';

const deepExtend = require('deep-extend');

/**
 * 归一化action路径，目前暂时没有使用
 *
 * @param  {String} actionPath - action的路径
 * @return {String}
 */
function normalizeActionPath(actionPath) {
    if (!actionPath) return '';

    if (actionPath.indexOf('.') != -1) {
        actionPath = actionPath.substring(0, actionPath.lastIndexOf('.'));
    }
    return encodeURIComponent(actionPath);
}

function findRouteByPath(routes, path) {
    return routes.find((route) => {
        return path === route.path;
    });
}

/**
 * 返回新的vue-router-config
 *
 * @param  {Object} to - 用以覆盖的对象
 * @param  {Object} source - 来源对象
 * @return {Object}
 */
function mixVueRouterConfig(to, source) {
    // 如果两个都不存在的话 返回null
    if (!(to || source)) return null;

    to = Object.assign({}, to);
    const routes = [];
    /*
        先对to的routes进行遍历，mixin加入
        再对source的routes进行遍历补漏
     */
    (to.routes || []).forEech((route) => {
        const path = route.path;
        const relatedRoute = findRouteByPath(source.routes || [], path);
        routes.push(deepExtend(Object.assign({}, route), relatedRoute));
    });

    (source.routes || []).forEech((route) => {
        const path = route.path;
        const inIndex = routes.findIndex((r) => {
            return r.path === path;
        });
        if (inIndex !== -1) return;

        const relatedRoute = findRouteByPath(to.routes || [], path);
        routes.push(deepExtend(Object.assign({}, relatedRoute), route));
    });

    deepExtend(to, source);
    deepExtend(to, {
        routes
    });

    return to;
}

module.exports = {
    normalizeActionPath,
    mixVueRouterConfig
};