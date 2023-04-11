'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var Call = require('es-abstract/2022/Call');
var Type = require('es-abstract/2022/Type');

module.exports = function Dispose(V, hint, method) {
	if (typeof V !== 'undefined' && Type(V) !== 'Object') {
		throw new $TypeError('Assertion failed: `V` must be `undefined` or an Object');
	}
	if (hint !== 'sync-dispose') {
		throw new $TypeError('Assertion failed: `hint` must be `\'sync-dispose\'`');
	}
	if (typeof method !== 'function') {
		throw new $TypeError('Assertion failed: `method` must be a function');
	}

	Call(method, V);
};
