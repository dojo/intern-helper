# @dojo/test-extras

[![Build Status](https://travis-ci.org/dojo/test-extras.svg?branch=master)](https://travis-ci.org/dojo/test-extras)
[![codecov](https://codecov.io/gh/dojo/test-extras/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/test-extras)
[![npm version](https://badge.fury.io/js/%40dojo%2Ftest-extras.svg)](http://badge.fury.io/js/%40dojo%2Ftest-extras)

Provides a simple API for testing and asserting Dojo 2 widget's expected virtual DOM and behavior.

- [Features](#features)
- [`harness`](#harness)
  - [Custom Comparators](#custom-comparators)
- [selectors](#selectors)
- [`harness.expect`](#harnessexpect)
- [`harness.expectPartial`](#harnessexpectpartial)
- [`harness.trigger`](#harnesstrigger)
- [How Do I Contribute?](#how-do-i-contribute)
    - [Setup Installation](#setup-installation)
    - [Testing](#testing)
- [Licensing Information](#licensing-information)

## Features

 * Simple, familiar and minimal API
 * Focussed harness for test Dojo 2 virtual dom structures
 * No DOM requirement by default
 * Full functional and tsx support

## harness

`harness()` is the primary API when working with `@dojo/test-extras`, essentially setting up each test and providing a context to perform virtual DOM assertions and interactions. Designed to mirror the core behavior for widgets when updating `properties` or `children` and widget invalidation, with no special or custom logic required.

### API

```ts
harness(renderFunction: () => WNode, customComparators?: CustomComparator[]): Harness;
```

* `renderFunction`: The a function that WNode for the widget under test
* `customComparators`: An array of custom comparator descriptors that provide a comparator function to be used by `properties` found via a `selector` and `property` name

The harness returns a `Harness` object that provides a small API for interacting with the widget under test:

`Harness`

* [`expect`](#harnessexpect): Performs an assertion against the entire virtual DOM from the widget under tests render.
* [`expectPartial`](#harnessexpectpartial): Performs an assertion against a section of virtual DOM from the widget under tests render.
* [`trigger`](#harnesstrigger): Used to trigger a function from a node on the widget under test's API

Setting up a widget for testing is simple and familiar using the `w()` function from `@dojo/widget-core`:

```ts
class MyWidget extends WidgetBase<{ foo: string; }> {
	protected render() {
		const { foo } = this.properties;
		return v('div', { foo }, this.children);
	}
}

const h = harness(() => w(MyWidget, { foo: 'bar' }, [ 'child' ]));
```

The harness also supports `tsx` usage as show below. The rest of the README examples in will use the programmatic `w()` API, there are more examples of `tsx` in the [unit tests](./blob/master/tests/unit/harnessWithTsx.tsx).

```ts
const h = harness(() => <MyWidget foo='bar'>child</MyWidget>);
```

The `renderFunction` is lazily executed so can include additional logic to manipulate the widget's `properties` and `children` between assertions.

```ts
let foo = 'bar';

const h = harness(() => {
	return w(MyWidget, { foo }, [ 'child' ]));
};

// call expect to assert the virtial DOM structure
h.expect(...bar...);
// update the property that is passed to the widget
foo = 'foo';
// calling expect again will set the current properties and children on the widget and re-render
h.expect(...foo...);
```

### Custom Comparators

There are circumstances where the exact value of a property is unknown during testing, so will require the use of a custom compare descriptor.

The descriptors have a [`selector`](./path/to/selector) to locate the virtual nodes to check, a property name for the custom compare and a comparator function that receives the actual value and returns a boolean result for the assertion.

```ts
const compareId = {
	selector: '*', // all nodes
	property: 'id',
	comparator: (value: any) => typeof value === 'string' // checks the property value is a string
};

const h = harness(() => w(MyWidget, {}), [ compareId ]);
```

For all assertions using the returned `harness` API will now only test identified `id` properties using the `comparator` instead of the standard equality.

## selectors

The `harness` APIs commonly support a concept of css style selectors to target nodes within the virtual DOM for assertions and operations. The full list of supported selectors be found [here](https://github.com/fb55/css-select#supported-selectors).

In addition to the standard API:

* The `@` sigil is supported as shorthand for targeting a node's `key` property
* The `classes` property is used instead of `class` when using the stand shorthand `.` for targeting classes

## harness.expect

The most common requirement for testing is to assert the structural output from a widget's `render` function. `expect` accepts a render function that returns the expected render output from the widget under test.

```ts
h.expect(() => v('div', { key: 'foo'}, [
    w(Widget, { key: 'child-widget' }),
    'text node',
    v('span', { classes: [ 'class' ] })
]));
```

If the actual render output and expected render output are different an exception is thrown with a structured visualization indicating all differences with `(A)` (the actual value) and `(E)` (the expected value).

Example assertion failure output:

```ts
v("div", {
	"classes": [
		"root",
(A)		"other"
(E)		"another"
	],
	"onclick": "function"
}, [
	v("span", {
		"classes": "span",
		"id": "random-id",
		"key": "span",
		"onclick": "function",
		"style": "width: 100px"
	}, [
		"hello 0"
	])
	w(ChildWidget, {
		"id": "random-id",
		"key": "widget"
	})
	w("registry-item", {
		"id": true,
		"key": "registry"
	})
])
```

### harness.expectPartial

`expectPartial` asserts against a section of the widget's render output based on a [`selector`](#selectors).

API

```ts
expectPartial(selector: string, expectedRenderFunction: () => DNode | DNode[]);
```

* `selector`: The selector query to find the node to target
* `expectedRenderFunction`: The a function that returns the expected DNode structure of the queried node

Example Usage:

```ts
h.expectPartial('@child-widget', () => w(Widget, { key: 'child-widget' }));
```

#### harness.trigger

`harness.trigger()` calls a function with the `name` on the node targeted by the `selector`.

API

```ts
trigger(selector: string, name: string: ...args: any[]);
```

* `selector`: The selector query to find the node to target
* `name`: The name of the function to call from the located node
* `args`: The arguments to call the located function with

Example Usage(s):

```ts
// calls the `onclick` function on the first node with a key of `foo`
h.trigger('@foo', 'onclick');
```

```ts
// calls the `customFunction` function on the first node with a key of `bar` with an argument of `100`
h.trigger('@bar', 'customFunction', 100);
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
