'use strict';

const configMerger = require('../common/config-merger');
const pageConfigMatcher = require('./mods/page-config-matcher');
const coreWorker = require('./mods/core-worker');
const actionBinder = require('./mods/action-binder');
const parallel = require('./mods/parallel');
const utils = require('../common/utils.js');

module.exports = {
    configMerger,
    parallel,
    pageConfigMatcher,
    actionBinder,
    coreWorker,
    utils
};