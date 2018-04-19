'use strict';

const {
	ID_MAIN_PAGE
} = require('../../../../common/constants');

module.exports = function*(config) {
    const content = config.pageHtml || '';
    return {
        result: `<div id="${ID_MAIN_PAGE}" style="position: relative;min-height: 100%;">${content}</div>`
    };
};