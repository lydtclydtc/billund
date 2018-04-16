'use strict';

const path = require('path');
const glob = require('glob');

let appConfig = null;
let parsedConfigs = null;

function findPageConfigs(dir, pattern) {
    return glob.sync(pattern, {
        cwd: dir
    });
}

function transToDisPath(distDir, relativePath) {
    const originPath = path.resolve(distDir, relativePath);
    const obj = path.parse(originPath);
    return path.format(Object.assign({}, obj, {
        ext: '.js'
    }));
}

function getConfigs(config, shouldUpdate) {
    if (shouldUpdate) {
        parsedConfigs = null;
    }
    if (parsedConfigs && parsedConfigs.length) return parsedConfigs;

    if (!appConfig) {
        if (!config) throw new Error('missing config in page-config-finder');
        if (!config.pageConfigDir) throw new Error('missing pageConfigDir in page-config-finder config');
        if (!config.pageConfigPattern) throw new Error('missing pageConfigPattern in page-config-finder config');
        if (!config.serverDist) throw new Error('missing serverDist in page-config-finder config');
        if (!config.browserDist) throw new Error('missing browserDist in page-config-finder config');
        appConfig = config;
    }

    const rps = findPageConfigs(config.pageConfigDir, config.pageConfigPattern);
    if (!(rps && rps.length)) throw new Error(`no page-config find in ${config.pageConfigDir}, pattern is ${config.pageConfigPattern}`);
    parsedConfigs = rps.map((rp) => {
        const filePath = path.resolve(config.pageConfigDir, rp);
        return {
            relativePath: rp,
            absolutePath: filePath,
            serverBundle: transToDisPath(config.serverDist, rp),
            browserBundle: transToDisPath(config.browserDist, rp)
        };
    });
    return parsedConfigs;
}

module.exports = {
    getConfigs
};