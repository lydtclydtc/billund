'use strict';

const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const babelTypes = require('babel-types');

module.exports = function(source) {
    if (this.cacheable) this.cacheable();
    /*
    	1.widget目前的配置都会是一个json，然后我们解出所有的值
    	2.通过babel解析出所有的属性值
    	3.生成对应的模板
     */
    let value = typeof source === 'string' ? JSON.parse(source) : source;
    value = JSON.stringify(value)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
    value = `module.exports = ${value}`;

    const ast = babylon.parse(value);
    const propertiesMap = {};
    traverse(ast, {
        MemberExpression(nodePath) {
            const isModuleExports = nodePath.node.object.name == 'module' && nodePath.node.property.name == 'exports';
            if (!isModuleExports) return;

            const parentPath = nodePath.findParent((pa) => pa.isAssignmentExpression());
            const exportsObj = parentPath.node.right;
            if (!babelTypes.isObjectExpression(exportsObj)) throw new Error(`error parsed ${this.resourcePath}`);

            const properties = exportsObj.properties || [];
            properties.forEach((property) => {
                const propertyVal = property.value;
                if (!(babelTypes.isLiteral(propertyVal) || babelTypes.isStringLiteral(propertyVal))) return;
                propertiesMap[property.key.name || property.key.value] = propertyVal.value;
            });
        }
    });

    // 进行校验，至少要有两个属性name,template
    if (!propertiesMap.name) {
        this.emitError(`not defined name in ${this.resourcePath}`);
        return '';
    }
    if (!propertiesMap.template) {
        this.emitError(`not defined template in ${this.resourcePath}`);
        return '';
    }

    const isServer = this.target === 'node';
    const dataGeneratorStr = propertiesMap.dataGenerator ?
        `
        const dataGenerator = require('${propertiesMap.dataGenerator}');
        ` :
        `
        const dataGenerator = function* (params) {
        	return params;
        };
        `;
    const storeConfigStr = propertiesMap.storeConfig ?
        `const storeConfig = require('${propertiesMap.storeConfig}');` :
        `const storeConfig = {};`;

    return `
    	'use strict';

    	const co = require('co');
    	const core = require('billund-next-core');
    	const utils = core.utils;
    	const parallel = core.parallel;
	
		${dataGeneratorStr}
		${storeConfigStr}
		const template = require('${propertiesMap.template}');

		function getInnerComponent(widgetId) {
    		return {
        		components: {
            		'wrapped-element': template
        		},
        		computed: {
        			widgetProps: function() {
        				return this.$store.state[widgetId];
        			}
        		},
        		render(h) {
        			/*
        			 	注意，每次更新的时候，都希望dataGenerator的返回值作为优先级更高的值
        			 */
            		const props = this.$attrs;
            		return h('wrapped-element', {
                		props: Object.assign({}, props, this.widgetProps)
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
        		listeners.forEach((fn) => {
            		fn && fn(vm);
        		});
    		}

    		function setVm($vm) {
        		if (vm) return;
        		vm = $vm;
        		listeners.forEach((fn) => {
            		fn && fn($vm);
        		});
    		}
    		const vmp = new Promise((resolve) => {
        		getVm(($vm) => {
            		resolve($vm);
        		});
    		});

    		const wp = new Promise((resolve, reject) => {
        		vmp.then(($vm) => {
        			const store = $vm.$store;
        			const ctx = store['__legoCtx'];
        			const attrs = $vm.$attrs;
        			const widgetId = attrs['_widget_id'];

        			co(function* (){
        				const genFn = dataGenerator.call(ctx, vm.$attrs);
        				const ret = yield parallel(genFn, {
                			timeout: 2000,
                			fallback: null
            			});
						if(ret.error) throw ret.error;

						return ret.result;
        			}).then((data) => {
            			const declareProps = template.props || {};
            			const tplProps = {};
            			const defaultPropKeys = utils.isArray(declareProps) ? declareProps : Object.keys(declareProps);
            			defaultPropKeys.forEach((propKey) => {
            				const prop = declareProps[propKey];
            				if (!(utils.isObject(prop) && prop.default !== undefined)) {
                				tplProps[propKey] = null;
                				return true;
            				}
            				tplProps[propKey] = undefined;
        				});

            			const mState = Object.assign(tplProps, storeConfig.state, data);
                		store.registerModule(widgetId, Object.assign({}, storeConfig, {
                			state
                		}));
                		resolve(getInnerComponent(widgetId));
            		}).catch((e) => {
            			// TODO，这里统一收集错误
            		})
        		});
    		});
    		return {
        		// 这里可以考虑用高级异步组件
        		components: {
            		'wrapped-element': (resolve) => {
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
    `;
};