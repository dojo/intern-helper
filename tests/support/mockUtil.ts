import * as mockery from 'mockery';

export interface MockMap {
	[key: string]: any;
}

export function mock(mocks: MockMap) {
	mockery.enable({
		useCleanCache: true,
		warnOnReplace: false,
		warnOnUnregistered: false
	});
	for (let moduleId in mocks) {
		const moduleContents = mocks[moduleId];
		mockery.registerMock(moduleId, moduleContents);
	}
}

export function unmock() {
	mockery.deregisterAll();
	mockery.disable();
}
