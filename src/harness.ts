import assertRender from './support/assertRender';
import { decorate, isWNode, isVNode } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';

interface TriggerTarget {
	name: string;
	key?: string | number;
}

export function harness(renderFunc: any) {
	let widget: any;
	let renderResult: any = null;
	let invalidated = true;

	return {
		expectRender(expectedRenderFunc: any) {
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
			assertRender(renderResult, expectedRenderFunc());
		},
		trigger(target: TriggerTarget, args?: any) {
			const { name } = target;
			let triggerFunction: any[];
			const isEvent = args instanceof Event;
			if (isEvent) {
				args.stopPropagation = () => {
					debugger;
				};
			}

			decorate(renderResult, (node: DNode) => {
				if (isVNode(node) || (isWNode(node) && !triggerFunction)) {
					const foundMethod = (node.properties as any)[name];
					if (!triggerFunction && foundMethod && typeof foundMethod === 'function') {
						if (target.key === node.properties.key || !target.key) {
							triggerFunction = foundMethod;
						}
					}
				}
				return node;
			});
			if (triggerFunction) {
				triggerFunction.call(widget);
			}
		}
	};
}
