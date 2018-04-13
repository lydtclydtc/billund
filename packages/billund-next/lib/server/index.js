'use strict';

const core = require('billund-next-core');

const pageConfigMatcher = core.pageConfigMatcher;
const actionBinder = core.actionBinder;
const coreWorker = core.coreWorker;
const configMerger = core.configMerger;
const builder = core.builder;

let appConfig = null;

/**
 * 初始化方法
 * 
 * @param  {Object} $appConfig - app的配置
 * @return {GeneratorFunction}
 */
function* init($appConfig) {
    appConfig = configMerger($appConfig);
    if (appConfig.isDev) {
        const builderIns = builder.getInstance(appConfig);
        yield builderIns.build();
    }

    const pageConfigs = pageConfigMatcher.matchPageConfigs(appConfig);
    actionBinder.bindRouter({
        pageConfigs
    });


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
            yield nextMiddleware.execute(this);
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

/**
 * 统一的更新操作
 *
 * @param {Object} config - 新的配置
 */
function update(config) {
    const pageConfigs = pageConfigMatcher.matchPageConfigs({
        dir: appConfig.pageConfigDir,
        pattern: appConfig.pageConfigPattern,
        serverDist: appConfig.serverDist,
        browserDist: appConfig.browserDist
    });
    actionBinder.updateRouter({
        pageConfigs
    });
}

module.exports = {
    init,
    update
};