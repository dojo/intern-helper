import harness from './harness';
import ClientErrorCollector from './intern/ClientErrorCollector';
import assertRender from './support/assertRender';
import sendEvent from './support/sendEvent';
import { assignChildProperties, assignProperties, findIndex, findKey, replaceChild, replaceChildProperties, replaceProperties } from './support/virtualDom';

export {
	assertRender,
	assignChildProperties,
	assignProperties,
	ClientErrorCollector,
	findIndex,
	findKey,
	harness,
	replaceChild,
	replaceChildProperties,
	replaceProperties,
	sendEvent
};
