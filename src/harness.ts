import assertRender from './support/assertRender';
import { select } from './support/selector';
import { WNode, DNode, WidgetBaseInterface, Constructor } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { decorateNodes } from './support/utils';

export interface CustomCompare {
	selector: string;
	property: string;
	compare: (value: any) => boolean;
}

export function harness(renderFunc: () => WNode<WidgetBaseInterface>, customCompares: CustomCompare[] = []) {
	let renderResult: any = null;
	let invalidated = true;
	let wNode = renderFunc();
	let widget: WidgetBase;
	const { properties, children } = wNode as any;
	const widgetConstructor = wNode.widgetConstructor as Constructor<WidgetBase>;
	if (typeof widgetConstructor === 'function') {
		widget = new class extends widgetConstructor {
			invalidate() {
				invalidated = true;
				super.invalidate();
			}
		}();
		widget.__setProperties__(properties);
		widget.__setChildren__(children);
	} else {
		throw new Error('Harness does not support registry items');
	}

	function _runCompares(nodes: DNode | DNode[], isExpected: boolean = false) {
		customCompares.forEach(({ selector, property, compare }) => {
			const items = select(selector, nodes);
			items.forEach((item: any) => {
				if (item.properties && item.properties[property] !== undefined) {
					item.properties[property] = isExpected ? true : compare(item.properties[property]);
				}
			});
		});
	}

	function _tryRender() {
		const { properties, children } = renderFunc();
		widget.__setProperties__(properties);
		widget.__setChildren__(children);
		if (invalidated) {
			renderResult = decorateNodes(widget.__render__());
			_runCompares(renderResult);
			invalidated = false;
		}
	}

	function _expect(expectedRenderFunc: any, selector?: string) {
		_tryRender();
		const expectedRenderResult = decorateNodes(expectedRenderFunc());
		_runCompares(expectedRenderResult, true);
		if (selector) {
			const [firstItem] = select(selector, renderResult);
			assertRender(firstItem, expectedRenderResult);
		} else {
			assertRender(renderResult, expectedRenderResult);
		}
	}

	return {
		expect(expectedRenderFunc: any) {
			return _expect(expectedRenderFunc);
		},
		expectPartial(selector: string, expectedRenderFunc: any) {
			return _expect(expectedRenderFunc, selector);
		},
		trigger(selector: string, name: string, ...args: any[]) {
			_tryRender();
			const [firstItem] = select(selector, renderResult);
			if (firstItem) {
				const triggerFunction = (firstItem.properties as any)[name];
				triggerFunction.apply(widget, args);
			}
		}
	};
}

export default harness;
