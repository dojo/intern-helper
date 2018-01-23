import assertRender from './support/assertRender';
import * as select from 'css-select-umd';
import adapter from './support/adapter';

export function harness(renderFunc: any) {
	let widget: any;
	let renderResult: any = null;
	let invalidated = true;

	function _expect(expectedRenderFunc: any, selector?: string) {
		let wNode = renderFunc();
		const { widgetConstructor, properties, children } = wNode;
		if (widget === undefined) {
			widget = new class extends widgetConstructor {
				invalidate() {
					invalidated = true;
					super.invalidate();
				}
			}();
		}
		widget.__setProperties__(properties);
		widget.__setChildren__(children);
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
			const [firstItem] = select(selector, [renderResult], { adapter });
			if (firstItem) {
				const triggerFunction = firstItem.properties[name];
				triggerFunction.apply(widget, args);
			}
		}
	};
}

export default harness;
