import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import {
	assignChildProperties,
	assignProperties,
	replaceChild,
	replaceChildProperties,
	replaceProperties
} from '../../../src/support/virtualDom';

import { v, w } from '@dojo/widget-core/d';
import assertRender from '../../../src/support/assertRender';

registerSuite({
	name: 'support/virtualDom',

		'assignChildProperties()': {
		'by index'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			assignChildProperties(actual, 1, { target: '_blank' });

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link', target: '_blank' }) ]));
		},

		'does not resolve'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assert.throws(() => {
				assignChildProperties(actual, 0, { target: '_blank' });
			}, TypeError, 'Index of "0" is not resolving to a valid target');
		}
	},

	'assignProperties()': {
		'basic'() {
			const actual = v('div', { styles: { 'color': 'blue' } }, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', { styles: { 'color': 'blue' } }, [ null, v('a', { href: '#link' }) ]));

			assignProperties(actual, { styles: { 'font-weight': 'bold' } });

			assertRender(actual, v('div', { styles: { 'font-weight': 'bold' } }, [ null, v('a', { href: '#link' }) ]));
		}
	},

	'replaceChild()': {
		'by index'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			replaceChild(actual, 0, v('dfn'));

			assertRender(actual, v('div', {}, [ v('dfn'), v('a', { href: '#link' }) ]));
		},

		'by string index'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			replaceChild(actual, '0', v('dfn'));

			assertRender(actual, v('div', {}, [ v('dfn'), v('a', { href: '#link' }) ]));
		},

		'no children'() {
			const actual = w('widget', {});

			assertRender(actual, w('widget', {}));

			replaceChild(actual, 0, v('span'));

			assertRender(actual, w('widget', {}, [ v('span') ]));
		},

		'by string deep index'() {
			const actual = v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]));

			replaceChild(actual, '0,0', 'baz');

			assertRender(actual, v('div', {}, [ v('span', {}, [ 'baz' ]), v('a', { href: '#link' }) ]));
		},

		'final item missing children'() {
			const actual = v('div', [ v('span', [ w('widget', { }) ]) ]);

			assertRender(actual, v('div', [ v('span', [ w('widget', { }) ]) ]));

			replaceChild(actual, '0,0,0', 'foo');

			assertRender(actual, v('div', [ v('span', [ w('widget', { }, [ 'foo' ]) ]) ]));
		},

		'string index resolving to a non child node throws'() {
			const actual = v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]);

			assert.throws(() => {
				replaceChild(actual, '0,0,0', 'bar');
			}, TypeError, 'Index of "0,0,0" is not resolving to a valid target');
		},

		'string index resolve to an earlier non child node throws'() {
			const actual = v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]);

			assert.throws(() => {
				replaceChild(actual, '3,0,0', 'bar');
			}, TypeError, 'Index of "3,0,0" is not resolving to a valid target');
		}
	},

	'replaceChildProperties()': {
		'by index'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			replaceChildProperties(actual, 1, { target: '_blank' });

			assertRender(actual, v('div', {}, [ null, v('a', { target: '_blank' }) ]));
		},

		'throws when final child can\'t have properties'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			assert.throws(() => {
				replaceChildProperties(actual, 0, { target: '_blank' });
			}, TypeError, 'Index of "0" is not resolving to a valid target');
		}
	},

	'replaceProperties()': {
		'basic'() {
			const actual = v('div', { styles: { 'color': 'blue' } }, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', { styles: { 'color': 'blue' } }, [ null, v('a', { href: '#link' }) ]));

			replaceProperties(actual, { classes: { 'foo': true } });

			assertRender(actual, v('div', { classes: { 'foo': true } }, [ null, v('a', { href: '#link' }) ]));
		}
	},

	'non-exported resolveChild()': {
		'by string index'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			assignChildProperties(actual, '1', { target: '_blank' });

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link', target: '_blank' }) ]));
		},

		'no children throws'() {
			const actual = w('widget', {});

			assertRender(actual, w('widget', {}));

			assert.throws(() => {
				assignChildProperties(actual, 0, { foo: 'bar' });
			}, TypeError, 'Index of "0" is not resolving to a valid target');
		},

		'by string deep index'() {
			const actual = v('div', {}, [ v('span', {}, [ v('a', { href: '#link' }) ]) ]);

			assertRender(actual, v('div', {}, [ v('span', {}, [ v('a', { href: '#link' }) ]) ]));

			assignChildProperties(actual, '0,0', { target: '_blank' });

			assertRender(actual, v('div', {}, [ v('span', {}, [ v('a', { href: '#link', target: '_blank' }) ]) ]));
		},

		'final item missing children throws'() {
			const actual = v('div', [ v('span', [ w('widget', { }) ]) ]);

			assertRender(actual, v('div', [ v('span', [ w('widget', { }) ]) ]));

			assert.throws(() => {
				assignChildProperties(actual, '0,0,0', { foo: 'bar' });
			}, TypeError, 'Index of "0,0,0" is not resolving to a valid target');
		},

		'string index resolving to a non child node throws'() {
			const actual = v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]);

			assert.throws(() => {
				assignChildProperties(actual, '0,0,0', { foo: 'bar' });
			}, TypeError, 'Index of "0,0,0" is not resolving to a valid target');
		},

		'string index resolve to an earlier non child node throws'() {
			const actual = v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]);

			assert.throws(() => {
				assignChildProperties(actual, '3,0,0', { foo: 'bar' });
			}, TypeError, 'Index of "3,0,0" is not resolving to a valid target');
		}
	}
});
