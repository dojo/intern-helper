const { describe, it } = intern.getInterface('bdd');
// const { assert } = intern.getPlugin('chai');

import { harness } from './../../src/harness';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { v, w } from '@dojo/widget-core/d';

class MyWidget extends WidgetBase {
	_count = 0;
	_onclick(event: MouseEvent) {
		event.stopPropagation();
		this._count++;
		this.invalidate();
	}

	_otherOnClick() {
		this._count = 50;
		this.invalidate();
	}

	render() {
		return v('div', { onclick: this._otherOnClick }, [
			v('span', { key: 'span', onclick: this._onclick }, [`hello ${this._count}`])
		]);
	}
}

describe('harness', () => {
	it('try my harness', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expectRender(() =>
			v('div', { onclick: () => {} }, [v('span', { key: 'span', onclick: () => {} }, ['hello 0'])])
		);
	});

	it('try my harness - fail', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expectRender(() =>
			v('div', { onclick: () => {} }, [v('span', { key: 'span', onclick: () => {} }, ['hello fail'])])
		);
	});

	it('with trigger', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expectRender(() =>
			v('div', { onclick: () => {} }, [v('span', { key: 'span', onclick: () => {} }, ['hello 0'])])
		);
		h.trigger({ name: 'onclick' });
		h.expectRender(() =>
			v('div', { onclick: () => {} }, [v('span', { key: 'span', onclick: () => {} }, ['hello 50'])])
		);
	});

	it('with trigger on key', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expectRender(() =>
			v('div', { onclick: () => {} }, [v('span', { key: 'span', onclick: () => {} }, ['hello 0'])])
		);
		h.trigger({ name: 'onclick', key: 'span' });
		h.expectRender(() =>
			v('div', { onclick: () => {} }, [v('span', { key: 'span', onclick: () => {} }, ['hello 1'])])
		);
	});
});
