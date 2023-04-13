'use strict';

var define = require('define-properties');
var globalThis = require('globalthis')();
var getPolyfill = require('./polyfill');

module.exports = function shimAsyncDisposableStack() {
	var polyfill = getPolyfill();
	define(
		globalThis,
		{ AsyncDisposableStack: polyfill },
		{ AsyncDisposableStack: true }
	);
	return polyfill;
};
