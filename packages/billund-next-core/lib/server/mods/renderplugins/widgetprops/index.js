'use strict';

const {
    WIDGET_PROPS
} = require('../../../../common/constants');

/**
 * 生成widget的props，传给前端
 *
 * @param  {Object} config - 配置
 * @return {Object}
 */
module.exports = function*(config) {
    const widgetStates = config.widgetStates || {};
    const scripts = Object.keys(widgetStates).map((id) => {
        const state = widgetStates[id];
        if (!state) return '';
        const unsafeStr = JSON.stringify({
            id,
            props: state
        });
        const safeStr = encodeURIComponent(unsafeStr);
        return `<script class="lego-widget-props">
                    window.${WIDGET_PROPS} || (window.${WIDGET_PROPS}=[]);
                    window.${WIDGET_PROPS}.push(JSON.parse(decodeURIComponent("${safeStr}")));
                </script>`;
    }).filter((str) => {
        return !!str;
    });
    return {
        result: scripts.join('')
    };
};