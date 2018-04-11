'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

const cache = require('../common/cache');
const parse = require('./parser');
const scriptCompiler = require('./script-compiler');
const templateCompiler = require('./template-compiler');

module.exports = function(content) {
    if (cache.get(this.resourcePath)) return content;

    const loaderContext = this;
    const isServer = this.target === 'node';
    const isProduction = this.minimize || process.env.NODE_ENV === 'production';

    const rawOptions = loaderUtils.getOptions(this);
    const options = rawOptions || {};
    if (!options.widgetRegExp) {
        this.emitError('for enhanced-vue-preloader in billund need widgetRegExp!');
        return '';
    }

    const filePath = this.resourcePath;
    const fileName = path.basename(filePath);

    const context = (
        this.rootContext ||
        (this.options && this.options.context) ||
        process.cwd()
    );
    const sourceRoot = path.dirname(path.relative(context, filePath));

    const needCssSourceMap = (!isProduction &&
        this.sourceMap &&
        options.cssSourceMap !== false
    );

    const parts = parse(
        content,
        fileName,
        this.sourceMap,
        sourceRoot,
        needCssSourceMap
    );

    let widgets = [];
    let widgetVariablesInTemplate = [];
    let widgetInfos = [];

    const scriptContent = scriptCompiler.getContent.call(this, parts.script);
    if (scriptContent) {
        widgets = scriptCompiler.matchWidgets.call(this, scriptContent, options);
        widgetVariablesInTemplate = scriptCompiler.matchWidgetVariablesInTemplate.call(this, scriptContent, widgets);
    }

    const templateContent = templateCompiler.getContent.call(this, parts.template);
    if (templateContent) {
        widgetInfos = templateCompiler.extractWidgets.call(this, templateContent, widgetVariablesInTemplate, isServer);
    }

    if (!(widgetInfos && Object.keys(widgetInfos).length)) return content;

    setCache(this, parts, {
        widgets,
        widgetVariablesInTemplate,
        widgetInfos
    });

    return content;
};

function setCache(ctx, parts, data) {
    const key = ctx.resourcePath;
    cache.set(key, data);
    if (parts.script && parts.script.src) {
        const scriptPath = path.resolve(ctx.resourcePath, `../${parts.script.src}`);
        cache.set(scriptPath, data);
    }
    if (parts.template && parts.template.src) {
        const templatePath = path.resolve(ctx.resourcePath, `../${parts.template.src}`);
        cache.set(templatePath, data);
    }
}