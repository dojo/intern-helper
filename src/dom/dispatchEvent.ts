import has, { add as hasAdd } from '@dojo/core/has';
import { assign } from '@dojo/core/lang';

hasAdd('customevent-constructor', () => {
	try {
		new window.CustomEvent('foo');
		return true;
	}
	catch (e) {
		return false;
	}
});

export type EventClass =
	'AnimationEvent' |
	'AudioProcessingEvent' |
	'BeforeInputEvent' |
	'BeforeUnloadEvent' |
	'BlobEvent' |
	'ClipboardEvent' |
	'CloseEvent' |
	'CompositionEvent' |
	'CSSFontFaceLoadEvent' |
	'CustomEvent' |
	'DeviceLightEvent' |
	'DeviceMotionEvent' |
	'DeviceOrientationEvent' |
	'DeviceProximityEvent' |
	'DOMTransactionEvent' |
	'DragEvent' |
	'EditingBeforeInputEvent' |
	'ErrorEvent' |
	'FetchEvent' |
	'FocusEvent' |
	'GamepadEvent' |
	'HashChangeEvent' |
	'IDBVersionChangeEvent' |
	'InputEvent' |
	'KeyboardEvent' |
	'MediaStreamEvent' |
	'MessageEvent' |
	'MouseEvent' |
	'MutationEvent' |
	'OfflineAudioCompletionEvent' |
	'PageTransitionEvent' |
	'PointerEvent' |
	'PopStateEvent' |
	'ProgressEvent' |
	'RelatedEvent' |
	'RTCDataChannelEvent' |
	'RTCIdentityErrorEvent' |
	'RTCIdentityEvent' |
	'RTCPeerConnectionIceEvent' |
	'SensorEvent' |
	'StorageEvent' |
	'SVGEvent' |
	'SVGZoomEvent' |
	'TimeEvent' |
	'TouchEvent' |
	'TrackEvent' |
	'TransitionEvent' |
	'UIEvent' |
	'UserProximityEvent' |
	'WebGLContextEvent' |
	'WheelEvent';

export interface DispatchOptions {
	/**
	 * The event class to use to create the event, defaults to `CustomEvent`
	 */
	eventClass?: EventClass;

	/**
	 * An object which is used to initialise the event
	 */
	eventInit?: EventInit;

	/**
	 * A CSS selector string, used to query the target to identify the element to
	 * dispatch the event to
	 */
	selector?: string;
}

export interface EventInitializer {
	(type: string, bubbles: boolean, cancelable: boolean, detail: any): void;
}

/**
 * Create and dispatch an event to an element
 * @param type The event type to dispatch
 * @param options A map of options to configure the event
 */
export default function dispatchEvent(target: Element, type: string, options?: DispatchOptions) {
	const {
		eventClass = 'CustomEvent',
		eventInit = {},
		selector = ''
	} = options || {};
	let event: Event;
	if (has('customevent-constructor')) {
		if (eventClass in window) {
			event = new ((<any> window)[eventClass] as typeof Event)(type, eventInit);
		}
		else {
			const { bubbles, cancelable, ...initProps } = eventInit;
			event = new window.CustomEvent(type, { bubbles, cancelable });
			assign(event, initProps);
		}
	}
	else {
		/* because the arity varies too greatly to be able to properly call all the event types, we will
		 * only support CustomEvent for those platforms that don't support event constructors, which is
		 * essentially IE11 */
		event = document.createEvent('CustomEvent');
		const { bubbles = false, cancelable = false, ...initProps } = eventInit;
		(event as CustomEvent).initCustomEvent(type, bubbles, cancelable, {});
		assign(event, initProps);
	}
	if (selector) {
		const selectorTarget = target.querySelector(selector);
		if (selectorTarget) {
			selectorTarget.dispatchEvent(event);
		}
		else {
			throw new Error(`Cannot resolve to an element with selector "${selector}"`);
		}
	}
	else {
		target.dispatchEvent(event);
	}
}
