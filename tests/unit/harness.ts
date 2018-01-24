const { describe, it } = intern.getInterface('bdd');

import { harness } from './../../src/harness';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { v, w } from '@dojo/widget-core/d';

class ChildWidget extends WidgetBase {}

class MyWidget extends WidgetBase {
	_count = 0;
	_onclick() {
		this._count++;
		this.invalidate();
	}

	_otherOnClick(count: any = 50) {
		this._count = count;
		this.invalidate();
	}

	render() {
		return v('div', { onclick: this._otherOnClick }, [
			v('span', { key: 'span', onclick: this._onclick }, [`hello ${this._count}`]),
			w(ChildWidget, { key: 'widget' }),
			w('registry-item', { key: 'registry' })
		]);
	}
}

describe('harness', () => {
	it('expect', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 0']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 0']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
	});

	it('expect partial for VNode', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expectPartial('*[key="span"]', () => v('span', { key: 'span', onclick: () => {} }, ['hello 0']));
	});

	it('expect partial for WNode constructor', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expectPartial('*[key="widget"]', () => w(ChildWidget, { key: 'widget' }));
	});

	it('expect partial for WNode registry item', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expectPartial('*[key="registry"]', () => w('registry-item', { key: 'registry' }));
	});

	it('trigger by tag', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 0']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
		h.trigger('div', 'onclick');
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 50']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
		h.trigger('div', 'onclick', 100);
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 100']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
	});

	it('trigger without expect', () => {
		const h = harness(() => w(MyWidget, {}));
		h.trigger('*[key="span"]', 'onclick');
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 1']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
	});

	it('trigger by key selector', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 0']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
		h.trigger('*[key="span"]', 'onclick');
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 1']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
	});

	it('trigger with non matching selector', () => {
		const h = harness(() => w(MyWidget, {}));
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 0']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
		h.trigger('*[key="other"]', 'onclick');
		h.expect(() =>
			v('div', { onclick: () => {} }, [
				v('span', { key: 'span', onclick: () => {} }, ['hello 0']),
				w(ChildWidget, { key: 'widget' }),
				w('registry-item', { key: 'registry' })
			])
		);
	});
});
