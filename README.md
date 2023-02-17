# disposablestack <sup>[![Version Badge][npm-version-svg]][package-url]</sup>

[![github actions][actions-image]][actions-url]
[![coverage][codecov-image]][codecov-url]
[![dependency status][deps-svg]][deps-url]
[![dev dependency status][dev-deps-svg]][dev-deps-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][npm-badge-png]][package-url]

An ESnext spec-compliant `DisposableStack` and `Symbol.dispose` shim/polyfill/replacement that works as far down as ES3.

Its root `auto` entrypoint also provides `SuppressedError`, via the [`suppressed-error`](https://npmjs.com/suppressed-error) package.

In the future, this package will also provide `AsyncDisposableStack` and `Symbol.asyncDispose`, or whichever forms end up in stage 3.

This package implements the [es-shim API](https://github.com/es-shims/api) “multi” interface. It works in an ES3-supported environment and complies with the proposed [spec](https://tc39.es/proposal-explicit-resource-management/).

## Getting started

```sh
npm install --save disposable-stack
```

## Usage/Examples

```js
const assert = require('assert');

require('disposable-stack/auto');

assert.equal(typeof Symbol.dispose, 'symbol');

const error = new SuppressedError();
assert.ok(error instanceof Error);

const stack = new DisposableStack();

// examples of stack methods

stack.dispose();

// assert disposal was done
```

## Tests

Clone the repo, `npm install`, and run `npm test`

[package-url]: https://npmjs.org/package/disposable-stack
[npm-version-svg]: https://versionbadg.es/es-shims/DisposableStack.svg
[deps-svg]: https://david-dm.org/es-shims/DisposableStack.svg
[deps-url]: https://david-dm.org/es-shims/DisposableStack
[dev-deps-svg]: https://david-dm.org/es-shims/DisposableStack/dev-status.svg
[dev-deps-url]: https://david-dm.org/es-shims/DisposableStack#info=devDependencies
[npm-badge-png]: https://nodei.co/npm/disposable-stack.png?downloads=true&stars=true
[license-image]: https://img.shields.io/npm/l/disposable-stack.svg
[license-url]: LICENSE
[downloads-image]: https://img.shields.io/npm/dm/disposable-stack.svg
[downloads-url]: https://npm-stat.com/charts.html?package=disposable-stack
[codecov-image]: https://codecov.io/gh/es-shims/DisposableStack/branch/main/graphs/badge.svg
[codecov-url]: https://app.codecov.io/gh/es-shims/DisposableStack/
[actions-image]: https://img.shields.io/endpoint?url=https://github-actions-badge-u3jn4tfpocch.runkit.sh/es-shims/DisposableStack
[actions-url]: https://github.com/es-shims/DisposableStack/actions
