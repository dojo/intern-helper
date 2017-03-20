import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import doc from '../../../src/dom/loadJsdom';

registerSuite({
	name: 'dom/loadJsdom',

	'document is global and matches export'() {
		assert(document, 'document should be in the global scope');
		assert.strictEqual(document, doc, 'document should equal default export of module');
	},

	'window is global and matches document.defaultView'() {
		assert(window, 'window should be global');
		assert.strictEqual(window, document.defaultView, 'window should equal document.defaultView');
	},

	'transition should be patched'() {
		assert.isTrue('transition' in document.createElement('div').style);
	},

	'requestAnimationFrame should be patched'(this: any) {
		const dfd = this.async();

		assert.isFunction(requestAnimationFrame);
		assert(requestAnimationFrame(dfd.callback(() => {})));
	},

	'cancelAnimationFrame should be patched'() {
		assert.isFunction(cancelAnimationFrame);
	}
});
