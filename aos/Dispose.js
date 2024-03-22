'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $Promise = GetIntrinsic('%Promise%', true);

var Call = require('es-abstract/2024/Call');
var PromiseResolve = require('es-abstract/2024/PromiseResolve');
var Type = require('es-abstract/2024/Type');

module.exports = function Dispose(V, hint, method) {
	if (typeof V !== 'undefined' && Type(V) !== 'Object') {
		throw new $SyntaxError('Assertion failed: `V` must be `undefined` or an Object');
	}
	if (hint !== 'SYNC-DISPOSE' && hint !== 'ASYNC-DISPOSE') {
		throw new $SyntaxError('Assertion failed: `hint` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}
	if (typeof method !== 'undefined' && typeof method !== 'function') {
		throw new $SyntaxError('Assertion failed: `method` must be `undefined` or a function');
	}

	var result = typeof method === 'undefined' ? method : Call(method, V); // step 1, 2

	if (hint === 'ASYNC-DISPOSE') {
		return PromiseResolve($Promise, result); // step 3.a, 4
	}
};
