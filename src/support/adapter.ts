import { DNode } from '@dojo/widget-core/interfaces';
import { isVNode, isWNode } from '@dojo/widget-core/d';

export type TestFunction = (elem: DNode) => boolean;
export const adapter = {
	isTag(elem: DNode) {
		return isVNode(elem);
	},
	getText(elem: DNode[]) {
		return '';
	},
	removeSubsets(elements: DNode[]) {
		return elements;
	},
	getChildren(elem: DNode) {
		return isVNode(elem) || isWNode(elem) ? elem.children : [];
	},
	getAttributeValue(elem: DNode, name: string) {
		if (isVNode(elem) || isWNode(elem)) {
			return (elem.properties as any)[name];
		}
	},
	hasAttrib(elem: DNode, name: string) {
		if (isVNode(elem) || isWNode(elem)) {
			return name in elem.properties;
		}
		return false;
	},
	existsOne(test: TestFunction, elements: DNode[]) {
		return elements.some((elem: DNode) => test(elem));
	},
	getName(elem: DNode) {
		if (isVNode(elem)) {
			return elem.tag;
		}
	},
	getParent() {
		// no-op for now
	},
	getSiblings() {
		// no-op for now
	},
	findOne(test: TestFunction, arr: DNode[]): DNode {
		let elem = null;
		for (let i = 0, l = arr.length; i < l && !elem; i++) {
			if (test(arr[i])) {
				elem = arr[i];
			} else {
				const children = adapter.getChildren(arr[i]);
				if (children && children.length > 0) {
					elem = adapter.findOne(test, children);
				}
			}
		}
		return elem;
	},
	findAll(test: TestFunction, elements: DNode[]): DNode[] {
		let result: DNode[] = [];
		for (let i = 0, j = elements.length; i < j; i++) {
			if (test(elements[i])) {
				result.push(elements[i]);
			}
			const children = adapter.getChildren(elements[i]);
			if (children) {
				result = [...result, ...adapter.findAll(test, children)];
			}
		}
		return result;
	}
};

export default adapter as any;
