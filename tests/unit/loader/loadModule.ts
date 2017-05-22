import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import loadModule from '../../../src/loader/loadModule';
import * as Module from '../../support/example';

registerSuite({
	name: 'loader/loadModule',

	async 'loads module and dependencies'() {
		const example: typeof Module = await loadModule('../../tests/support/example');
		assert.isFunction(example.default);
		assert.isString(example.foo);
		assert.isNumber(example.bar);
		assert.deepEqual(example.baz, {});
		assert.strictEqual(example.qat, 'foo');
	},

	async 'uses relative require'() {
		const example: typeof Module = await loadModule('../../support/example', require);
		assert.isFunction(example.default);
		assert.isString(example.foo);
		assert.isNumber(example.bar);
		assert.deepEqual(example.baz, {});
		assert.strictEqual(example.qat, 'foo');
	},

	async 'does undefine before require'() {
		let example: typeof Module = await loadModule('../../tests/support/example');
		example.qat = 'bar';
		assert.strictEqual(example.qat, 'bar', 'should equal changed value');
		example = await loadModule('../../tests/support/example');
		assert.strictEqual(example.qat, 'foo', 'should equal orginal value');
	},

	async 'respects noundef before require'() {
		let example: typeof Module = await loadModule('../../tests/support/example');
		example.qat = 'bar';
		assert.strictEqual(example.qat, 'bar', 'should equal changed value');
		example = await loadModule('../../support/example', require, true);
		assert.strictEqual(example.qat, 'bar', 'still have old value');
	},

	'rejects on missing module'(this: any) {
		const dfd = this.async();
		loadModule('../../tests/support/missing')
			.then(() => {
					throw new Error('Should reject');
				}, dfd.callback((e: Error) => {
					assert.instanceOf(e, Error, 'should be instance of error');
				}));
	}
});
