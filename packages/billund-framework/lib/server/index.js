'use strict';

const compose = require('koa-compose');
const co = require('co');
const frameworkCore = require('billund-framework-core');
const actionBinder = frameworkCore.actionBinder;
const widgetsPool = frameworkCore.widgetsPool;
const worker = frameworkCore.worker;

/**
 * 初始化函数
 *
 * @param  {Object} config - 初始化配置,字段如下:
 * {
 *      actionDir: [String], // action的文件夹名称
 *      actionNameRegex: [Regex|String], // action名称的正则
 *      widgetDir: [String], // widget的文件夹名称
 *      widgetNameRegex: [Regex|String] // 名称的正则
 *      supportorPath: [String], // 支持组件路径
 *      vendors: [Object], // dll文件的路径(取决于你自己的解析方式),一般会有react|vue两个字段
 *      renderPlugins: [Object], // 渲染插件,一般会有header和body两个字段,对应不同的位置
 *      sortRenderPlugin: [Function] // renderPlugin的操作、处理函数
 * }
 * @return {GenerateFunction}
 */
function init(config) {
    actionBinder.bindActionRouter(Object.assign({}, config, {
        actionDir: config.actionDir,
        nameRegex: config.actionNameRegex
    }));
    widgetsPool.bindWidgets({
        widgetDir: config.widgetDir,
        nameRegex: config.widgetNameRegex
    });
    worker.init(config);

    /**
     * 判断当前的处理action是否是lego处理
     *
     * @param  {Object}  context - 上下文对象
     * @return {Boolean}
     */
    function isLegoType(context) {
        return context && context.legoConfig;
    }

    /**
     * lego的核心处理方法入口
     *
     * @param {Object} context - 上下文
     * @param {GenerateFunction} next
     */
    async function doRender(context, next) {
        try {
            await next();
            if (!isLegoType(context)) return;

            await co(function*() {
                // 真正的执行方法
                yield worker.execute(context);
            });
        } catch (e) {
            /*
                lego并不真正的处理错误,而是继续向外抛,直到有人处理
             */
            console.error(`lego didn't deal this error,please confirm it's dealed by outside.
                            ${e.stack}`);
            throw e;
        }
    }

    return compose([doRender, actionBinder.getRouter()]);
}

module.exports = {
    init,
    updateWidgets: widgetsPool.updateWidgets
};