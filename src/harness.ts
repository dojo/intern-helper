import 'pepjs';

import Evented from '@dojo/core/Evented';
import { createHandle } from '@dojo/core/lang';
import { VNode } from '@dojo/interfaces/vdom';
import { DNode, WidgetProperties, WidgetBaseConstructor, WidgetBaseInterface } from '@dojo/widget-core/interfaces';
import { v, w } from '@dojo/widget-core/d';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import cssTransitions from '@dojo/widget-core/animations/cssTransitions';
import { dom, Projection, ProjectionOptions, VNodeProperties } from 'maquette';
import assertRender from './support/assertRender';
import sendEvent, { SendEventOptions } from './support/sendEvent';

const ROOT_CUSTOM_ELEMENT_NAME = 'dojo--harness';

const EVENT_HANDLERS = [
	'ontouchcancel',
	'ontouchend',
	'ontouchmove',
	'ontouchstart',
	'onblur',
	'onchange',
	'onclick',
	'ondblclick',
	'onfocus',
	'oninput',
	'onkeydown',
	'onkeypress',
	'onkeyup',
	'onload',
	'onmousedown',
	'onmouseenter',
	'onmouseleave',
	'onmousemove',
	'onmouseout',
	'onmouseover',
	'onmouseup',
	'onmousewheel',
	'onscroll',
	'onsubmit'
];

/**
 * A private class that is used to actually render the widget.
 */
class RenderWidget<P extends WidgetProperties, W extends WidgetBaseConstructor<P>> extends WidgetBase<P> {
	private _widgetConstructor: W;
	private _afterCreate: (element: HTMLElement) => void;
	private _cachedWidget: WidgetBaseInterface<P> | undefined;

	public lastRender: DNode;

	constructor(widgetConstructor: W, afterCreate: (element: HTMLElement) => void) {
		super();

		this._widgetConstructor = widgetConstructor;
		this._afterCreate = afterCreate;
	}

	render(): DNode {
		if (!this._cachedWidget) {
			this._cachedWidget = new this._widgetConstructor();
			this.own(this._cachedWidget);
		}
		this._cachedWidget.setProperties(this.properties);
		this.lastRender = (<any> this._cachedWidget).render();

		return v(
				ROOT_CUSTOM_ELEMENT_NAME,
				{ afterCreate: this._afterCreate },
				[ w(this._widgetConstructor, this.properties) ]
			);
	}
}

/**
 * Harness a widget constructor, providing an API to interact with the widget for testing purposes.
 */
export class WidgetHarness<P extends WidgetProperties, W extends WidgetBaseConstructor<P>> extends Evented {
	private _attached = false;

	private _afterCreate = (element: HTMLElement) => {
		/* remove the element from the flow of the document upon destruction */
		this.own(createHandle(() => {
			if (element.parentNode) {
				element.parentNode.removeChild(element);
			}
		}));

		/* assign the element to the root of this document */
		this._root = element;
	}

	private _projection: Projection | undefined;
	private _projectionOptions: ProjectionOptions;
	private _projectionRoot: HTMLElement;
	private _renderWidget: RenderWidget<P, W>;
	private _renderWidgetRender: () => string | VNode | null;
	private _root: HTMLElement | undefined;

	/**
	 * Harness a widget constructor, providing an API to interact with the widget for testing purposes.
	 * @param widgetConstructor The constructor function/class that should be harnessed
	 * @param projectionRoot Where to append the harness.  Defaults to `document.body`
	 */
	constructor(widgetConstructor: W, projectionRoot: HTMLElement = document.body) {
		super({});

		this._projectionRoot = projectionRoot;
		this._projectionOptions = {
			transitions: cssTransitions,
			eventHandlerInterceptor: this._eventHandlerInterceptor.bind(this)
		};

		this._renderWidget = new RenderWidget<P, W>(widgetConstructor, this._afterCreate);
		this._renderWidgetRender = this._renderWidget.__render__.bind(this._renderWidget);
		this.own(this._renderWidget);
	}

	private _attach(): boolean {
		this.own(createHandle(() => {
			if (!this._attached) {
				return;
			}
			this._projection = undefined;
			this._attached = false;
		}));

		this._projection = dom.append(this._projectionRoot, this._getVNode(), this._projectionOptions);
		this._attached = true;
		return this._attached;
	}

	private _eventHandlerInterceptor(propertyName: string, eventHandler: Function, domNode: Element, properties: VNodeProperties) {
		if (EVENT_HANDLERS.indexOf(propertyName) > -1) {
			return function(this: Node, ...args: any[]) {
				return eventHandler.apply(properties.bind || this, args);
			};
		}
		else {
			// remove "on" from event name
			const eventName = propertyName.substr(2);
			domNode.addEventListener(eventName, (...args: any[]) => {
				eventHandler.apply(properties.bind || this, args);
			});
		}
	}

	private _getVNode(): VNode {
		const vnode = this._renderWidget.__render__();
		if (typeof vnode === 'string' || vnode === null) {
			throw new TypeError('Render cannot be string or null');
		}
		return vnode;
	}

	private _render(): void {
		if (!this._attached) {
			this._attach();
		}
		else {
			this._projection && this._projection.update(this._getVNode());
		}
	}

	/**
	 * Assert an expected virtual DOM (`DNode`) against what is actually being rendered.  Will throw if the expected does
	 * not match the actual.
	 * @param expected The expected render (`DNode`)
	 * @param message Any message to be part of an error that gets thrown if the actual and expected do not match
	 */
	public expectRender(expected: DNode, message?: string): this {
		assertRender(this.getRender(), expected, message);
		return this;
	}

	/**
	 * Refresh the render and return the last render's root `DNode`.
	 */
	public getRender(): DNode {
		this._render();
		return this._renderWidget.lastRender;
	}

	/**
	 * Get the root element of the harnessed widget.  This will refresh the render.
	 */
	public getDom(): HTMLElement {
		this._render();
		if (!(this._root && this._root.firstChild)) {
			throw new Error('Missing root DOM node');
		}
		return <HTMLElement> this._root.firstChild;
	}

	public setProperties(properties: P): this {
		this._renderWidget.setProperties(properties);
		return this;
	}

	/**
	 * Dispatch an event to the root DOM element of the rendered harnessed widget.  You can use the options to change the
	 * event class, provide additional event properties, or select a different target.
	 * @param type The type of event (e.g. `click` or `mousedown`)
	 * @param options Options which can modify the event sent, like using a different EventClass or selecting a different
	 */
	public sendEvent(type: string, options?: SendEventOptions): this {
		const root = this.getDom();
		if (root) {
			sendEvent(root, type, options);
		}
		return this;
	}
}

/**
 * Harness a widget class for testing purposes, returning an API to interact with the harness widget class.
 * @param widgetConstructor The constructor function/class of widget that should be harnessed.
 * @param projectionRoot The root where the harness should append itself to the DOM.  Default to `document.body`
 */
export default function harness<P extends WidgetProperties, W extends WidgetBaseConstructor<P>>(widgetConstructor: W, projectionRoot?: HTMLElement): WidgetHarness<P, W> {
	return new WidgetHarness<P, W>(widgetConstructor, projectionRoot);
}
