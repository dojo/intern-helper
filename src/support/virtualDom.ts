import { assign } from '@dojo/core/lang';
import { DNode, HNode, VirtualDomProperties, WidgetProperties, WNode } from '@dojo/widget-core/interfaces';
import { isHNode, isWNode } from '@dojo/widget-core/d';

export function assignChildProperties(target: WNode | HNode, index: number | string, properties: WidgetProperties | VirtualDomProperties): WNode | HNode {
	const node = resolveChild(target, index);
	if (!(isWNode(node) || isHNode(node))) {
		throw new TypeError(`Index of "${index}" is not resolving to a valid target`);
	}
	assignProperties(node, properties);
	return target;
}

export function assignProperties(target: HNode, properties: VirtualDomProperties): HNode;
export function assignProperties(target: WNode, properties: WidgetProperties): WNode;
export function assignProperties(target: WNode | HNode, properties: WidgetProperties | VirtualDomProperties): WNode | HNode;
export function assignProperties(target: WNode | HNode, properties: WidgetProperties | VirtualDomProperties): WNode | HNode {
	assign(target.properties, properties);
	return target;
}

/**
 * Replace a child of DNode.
 *
 * *NOTE:* The replacement modify the passed `target` and does not return a new instance of the `DNode`.
 * @param target The DNode to replace a child element on
 * @param index A number of the index of a child, or a string with comma seperated indexes that would nagivate
 * @param replacement The DNode to be replaced
 */
export function replaceChild(target: WNode | HNode, index: number | string, replacement: DNode): WNode | HNode {
	/* TODO: Combine with resolveChild */
	if (typeof index === 'number') {
		if (!target.children) {
			target.children = [];
		}
		target.children[index] = replacement;
	}
	else {
		const indexes = index.split(',').map(Number);
		const lastIndex = indexes.pop()!;
		const resolvedTarget = indexes.reduce((target, idx) => {
			if (!(isWNode(target) || isHNode(target)) || !target.children) {
				throw new TypeError(`Index of "${index}" is not resolving to a valid target`);
			}
			return target.children[idx];
		}, <DNode> target);
		if (!(isWNode(resolvedTarget) || isHNode(resolvedTarget))) {
			throw new TypeError(`Index of "${index}" is not resolving to a valid target`);
		}
		if (!resolvedTarget.children) {
			resolvedTarget.children = [];
		}
		resolvedTarget.children[lastIndex] = replacement;
	}
	return target;
}

function resolveChild(target: WNode | HNode, index: number | string): DNode {
	if (typeof index === 'number') {
		if (!target.children) {
			throw new TypeError(`Index of "${index}" is not resolving to a valid target`);
		}
		return target.children[index];
	}
	const indexes = index.split(',').map(Number);
	const lastIndex = indexes.pop()!;
	const resolvedTarget = indexes.reduce((target, idx) => {
		if (!(isWNode(target) || isHNode(target)) || !target.children) {
			throw new TypeError(`Index of "${index}" is not resolving to a valid target`);
		}
		return target.children[idx];
	}, <DNode> target);
	if (!(isWNode(resolvedTarget) || isHNode(resolvedTarget)) || !resolvedTarget.children) {
		throw new TypeError(`Index of "${index}" is not resolving to a valid target`);
	}
	return resolvedTarget.children[lastIndex];
}

export function replaceChildProperties(target: WNode | HNode, index: number | string, properties: WidgetProperties | VirtualDomProperties): WNode | HNode {
	const node = resolveChild(target, index);
	if (!(isWNode(node) || isHNode(node))) {
		throw new TypeError(`Index of "${index}" is not resolving to a valid target`);
	}
	replaceProperties(node, properties);
	return target;
}

export function replaceProperties(target: HNode, properties: VirtualDomProperties): HNode;
export function replaceProperties(target: WNode, properties: WidgetProperties): WNode;
export function replaceProperties(target: WNode | HNode, properties: WidgetProperties | VirtualDomProperties): WNode | HNode;
export function replaceProperties(target: WNode | HNode, properties: WidgetProperties | VirtualDomProperties): WNode | HNode {
	target.properties = properties;
	return target;
}
