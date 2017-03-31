import { DNode } from '@dojo/widget-core/interfaces';
import { diff } from './compare';
import { isHNode, isWNode } from '@dojo/widget-core/d';
import * as AssertionError from 'assertion-error';

const RENDER_FAIL_MESSAGE = 'Render unexpected';

function throwAssertionError(actual: any, expected: any, message?: string): never {
	throw new AssertionError(message ? `${RENDER_FAIL_MESSAGE}: ${message}` : RENDER_FAIL_MESSAGE, {
		actual,
		expected,
		showDiff: true
	}, assertRender);
}

export default function assertRender(actual: DNode, expected: DNode, message?: string): void {

	function assertChildren(actual: DNode[], expected: DNode[]) {
		if (actual.length !== expected.length) {
			throwAssertionError(actual, expected, message);
		}
		actual.forEach((actualChild, index) => {
			assertRender(actualChild, expected[index], message);
		});
	}

	if (isHNode(actual) && isHNode(expected)) {
		if (actual.tag !== expected.tag) {
			/* The tags do not match */
			throwAssertionError(actual.tag, expected.tag, message);
		}
		const delta = diff(actual.properties, expected.properties, true);
		if (delta.length) {
			/* The properties do not match */
			throwAssertionError(actual.properties, expected.properties, message);
		}
		/* We need to assert the children match */
		assertChildren(actual.children, expected.children);
	}
	else if (isWNode(actual) && isWNode(expected)) {
		if (actual.widgetConstructor !== expected.widgetConstructor) {
			/* The WNode does not share the same constructor */
			throwAssertionError(actual.widgetConstructor, expected.widgetConstructor, message);
		}
		const delta = diff(actual.properties, expected.properties, true);
		if (delta.length) {
			/* There are differences in the properties between the two nodes */
			throwAssertionError(actual.properties, expected.properties, message);
		}
		if (actual.children && expected.children) {
			/* We need to assert the children match */
			assertChildren(actual.children, expected.children);
		}
		else if (actual.children || expected.children) {
			/* One WNode has children, but the other doesn't */
			throwAssertionError(actual.children, expected.children, message);
		}
	}
	else if (typeof actual === 'string' && typeof expected === 'string') {
		/* Both DNodes are strings */
		if (actual !== expected) {
			/* The strings do not match */
			throwAssertionError(actual, expected, message);
		}
	}
	else if (!(actual === null && expected === null)) {
		/* There is a mismatch between the types of DNodes */
		throwAssertionError(actual, expected, message);
	}
}
