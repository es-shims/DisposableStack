'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var IsCallable = require('es-abstract/2025/IsCallable');

var isObject = require('es-abstract/helpers/isObject');

var GetDisposeMethod = require('./GetDisposeMethod');

module.exports = function CreateDisposableResource(V, kind) {
	if (kind !== '~SYNC-DISPOSE~' && kind !== '~ASYNC-DISPOSE~') {
		throw new $SyntaxError('Assertion failed: `kind` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}

	var method;
	if (arguments.length < 3) { // step 1
		if (V == null) { // step 1.a
			// eslint-disable-next-line no-param-reassign
			V = void undefined; // step 1.a.i
			method = void undefined; // step 1.a.ii
		} else {
			if (typeof V !== 'undefined' && !isObject(V)) {
				throw new $TypeError('`V` must be an Object, or `null` or `undefined`'); // step 1.b.i
			}

			method = GetDisposeMethod(V, kind); // step 1.b.ii

			if (typeof method === 'undefined') {
				throw new $TypeError('dispose method must not be `undefined` on `V` when an object `V` is provided'); // step 1.b.i
			}
		}
	} else { // step 2
		method = arguments[2];
		if (!IsCallable(method)) {
			throw new $TypeError('`method`, when provided, must be a function'); // step 2.a
		}
	}
	return { // step 3
		'[[ResourceValue]]': V,
		'[[Kind]]': kind,
		'[[DisposeMethod]]': method
	};
};
