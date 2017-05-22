import has from '@dojo/has/has';
import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import sendEvent from '../../../src/support/sendEvent';

const hasCustomEventConstructor = (() => {
	try {
		new window.CustomEvent('foo');
		return true;
	}
	catch (e) {
		return false;
	}
})();

registerSuite({
	name: 'support/sendEvent',

	'custom event'() {
		const target = document.createElement('div');
		document.body.appendChild(target);

		function listener(evt: CustomEvent) {
			assert.strictEqual(evt.type, 'foo', 'event type should be "foo"');
			assert.isTrue(evt.bubbles, 'event should bubble by default');
			assert.isTrue(evt.cancelable, 'event should be cancelable by default');

			target.removeEventListener('foo', listener);
			document.body.removeChild(target);
		}

		target.addEventListener('foo', listener);

		sendEvent(target, 'foo');
	},

	'bubbles/cancelable'() {
		const target = document.createElement('div');
		document.body.appendChild(target);

		function listener(evt: CustomEvent) {
			assert.property(evt, 'preventDefault', 'preventDefault should be included');
			assert.isFalse(evt.bubbles, 'event should not bubble');
			assert.isFalse(evt.cancelable, 'event not be cancelable');

			target.removeEventListener('foo', listener);
			document.body.removeChild(target);
		}

		target.addEventListener('foo', listener);

		sendEvent(target, 'foo', {
			eventInit: {
				bubbles: false,
				cancelable: false
			}
		});
	},

	'mock target'() {
		const target = document.createElement('div');
		document.body.appendChild(target);

		const mockTarget = {} as HTMLDivElement;
		let called = false;

		function listener(evt: CustomEvent) {
			assert.strictEqual(evt.target, mockTarget, 'Target of event should be mock target');
			called = true;
		}

		target.addEventListener('click', listener);

		sendEvent(target, 'click', {
			eventInit: {
				target: mockTarget
			}
		});
		assert.isTrue(called, 'listener should have been called');

		document.body.removeChild(target);
	},

	'MouseEvents'() {
		const target = document.createElement('button');
		document.body.appendChild(target);

		function listener(evt: MouseEvent) {
			assert.strictEqual(evt.type, 'click', 'event type should be "click"');
			if (hasCustomEventConstructor) {
				assert.instanceOf(evt, (<any> window).MouseEvent, 'event should be an instance of MouseEvent');
			}
			else {
				assert.instanceOf(evt, (<any> window).CustomEvent, 'event should be an instance of MouseEvent');
			}
			assert.strictEqual(evt.clientX, 50);
			assert.strictEqual(evt.clientY, 50);

			target.removeEventListener('click', listener);
			document.body.removeChild(target);
		}

		target.addEventListener('click', listener);

		const eventInit: MouseEventInit = {
			cancelable: true,
			bubbles: false,
			clientX: 50,
			clientY: 50
		};

		sendEvent(target, 'click', {
			eventClass: 'MouseEvent',
			eventInit
		});
	},

	'widely unsupported event'() {
		const target = document.createElement('button');
		document.body.appendChild(target);

		function listener(evt: any) {
			assert.strictEqual(evt.type, 'deviceproximity', 'event type should be "deviceproximity"');
			assert.strictEqual(evt.max, 0);
			assert.strictEqual(evt.min, 0);
			assert.strictEqual(evt.value, 0);

			target.removeEventListener('deviceproximity', listener);
			document.body.removeChild(target);
		}

		target.addEventListener('deviceproximity', listener);

		const eventInit = {
			max: 0,
			min: 0,
			value: 0
		};

		sendEvent(target, 'deviceproximity', {
			eventClass: 'DeviceProximityEvent',
			eventInit
		});
	},

	'selector'() {
		const target = document.createElement('div');
		const button = document.createElement('button');
		target.appendChild(button);
		document.body.appendChild(target);

		function wronglistener() {
			throw new Error('Wrong listener called');
		}

		function listener(evt: CustomEvent) {
			assert.strictEqual(evt.target, button);

			button.removeEventListener('foo', listener);
			target.removeEventListener('foo', wronglistener);
			document.body.removeChild(target);
		}

		target.addEventListener('foo', wronglistener);
		button.addEventListener('foo', listener);

		sendEvent(target, 'foo', {
			selector: 'button'
		});
	},

	'bad selector throws'() {
		const target = document.createElement('div');
		document.body.appendChild(target);

		assert.throws(() => {
			sendEvent(target, 'foo', {
				selector: 'button'
			});
		}, Error, 'Cannot resolve to an element with selector');

		document.body.removeChild(target);
	},

	'uncaught listener errors throw'(this: any) {
		if (!has('host-node')) {
			this.skip('Browsers detect this as a fatal suite error');
		}

		const target = document.createElement('div');
		document.body.appendChild(target);

		function thrower() {
			throw new Error('foo');
		}
		target.addEventListener('click', thrower);

		assert.throws(() => {
			sendEvent(target, 'click');
		}, Error, 'foo');

		target.removeEventListener('click', thrower);
		document.body.removeChild(target);
	}
});
