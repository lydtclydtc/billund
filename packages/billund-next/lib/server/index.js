'use strict';

const core = require('billund-next-core');

const pageConfigMatcher = core.pageConfigMatcher;
const actionBinder = core.actionBinder;
const coreWorker = core.coreWorker;
const configMerger = core.configMerger;
const builder = core.builder;
const constants = core.constants;

let appConfig = null;

/**
 * 初始化方法
 * 
 * @param  {Object} $appConfig - app的配置
 * @return {GeneratorFunction}
 */
function* init($appConfig) {
    appConfig = configMerger($appConfig);

    let builderIns = null;
    if (appConfig.isDev) {
        builderIns = builder.getInstance(appConfig);
        yield builderIns.build();
    }

    let pageConfigs = pageConfigMatcher.matchPageConfigs(appConfig);
    actionBinder.bindRouter({
        pageConfigs
    });

    if (appConfig.isDev) {
        builderIns.on(constants.SERVER_COMPILER_UPDATE_FAIL, () => {
            console.log('webpack in server bundle failed');
        });
        builderIns.on(constants.SERVER_COMPILER_UPDATE_SUCCESS, () => {
            console.log('webpack in server bundle successed');
            pageConfigs = pageConfigMatcher.matchPageConfigs(appConfig, true);
            actionBinder.updateRouter({
                pageConfigs
            });
        });
    }

    const nextMiddleware = coreWorker.init(appConfig);
    /**
     * 判断当前的处理action是否是由billund-next处理
     *
     * @param  {Object}  context - 上下文对象
     * @return {Boolean}
     */
    function isLegoType(context) {
        return context && context.legoConfig && context.legoConfig['__next'];
    }

    /**
     * lego的核心处理方法入口
     *
     * @param {GenerateFunction} next
     */
    function* doRender(next) {
        try {
            yield next;
            if (!isLegoType(this)) return;

            // 真正的执行方法
            yield nextMiddleware(this);
        } catch (e) {
            /*
                lego并不真正的处理错误,而是继续向外抛,直到有人处理
             */
            console.error(`lego didn't deal this error,please confirm it's dealed by outside.
                            ${e.stack}`);
            throw e;
        }
    }
    return function* combineLego(next) {
        yield doRender.call(this, actionBinder.getRouter().call(this, next));
    };
}

module.exports = {
    init
};