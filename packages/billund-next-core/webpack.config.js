'use strict';

const path = require('path');

module.exports = {
    entry: './lib/browser/index.js',
    output: {
        path: path.resolve(__dirname, './built'),
        filename: 'billund-next-core.js',
        library: 'BillundNextCore',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
            test: /\.(js)$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['es2015', 'stage-0'],
                    plugins: [
                        'add-module-exports',
                        'transform-object-assign',
                        'array-includes'
                    ]
                }
            }]
        }]
    }
};