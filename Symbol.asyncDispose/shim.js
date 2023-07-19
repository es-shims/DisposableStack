'use strict';

var hasSymbols = require('has-symbols');
var DefinePropertyOrThrow = require('es-abstract/2023/DefinePropertyOrThrow');

var polyfill = require('./polyfill');

module.exports = function shimSymbolAsyncDispose() {
	var asyncDispose = polyfill();

	if (hasSymbols()) {
		DefinePropertyOrThrow(Symbol, 'asyncDispose', {
			'[[Configurable]]': false,
			'[[Enumerable]]': false,
			'[[Writable]]': false,
			'[[Value]]': asyncDispose
		});
	}

	return asyncDispose;
};
