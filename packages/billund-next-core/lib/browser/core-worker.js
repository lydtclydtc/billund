'use strict';

const Vue = require('vue');
const Router = require('vue-router');
// https://www.npmjs.com/package/browser-cookies
const Cookies = require('browser-cookies');
const qs = require('qs');
const {
    ID_MAIN_PAGE,
    KEY_STORE_GLOBAL_STATE
} = require('../common/constants');
const storeInit = require('../common/store-init');
const {
    isFunction
} = require('../common/utils');

const addEventListener = (function() {
    let _events = document.addEventListener ? 'addEventListener' : 'attachEvent';
    return function(el, type, fn) {
        el[_events]((document.addEventListener ? '' : 'on') + type, fn);
    };
})();

const removeEventListener = (function() {
    let _events = document.removeEventListener ? 'removeEventListener' : 'detachEvent';
    return function(el, type, fn) {
        el[_events](type, fn);
    };
})();

function onReady(cb) {
    if (!cb) return;

    /**
     * domContentLoaded监听,过或不过能接收
     *
     * @return {Function}
     */
    function domReady() {
        const fns = [];
        let listener = null;
        const hack = document.documentElement.doScroll;
        const domContentLoaded = 'DOMContentLoaded';
        let loaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(document.readyState);

        if (!loaded) {
            addEventListener(window, domContentLoaded, listener = function() {
                removeEventListener(window, domContentLoaded, listener);
                loaded = 1;
                while ((listener = fns.shift())) {
                    listener();
                }
            });
        }
        return function(fn) {
            loaded ? setTimeout(fn, 0) : fns.push(fn);
        };
    }

    // 先判断是否已经是load的了,如果是的话直接执行
    if (document.readyState === 'complete') {
        window.setTimeout(() => {
            cb();
        }, 5);
        return;
    }

    domReady()(() => {
        window.setTimeout(() => {
            cb();
        }, 1500);
    });

    addEventListener(window, 'load', () => {
        window.setTimeout(() => {
            cb();
        }, 5);
    });
}

class CoreWorker {
    constructor() {
        this.registBaseMiddlewares();
        this.inited = false;

        const initialState = window[KEY_STORE_GLOBAL_STATE] || {};
        this.initialState = initialState;

        this.appConfig = null;
        this.pageConfig = null;
        this.store = null; // 留待初始化
        this.router = null; // 留待初始化
        this.onReadyPromise = new Promise((resolve, reject) => {
            onReady(resolve);
        });
    }
    /**
     * 挂载基本的中间件
     */
    registBaseMiddlewares() {
        const self = this;
        this.cookies = Cookies;

        function querystring() {
            const search = window.location.search || '';
            if (search.indexOf('?') == -1) return '';
            return search.slice(1, search.length);
        }

        this.querystring = querystring();

        function query() {
            const str = self.querystring;
            return qs.parse(str);
        }

        this.query = query();
    }

    doInit(appConfig, pageConfig) {
        if (this.inited) return;
        if (!appConfig) throw new Error('doInit CoreWorker require appConfig!');
        if (!pageConfig) throw new Error('doInit CoreWorker require pageConfig!');

        if (!pageConfig.page) throw new Error('doInit CoreWorker require page in pageConfig!');

        this.appConfig = appConfig;
        this.pageConfig = pageConfig;

        // 挂载appConfig能力

        // 挂载pageConfig能力
        const storeConfig = pageConfig.store || {};
        const storeData = window[KEY_STORE_GLOBAL_STATE] || {};
        const store = this.store = storeInit(this, storeData, storeConfig);
        const component = pageConfig.page;
        component.store = store;
        /*
            判断，是否存在有routers，如果有的话，要提前初始化
        */
        if (component.initRouter) {
            if (!isFunction(component.initRouter)) throw new Error(`initRouter must be a function`);
            const routerConfig = component.initRouter(Object.assign({}, store.getState()));
            component.router = new Router(routerConfig);
        }
        this.connectDom(component);

        this.dispatch = this.store.dispatch;
        this.getState = this.store.getState;
    }

    connectDom(component) {
        if (!component) throw new Error('init page neeed component');
        /*
         * vue2.0有一个比较坑的点,就是会把挂载的el整个替换掉,那么对于我们,就分为两种情况
         * 1:server端有渲染,那么找到那个div
         * 2:没有的话,创建一个临时div
         */
        let node = null;

        function findFirstChild(dom) {
            if (!dom) return null;
            if (!dom.childNodes) return null;
            return Array.prototype.slice.call(dom.childNodes).find((child) => {
                return child && (!(child.nodeName == '#text' && !/\S/.test(child.nodeValue)));
            });
        }
        const container = document.getElementById(ID_MAIN_PAGE);
        node = findFirstChild(container);
        if (!node) {
            node = document.createElement('div');
            container.appendChild(node);
        }

        new Vue(Object.assign({
            el: node
        }, component));
    }

    onReady() {
        return this.onReadyPromise;
    }

    /**
     * 分发action的操作
     */
    dispatch() {
        throw new Error(`store has not been initialized`);
    }

    /**
     * 获取当前的state
     */
    getState() {
        throw new Error(`store has not been initialized`);
    }

    getRouter() {
        if (!this.router) throw new Error(`router has not been initialized`);
        return this.router;

    }
}

module.exports = CoreWorker;