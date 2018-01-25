const { describe, it } = intern.getInterface('bdd');

import { harness } from './../../src/harness';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { v, w } from '@dojo/widget-core/d';

class ChildWidget extends WidgetBase<any> {}

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

	// prettier-ignore
	protected render() {
		return v('div', { classes: ['root', 'other'], onclick: this._otherOnClick }, [
			v('span', {
				key: 'span',
				classes: 'span',
				style: 'width: 100px',
				id: 'random-id',
				onclick: this._onclick
			}, [
				`hello ${this._count}`
			]),
			w(ChildWidget, { key: 'widget', id: 'random-id' }),
			w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
		]);
	}
}

class ArrayWidget extends WidgetBase {
	_count = 0;
	_onclick() {
		this._count++;
		this.invalidate();
	}

	_otherOnClick(count: any = 50) {
		this._count = count;
		this.invalidate();
	}

	// prettier-ignore
	protected render() {
		return [
			v('span', {
				key: 'span',
				classes: 'span',
				style: 'width: 100px',
				id: 'random-id',
				onclick: this._onclick
			}, [
				`hello ${this._count}`
			]),
			w(ChildWidget, { key: 'widget', id: 'random-id' }),
			w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
		];
	}
}

describe('harness', () => {
	describe('widget with a single top level DNode', () => {
		it('expect', () => {
			const h = harness(() => w(MyWidget, {}));
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 0']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('expect partial for VNode', () => {
			const h = harness(() => w(MyWidget, {}));
			h.expectPartial('*[key="span"]', () =>
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 0'
				])
			);
		});

		it('expect partial for WNode constructor', () => {
			const h = harness(() => w(MyWidget, {}));
			h.expectPartial('*[key="widget"]', () => w(ChildWidget, { key: 'widget', id: 'random-id' }));
		});

		it('expect partial for WNode registry item', () => {
			const h = harness(() => w(MyWidget, {}));
			h.expectPartial('*[key="registry"]', () =>
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			);
		});

		it('trigger by tag', () => {
			const h = harness(() => w(MyWidget, {}));
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 0']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
			h.trigger('div', 'onclick');
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 50']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
			h.trigger('div', 'onclick', 100);
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 100']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('trigger by class', () => {
			const h = harness(() => w(MyWidget, {}));
			h.trigger('.span', 'onclick');
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 1']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('trigger by class from classes array', () => {
			const h = harness(() => w(MyWidget, {}));
			h.trigger('.root', 'onclick');
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 50']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('trigger by nested selector', () => {
			const h = harness(() => w(MyWidget, {}));
			h.trigger('.root span', 'onclick');
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 1']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('trigger without expect', () => {
			const h = harness(() => w(MyWidget, {}));
			h.trigger('*[key="span"]', 'onclick');
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 1']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('trigger by key selector', () => {
			const h = harness(() => w(MyWidget, {}));
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 0']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
			h.trigger('*[key="span"]', 'onclick');
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 1']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('trigger with non matching selector', () => {
			const h = harness(() => w(MyWidget, {}));
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 0']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
			h.trigger('*[key="other"]', 'onclick');
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} },
						['hello 0']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('custom compare for VNode', () => {
			const h = harness(() => w(MyWidget, {}), [
				{
					selector: '*[key="span"]',
					property: 'id',
					comparator: (property: any) => typeof property === 'string'
				}
			]);
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v('span', { key: 'span', id: '', classes: 'span', style: 'width: 100px', onclick: () => {} }, [
						'hello 0'
					]),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('custom compare for constructor WNode', () => {
			const h = harness(() => w(MyWidget, {}), [
				{
					selector: '*[key="widget"]',
					property: 'id',
					comparator: (property: any) => typeof property === 'string'
				}
			]);
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', id: 'random-id', classes: 'span', style: 'width: 100px', onclick: () => {} },
						['hello 0']
					),
					w(ChildWidget, { key: 'widget', id: '' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
				])
			);
		});

		it('custom compare for registry item WNode', () => {
			const h = harness(() => w(MyWidget, {}), [
				{
					selector: '*[key="registry"]',
					property: 'id',
					comparator: (property: any) => typeof property === 'string'
				}
			]);
			h.expect(() =>
				v('div', { classes: ['root', 'other'], onclick: () => {} }, [
					v(
						'span',
						{ key: 'span', id: 'random-id', classes: 'span', style: 'width: 100px', onclick: () => {} },
						['hello 0']
					),
					w(ChildWidget, { key: 'widget', id: 'random-id' }),
					w<ChildWidget>('registry-item', { key: 'registry', id: '' })
				])
			);
		});
	});

	describe('widget with an array of DNodes', () => {
		it('expect', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.expect(() => [
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 0'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
		});

		it('expect partial for VNode', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.expectPartial('*[key="span"]', () =>
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 0'
				])
			);
		});

		it('expect partial for WNode constructor', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.expectPartial('*[key="widget"]', () => w(ChildWidget, { key: 'widget', id: 'random-id' }));
		});

		it('expect partial for WNode registry item', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.expectPartial('*[key="registry"]', () =>
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			);
		});

		it('trigger by tag', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.expect(() => [
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 0'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
			h.trigger('span', 'onclick');
			h.expect(() => [
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 1'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
		});

		it('trigger by class', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.trigger('.span', 'onclick');
			h.expect(() => [
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 1'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
		});

		it('trigger by key selector', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.expect(() => [
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 0'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
			h.trigger('*[key="span"]', 'onclick');
			h.expect(() => [
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 1'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
		});

		it('trigger with non matching selector', () => {
			const h = harness(() => w(ArrayWidget, {}));
			h.trigger('*[key="other"]', 'onclick');
			h.expect(() => [
				v('span', { key: 'span', classes: 'span', style: 'width: 100px', id: 'random-id', onclick: () => {} }, [
					'hello 0'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
		});

		it('custom compare for VNode', () => {
			const h = harness(() => w(ArrayWidget, {}), [
				{
					selector: '*[key="span"]',
					property: 'id',
					comparator: (property: any) => typeof property === 'string'
				}
			]);
			h.expect(() => [
				v('span', { key: 'span', id: '', classes: 'span', style: 'width: 100px', onclick: () => {} }, [
					'hello 0'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
		});

		it('custom compare for constructor WNode', () => {
			const h = harness(() => w(ArrayWidget, {}), [
				{
					selector: '*[key="widget"]',
					property: 'id',
					comparator: (property: any) => typeof property === 'string'
				}
			]);
			h.expect(() => [
				v('span', { key: 'span', id: 'random-id', classes: 'span', style: 'width: 100px', onclick: () => {} }, [
					'hello 0'
				]),
				w(ChildWidget, { key: 'widget', id: '' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: 'random-id' })
			]);
		});

		it('custom compare for registry item WNode', () => {
			const h = harness(() => w(ArrayWidget, {}), [
				{
					selector: '*[key="registry"]',
					property: 'id',
					comparator: (property: any) => typeof property === 'string'
				}
			]);
			h.expect(() => [
				v('span', { key: 'span', id: 'random-id', classes: 'span', style: 'width: 100px', onclick: () => {} }, [
					'hello 0'
				]),
				w(ChildWidget, { key: 'widget', id: 'random-id' }),
				w<ChildWidget>('registry-item', { key: 'registry', id: '' })
			]);
		});
	});
});
