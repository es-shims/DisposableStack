'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var IsCallable = require('es-abstract/2024/IsCallable');
var Type = require('es-abstract/2024/Type');

var GetDisposeMethod = require('./GetDisposeMethod');

module.exports = function CreateDisposableResource(V, hint) {
	if (hint !== 'SYNC-DISPOSE' && hint !== 'ASYNC-DISPOSE') {
		throw new $SyntaxError('Assertion failed: `hint` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}

	var method;
	if (arguments.length < 3) { // step 1
		if (V == null) { // step 1.a
			// eslint-disable-next-line no-param-reassign
			V = void undefined; // step 1.a.i
			method = void undefined; // step 1.a.ii
		} else {
			if (typeof V !== 'undefined' && Type(V) !== 'Object') {
				throw new $TypeError('`V` must be an Object, or `null` or `undefined`'); // step 1.b.i
			}

			method = GetDisposeMethod(V, hint); // step 1.b.ii

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
		'[[Hint]]': hint,
		'[[DisposeMethod]]': method
	};
};
