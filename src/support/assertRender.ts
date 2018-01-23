import { DNode, WNode, VNode } from '@dojo/widget-core/interfaces';
import { isWNode } from '@dojo/widget-core/d';
import * as diff from 'diff';

function replacer(key: string, value: any) {
	if (typeof value === 'function') {
		return 'function';
	}
	return value;
}

export function formatDNodes(nodes: DNode | DNode[], depth: number = 0) {
	nodes = Array.isArray(nodes) ? nodes : [nodes];
	let tabs = '';
	for (let i = 0; i < depth; i++) {
		tabs = tabs + '\t';
	}
	const formattedNode: string = nodes.reduce((result: string, node, index) => {
		if (node === null || node === undefined) {
			return result;
		}
		if (index > 0) {
			result = `${result}\n`;
		}
		result = `${result}${tabs}`;

		if (typeof node === 'string') {
			return `${result}"${node}"`;
		}

		result = result + formatNode(node);
		if (node.children && node.children.length > 0) {
			result = result + `, [\n${formatDNodes(node.children, depth + 1)}\n${tabs}]`;
		}
		return `${result})`;
	}, '');
	return formattedNode;
}

function formatNode(node: WNode | VNode) {
	if (isWNode(node)) {
		// TODO what do we do about IE11 that doesn't support function names?
		return `w("${(node.widgetConstructor as any).name}", ${JSON.stringify(node.properties, replacer)}`;
	}
	return `v("${node.tag}", ${JSON.stringify(node.properties, replacer)}`;
}

export function assertRender(actual: DNode | DNode[], expected: DNode | DNode[], message?: string) {
	const parsedActual = formatDNodes(actual);
	const parsedExpected = formatDNodes(expected);
	const diffResult = diff.diffLines(parsedActual, parsedExpected);
	let diffFound = false;
	const parsedDiff = diffResult.reduce((result: string, part, index) => {
		if (index > 0) {
			result = `\n${result}`;
		}
		if (part.added) {
			diffFound = true;
			result = `${result}+${part.value}`;
		} else if (part.removed) {
			diffFound = true;
			result = `${result}-${part.value}`;
		} else {
			result = `${result}${part.value}`;
		}
		return result;
	}, '');

	if (diffFound) {
		throw new Error(parsedDiff);
	}
}

export default assertRender;
