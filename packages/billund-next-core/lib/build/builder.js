'use strict';

const fs = require('co-fs');
const webpack = require('webpack');
const EventEmitter = require('eventemitter3');
const del = require('del');

const configMerger = require('../common/config-merger');
const WebpackServerConfig = require('./webpack/server');
const {
    waitFor
} = require('./utils');
const {
    SERVER_COMPILER_UPDATE_SUCCESS,
    SERVER_COMPILER_UPDATE_FAIL
} = require('../common/constants');

const STATUS = {
    INITIAL: 1,
    BUILD_DONE: 2,
    BUILDING: 3
};

class Builder extends EventEmitter {
    constructor(config) {
        super();
        this.appConfig = configMerger(config);
        this.isDev = !!this.appConfig.isDev;
        this._buildingStatus = STATUS.INITIAL;
    }

    * build() {
        if (this._buildingStatus === STATUS.BUILD_DONE && this.isDev) return;
        if (this._buildingStatus === STATUS.BUILDING) {
            yield waitFor(1000);
            return yield this.build();
        }
        this._buildStatus = STATUS.BUILDING;
        const appConfig = this.appConfig;

        console.log(`-----------clear serverDist: ${appConfig.serverDist} ---------------`);
        const isServerDistExist = yield fs.exists(appConfig.serverDist);
        if (isServerDistExist) {
            yield del(appConfig.serverDist);
        }
        if (!this.isDev) {
            console.log(`-----------clear browserDist: ${appConfig.browserDist} ---------------`);
            const isBrowserDistExist = yield fs.exists(appConfig.browserDist);
            if (isBrowserDistExist) {
                yield del(appConfig.browserDist);
            }
        }
        yield this.serverBuild();

        this._buildStatus = STATUS.BUILD_DONE;
    }

    * serverBuild() {
        const isDev = this.isDev;

        this.webpackServerConfig = new WebpackServerConfig(this.appConfig);
        this.serverCompiler = webpack(this.webpackServerConfig.getConfig());
        const initPromise = new Promise((resolve, reject) => {
            this.serverCompiler.run((err, stats) => {
                if (err || stats.hasErrors()) {
                    stats = stats.toJson();
                    stats.errors.forEach((error) => {
                        console.error(error);
                    });
                    const throwE = err ||
                        (stats.errors && stats.errors.length && stats.errors[0]) ||
                        new Error('webpack server inited compiled error!');
                    reject(throwE);
                    console.log(throwE.stack);
                    return;
                }
                stats = stats.toJson();
                stats.warnings.forEach((error) => {
                    console.warn(error);
                });

                resolve('done');
            });
        });
        yield initPromise;
        console.log('--------------------server compile done---------------------');
        if (isDev) {
            console.log('--------------------server start watching ---------------------');
            this.serverCompiler.watch({
                ignored: /node_modules/,
                aggregateTimeout: 500
            }, (err, stats) => {
                if (err || stats.hasErrors()) {
                    stats = stats.toJson();
                    stats.errors.forEach((error) => {
                        console.error(error);
                    });
                    this.emit(SERVER_COMPILER_UPDATE_FAIL);
                    return;
                }
                stats = stats.toJson();
                stats.warnings.forEach((error) => {
                    console.warn(error);
                });

                this.emit(SERVER_COMPILER_UPDATE_SUCCESS);
            });
        }
    }
}

module.exports = Builder;