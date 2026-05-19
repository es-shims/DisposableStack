'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var Call = require('es-abstract/2025/Call');
var GetMethod = require('es-abstract/2025/GetMethod');
var NewPromiseCapability = require('es-abstract/2025/NewPromiseCapability');

var isObject = require('es-abstract/helpers/isObject');

var symbolDispose = require('../Symbol.dispose/polyfill')();
var symbolAsyncDispose = require('../Symbol.asyncDispose/polyfill')();

// https://tc39.es/ecma262/#sec-getdisposemethod
module.exports = function GetDisposeMethod(V, kind) {
	if (!isObject(V)) {
		throw new $TypeError('`V` must be an Object'); // step 1
	}
	if (kind !== '~SYNC-DISPOSE~' && kind !== '~ASYNC-DISPOSE~') {
		throw new $SyntaxError('Assertion failed: `kind` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}

	if (kind === '~SYNC-DISPOSE~') { // step 2
		if (!symbolDispose) {
			throw new $SyntaxError('`Symbol.dispose` is not supported');
		}
		return GetMethod(V, symbolDispose);
	}

	// step 3: kind is ~ASYNC-DISPOSE~
	var asyncMethod = symbolAsyncDispose ? GetMethod(V, symbolAsyncDispose) : void undefined; // step 4
	if (typeof asyncMethod !== 'undefined') { // step 5
		return asyncMethod;
	}

	if (!symbolDispose) {
		throw new $SyntaxError('`Symbol.dispose` is not supported');
	}

	var syncMethod = GetMethod(V, symbolDispose); // step 6
	if (typeof syncMethod === 'undefined') {
		return void undefined; // step 7
	}

	// steps 8-10: wrap the sync dispose method so it returns a Promise
	return function () {
		// eslint-disable-next-line no-invalid-this
		var obj = this; // step 8.a
		var promiseCapability = NewPromiseCapability(Promise); // step 8.b
		try {
			Call(syncMethod, obj); // step 8.c
		} catch (e) {
			promiseCapability['[[Reject]]'](e); // step 8.d (IfAbruptRejectPromise)
			return promiseCapability['[[Promise]]']; // step 8.f
		}
		Call(promiseCapability['[[Resolve]]'], void undefined, [void undefined]); // step 8.e
		return promiseCapability['[[Promise]]']; // step 8.f
	};
};
