'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var IsCallable = require('es-abstract/2023/IsCallable');
var Type = require('es-abstract/2023/Type');

var GetDisposeMethod = require('./GetDisposeMethod');

module.exports = function CreateDisposableResource(V, hint) {
	if (hint !== 'SYNC-DISPOSE' && hint !== 'ASYNC-DISPOSE') {
		throw new $SyntaxError('Assertion failed: `hint` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}

	if (typeof V !== 'undefined' && Type(V) !== 'Object') {
		throw new $TypeError('`V` must be an Object'); // step 1.a
	}

	var method;
	if (arguments.length < 3) { // step 1
		if (typeof V === 'undefined') {
			throw new $TypeError('`V` must not be `undefined` when `method` is not provided'); // step 1.a
		}
		method = GetDisposeMethod(V, hint); // step 1.b
		if (typeof method === 'undefined') {
			throw new $TypeError('dispose method must not be `undefined` on `V` when an object `V` is provided'); // step 1.a
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
