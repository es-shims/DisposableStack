'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var Type = require('es-abstract/2024/Type');

var isDisposeCapabilityRecord = require('./records/dispose-capability-record');

var CreateDisposableResource = require('./CreateDisposableResource');

var callBound = require('call-bind/callBound');

var $push = callBound('Array.prototype.push');

module.exports = function AddDisposableResource(disposeCapability, V, hint) {
	if (!isDisposeCapabilityRecord(disposeCapability)) {
		throw new $TypeError('Assertion failed: `disposeCapability` must be a DisposeCapability Record');
	}
	if (hint !== 'SYNC-DISPOSE' && hint !== 'ASYNC-DISPOSE') {
		throw new $SyntaxError('Assertion failed: `hint` must be `~SYNC-DISPOSE~` or `~ASYNC-DISPOSE~`');
	}
	var method = arguments.length > 3 ? arguments[3] : void undefined;
	if (arguments.length > 3 && typeof method !== 'function') {
		throw new $TypeError('Assertion failed: `method`, when present, must be a function');
	}

	if (!disposeCapability['[[DisposableResourceStack]]']) {
		throw new $TypeError('Assertion failed: `disposeCapability.[[DisposableResourceStack]]` must not be ~empty~');
	}

	var resource;
	if (arguments.length < 4) { // step 2
		if (V == null) {
			return 'unused'; // step 2.a
		}
		if (Type(V) !== 'Object') {
			throw new $TypeError('`V` must be an Object'); // step 2.b
		}
		resource = CreateDisposableResource(V, hint); // step 2.c
	} else { // step 3
		if (typeof V !== 'undefined') {
			throw new $TypeError('Assertion failed: `V` must be undefined when `method` is present'); // step 3.a
		}
		resource = CreateDisposableResource(void undefined, hint, method); // step 3.b
	}
	$push(disposeCapability['[[DisposableResourceStack]]'], resource); // step 4

	return 'unused'; // step 5
};
