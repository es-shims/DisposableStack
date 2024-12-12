'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var isDisposeCapabilityRecord = require('./records/dispose-capability-record');

var CreateDisposableResource = require('./CreateDisposableResource');

var callBound = require('call-bound');

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
		throw new $TypeError('Assertion failed: `disposeCapability.[[DisposableResourceStack]]` must not be ~EMPTY~');
	}

	var resource;
	if (arguments.length < 4) { // step 1
		if (V == null && hint === 'SYNC_DISPOSE') {
			return 'UNUSED'; // step 1.a
		}
		resource = CreateDisposableResource(V, hint); // step 1.c
	} else { // step 2
		if (typeof V !== 'undefined') {
			throw new $TypeError('Assertion failed: `V` must be undefined when `method` is present'); // step 2.a
		}
		resource = CreateDisposableResource(void undefined, hint, method); // step 2.b
	}
	$push(disposeCapability['[[DisposableResourceStack]]'], resource); // step 3

	return 'UNUSED'; // step 4
};
