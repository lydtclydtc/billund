'use strict';

// todo complete test
const parser = require('../lib/action.js');

const script = `
'use strict';

function* action() {
	console.log('a');
	this.legoConfig = {
		routerConfig: {
			mode: 'hash'
		}
	};
}
module.exports = {
    url: '/demo/node/html/demoindex.:suffix',
    action
};
`;

console.log(parser.extractRouterConfig(script));
