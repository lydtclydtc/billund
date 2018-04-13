'use strict';

const glob = require('glob');

let appConfig = null;
let files = null;

function findPageConfigs(dir, pattern) {
    return glob.sync(pattern, {
        cwd: dir
    });
}

function getFiles(config, shouldUpdate) {
    if (shouldUpdate) {
        files = null;
    }
    if (files && files.length) return files;

    if (!appConfig) {
        if (!config) throw new Error('missing config in page-config-finder');
        if (!config.pageConfigDir) throw new Error('missing pageConfigDir in page-config-finder config');
        if (!config.pageConfigPattern) throw new Error('missing pageConfigPattern in page-config-finder config');
        appConfig = config;
    }

    files = findPageConfigs(config.pageConfigDir, config.pageConfigPattern);
    if (!(files && files.length)) throw new Error(`no page-config find in ${config.pageConfigDir}, pattern is ${config.pageConfigPattern}`);
    return files;
}

module.exports = {
    getFiles
};