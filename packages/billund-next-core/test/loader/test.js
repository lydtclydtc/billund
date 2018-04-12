'use strict';

const webpack = require('webpack');
const config = require('./server-config.js');

const webpackCompiler = webpack(config);
webpackCompiler.run((err, stats) => {
    const errors = stats.compilation.errors;
    if (errors) {
        console.error(errors);
    }
})