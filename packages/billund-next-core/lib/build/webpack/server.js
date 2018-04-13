'use strict';

const WebpackBaseConfig = require('./base');

class WebpackServerConfig extends WebpackBaseConfig {
    constructor(config) {
        super(config, {
            isServer: true
        });
    }
    config() {
        const config = super.config();
        return config;
    }
}

module.exports = WebpackServerConfig;