'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $Promise = GetIntrinsic('%Promise%', true);

var Call = require('es-abstract/2023/Call');
var PromiseResolve = require('es-abstract/2023/PromiseResolve');
var Type = require('es-abstract/2023/Type');

module.exports = function Dispose(V, hint, method) {
	if (typeof V !== 'undefined' && Type(V) !== 'Object') {
		throw new $SyntaxError('Assertion failed: `V` must be `undefined` or an Object');
	}
	if (hint !== 'sync-dispose' && hint !== 'async-dispose') {
		throw new $SyntaxError('Assertion failed: `hint` must be `\'sync-dispose\'` or `\'async-dispose\'`');
	}
	if (typeof method !== 'undefined' && typeof method !== 'function') {
		throw new $SyntaxError('Assertion failed: `method` must be `undefined` or a function');
	}

	var result = Call(method, V);
	if (hint === 'async-dispose') {
		return PromiseResolve($Promise, result);
	}
};
