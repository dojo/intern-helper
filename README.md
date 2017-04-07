# @dojo/test-extras

[![Build Status](https://travis-ci.org/dojo/test-extras.svg?branch=master)](https://travis-ci.org/dojo/test-extras)
[![codecov](https://codecov.io/gh/dojo/test-extras/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/test-extras)
[![npm version](https://badge.fury.io/js/%40dojo%2Ftest-extras.svg)](http://badge.fury.io/js/%40dojo%2Ftest-extras)

A package that contains various modules to make it easier to test Dojo 2 with Intern.

**WARNING** This is *alpha* software. It is not yet production ready, so you should use at your own risk.

## Features

### harness()

`harness()` is a function which takes a class that has extended `WidgetBase` and returns on instance that provides an API that
facilitates the testing of the widget class in a way the mimicks its actual runtime usage.  What the harness does is render
the widget using the `w()` virtual DOM function and project that virtual DOM to the real DOM.  It adds a *spy* during the
render process of the harnessed widget class, so testing can be performed on the render and provides APIs that allow the sending
of events, setting properties, and children of the widget class and observing how that changes the virutal DOM render and how
that is actually applied to the DOM.

Any of the methods that require an instance of the widget to operate will automatically ensure the harness instance is attached
to the DOM and rendered.  Additional actions will interact with the widgeting system as they would in real life, meaning the
harnessed widget will follow the lifecycle of a widget as if it were part of a larger application.  The only difference is that
instead of updates to the DOM being applied in an async fashion, the entire harness operates in a sync fashion.

In order to isolate the widget, any sub widgets (`WNode`s or node generated by `w()`) within the render will be swapped out for
special virtual DOM nodes before being sent to the virtual DOM engine for rendering.  The are custom element tag which will look
like `<test--widget-stub data--widget-name="<<widget class name>>"></test--widget-stub>`, where `data--widget-name` will be set
to either the widget class tag or the name of the class (*note* IE11 does not support function names, therefore it will have
`<Anonymous>` as the value of the attribute instead.  The substituion occurs *after* the virtual DOM is compared on an
`.expectedRender()` assertion, so expected virtual DOM passed to that function should be as the widget will be expected to
return from its `.render()` implimentation.

Basic usage of `harness()` would look like this:

```typescript
import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import harness from '@dojo/intern-helper/harness';
import { v, w } from '@dojo/widget-core/d';

import MyWidget from '../../MyWidget';
import css from '../../styles/myWidget.m.css';

registerSuite({
    name: 'MyWidget',

    basic() {
        const widget = harness(MyWidget);

        widget.expectRender(v('div', { classes: widget.classes(css.root) }, [ w('child', {
            bind: true,
            key: 'first-child',
            classes: widget.classes(css.child)
        }, 'should render as expected');

        widget.destroy();
    }
});
```

`harness()` requires a class which has extended from `WidgetBase` as the first argument and can take an optional second argument
which is an `HTMLElement` to append the root of the harness to.  By default, it appends its root as the last child of `document.body`.

#### .listener

A reference to a simple stub function to use on an expected render to use as a place holder for listener functions in a render.  For
example:

```typescript
widget.expectRender(v('div', {
    onclick: widget.listener
}));
```

Since it would require widget's to break their encapsulation to expose their listeners, the harness does not require the expected
render to have a reference to the actual listener.  It only compares if the property exists and that both the actual and expected
values are of `typeof === 'function'`.

#### .classes()

Returns a value to be passed as a classes property of a `v()` or `w()` call that adds classes in the same way they would be added
to a virtual DOM node.  For example:

```typescript
widget.expectRender(v('div', {
    classes: widget.classes(css.root)
}, [
    v('div', {
        classes: widget.classes(css.child)
    });
]));
```

When rendering, in order to ensure that classes are persisted from render to render, the widget instance will keep the map of
classes stateful, meaning if the classes is removed, instead of being dropped from the map, it is set to `false`.  These ensures
that the virtual DOM engine adds and removes classes appropriatly.  The `.classes()` method mimicks this behaviour for you.

It is important to note though, that between a first render and a second render of a widget, that map will expand.  That means
classes will need to be updated in your expected render.  For example, this would likely fail:

```typescript
const expected = v('div', {
    classes: widget.classes(css.root)
}, [
    v('div', {
        classes: widget.classes(css.child)
    });
]);

widget.expectRender(expected);

widget.setProperties({
  foo: 'bar'
});

widget.expectRender(expected);
```

In order to avoid this, you should always generate your expected anew, or use some of the helper functions that are part of the
`harness` module to update the classes.  For example:

```typescript
const expected = v('div', {
    classes: widget.classes(css.root)
}, [
    v('div', {
        classes: widget.classes(css.child)
    });
]);

widget.expectRender(expected);

widget.setProperties({
    foo: 'bar'
});

assignProperties(expected, {
    classes: widget.classes(css.root)
});
assignChildProperties(expected, 0, {
    classes: widget.classes(css.child)
});

widget.expectRender(expected);
```

#### .destroy()

Cleans up the `harness` instance and removes the harness and other rendered DOM from the DOM.  You should *always* call `.destroy()`
otherwise you will leave quite a lot of grabage DOM in the document which may have impacts on other tests you will run.

#### .expectedRender()

Provide an expected of virtual DOM which will be compared with the actual rendered virtual DOM from the widget class.  It *spies*
the result from the harnessed widget's `.render()` return and compares that with the provided expected virtual DOM.  If the `actual`
and `expected` don't match, the method will `throw` and assertion error, usually providing a difference of what was expected and
what was actual.  If they do match, the method simply returns the harness instance.

Because of the need not to break encapsulation, there are two distinct differences in how the harness will compare actual virtual DOM
and expected:

- Properties with a value which is `typeof function` are simply compared on their existance and that both values are functions.  This is
  because it would be impossible or difficult to obtain references to the actual functions.
- The property of `bind` is simply compared upon existance in both actual or expected.  `bind` is usually populated with a widget instance
  which again would be impossible to get a reference to.  The method will throw if `bind` is specified but not in the render, or if `bind`
  is actually in the render, but not expected.

Most usuage would be replicating the expected render from a widget class:

```typescript
widget.setProperties({
    open: true
});

widget.setChildren('some text');

widget.expectRender(v('div', {
    bind: true,
    classes: widget.classes(css.root, css.open),
    onclick: widget.listener
}, [ 'some text' ]));
```

#### .getRender()

This returns the virtual DOM of the last render of the harnessed widget class.  It is intended for advanced introspection.  It is
important to note though that there is some post processing done on the virtual DOM by this point via the `.__render__()` method
on the harnessed class.  In addition, any sub widgets that were rendered (e.g. `WNode`s or returns from `w()`) will have been
replaced with stubs of virtual DOM.

#### .getDom()

Return the root node of the rendered DOM of the widget.  This allows introspection or manipulation of the actual DOM.

#### .resetClasses()

Reset the classes to "forget" any previously asserted classes.

#### .sendEvent()

Dispatch an event to the DOM of the rendered widget.  The first argument is the type of the event to dispatch to the root
of the widget's rendered DOM.  The second is an optional object literal of additional options:

|Option|Description|
|------|-----------|
|eventClass|A string that matches the class of event to use (e.g. `MouseEvent`).  By default, `CustomEvent` is used.|
|eventInit|Any properties that should be part of initialising the event.  Note that `bubbles` and `cancelable` are `true` by default, which is different then if you were creating events directly.|
|selector|A string selector to be applied to the root DOM element of the rendered widget.  This is intended to make it easy to sub-select a part of the widget's rendered DOM for targetting the event.|
|target|By default, the widget's render root element is used.  This property subtitutes a specific target to dispatch the event to.|

Using event classes other than `CustomEvent` can sometimes be challenging, as cross browser support is sometimes difficult to acheive.
In most use cases, assuming the widget is not expecting an event of a particular class, custom events should be fine.

An example of clicking on a widget:

```typescript
widget.sendEvent('click');
```

An example of swiping right on a widget's last's child:

```typescript
widget.sendEvent('touchstart', {
    eventInit: {
        changedTouches: [ { screenX: 50 } ]
    },
    selector: ':last-child'
});

widget.sendEvent('touchmove', {
    eventInit: {
        changedTouches: [ { screenX: 150 } ]
    },
    selector: ':last-child'
});

widget.sendEvent('touchend', {
    eventInit: {
        changedTouches: [ { screenX: 150 } ]
    },
    selector: ':last-child'
});
```

#### .setChildren()

Provide children that should be passed to the widget class as it is rendered. These are typically passed by an upstream widget by
invoking a `w(WidgetClass, { }, [ ...children ])`.

Adding an array of children:

```typescript
function generateChildren(): DNode[] {
    return [ 'foo', 'bar', 'baz', 'qat' ]
      .map((text) => v('li', [ text ]));
}

widget.setChildren(...generateChildren());

widget.expectRender(v('ul', generateChildren()));
```

#### .setProperties()

Provide a map of properties to a widget. These are typically passed by an upstream widget by invoking a
`w(WidgetClass, { ...properties })`.  For example:

```typescript
widget.setProperties({
    open: true
});

widget.expectRender(v('div', { classes.widget(css.root, css.open) }));
```

### Virtual DOM Helper Functions

In testing expected virtual DOM, it can be overly verbose to regenerate your virtual DOM every time you have changed the conditions
that might effect the render.  Therefore the `harness` module contains some additional helper functions which can be used to manipulate
virtual DOM once it has been generated by the `v()` and `w()` virtual DOM functions.

#### assignChildProperties

Shallowly assigns properties of a `WNode` or `HNode` indicated by an index.  The index can be a number, or it can be a string of numbers
seperated by commas to target a deeper child.  For example:

```typescript
const expected = v('div', [
    v('ol', { type: 'I' }, [
        v('li', { value: '3' }, [ 'foo' ]),
        v('li', { }, [ 'bar' ]),
        v('li', { }, [ 'baz' ])
    ])
]);

assignChildProperties(expected, '0,2', { classes: widget.classes(css.highlight) });
```

#### assignProperties

Shallowly assigns properties to a `WNode` or `HNode`.  For example:

```typescript
const expected = v('div', {
    classes: widget.classes(css.root),
    onclick: widget.listener
}, [ 'content' ]);

assignProperties(expected, {
    classes: widget.classes(css.root, css.open)
});
```

#### replaceChild

Replaces a child in a `WNode` or `HNode` with another, specified by an index.  The index can be either a number, or a string of
numbers seperated by commas to target a deeper child.  If the target child does not have any children, a child array will be created
prior to the child being added.  Also note that it is quite easy to generate sparse arrays, as there is no range checking on the
index.

An example:

```typescript
const expected = v('div', [
    v('ol', { type: 'I' }, [
        v('li', { value: '3' }, [ 'foo' ]),
        v('li', { }, [ 'bar' ]),
        v('li', { }, [ 'baz' ])
    ])
]);

replaceChild(expected, '0,0,0', 'qat');
replaceChild(expected, '0,2', v('span'));
```

#### replaceChildProperties

Replace a map of properties on a child specified by the index.  The index can be eitehr a number, or a string of numbers
seperated by commas to target a deeper child.  Different than `assignChildProperties` which *mixes-in* properties, this is a
wholesale replacement.  For example:

```typescript
const expected = v('div', [
    v('ol', { type: 'I' }, [
        v('li', { value: '3' }, [ 'foo' ]),
        v('li', { }, [ 'bar' ]),
        v('li', { }, [ 'baz' ])
    ])
]);

assignChildProperties(expected, '0,2', {
    classes: widget.classes(css.highlight)
    value: '6'
});
```

#### replaceProperties

Replaces properties on a `WNode` or `HNode`.  For example:

```typescript
const expected = v('div', {
    classes: widget.classes(css.root),
    onclick: widget.listener
}, [ 'content' ]);

assignProperties(expected, {
    classes: widget.classes(css.root, css.open),
    onclick: widget.listener
});
```

### sendEvent()

Dispatch an event to a specified DOM element.  The first argument is the target, the second argument is the type of the event to
dispatch to the target.  The third is an optional object of additional options:

|Option|Description|
|------|-----------|
|eventClass|A string that matches the class of event to use (e.g. `MouseEvent`).  By default, `CustomEvent` is used.|
|eventInit|Any properties that should be part of initialising the event.  Note that `bubbles` and `cancelable` are `true` by default, which is different then if you were creating events directly.|
|selector|A string selector to be applied to the target element.|

An example of clicking on a button:

```typescript
const button = document.createElement('button');
document.body.appendChild(button);
sendEvent(button, 'click');
```

An example of swiping right on a `div`:

```typescript
const div = document.createElement('div');
document.body.appendChild(div);

sendEvent(div, 'touchstart', {
    eventInit: {
        changedTouches: [ { screenX: 50 } ]
    }
});

sendEvent(div, 'touchmove', {
    eventInit: {
        changedTouches: [ { screenX: 150 } ]
    }
});

sendEvent(div, 'touchend', {
    eventInit: {
        changedTouches: [ { screenX: 150 } ]
    }
});
```

### assertRender()

`assertRender()` is an assertion function that throws when there is a discrepency between an actual Dojo virtual DOM (`DNode`)
and the expected Dojo virtual DOM.

Typically, this would be used with the Dojo virtual DOM functions `v()` and `w()` provided in `@dojo/widget-core/d` in the following
way:

```typescript
import { v } from '@dojo/widget-core/d';
import assertRender from '@dojo/test-extras/support/assertRender';

function someRenderFunction () {
  return v('div', { styles: { 'color': 'blue' } }, [ 'Hello World!' ]);
}

assertRender(someRenderFunction(), v('div', {
    styles: {
      'color': 'blue'
    }
  }, [ 'Hello World!' ]), 'renders should match');
```

There are some important things to note about how `assertRender()` compares `DNode`s.

First, on function values of the properties of a `DNode`, their equality is simply compared on the presence of the value and that
both actual and expected values are `typeof` functions.  This is because it challenging to gain the direct reference of a
function, like an event handler.  If there is a mismatch between the presence of the property or the type of the value,
`asserRender()` will throw.

Second, widget constructors (in `WNode`s/generated by `w()`) are compared by strict equality.  They can be strings (if using the widget
registry), but the actual constructor functions will not be resolved.

Third, `DNode`s will not be rendered when comparing.  Simply their children will be walked, but if a `DNode`'s rendering causes
additional virtual DOM to be rendered (e.g. a `w()`/`WNode` which has a widget constructor that renders additional widgets),
the will not be compared.  If those comparisons are important, then walking the `DNode` structure and comparing the results
using `assertRender()` would need to be done.

### ClientErrorCollector

`ClientErrorCollector` is a class that will collect errors from a remote session with Intern.  This is typically used with
functional tests, when there might be client error messages which are not effecting the functionality of the test, but are
undesired.

Typical usage would be to create an instance of the `ClientErrorCollector` providing the remote session, `.init()` the collector
which will install the collection script on the remote client, run whatever additional tests are desired, and then call `.finish()`
which will resolve with any errors that were collected or call `.assertNoErrors()`.  `.assertNoErrors()` either resolves if there
were no errors, or rejects with the first error collecte.  For example:

```typescript
import * as assert from 'intern/chai!assert';
import * as registerSuite from 'intern!object';
import * as Suite from 'intern/lib/Suite';
import ClientErrorCollector from '@dojo/test-extras/intern/ClientErrorCollector';

registerSuite({
  name: 'Test',

  'functional testing'(this: Suite) {
    const collector = new ClientErrorCollector(this.remote);
    return this.remote
      .get('SomeTest.html')
      .then(() => collector.init())
      .execute(() => {
        /* some test code */
      })
      .then(() => collector.assertNoErrors());
  }
});
```

### loadJsdom

`loadJsdom` is a module which will attempt to load `jsdom` in environments where there appears to be no global `document` object
(e.g. NodeJS).  If it detects `jsdom` needs to be loaded, it will create a global `document` and `window` as well as provide a
couple of key shims/polyfills to support certain feature detections needed by Dojo 2.

The module's default export is a reference to `document`, either the created one, or the one that is already there.  It will
essentially be a "noop" if it is running in a browser environment, so it is safe to load without knowing what sort of environment
you are running in.

Typical usage would be to load the module before starting any client unit tests that need a browser environment:

```typescript
import '@dojo/intern-helper/support/loadJsdom';
import 'testModule';
```

## How do I contribute?

We appreciate your interest!  Please see the [Dojo 2 Meta Repository](https://github.com/dojo/meta#readme) for the
Contributing Guidelines and Style Guide.

### Installation

To start working with this package, clone the repository and run `npm install`.

In order to build the project, run `grunt dev` or `grunt dist`.

## Testing

Test cases MUST be written using [Intern](https://theintern.github.io) using the Object test interface and Assert assertion interface.

90% branch coverage MUST be provided for all code submitted to this repository, as reported by istanbul’s combined coverage results for all supported platforms.

To test locally in node run:

`grunt test`

To test against browsers with a local selenium server run:

`grunt test:local`

To test against BrowserStack or Sauce Labs run:

`grunt test:browserstack`

or

`grunt test:saucelabs`

## Licensing information

- `src/support/AssertionError` is adapted from [assertion-error](https://github.com/chaijs/assertion-error)
  and is © 2013 Jake Luer and [MIT Licensed](http://opensource.org/licenses/MIT)

© [JS Foundation](https://js.foundation/) & contributors. [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.
