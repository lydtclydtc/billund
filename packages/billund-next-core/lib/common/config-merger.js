'use strict';

const _ = require('lodash');
const DEFAULT_CONFIG = require('./lego.config.js');

/**
 * 合并配置
 *
 * @param  {Object} to - 优先级高的配置
 * @param  {Object} from - 优先级低的配置
 * @return {Object}
 */
module.exports = function(to, from) {
    from = from || DEFAULT_CONFIG;
    if (!to) return Object.assign({}, from);

    const commonChunkModules = _.uniq(from.commonChunkModules.concat(to.commonChunkModules));
    return Object.assign({}, from, to, {
        commonChunkModules
    });
}