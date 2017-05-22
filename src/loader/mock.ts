/// <reference path="../../node_modules/@dojo/loader/dojo-loader.d.ts" />

import { createHandle } from '@dojo/core/lang';
import { Handle } from '@dojo/interfaces/core';
import { forOf } from '@dojo/shim/iterator';
import Map from '@dojo/shim/Map';

declare const define: DojoLoader.Define;

const moduleMap = new Map<string, () => void>();

let disableHandle: Handle | undefined;

/* TODO: remove when https://github.com/dojo/loader/issues/126 is resolved */
declare global {
	interface NodeRequire {
		undef(moduleId: string, recursive?: boolean): void;
	}
}

/**
 * Register a module to be mocked when mocking is enabled
 * @param mid The absolute module ID to mock
 * @param mock The mock definition of the module
 */
export function register(mid: string, mock: any, req: NodeRequire = require): Handle {
	if (disableHandle) {
		throw new Error('Cannot register modules while mock is enabled.');
	}
	const absoluteMid = req.toAbsMid(mid);
	moduleMap.set(absoluteMid, () => define(absoluteMid, [], () => mock));
	return createHandle(() => {
		if (disableHandle) {
			req.undef(absoluteMid);
			require.cache({
				[mid]: undefined
			});

			/* TODO: remove when https://github.com/dojo/loader/issues/124 resolved */
			require.cache({});
		}
		moduleMap.delete(absoluteMid);
	});
}

/**
 * Enable mocking of modules with the `@dojo/loader`.
 *
 * The function will return a `Handle` which will disable the mocks and remove them from
 * the loader.
 */
export function enable(): Handle {
	if (disableHandle) {
		return disableHandle;
	}

	const map: { [mid: string]: () => void } = Object.create(null);
	forOf(moduleMap, ([ mid, value ]) => {
		require.undef(mid);
		map[mid] = value;
	});
	require.cache(map);

	/* TODO: remove when https://github.com/dojo/loader/issues/124 resolved */
	require.cache({});

	return disableHandle = createHandle(() => {
		const emptyMap: { [mid: string]: undefined } = {};
		forOf(moduleMap, ([ mid ]) => {
			require.undef(mid);
			emptyMap[mid] = undefined;
		});
		moduleMap.clear();

		require.cache(emptyMap);

		/* TODO: remove when https://github.com/dojo/loader/issues/124 resolved */
		require.cache({});

		disableHandle = undefined;
	});
}
