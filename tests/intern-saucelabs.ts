export * from './intern';

export const environments = [
	{ browserName: 'internet explorer', version: '11.0', platform: 'Windows 7' },
	{ browserName: 'microsoftedge', platform: 'Windows 10' },
	{ browserName: 'firefox', platform: 'Windows 10' },
	{ browserName: 'chrome', platform: 'Windows 10' },
	{ browserName: 'safari', version: '10.0', platform: 'macOS 10.12' },
	// Andriod causing issues when run from travis
	// { browserName: 'Browser', appiumVersion: '1.5.3', deviceName: 'Android Emulator', platformVersion: '5.1', platformName: 'Android' },
	{ browserName: 'iphone', version: '9.3' }
];

/* SauceLabs supports more max concurrency */
export const maxConcurrency = 4;

export const tunnel = 'SauceLabsTunnel';
