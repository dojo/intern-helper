import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { enable, register } from '../../../src/loader/mock';
import loadModule from '../../../src/loader/loadModule';
import * as Example from '../../support/example';
import * as DependencyA from '../../support/dependencyA';

registerSuite({
	name: 'loader/mock',

	async 'module subtitution'() {
		register('foo/bar/baz', {
			foo: 'foo'
		});
		const enableHandle = enable();
		const result = await loadModule('foo/bar/baz');
		assert.deepEqual(result, {
			foo: 'foo'
		});
		enableHandle.destroy();
	},

	async 'relative module subtitution'() {
		register('./foo/bar/baz', {
			foo: 'foo'
		});
		const enableHandle = enable();
		const result = await loadModule('./foo/bar/baz');
		assert.deepEqual(result, {
			foo: 'foo'
		});
		enableHandle.destroy();
	},

	async 'relative module to abs mid'() {
		register('./foo/bar/baz', {
			foo: 'foo'
		}, require);
		const enableHandle = enable();
		const mid = require.toAbsMid('./foo/bar/baz');
		const result = await loadModule(mid);
		assert.deepEqual(result, {
			foo: 'foo'
		});
		enableHandle.destroy();
	},

	async 'subtitution of dependencies'() {
		register(require.toAbsMid('../../support/dependencyA'), {
			baz: { foo: 'bar' },
			foo: 'qat',
			bar: 99
		} as typeof DependencyA);
		const enableHandle = enable();
		const result: typeof Example = await loadModule('../../support/example', require);
		assert.strictEqual(result.foo, 'qat', 'should have value from mocked module');
		assert.strictEqual(result.bar, 99, 'should have value from mocked module');
		assert.deepEqual(result.baz, { foo: 'bar' }, 'should have value from mocked module');
		assert.strictEqual(result.qat, 'foo', 'should have required dependency');
		assert.isFunction(result.default);
		enableHandle.destroy();
	},

	async 'removal of registered module before enablement'() {
		const handle = register(require.toAbsMid('../../support/dependencyA'), {
			baz: { foo: 'bar' },
			foo: 'qat',
			bar: 99
		} as typeof DependencyA);
		handle.destroy();
		const enableHandle = enable();
		const result: typeof Example = await loadModule('../../support/example', require);
		assert.strictEqual(result.foo, 'bar', 'should have value from mocked module');
		assert.strictEqual(result.bar, 2, 'should have value from mocked module');
		assert.deepEqual(result.baz, { }, 'should have value from mocked module');
		enableHandle.destroy();
	},

	async 'removal of registered module after enablement'() {
		const handle = register(require.toAbsMid('../../support/dependencyA'), {
			baz: { foo: 'bar' },
			foo: 'qat',
			bar: 99
		} as typeof DependencyA);
		const enableHandle = enable();
		handle.destroy();
		const result: typeof Example = await loadModule('../../support/example', require);
		assert.strictEqual(result.foo, 'bar', 'should have value from mocked module');
		assert.strictEqual(result.bar, 2, 'should have value from mocked module');
		assert.deepEqual(result.baz, { }, 'should have value from mocked module');
		enableHandle.destroy();
	},

	'already enabled return same handle'() {
		const handle1 = enable();
		const handle2 = enable();
		assert.strictEqual(handle1, handle2, 'should be the same handle');
		handle1.destroy();
		assert.notStrictEqual(handle1, enable(), 'should re-enable');
	},

	'duplicate calls to handles do not cause issues'() {
		const handle = enable();
		handle.destroy();
		handle.destroy();
	},

	'registering mocks after enablement throws'() {
		enable();
		assert.throws(() => {
			register('foo, bar, baz', {});
		}, Error, 'Cannot register modules while mock is enabled.');
	}
});
