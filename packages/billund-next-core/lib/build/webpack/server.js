'use strict';

const WebpackBaseConfig = require('./base');

class WebpackServerConfig extends WebpackBaseConfig {
    constructor(config) {
        super(config, {
            isServer: true
        });
    }
    getConfig() {
        const config = super.getConfig();
        return config;
    }
}

module.exports = WebpackServerConfig;