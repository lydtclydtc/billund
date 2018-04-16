'use strict';

const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex);

/**
 * 创建store
 *
 * @param  {Object} context - koa上下文
 * @param  {Object} storeData - 全局数据
 * @param  {Object} storeConfig - 静态的store配置
 * @return {Object}
 */
function createStore(context, storeData, storeConfig) {
    // 允许storeConfig写一些静态资源的state
    const staticState = storeConfig.state;
    storeData = Object.assign({
        __legoCtx: context,
        __widgetState: {}
    }, staticState, storeData);

    return new Vuex.Store(Object.assign({}, storeConfig, {
        state: storeData
    }));
}

module.exports = {
    createStore
};