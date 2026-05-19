'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var isArray = require('es-abstract/helpers/IsArray');
var every = require('es-abstract/helpers/every');

var isDisposableResourceRecord = require('./records/disposable-resource-record');

var CreateDisposableResource = require('./CreateDisposableResource');

var callBound = require('call-bound');

var $push = callBound('Array.prototype.push');

module.exports = function AddDisposableResource(disposableResourceStack, V, kind) {
	if (!isArray(disposableResourceStack) || !every(disposableResourceStack, isDisposableResourceRecord)) {
		throw new $TypeError('Assertion failed: `disposableResourceStack` must be a List of DisposableResource Records');
	}
	if (kind !== '~SYNC-DISPOSE~' && kind !== '~ASYNC-DISPOSE~') {
		throw new $SyntaxError('Assertion failed: `kind` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}
	var method = arguments.length > 3 ? arguments[3] : void undefined;
	if (arguments.length > 3 && typeof method !== 'function') {
		throw new $TypeError('Assertion failed: `method`, when present, must be a function');
	}

	var resource;
	if (arguments.length < 4) { // step 1
		if (V == null && kind === '~SYNC-DISPOSE~') {
			return '~UNUSED~'; // step 1.a
		}
		resource = CreateDisposableResource(V, kind); // step 1.c
	} else { // step 2
		if (typeof V !== 'undefined') {
			throw new $TypeError('Assertion failed: `V` must be undefined when `method` is present'); // step 2.a
		}
		resource = CreateDisposableResource(void undefined, kind, method); // step 2.b
	}
	$push(disposableResourceStack, resource); // step 3

	return '~UNUSED~'; // step 4
};
