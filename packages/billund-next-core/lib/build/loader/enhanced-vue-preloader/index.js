'use strict';

const path = require('path');
const loaderUtils = require('loader-utils');

const parse = require('./parser');
const scriptCompiler = require('./script-compiler');

module.exports = function(content) {
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

    const scriptContent = scriptCompiler.getContent.call(this, parts.script);
    if (scriptContent) {
        widgets = scriptCompiler.matchWidgets.call(this, scriptContent, options);
        widgetVariablesInTemplate = scriptCompiler.matchWidgetVariablesInTemplate.call(this, scriptContent, widgets);
        console.log('-----------------------');
        console.log(widgets);
        console.log(widgetVariablesInTemplate);
    }


    return content;
};