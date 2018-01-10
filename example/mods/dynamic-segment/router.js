'use strict';

const Constants = require('./constants.js');

module.exports = {
    base: `${Constants.BASE_PATH}/`,
    routes: [{
            path: '/'
        },
        {
            path: '/hello/:name',
            props: true,
            beforeEnter(to, from, next) {
                next();
            }
        },
        {
            path: '/static',
            props: {
                name: 'world'
            }
        },
        {
            path: '/dynamic/:years',
            props: function dynamicPropsFn(route) {
                const now = new Date();
                return {
                    name: (now.getFullYear() + parseInt(route.params.years)) + '!'
                };
            }
        },
        {
            path: '/attrs',
            props: {
                name: 'attrs'
            }
        }
    ]
};