'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var GetMethod = require('es-abstract/2023/GetMethod');
var Type = require('es-abstract/2023/Type');

var symbolDispose = require('../Symbol.dispose/polyfill')();
var symbolAsyncDispose = require('../Symbol.asyncDispose/polyfill')();

module.exports = function GetDisposeMethod(V, hint) {
	if (Type(V) !== 'Object') {
		throw new $TypeError('`V` must be an Object');
	}
	if (hint !== 'sync-dispose' && hint !== 'async-dispose') {
		throw new $SyntaxError('Assertion failed: `hint` must be `\'sync-dispose\'` or `\'async-dispose\'`');
	}

	var method;
	if (hint === 'async-dispose' && symbolAsyncDispose) { // step 1
		method = GetMethod(V, symbolAsyncDispose); // step 1.a
	}

	if (!method) {
		if (!symbolDispose) {
			throw new $SyntaxError('`Symbol.dispose` is not supported');
		}
		method = GetMethod(V, symbolDispose); // step 1.b.i, 2.a
	}

	return method; // step 3
};
