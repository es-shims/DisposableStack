'use strict';

var define = require('define-properties');
var globalThis = require('globalthis')();
var getPolyfill = require('./polyfill');

module.exports = function shimDisposableStack() {
	var polyfill = getPolyfill();
	define(
		globalThis,
		{ DisposableStack: polyfill },
		{ DisposableStack: true }
	);
	return polyfill;
};
