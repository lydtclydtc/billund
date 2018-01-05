'use strict';

const isDev = (process.env.LEGO_ENV === 'development' || process.env.LEGO_ENV === 'dev' || process.env.BILLUND_ENV === 'development' || process.env.BILLUND_ENV === 'dev');

const debug = require('debug');
const log = debug('billund-vue-router:error');
const compareVersions = require('compare-versions');
const deepExtend = require('deep-extend');
const Vue = require('vue/dist/vue.common.js');
const VueRouter = require('vue-router');
Vue.use(VueRouter);

const VueRender = require('../../render/lib/vue.js');

function normalizeBase(base) {
    // make sure there's the starting slash
    if (base.charAt(0) !== '/') {
        base = '/' + base;
    }
    // remove trailing slash
    return base.replace(/\/$/, '');
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
    (to.routes || []).forEach((route) => {
        const path = route.path;
        const relatedRoute = findRouteByPath(source.routes || [], path);
        routes.push(deepExtend(Object.assign({}, route), relatedRoute));
    });

    (source.routes || []).forEach((route) => {
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

/**
 * 创建对应的vue-router实例
 *
 * @param  {Object} context - koa上下文
 * @param  {Object} config - 配置
 * @param  {Array} widgets - 对应的重要组件
 * @return {Object} router实例
 */
function createRouter(context, config, widgets) {
    if (!(config.routerConfig || config.staticRouterConfig)) return null;

    const routerConfig = mixVueRouterConfig(config.staticRouterConfig, config.routerConfig);
    if (!(routerConfig.routes && routerConfig.routes.length)) return null;

    const routes = routerConfig.routes;
    const rootPathIndex = routes.findIndex((route) => {
        return route.path === '/';
    });
    if (rootPathIndex === -1) {
        routes.push({
            path: '/'
        });
    }

    routes.forEach((route) => {
        route.components = route.components || {};

        const path = route.path;
        const props = route.props;
        if (props) {
            route.props = {};
            if (isDev && (compareVersions(Vue.version, '2.4.0') !== 1)) {
                log(`error: for vue version below 2.4.0 so that you can't use route prop`);
            }
        }
        widgets.forEach((widget) => {
            // 没有设置的话，代表默认首页出现
            const paths = widget.paths || ['/'];
            if (paths.indexOf(path) !== -1) {
                route.components[widget.id] = VueRender.getBaseComponent(widget);
                if (props) {
                    route.props[widget.id] = props;
                }
            } else {
                route.components[widget.id] = VueRender.getEmptyComponent();
            }
        });
    });
    const router = new VueRouter(routerConfig);

    let pushUrl = '/';
    if (routerConfig.mode === 'history') {
        pushUrl = context.url;
        if (routerConfig.base) {
            pushUrl = pushUrl.replace(normalizeBase(routerConfig.base), '');
        }
        pushUrl = pushUrl || '/';
    }
    router.pushUrl = pushUrl;

    return {
        router,
        routerConfig
    };
}

module.exports = {
    createRouter
};