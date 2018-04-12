'use strict';

process.env.VUE_ENV = 'server'; // very important
const _ = require('lodash');
const Vue = require('vue');
const Router = require('vue-router');
Vue.use(Router);

const renderer = require('vue-server-renderer').createRenderer({
    cache: require('lru-cache')({
        max: 1000,
        maxAge: 1000 * 60 * 60
    })
});

/**
 * 进行页面的渲染
 *
 * @param {Object} context - koa上下文
 * @param {Object} pageConfig - 页面的配置
 * @param {type} store - vuex store
 * @return {String}
 */
function* render(context, pageConfig, store) {
    if (!pageConfig.page) throw new Error(`no page defined in ${pageConfig.file}`);
    const component = pageConfig.page;
    component.store = store;
    /*
        判断，是否存在有routers，如果有的话，要提前初始化
     */
    if (component.initRouter) {
        if (!_.isFunction(component.initRouter)) throw new Error(`initRouter must be a function`);
        const routerConfig = component.initRouter(Object.assign({}, store.getState()));
        component.router = new Router(routerConfig);
    }

    return yield new Promise((resolve, reject) => {
        renderer.renderToString(component, (error, html) => {
            if (error) {
                console.error(`${pageConfig.file} render error!
                                ${error.stack}`);
                reject(error);
                return;
            }
            resolve(html);
        });
    }).catch(() => {
        // 渲染失败，展示一个loading页
        return '<div>ssr失败，页面正在加载中</div>';
    });
}

module.exports = {
    render
};