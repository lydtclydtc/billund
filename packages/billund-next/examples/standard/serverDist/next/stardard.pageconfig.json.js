module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = normalizeComponent;
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  scriptExports = scriptExports || {}

  // ES6 modules interop
  var type = typeof scriptExports.default
  if (type === 'object' || type === 'function') {
    scriptExports = scriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () { injectStyles.call(this, this.$root.$options.shadowRoot) }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1);

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function (resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, ' + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj) {
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_billund_next_core_lib_build_loader_vue_preloader_script_js_billund_next_core_node_modules_vue_loader_lib_selector_type_script_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__ = __webpack_require__(5);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_70e5019c_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__billund_next_core_node_modules_vue_loader_lib_runtime_component_normalizer__ = __webpack_require__(0);
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = "265cdd04"

var Component = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__billund_next_core_node_modules_vue_loader_lib_runtime_component_normalizer__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_billund_next_core_lib_build_loader_vue_preloader_script_js_billund_next_core_node_modules_vue_loader_lib_selector_type_script_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_70e5019c_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_70e5019c_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__["b" /* staticRenderFns */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "widget/body/index.vue"

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_billund_next_core_lib_build_loader_vue_preloader_script_js_billund_next_core_node_modules_vue_loader_lib_selector_type_script_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__ = __webpack_require__(6);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_3035d51d_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__billund_next_core_node_modules_vue_loader_lib_runtime_component_normalizer__ = __webpack_require__(0);
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = "14be8469"

var Component = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__billund_next_core_node_modules_vue_loader_lib_runtime_component_normalizer__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_billund_next_core_lib_build_loader_vue_preloader_script_js_billund_next_core_node_modules_vue_loader_lib_selector_type_script_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_3035d51d_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_3035d51d_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_index_vue__["b" /* staticRenderFns */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "widget/header/index.vue"

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_header_index_widget_json__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__widget_header_index_widget_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__widget_header_index_widget_json__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_body_index_widget_json__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__widget_body_index_widget_json___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__widget_body_index_widget_json__);
//
//
//
//
//
//
//






/* harmony default export */ __webpack_exports__["a"] = ({
  components: {
    "header-1001d5de": __WEBPACK_IMPORTED_MODULE_0__widget_header_index_widget_json___default.a.getComponent(),
    "content-36a77ea4": __WEBPACK_IMPORTED_MODULE_1__widget_body_index_widget_json___default.a.getComponent()
  },
  data() {
    return {
      headerMsg: 'standard-header',
      bodyMsg: 'standard-body'
    };
  },
  computed: {
    storeData(state) {
      return this.$store.state;
    }
  }
});

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
	props: {
		msg: {
			type: String,
			default: 'fake message'
		}
	}
});

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
	props: ['msg']
});

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("billund-next-core");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function* () {
    const storeData = {
        tag: `I'm standard`
    };
    this.legoConfig = {
        storeData
    };
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    state: {
        pageName: 'standard'
    },
    actions: {
        testAction() {
            console.log('actions');
        }
    }
};

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_billund_next_core_lib_build_loader_vue_preloader_script_js_billund_next_core_node_modules_vue_loader_lib_selector_type_script_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_standard_vue__ = __webpack_require__(4);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_6f0e0dc2_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_standard_vue__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__billund_next_core_node_modules_vue_loader_lib_runtime_component_normalizer__ = __webpack_require__(0);
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = "2fda116b"

