import assertRender from './support/assertRender';
import * as select from 'css-select-umd';
import adapter from './support/adapter';

export function harness(renderFunc: any) {
	let renderResult: any = null;
	let invalidated = true;

	let wNode = renderFunc();
	const { widgetConstructor, properties, children } = wNode;
	const widget = new class extends widgetConstructor {
		invalidate() {
			invalidated = true;
			super.invalidate();
		}
	}();
	widget.__setProperties__(properties);
	widget.__setChildren__(children);

	function _expect(expectedRenderFunc: any, selector?: string) {
		if (invalidated) {
			renderResult = widget.__render__();
			invalidated = false;
		}
		if (selector) {
			const [firstItem] = select(selector, [renderResult], { adapter });
			assertRender(firstItem, expectedRenderFunc());
		} else {
			assertRender(renderResult, expectedRenderFunc());
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
			if (invalidated) {
				renderResult = widget.__render__();
				invalidated = false;
			}
			const [firstItem] = select(selector, [renderResult], { adapter });
			if (firstItem) {
				const triggerFunction = firstItem.properties[name];
				triggerFunction.apply(widget, args);
			}
		}
	};
}

export default harness;
