'use strict';

module.exports = function*(config, context) {
    const ua = context.req.headers['user-agent'];
    const isIos = !!(ua.match(/(ipad|iphone|ipod).*os\s([\d_]+)/i));
    if (!isIos) {
        return {
            result: ''
        };
    }

    /*
        在ios情况下,可能有些全局click不可用，是因为没有给body增加cursor: pointer;
     */
    return {
        result: `
                <style>
                    body {
                        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                        cursor: pointer;
                    }
                </style>`
    };
};