var Component = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__billund_next_core_node_modules_vue_loader_lib_runtime_component_normalizer__["a" /* default */])(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_billund_next_core_lib_build_loader_vue_preloader_script_js_billund_next_core_node_modules_vue_loader_lib_selector_type_script_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_standard_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_6f0e0dc2_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_standard_vue__["a" /* render */],
  __WEBPACK_IMPORTED_MODULE_1__billund_next_core_node_modules_vue_loader_lib_template_compiler_index_id_data_v_6f0e0dc2_hasScoped_false_optionsId_0_buble_transforms_billund_next_core_lib_build_loader_vue_preloader_template_js_billund_next_core_node_modules_vue_loader_lib_selector_type_template_index_0_billund_next_core_lib_build_loader_enhanced_vue_preloader_index_js_ref_2_1_standard_vue__["b" /* staticRenderFns */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "page/standard.vue"

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__action_standard_js__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__action_standard_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__action_standard_js__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__page_standard_vue__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store_standard_js__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__store_standard_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__store_standard_js__);



/* harmony default export */ __webpack_exports__["default"] = ({
  url: "/billund-next/standard.html",
  action: __WEBPACK_IMPORTED_MODULE_0__action_standard_js___default.a,
  page: __WEBPACK_IMPORTED_MODULE_1__page_standard_vue__["a" /* default */],
  store: __WEBPACK_IMPORTED_MODULE_2__store_standard_js___default.a
});

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const co = __webpack_require__(1);
const core = __webpack_require__(7);
const utils = core.utils;
const parallel = core.parallel;
const coreWorker = core.coreWorker;

const dataGenerator = function* (params) {
    return params;
};

const storeConfig = {};
const template = __webpack_require__(2).default || __webpack_require__(2);

function getInnerComponent(widgetId) {
    return {
        components: {
            'wrapped-element': template
        },
        computed: {
            widgetProps: function () {
                return this.$store.state[widgetId];
            }
        },
        render(h) {
            /*
             	注意，每次更新的时候，都希望dataGenerator的返回值作为优先级更高的值
             */
            const props = this.$attrs;
            return h('wrapped-element', {
                props: _extends({}, props, this.widgetProps)
            });
        }
    };
}

function getComponent() {
    let vm = null; // 用以cache vue的上下文
    const listeners = [];

    function getVm(cb) {
        if (!vm) {
            listeners.push(cb);
            return;
        }
        listeners.forEach(fn => {
            fn && fn(vm);
        });
    }

    function setVm($vm) {
        if (vm) return;
        vm = $vm;
        listeners.forEach(fn => {
            fn && fn($vm);
        });
    }
    const vmp = new Promise(resolve => {
        getVm($vm => {
            resolve($vm);
        });
    });

    const wp = new Promise((resolve, reject) => {
        vmp.then($vm => {
            const store = $vm.$store;
            const ctx = store.state['__legoCtx'];
            const attrs = $vm.$attrs;
            const widgetId = attrs['_widget_id'];

            co(function* () {
                const genFn = function* () {
                    const fn = dataGenerator.call(ctx, vm.$attrs);
                    return yield fn;
                };
                const ret = yield parallel(genFn, {
                    timeout: 2000,
                    fallback: null
                });
                if (ret.error) throw ret.error;

                return ret.result;
            }).then(data => {
                const declareProps = template.props || {};
                const tplProps = {};
                const defaultPropKeys = utils.isArray(declareProps) ? declareProps : Object.keys(declareProps);
                defaultPropKeys.forEach(propKey => {
                    const prop = declareProps[propKey];
                    if (!(utils.isObject(prop) && prop.default !== undefined)) {
                        tplProps[propKey] = null;
                        return true;
                    }
                    tplProps[propKey] = undefined;
                });

                const mState = _extends(tplProps, storeConfig.state, data);
                store.registerModule(widgetId, _extends({}, storeConfig, {
                    mState
                }));
                coreWorker.storeWidgetState(ctx, widgetId, mState);
                resolve(getInnerComponent(widgetId));
            }).catch(e => {
                // TODO，这里统一收集错误
            });
        });
    });
    return {
        // 这里可以考虑用高级异步组件
        components: {
            'wrapped-element': resolve => {
                return wp;
            }
        },
        render(h) {
            setVm(this);
            return h('wrapped-element', {
                attrs: this.$attrs
            });
        }
    };
}

module.exports = {
    getComponent
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const co = __webpack_require__(1);
const core = __webpack_require__(7);
const utils = core.utils;
const parallel = core.parallel;
const coreWorker = core.coreWorker;

const dataGenerator = function* (params) {
    return params;
};

const storeConfig = {};
const template = __webpack_require__(3).default || __webpack_require__(3);

function getInnerComponent(widgetId) {
    return {
        components: {
            'wrapped-element': template
        },
        computed: {
            widgetProps: function () {
                return this.$store.state[widgetId];
            }
        },
        render(h) {
            /*
             	注意，每次更新的时候，都希望dataGenerator的返回值作为优先级更高的值
             */
            const props = this.$attrs;
            return h('wrapped-element', {
                props: _extends({}, props, this.widgetProps)
            });
        }
    };
}

function getComponent() {
    let vm = null; // 用以cache vue的上下文
    const listeners = [];

    function getVm(cb) {
        if (!vm) {
            listeners.push(cb);
            return;
        }
        listeners.forEach(fn => {
            fn && fn(vm);
        });
    }

    function setVm($vm) {
        if (vm) return;
        vm = $vm;
        listeners.forEach(fn => {
            fn && fn($vm);
        });
    }
    const vmp = new Promise(resolve => {
        getVm($vm => {
            resolve($vm);
        });
    });

    const wp = new Promise((resolve, reject) => {
        vmp.then($vm => {
            const store = $vm.$store;
            const ctx = store.state['__legoCtx'];
            const attrs = $vm.$attrs;
            const widgetId = attrs['_widget_id'];

            co(function* () {
                const genFn = function* () {
                    const fn = dataGenerator.call(ctx, vm.$attrs);
                    return yield fn;
                };
                const ret = yield parallel(genFn, {
                    timeout: 2000,
                    fallback: null
                });
                if (ret.error) throw ret.error;

                return ret.result;
            }).then(data => {
                const declareProps = template.props || {};
                const tplProps = {};
                const defaultPropKeys = utils.isArray(declareProps) ? declareProps : Object.keys(declareProps);
                defaultPropKeys.forEach(propKey => {
                    const prop = declareProps[propKey];
                    if (!(utils.isObject(prop) && prop.default !== undefined)) {
                        tplProps[propKey] = null;
                        return true;
                    }
                    tplProps[propKey] = undefined;
                });

                const mState = _extends(tplProps, storeConfig.state, data);
                store.registerModule(widgetId, _extends({}, storeConfig, {
                    mState
                }));
                coreWorker.storeWidgetState(ctx, widgetId, mState);
                resolve(getInnerComponent(widgetId));
            }).catch(e => {
                // TODO，这里统一收集错误
            });
        });
    });
    return {
        // 这里可以考虑用高级异步组件
        components: {
            'wrapped-element': resolve => {
                return wp;
            }
        },
        render(h) {
            setVm(this);
            return h('wrapped-element', {
                attrs: this.$attrs
            });
        }
    };
}

module.exports = {
    getComponent
};

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "header" }, [
    _vm._ssrNode(_vm._ssrEscape(_vm._s(_vm.msg)))
  ])
}
var staticRenderFns = []
render._withStripped = true


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "standard-page" },
    [
      _vm._ssrNode("\n\tstandard-page\n\t"),
      _c("header-1001d5de", {
        attrs: { msg: _vm.storeData.tag, _widget_id: "header-1001d5de" }
      }),
      _vm._ssrNode(" "),
      _c("content-36a77ea4", {
        attrs: { msg: _vm.storeData.tag, _widget_id: "content-36a77ea4" }
      })
    ],
    2
  )
}
var staticRenderFns = []
render._withStripped = true


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return staticRenderFns; });
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "standard-body" }, [
    _vm._ssrNode(_vm._ssrEscape(_vm._s(_vm.msg)))
  ])
}
var staticRenderFns = []
render._withStripped = true


/***/ })
/******/ ]);