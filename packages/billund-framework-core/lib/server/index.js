'use strict';

const actionBinder = require('./modules/actionbinder.js');
const widgetsPool = require('./modules/widgetspool.js');
const worker = require('./html/index.js');

module.exports = {
    actionBinder,
    widgetsPool,
    worker
};