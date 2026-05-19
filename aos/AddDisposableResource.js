'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var isArray = require('es-abstract/helpers/IsArray');
var every = require('es-abstract/helpers/every');

var isDisposableResourceRecord = require('./records/disposable-resource-record');

var CreateDisposableResource = require('./CreateDisposableResource');

var callBound = require('call-bound');

var $push = callBound('Array.prototype.push');

// https://tc39.es/ecma262/#sec-adddisposableresource
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
	if (arguments.length > 3) { // step 1
		if (typeof V !== 'undefined') {
			throw new $TypeError('Assertion failed: `V` must be undefined when `method` is present'); // step 1.a
		}
		resource = CreateDisposableResource(void undefined, kind, method); // step 1.b
	} else { // step 2
		if (V == null && kind === '~SYNC-DISPOSE~') {
			return '~UNUSED~'; // step 2.a
		}
		// step 2.b: NOTE - when V is null/undefined and kind is ~ASYNC-DISPOSE~,
		// we record the resource so that we still perform an Await during disposal.
		resource = CreateDisposableResource(V, kind); // step 2.c
	}
	$push(disposableResourceStack, resource); // step 3

	return '~UNUSED~'; // step 4
};
