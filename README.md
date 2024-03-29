# disposablestack <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

An ESnext spec-compliant `DisposableStack`, `AsyncDisposableStack`, `Symbol.dispose`, and `Symbol.asyncDispose` shim/polyfill/replacement that works as far down as ES3.

Its root `auto` entrypoint also provides `SuppressedError`, via the [`suppressed-error`](https://npmjs.com/suppressed-error) package.

This package implements the [es-shim API](https://github.com/es-shims/api) “multi” interface. It works in an ES3-supported environment and complies with the proposed [spec](https://tc39.es/proposal-explicit-resource-management/).

## Getting started

```sh
npm install --save disposablestack
```

## Usage/Examples

```js
const assert = require('assert');

require('disposablestack/auto');

assert.equal(typeof Symbol.dispose, 'symbol');
assert.equal(typeof Symbol.asyncDispose, 'symbol');

const error = new SuppressedError();
assert.ok(error instanceof Error);

const stack = new DisposableStack();

const asyncStack = new AsyncDisposableStack();

// examples of stack methods

stack.dispose();

await asyncStack.disposeAsync();

// assert disposal was done
```

## Tests

Clone the repo, `npm install`, and run `npm test`

[package-url]: https://npmjs.org/package/disposablestack
[npm-version-svg]: https://versionbadg.es/es-shims/DisposableStack.svg
[deps-svg]: https://david-dm.org/es-shims/DisposableStack.svg
[deps-url]: https://david-dm.org/es-shims/DisposableStack
[dev-deps-svg]: https://david-dm.org/es-shims/DisposableStack/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/DisposableStack#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/disposablestack.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/disposablestack.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/disposablestack.svg
[downloads-url]: https://npm-stat.com/charts.html?package=disposablestack
[codecov-image]: https://codecov.io/gh/es-shims/DisposableStack/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/es-shims/DisposableStack/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/es-shims/DisposableStack
[actions-url]: https://github.com/es-shims/DisposableStack/actions
