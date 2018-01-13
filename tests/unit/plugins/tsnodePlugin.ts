import { SinonStub, stub } from 'sinon';
import { mock, unmock } from '../../support/mockUtil';

const { registerSuite } = intern.getInterface('object');
const { assert } = intern.getPlugin('chai');

let registerStub: SinonStub;
let registerPluginStub: SinonStub;

function assertRegisterPlugin() {
	assert.strictEqual(registerPluginStub.callCount, 1);
	const callback = registerPluginStub.lastCall.args[1];
	assert.strictEqual(registerStub.callCount, 0);
	assert.isFunction(callback);

	return callback;
}

registerSuite('plugins/tsnodePlugin', {
	afterEach() {
		unmock();
		registerPluginStub.restore();
	},

	beforeEach(test) {
		if (intern.environment !== 'node') {
			test.skip('postcssRequirePlugin only runs in a node environment');
		} else {
			registerStub = stub();
			mock({
				'ts-node': { register: registerStub }
			});
			registerPluginStub = stub(intern, 'registerPlugin');
			require('../../../src/plugins/tsnodePlugin');
		}
	},

	tests: {
		'plugin loads without options'() {
			const callback = assertRegisterPlugin();

			callback();

			assert.strictEqual(registerStub.callCount, 1);
			assert.lengthOf(registerStub.lastCall.args, 0);
		},

		'plugin loads and passes options'() {
			const callback = assertRegisterPlugin();

			const options = {};
			callback(options);

			assert.strictEqual(registerStub.callCount, 1);
			assert.equal(registerStub.lastCall.args[0], options);
		}
	}
});
