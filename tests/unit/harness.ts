import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import harness from '../../src/harness';

import { v } from '@dojo/widget-core/d';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import WidgetBase from '@dojo/widget-core/WidgetBase';

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

registerSuite({
	name: 'harness',

	'expectRender()': {
		'matches'() {
			const widget = harness(MockWidget);
			widget.expectRender(v('div.foo'));
			widget.destroy();
		},

		'does not match'() {
			const widget = harness(MockWidget);
			assert.throws(() => {
				widget.expectRender(v('div.bar'));
			});
			widget.destroy();
		}
	},

	'getDom()'() {
		const widget = harness(MockWidget);
		const dom = widget.getDom();
		assert.strictEqual(dom.tagName, 'DIV');
		assert.strictEqual(dom.className, 'foo');
		assert.strictEqual(dom.children.length, 0);
	}
});
