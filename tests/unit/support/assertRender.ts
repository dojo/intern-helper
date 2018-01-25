const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

import Set from '@dojo/shim/Set';
import Map from '@dojo/shim/Map';
import assertRender from '../../../src/support/assertRender';
import { v, w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';

class MockWidget extends WidgetBase {
	render() {
		return v('div');
	}
}

class OtherWidget extends WidgetBase {
	render() {
		return v('div', { key: 'one', classes: 'class' }, ['text node', undefined, w(MockWidget, {})]);
	}
}

class ChildWidget extends WidgetBase<any> {}

class WidgetWithMap extends WidgetBase {
	render() {
		const bar = new Set();
		bar.add('foo');
		const foo = new Map();
		foo.set('a', 'a');
		return w(ChildWidget, { foo, bar });
	}
}

describe('support/assertRender', () => {
	it('Should not throw when actual and expected match', () => {
		const widget = new OtherWidget();
		const renderResult = widget.__render__();
		assert.doesNotThrow(() => {
			assertRender(renderResult, renderResult);
		});
	});

	it('Should not throw when actual and expected but properties are ordered differently', () => {
		const widget = new OtherWidget();
		const renderResult = widget.__render__();
		assert.doesNotThrow(() => {
			assertRender(
				renderResult,
				v('div', { classes: 'class', key: 'one' }, ['text node', undefined, w(MockWidget, {})])
			);
		});
	});

	it('Should throw when actual and expected do not match', () => {
		const widget = new OtherWidget();
		const renderResult = widget.__render__();
		assert.throws(() => {
			assertRender(renderResult, v('div', { key: 'one', classes: 'class' }, ['text node', v('span')]));
		});
	});

	it('Should not throw when map and set properties are equal', () => {
		const bar = new Set();
		bar.add('foo');
		const foo = new Map();
		foo.set('a', 'a');
		const widget = new WidgetWithMap();
		const renderResult = widget.__render__();
		assert.doesNotThrow(() => {
			assertRender(renderResult, w(ChildWidget, { bar, foo }));
		});
	});

	it('Should throw when a map property is not equal', () => {
		const bar = new Set();
		bar.add('foo');
		const foo = new Map();
		foo.set('a', 'b');
		const widget = new WidgetWithMap();
		const renderResult = widget.__render__();
		assert.throws(() => {
			assertRender(renderResult, w(ChildWidget, { bar, foo }));
		});
	});

	it('Should throw when a set property is not equal', () => {
		const bar = new Set();
		bar.add('bar');
		const foo = new Map();
		foo.set('a', 'a');
		const widget = new WidgetWithMap();
		const renderResult = widget.__render__();
		assert.throws(() => {
			assertRender(renderResult, w(ChildWidget, { bar, foo }));
		});
	});
});
