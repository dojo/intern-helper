/**
 * An async function which attempts to load the `mid` and resolve to the contents of the module.  If there is an error,
 * the function will reject with the error.
 *
 * By default, the function will attempt to undefine the module before loading it.  This can be skipped via `noUndef`.
 *
 * A local reference to `require` can be passed to change the location of relative module IDs.
 * @param mid The mid to load
 * @param req A local require for relative mids
 * @param noUndef Skip undefining a module
 */
export default async function loadModule(mid: string, req: NodeRequire = require, noUndef: boolean = false): Promise<any> {
	if (!noUndef) {
		req.undef(req.toAbsMid(mid));
	}
	return new Promise((resolve, reject) => {
		const handle = req.on('error', (e: Error) => {
			handle.remove();
			reject(e);
		});
		req([ mid ], (result) => {
			handle.remove();
			resolve(result);
		});
	});
}
