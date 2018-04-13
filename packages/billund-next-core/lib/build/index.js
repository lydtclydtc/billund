'use strict';

const Builder = require('./builder');

let ins = null;

function getInstance(config) {
    if (!ins) {
        ins = new Builder(config);
    }
    return ins;
}

module.exports = {
    getInstance
};