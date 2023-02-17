'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');

var Type = require('es-abstract/2022/Type');

var CreateDisposableResource = require('./CreateDisposableResource');

var callBound = require('call-bind/callBound');

var $push = callBound('Array.prototype.push');

module.exports = function AddDisposableResource(disposeCapability, V, hint) {
	// assertRecord('DisposeCapability Record', disposeCapability, 'disposeCapability'); ??
	if (hint !== 'sync-dispose') {
		throw new $SyntaxError('`hint` must be `\'sync-dispose\'`');
	}
	var method = arguments.length > 3 ? arguments[3] : void undefined;
	if (arguments.length > 3 && typeof method !== 'function') {
		throw new $TypeError('`method`, when present, must be a function');
	}

	var resource;
	if (arguments.length < 4) {
		if (V == null) {
			return 'unused'; // step 1.a
		}
		if (Type(V) !== 'Object') {
			throw new $TypeError('`V` must be an Object'); // step 1.b
		}
		resource = CreateDisposableResource(V, hint); // step 1.c
	} else {
		/* eslint no-lonely-if: 0 */
		if (V == null) { // step 2.a
			resource = CreateDisposableResource(void undefined, hint, method); // step 2.a.i
		} else { // step 2.b
			if (Type(V) !== 'Object') {
				throw new $TypeError('`V` must be an Object'); // step 2.b.i
			}
			resource = CreateDisposableResource(V, hint, method); // step 2.b.ii
		}
	}
	$push(disposeCapability['[[DisposableResourceStack]]'], resource); // step 3

	return 'unused'; // step 4
};
