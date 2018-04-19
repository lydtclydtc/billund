'use strict';

const Vue = require('vue');
const Vuex = require('vuex');
Vue.use(Vuex);

const storeInit = require('../../common/store-init');

module.exports = {
    createStore: storeInit
};