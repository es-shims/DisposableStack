'use strict';

var hasSymbols = require('has-symbols');
var DefinePropertyOrThrow = require('es-abstract/2023/DefinePropertyOrThrow');

var polyfill = require('./polyfill');

module.exports = function shimSymbolDispose() {
	var dispose = polyfill();

	if (hasSymbols()) {
		DefinePropertyOrThrow(Symbol, 'dispose', {
			'[[Configurable]]': false,
			'[[Enumerable]]': false,
			'[[Writable]]': false,
			'[[Value]]': dispose
		});
	}

	return dispose;
};
