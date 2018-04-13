'use strict';

const path = require('path');
const alias = require('module-alias');

function makeModuleAlias() {
    /*
        还有一些公用包，确保一定走了这个项目自身
     */
    alias.addAlias('billund-next', path.resolve(__dirname, '../../'));
    alias.addAlias('billund-next-core', path.resolve(__dirname, '../../../billund-next-core'));
}

makeModuleAlias();