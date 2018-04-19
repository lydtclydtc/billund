'use strict';

// ------------------- Node Controler -------------------------------------
const DEFAULT_LEGO_CONFIG = {
    storeData: {}
};
// ------------------- Node Controler -------------------------------------

// ------------------- Store -------------------------------------
const KEY_STORE_GLOBAL_STATE = '__store_global_state';
const ACTION_KEY_INIT_WIDGET_STATE = '__billund_init_widget_state';
// ------------------- Store -------------------------------------

// ------------------- Build -------------------------------------
const SERVER_COMPILER_UPDATE_SUCCESS = '__server_compiler_update_success';
const SERVER_COMPILER_UPDATE_FAIL = '__server_compiler_update_fail';
// ------------------- Build -------------------------------------

// ------------------- TAG -------------------------------------
const WIDGET_PROPS = '__billund_next_widget_props';
const FRAMEWORK_VARIABLE_IN_GLOBAL = '__billund_next_framework';
const ID_MAIN_PAGE = '__billund_next_main_page';
// ------------------- TAG -------------------------------------

module.exports = {
    KEY_STORE_GLOBAL_STATE,
    DEFAULT_LEGO_CONFIG,
    ACTION_KEY_INIT_WIDGET_STATE,
    SERVER_COMPILER_UPDATE_SUCCESS,
    SERVER_COMPILER_UPDATE_FAIL,
    WIDGET_PROPS,
    FRAMEWORK_VARIABLE_IN_GLOBAL,
    ID_MAIN_PAGE
};