import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import harness, { assignChildProperties, assignProperties, replaceChild, replaceChildProperties, replaceProperties } from '../../src/harness';

import { v, w } from '@dojo/widget-core/d';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import assertRender from '../../src/support/assertRender';

const hasFunctionName = (() => {
	function foo() {}
	return (<any> foo).name === 'foo';
})();

interface MockWidgetProperties extends WidgetProperties {
	foo?: string;
	bar?: number;
	baz?: (e: Event) => void;
}

class MockWidget<P extends MockWidgetProperties> extends WidgetBase<P> {
	render() {
		return v('div.foo');
	}
}

class SubWidget extends WidgetBase<WidgetProperties> {
	render() {
		return v('div', { }, [ w(MockWidget, { bind: this, key: 'first' }), w(MockWidget, { bind: this, key: 'second' }) ]);
	}
}

registerSuite({
	name: 'harness',

	'rendering': {
		'nodes are added during rendering and removed after destruction'() {
			const widget = harness(MockWidget);
			const bodyChildCount = document.body.childElementCount;
			const dom = widget.getDom();
			assert.strictEqual(document.body.childElementCount, bodyChildCount + 1, 'body should have an extra node');
			const parentElement = dom.parentElement!;
			assert.strictEqual(parentElement.tagName, 'TEST--HARNESS');
			assert.include(parentElement.getAttribute('id')!, 'test--harness-');
			assert.strictEqual(parentElement.childElementCount, 1, 'harness should only have one child element');
			assert.strictEqual(parentElement.parentElement, document.body, 'harness root should be child of document.body');
			widget.destroy();
			assert.strictEqual(document.body.childElementCount, bodyChildCount, 'body should have had a child removed');
			assert.isNull(parentElement.parentElement, 'harness root should no longer be a child of the document.body');
		},

		'WNodes are stubbed'() {
			const widget = harness(SubWidget);
			const dom = widget.getDom();
			assert.strictEqual(dom.tagName, 'DIV');
			assert.strictEqual(dom.childElementCount, 2);
			assert.strictEqual(dom.children[0].tagName, 'TEST--WIDGET-STUB');
			assert.strictEqual(dom.children[1].tagName, 'TEST--WIDGET-STUB');
			if (hasFunctionName) {
				assert.strictEqual(dom.children[0].getAttribute('test--widget-name'), 'MockWidget');
				assert.strictEqual(dom.children[1].getAttribute('test--widget-name'), 'MockWidget');
			}
			else {
				assert.strictEqual(dom.children[0].getAttribute('test--widget-name'), '<Anonymous>');
				assert.strictEqual(dom.children[1].getAttribute('test--widget-name'), '<Anonymous>');
			}
			widget.destroy();
		}
	},

	'expectRender()': {
		'HNode render - matches'() {
			const widget = harness(MockWidget);
			widget.expectRender(v('div.foo'));
			widget.destroy();
		},

		'HNode render - does not match'() {
			const widget = harness(MockWidget);
			assert.throws(() => {
				widget.expectRender(v('div.bar'));
			});
			widget.destroy();
		},

		'WNode children render - matches'() {
			const widget = harness(SubWidget);
			widget.expectRender(v('div', { }, [ w(MockWidget, { bind: true, key: 'first' }), w(MockWidget, { bind: true, key: 'second' }) ]));
			widget.destroy();
		},

		'WNode children render - does not match'() {
			const widget = harness(SubWidget);
			assert.throws(() => {
				widget.expectRender(v('div', { }, [ w(MockWidget, { key: 'first' }), w(MockWidget, { bind: true, key: 'second' }) ]));
			});
			widget.destroy();
		}
	},

	'setProperties()': {
		'properties alter render'() {
			interface DynamicWidgetProperties extends WidgetProperties {
				flag: boolean;
			}

			class DynamicWidget extends WidgetBase<DynamicWidgetProperties> {
				render() {
					return this.properties.flag ?
						v('div', { }, [ w(MockWidget, { bind: this, key: 'first' }), w(MockWidget, { bind: this, key: 'second' }) ]) :
						v('div', { }, [ w(MockWidget, { bind: this, key: 'first' }) ]);
				}
			}

			const widget = harness(DynamicWidget);

			widget.setProperties({ flag: false });
			widget.expectRender(v('div', { }, [ w(MockWidget, { bind: true, key: 'first' }) ]));

			widget.setProperties({ flag: true });
			widget.expectRender(v('div', { }, [ w(MockWidget, { bind: true, key: 'first' }), w(MockWidget, { bind: true, key: 'second' }) ]));

			widget.destroy();
		}
	},

	'sendEvent()': {
		'default sendEvent'() {
			let clickCount = 0;
			let dom: HTMLElement;

			class ButtonWidget extends WidgetBase<WidgetProperties> {
				private _tag = 'foo';

				protected onClick(e: MouseEvent): boolean {
					clickCount++;
					e.preventDefault();
					if (hasFunctionName) {
						assert.strictEqual((<any> e.constructor).name, 'CustomEvent', 'should be of class custom event');
					}
					assert.strictEqual(e.type, 'click', 'should be type of "click"');
					assert.strictEqual(e.target, dom, 'the target should be the rendered dom');
					assert.strictEqual(this._tag, 'foo', '"this" should be an instance of the class');
					return true;
				}

				render() {
					return v('button', { onclick: this.onClick });
				}
			}

			const widget = harness(ButtonWidget);

			assert.strictEqual(clickCount, 0);

			dom = widget.getDom();

			widget.sendEvent('click');

			assert.strictEqual(clickCount, 1);
		}
	},

	'getDom()'() {
		const widget = harness(MockWidget);
		const dom = widget.getDom();
		assert.strictEqual(dom.parentElement && dom.parentElement.innerHTML, '<div class="foo"></div>', 'widget was rendered to the DOM as expected');
		widget.destroy();
	},

	'assignChildProperties()': {
		'by index'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			assignChildProperties(actual, 1, { target: '_blank' });

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link', target: '_blank' }) ]));
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
			const actual = v('div');

			assertRender(actual, v('div'));

			replaceChild(actual, 0, v('span'));

			assertRender(actual, v('div', {}, [ v('span') ]));
		},

		'by string deep index'() {
			const actual = v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]));

			replaceChild(actual, '0,0', 'baz');

			assertRender(actual, v('div', {}, [ v('span', {}, [ 'baz' ]), v('a', { href: '#link' }) ]));
		},

		'string index resolving to a non child node throws'() {
			const actual = v('div', {}, [ v('span', {}, [ 'foobar' ]), v('a', { href: '#link' }) ]);

			assert.throws(() => {
				replaceChild(actual, '0,0,0', 'bar');
			}, TypeError, 'Index of "0,0,0" is not resolving to a valid target');
		}
	},

	'replaceChildProperties()': {
		'by index'() {
			const actual = v('div', {}, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', {}, [ null, v('a', { href: '#link' }) ]));

			replaceChildProperties(actual, 1, { target: '_blank' });

			assertRender(actual, v('div', {}, [ null, v('a', { target: '_blank' }) ]));
		}
	},

	'replaceProperties()': {
		'basic'() {
			const actual = v('div', { styles: { 'color': 'blue' } }, [ null, v('a', { href: '#link' }) ]);

			assertRender(actual, v('div', { styles: { 'color': 'blue' } }, [ null, v('a', { href: '#link' }) ]));

			replaceProperties(actual, { classes: { 'foo': true } });

			assertRender(actual, v('div', { classes: { 'foo': true } }, [ null, v('a', { href: '#link' }) ]));
		}
	}
});
