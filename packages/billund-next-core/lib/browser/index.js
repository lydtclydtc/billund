'use strict';

require('./polyfill');
require('./vendors');
const {
    FRAMEWORK_VARIABLE_IN_GLOBAL
} = require('../common/constants');
const coreWorker = require('./core-worker');

function init() {
    if (window[FRAMEWORK_VARIABLE_IN_GLOBAL]) {
        console.warn(`different version of billund-next are required`);
        return window[FRAMEWORK_VARIABLE_IN_GLOBAL];
    }
    window[FRAMEWORK_VARIABLE_IN_GLOBAL] = new coreWorker();
    return window[FRAMEWORK_VARIABLE_IN_GLOBAL];
}

module.exports = init();