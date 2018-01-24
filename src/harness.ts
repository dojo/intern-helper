import assertRender from './support/assertRender';
import * as select from 'css-select-umd';
import adapter from './support/adapter';
import { WNode, DNode, VNode } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';

export interface CustomCompare {
	selector: string;
	property: string;
	compare: (value: any) => boolean;
}

export function harness(renderFunc: () => WNode<WidgetBase>, customCompares: CustomCompare[] = []) {
	let renderResult: any = null;
	let invalidated = true;
	let wNode = renderFunc();
	let widget: WidgetBase;
	const { widgetConstructor, properties, children } = wNode;
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

	function _runCompares(nodes: DNode, isExpected: boolean = false) {
		customCompares.forEach(({ selector, property, compare }) => {
			const [item] = select<DNode, VNode | WNode>(selector, [nodes], { adapter });
			if (item) {
				(item.properties as any)[property] = isExpected ? true : compare((item.properties as any)[property]);
			}
		});
	}

	function _tryRender() {
		const { properties, children } = renderFunc();
		widget.__setProperties__(properties);
		widget.__setChildren__(children);
		if (invalidated) {
			renderResult = widget.__render__();
			_runCompares(renderResult);
			invalidated = false;
		}
	}

	function _expect(expectedRenderFunc: any, selector?: string) {
		_tryRender();
		const expectedRenderResult = expectedRenderFunc();
		_runCompares(expectedRenderResult, true);
		if (selector) {
			const [firstItem] = select(selector, [renderResult], { adapter });
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
			const [firstItem] = select(selector, [renderResult], { adapter });
			if (firstItem) {
				const triggerFunction = firstItem.properties[name];
				triggerFunction.apply(widget, args);
			}
		}
	};
}

export default harness;
