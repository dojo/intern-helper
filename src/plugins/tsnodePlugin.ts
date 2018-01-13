import Node from 'intern/lib/executors/Node';

declare const intern: Node;

/**
 * TypeScript Intern plugin for Node.js
 *
 * This plugin augments Node.js's `require` method to allow for run-time loading and compiling of TypeScript files
 */
intern.registerPlugin('ts-node', (options?: any) => {
	if (intern.environment !== 'node') {
		intern.emit('warning', 'postcss-require-plugin cannot run outside of a nodejs environment');
	}

	const tsnode = require('ts-node');
	options ? tsnode.register(options) : tsnode.register();
});
