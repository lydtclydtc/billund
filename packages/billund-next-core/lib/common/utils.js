'use strict';

function isObject(obj) {
    let type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
}

function isString(obj) {
    return Object.prototype.toString.call(obj) == '[object String]';
}

function after(n, func) {
    if (typeof func != 'function') {
        throw new TypeError('func shouldbe a function');
    }
    n = parseInt(n);
    return function() {
        if (--n < 1) {
            return func.apply(this, arguments);
        }
    };
}

const isArray = Array.isArray || function(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
};

function isFunction(obj) {
    return obj && (Object.prototype.toString.call(obj) == '[object Function]');
}

module.exports = {
    isObject,
    isString,
    after,
    isArray,
    isFunction
};