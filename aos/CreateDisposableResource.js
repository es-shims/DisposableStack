'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var IsCallable = require('es-abstract/2025/IsCallable');

var isObject = require('es-abstract/helpers/isObject');

var GetDisposeMethod = require('./GetDisposeMethod');

// https://tc39.es/ecma262/#sec-createdisposableresource
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
		} else { // step 1.b
			if (!isObject(V)) {
				throw new $TypeError('`V` must be an Object, or `null` or `undefined`');
			}

			method = GetDisposeMethod(V, kind); // step 1.b.i

			if (typeof method === 'undefined') {
				throw new $TypeError('dispose method must not be `undefined` on `V` when an object `V` is provided'); // step 1.b.ii
			}
		}
	} else { // step 2 (method is present)
		method = arguments[2];
		if (!IsCallable(method)) {
			throw new $TypeError('`method`, when provided, must be a function');
		}
	}
	return { // step 2
		'[[ResourceValue]]': V,
		'[[Kind]]': kind,
		'[[DisposeMethod]]': method
	};
};
