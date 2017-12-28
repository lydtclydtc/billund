'use strict';

function* action() {
    this.legoConfig = {
        noServerRender: true,
        widgets: [{
            name: 'simple-vue-widget',
            params: {
                title: 'simple-vue-widget',
                desc: 'test',
                now: new Date().valueOf() + ''
            },
            weight: 100
        }],
        options: {
            staticResources: [{
                entry: 'billund-example/common.js'
            }, {
                entry: 'billund-example/no-server-render.js',
                styles: 'billund-example/no-server-render.css'
            }]
        }
    };
}

module.exports = {
    url: '/no-server-render.html',
    action
};