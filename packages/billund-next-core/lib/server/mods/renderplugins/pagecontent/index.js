'use strict';

module.exports = function*(config) {
    return {
        result: config.pageHtml || ''
    };
}