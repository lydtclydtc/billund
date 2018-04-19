'use strict';

const ID_SERVER_TIME = '__billund_next_server_time';
const KEY_PAGE_VERSION = '__billund_next_page_version';

/**
 * 增加回退自动刷新机制
 *
 * @param  {Object} config - 对应的配置
 * @return {Object}
 */
module.exports = function*(config) {
    config = config || {};
    const options = config.options || {};
    if (!options.backAutoRefresh) {
        return {
            result: ''
        };
    }
    const now = new Date().getTime();
    const validateSciprt = `<input type="hidden" id='${ID_SERVER_TIME}' value="${now}"/>
    						<script>
    							function validateIsNoRefreshBack(){
    								var serverTime = document.getElementById('${ID_SERVER_TIME}');
    								var remoteValue = serverTime && serverTime.value;
    								if(!remoteValue) return;

    								var localValue = -1;
    								if(localStorage && localStorage['${KEY_PAGE_VERSION}']){
    									localValue = localStorage['${KEY_PAGE_VERSION}'];
    								}
    								if(parseInt(localValue) >= parseInt(remoteValue)){
    									window.setTimeout(function(){
    										location.reload(true);
    									},5);
										return;
									}
									localStorage['${KEY_PAGE_VERSION}'] = remoteValue;
    							}
    							validateIsNoRefreshBack();
    						</script>`;
    return {
        result: validateSciprt
    };
};
