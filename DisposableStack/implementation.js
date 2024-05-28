'use strict';

/* eslint no-invalid-this: 0 */

var $ReferenceError = require('es-errors/ref');
var $TypeError = require('es-errors/type');

var Call = require('es-abstract/2024/Call');
var CreateMethodProperty = require('es-abstract/2023/CreateMethodProperty');
var DefinePropertyOrThrow = require('es-abstract/2024/DefinePropertyOrThrow');
var IsCallable = require('es-abstract/2024/IsCallable');
var NormalCompletion = require('es-abstract/2024/NormalCompletion');

var SLOT = require('internal-slot');
var setToStringTag = require('es-set-tostringtag');
var supportsDescriptors = require('define-properties').supportsDescriptors;
var callBind = require('call-bind');

var AddDisposableResource = require('../aos/AddDisposableResource');
var DisposeResources = require('../aos/DisposeResources');
var NewDisposeCapability = require('../aos/NewDisposeCapability');

var symbolDispose = require('../Symbol.dispose/polyfill')();

var DisposableStack = function DisposableStack() {
	if (
		!(this instanceof DisposableStack)
		|| SLOT.has(this, '[[DisposableState]]')
		|| SLOT.has(this, '[[DisposeCapability]]')
	) {
		throw new $TypeError('can only be used with new');
	}
	SLOT.set(this, '[[DisposableState]]', 'PENDING');
	SLOT.set(this, '[[DisposeCapability]]', NewDisposeCapability());
};

var disposed = function disposed() {
	var disposableStack = this; // step 1

	SLOT.assert(disposableStack, '[[DisposableState]]'); // step 2

	return SLOT.get(disposableStack, '[[DisposableState]]') === 'DISPOSED'; // steps 3-4
};
var isDisposed = callBind(disposed);
if (supportsDescriptors) {
	DefinePropertyOrThrow(DisposableStack.prototype, 'disposed', {
		'[[Configurable]]': true,
		'[[Enumerable]]': false,
		'[[Get]]': disposed
	});
} else {
	DisposableStack.prototype.disposed = false;
}

var markDisposed = function markDisposed(disposableStack) {
	SLOT.set(disposableStack, '[[DisposableState]]', 'DISPOSED'); // step 4
	if (!supportsDescriptors) {
		disposableStack.disposed = true; // eslint-disable-line no-param-reassign
	}
};

CreateMethodProperty(DisposableStack.prototype, 'dispose', function dispose() {
	var disposableStack = this; // step 1

	if (isDisposed(disposableStack)) { // steps 2-3
		return void undefined; // step 3
	}

	markDisposed(disposableStack); // step 4

	return DisposeResources(SLOT.get(disposableStack, '[[DisposeCapability]]'), NormalCompletion())['?'](); // step 5
});

CreateMethodProperty(DisposableStack.prototype, 'use', function use(value) {
	var disposableStack = this; // step 1

	if (isDisposed(disposableStack)) { // steps 2-3
		throw new $ReferenceError('a disposed stack can not use anything new'); // step 3
	}

	AddDisposableResource(SLOT.get(disposableStack, '[[DisposeCapability]]'), value, 'SYNC-DISPOSE'); // step 4

	return value; // step 5
});

CreateMethodProperty(DisposableStack.prototype, 'adopt', function adopt(value, onDispose) {
	var disposableStack = this; // step 1

	if (isDisposed(disposableStack)) { // steps 2-3
		throw new $ReferenceError('a disposed stack can not use anything new'); // step 3
	}

	if (!IsCallable(onDispose)) {
		throw new $TypeError('`onDispose` must be a function'); // step 4
	}

	// eslint-disable-next-line no-sequences
	var F = (0, function () { // steps 5-7
		return Call(onDispose, void undefined, [value]);
	});

	AddDisposableResource(SLOT.get(disposableStack, '[[DisposeCapability]]'), void undefined, 'SYNC-DISPOSE', F); // step 8

	return value; // step 9
});

CreateMethodProperty(DisposableStack.prototype, 'defer', function defer(onDispose) {
	var disposableStack = this; // step 1

	if (isDisposed(disposableStack)) { // steps 2-3
		throw new $ReferenceError('a disposed stack can not defer anything new'); // step 3
	}

	if (!IsCallable(onDispose)) {
		throw new $TypeError('`onDispose` must be a function'); // step 4
	}

	AddDisposableResource(SLOT.get(disposableStack, '[[DisposeCapability]]'), void undefined, 'SYNC-DISPOSE', onDispose); // step 5
});

CreateMethodProperty(DisposableStack.prototype, 'move', function move() {
	var disposableStack = this; // step 1

	if (isDisposed(disposableStack)) { // steps 2-3
		throw new $ReferenceError('a disposed stack can not use anything new'); // step 3
	}

	var newDisposableStack = new DisposableStack(); // step 4-5
	SLOT.set(newDisposableStack, '[[DisposeCapability]]', SLOT.get(disposableStack, '[[DisposeCapability]]')); // step 6
	SLOT.set(disposableStack, '[[DisposeCapability]]', NewDisposeCapability()); // step 7
	markDisposed(disposableStack); // step 8

	return newDisposableStack; // step 9
});

if (symbolDispose) {
	CreateMethodProperty(DisposableStack.prototype, symbolDispose, DisposableStack.prototype.dispose);
}

setToStringTag(DisposableStack.prototype, 'DisposableStack');

module.exports = DisposableStack;
