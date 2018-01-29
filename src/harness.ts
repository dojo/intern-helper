import assertRender from './support/assertRender';
import { select } from './support/selector';
import { WNode, DNode, WidgetBaseInterface, Constructor, VNode } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { decorate, isVNode, isWNode } from '@dojo/widget-core/d';

export interface CustomComparator {
	selector: string;
	property: string;
	comparator: (value: any) => boolean;
}

function decorateNodes(dNode: DNode[]): DNode[];
function decorateNodes(dNode: DNode): DNode;
function decorateNodes(dNode: any): DNode | DNode[] {
	function addParent(parent: WNode | VNode): void {
		(parent.children || []).forEach((child) => {
			if (isVNode(child) || isWNode(child)) {
				(child as any).parent = parent;
			}
		});
		if (isVNode(parent) && typeof parent.deferredPropertiesCallback === 'function') {
			parent.properties = { ...parent.properties, ...parent.deferredPropertiesCallback(false) };
		}
	}
	return decorate(dNode, addParent, (node: DNode): node is WNode | VNode => isWNode(node) || isVNode(node));
}

export function harness(renderFunc: () => WNode<WidgetBaseInterface>, customComparator: CustomComparator[] = []) {
	let renderResult: any = null;
	let invalidated = true;
	let wNode = renderFunc();
	let widget: WidgetBase;
	const { properties, children } = wNode;
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
		customComparator.forEach(({ selector, property, comparator }) => {
			const items = select(selector, nodes);
			items.forEach((item: any, index: number) => {
				const comparatorName = `comparator(selector=${selector}, ${property})`;
				if (item && item.properties && item.properties[property] !== undefined) {
					const comparatorResult = comparator(item.properties[property])
						? comparatorName
						: `${comparatorName} FAILED`;
					item.properties[property] = isExpected ? comparatorName : comparatorResult;
				}
			});
		});
	}

	function _tryRender() {
		const { properties, children } = renderFunc();
		widget.__setProperties__(properties);
		widget.__setChildren__(children);
		if (invalidated) {
			renderResult = decorateNodes(widget.__render__() as any);
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
				triggerFunction && triggerFunction.apply(widget, args);
			}
		}
	};
}

export default harness;
