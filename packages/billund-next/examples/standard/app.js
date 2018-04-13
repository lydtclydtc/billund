'use strict';

require('../utils/alias');

const co = require('co');
const koa = require('koa');
const BillundNext = require('billund-next');

const app = koa();
const legoConfig = require('./lego.config.js');

co(function*() {
    const middleware = yield BillundNext.init(legoConfig);
    app.use(middleware);

    app.listen(8080);
    console.log('listening 8080 server start!');
}).catch((e) => {
    console.log(e.stack);
    app.context.logger.error(e.stack);
    process.exit(1);
});