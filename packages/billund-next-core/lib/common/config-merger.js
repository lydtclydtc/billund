'use strict';

const _ = require('lodash');
const DEFAULT_CONFIG = require('./lego.config.js');

function mergeServerBuildConfig(next, last) {
    next = next || {};
    last = last || {};
    const externals = _.uniq((last.externals || []).concat(next.externals || []));
    const ignores = _.uniq((last.ignores || []).concat(next.ignores || []));
    return Object.assign({}, last, next, {
        externals,
        ignores
    });
}

function mergeBrowserBuildConfig(next, last) {
    next = next || {};
    last = last || {};
    const commonChunkModules = _.uniq((last.commonChunkModules || []).concat(next.commonChunkModules || []));
    return Object.assign({}, last, next, {
        commonChunkModules
    });
}

function mergeBuildConfig(next, last) {
    next = next || {};
    last = last || {};
    return {
        server: mergeServerBuildConfig(next.server, last.server),
        browser: mergeBrowserBuildConfig(next.browser, last.browser)
    };
}

module.exports = function(next, last) {
    last = last || DEFAULT_CONFIG;
    if (!next) return Object.assign({}, last);

    const buildConfig = mergeBuildConfig(next.build, last.build);

    return Object.assign({}, last, next, {
        build: buildConfig
    });
};