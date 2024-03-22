'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var Call = require('es-abstract/2024/Call');
var GetMethod = require('es-abstract/2024/GetMethod');
var Type = require('es-abstract/2024/Type');

var symbolDispose = require('../Symbol.dispose/polyfill')();
var symbolAsyncDispose = require('../Symbol.asyncDispose/polyfill')();

module.exports = function GetDisposeMethod(V, hint) {
	if (Type(V) !== 'Object') {
		throw new $TypeError('`V` must be an Object');
	}
	if (hint !== 'SYNC-DISPOSE' && hint !== 'ASYNC-DISPOSE') {
		throw new $SyntaxError('Assertion failed: `hint` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}

	var method;
	if (hint === 'ASYNC-DISPOSE' && symbolAsyncDispose) { // step 1
		method = GetMethod(V, symbolAsyncDispose); // step 1.a
	}

	if (!method) {
		if (!symbolDispose) {
			throw new $SyntaxError('`Symbol.dispose` is not supported');
		}
		method = GetMethod(V, symbolDispose); // step 1.b.i, 2.a

		if (typeof method !== 'undefined') { // step 1.b.ii
			return function () { // step 1.b.ii.1, 1.b.ii.3
				// eslint-disable-next-line no-invalid-this
				var O = this; // step 1.b.ii.1.a
				Call(method, O); // step // step 1.b.ii.1.b
			};
		}
	}

	return method; // step 3
};
