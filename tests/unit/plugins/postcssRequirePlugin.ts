import { SinonStub, stub } from 'sinon';
import { mock, unmock } from '../../support/mockUtil';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

let moduleStub: SinonStub;
let registerPluginStub: SinonStub;

function assertRegisterPlugin() {
	assert.strictEqual(registerPluginStub.callCount, 1);
	const callback = registerPluginStub.lastCall.args[1];
	assert.strictEqual(moduleStub.callCount, 0);
	assert.isFunction(callback);

	return callback;
}

registerSuite('plugins/postcssRequirePlugin', {
	afterEach() {
		unmock();
		registerPluginStub.restore();
	},

	beforeEach(test) {
		if (intern.environment !== 'node') {
			test.skip('postcssRequirePlugin only runs in a node environment');
		} else {
			moduleStub = stub();
			mock({
				'css-modules-require-hook': moduleStub
			});
			registerPluginStub = stub(intern, 'registerPlugin');
			require('../../../src/plugins/postcssRequirePlugin');
		}
	},

	tests: {
		'plugin loads without options'() {
			const callback = assertRegisterPlugin();
			callback();

			assert.strictEqual(moduleStub.callCount, 1);
			assert.deepEqual(moduleStub.lastCall.args[0], {});
		},

		'plugin loads and passes options'() {
			const callback = assertRegisterPlugin();
			const options = {};
			callback(options);

			assert.strictEqual(moduleStub.callCount, 1);
			assert.equal(moduleStub.lastCall.args[0], options);
		}
	}
});
