import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import harness from '../../src/harness';

import { v, w } from '@dojo/widget-core/d';
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

class SubWidget extends WidgetBase<WidgetProperties> {
	render() {
		return w(MockWidget, { bind: this, foo: 'bar' }, [ v('div'), w(MockWidget, { bind: this, foo: 'bar' } ) ]);
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
		assert.strictEqual(dom.parentElement && dom.parentElement.innerHTML, '<div class="foo"></div>');
		widget.destroy();
	},

	'decorate WNodes'() {
		const widget = harness(SubWidget);
		widget.expectRender(w(MockWidget, { foo: 'bar' }, [ v('div'), w(MockWidget, { foo: 'bar' } ) ]));
		widget.destroy();
	}
});
