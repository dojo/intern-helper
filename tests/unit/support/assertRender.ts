const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

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
});
