import { DNode } from '@dojo/widget-core/interfaces';

export function decorateNodes(nodes: DNode | DNode[], parent?: DNode): DNode | DNode[] {
	const isArray = Array.isArray(nodes);
	nodes = Array.isArray(nodes) ? nodes : [nodes];
	const decoratedNodes = nodes.map((node: any, index) => {
		if (node === null || node === undefined || typeof node === 'string') {
			return node;
		}
		node.parent = parent;
		if (node.children && node.children.length > 0) {
			node.children = decorateNodes(node.children, node);
		}
		return node;
	});
	return isArray ? decoratedNodes : decoratedNodes[0];
}
