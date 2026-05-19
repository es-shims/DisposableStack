'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Promise = GetIntrinsic('%Promise%', true);

var callBound = require('call-bound');
var $then = callBound('Promise.prototype.then', true);

var Call = require('es-abstract/2025/Call');
var CompletionRecord = require('es-abstract/2025/CompletionRecord');
var PromiseResolve = require('es-abstract/2025/PromiseResolve');
var ThrowCompletion = require('es-abstract/2025/ThrowCompletion');

var isArray = require('es-abstract/helpers/IsArray');
var every = require('es-abstract/helpers/every');

var isDisposableResourceRecord = require('./records/disposable-resource-record');

var SuppressedError = require('suppressed-error/polyfill')();

// https://tc39.es/ecma262/#sec-disposeresources
module.exports = function DisposeResources(disposableResourceStack, completion) {
	if (!isArray(disposableResourceStack) || !every(disposableResourceStack, isDisposableResourceRecord)) {
		throw new $TypeError('Assertion failed: `disposableResourceStack` must be a List of DisposableResource Records');
	}
	if (!(completion instanceof CompletionRecord)) {
		throw new $TypeError('Assertion failed: `completion` must be a Completion Record');
	}

	// DisposableStack and AsyncDisposableStack each only carry one kind. Detect which one.
	var anyAsync = false;
	var anySync = false;
	for (var j = 0; j < disposableResourceStack.length; j += 1) {
		if (disposableResourceStack[j]['[[Kind]]'] === '~ASYNC-DISPOSE~') {
			anyAsync = true;
		} else {
			anySync = true;
		}
	}
	if (anyAsync && anySync) {
		throw new $SyntaxError('mixed-kind disposable resource stacks are not supported by this polyfill');
	}

	// step 3: let outputCompletion be completion (mutated through the loop).
	var outputCompletion = completion;

	// steps 4.b.iii.1: SuppressedError chaining when an error occurs and outputCompletion is already a throw.
	var suppress = function (errValue) {
		if (outputCompletion.type() === 'throw') {
			var suppressed = outputCompletion.value();
			var error = new SuppressedError(errValue, suppressed);
			outputCompletion = ThrowCompletion(error);
		} else {
			outputCompletion = ThrowCompletion(errValue);
		}
	};

	if (!anyAsync) {
		// Sync path: no Await needed; just call methods in reverse, suppressing errors.
		for (var i = disposableResourceStack.length - 1; i >= 0; i -= 1) {
			var resource = disposableResourceStack[i];
			var method = resource['[[DisposeMethod]]'];
			if (typeof method !== 'undefined') { // step 4.b
				try {
					Call(method, resource['[[ResourceValue]]']); // step 4.b.i
				} catch (e) {
					suppress(e); // steps 4.b.iii
				}
			}
		}
		return outputCompletion; // step 6
	}

	// Async path: build a promise chain that calls each method (in reverse) and awaits its result.
	// A null-method ~ASYNC-DISPOSE~ resource (from `use(null)` / `use(undefined)`) corresponds to
	// the spec's `needsAwait` flag: the promise chain itself supplies the microtask tick.
	var promise = PromiseResolve($Promise, void undefined);

	var disposeOne = function (resourceRecord) {
		var resourceValue = resourceRecord['[[ResourceValue]]'];
		var disposeMethod = resourceRecord['[[DisposeMethod]]'];

		return function () {
			if (typeof disposeMethod === 'undefined') {
				// step 4.c: kind is ~ASYNC-DISPOSE~ with no method - just yield a microtask tick.
				return void undefined;
			}
			var result;
			try {
				result = Call(disposeMethod, resourceValue); // step 4.b.i
			} catch (e) {
				suppress(e); // step 4.b.iii (synchronous throw)
				return void undefined;
			}
			// step 4.b.ii: kind is ~ASYNC-DISPOSE~, so await result.
			return $then(PromiseResolve($Promise, result), void undefined, function (e) {
				suppress(e); // step 4.b.iii (asynchronous rejection)
			});
		};
	};

	for (var k = disposableResourceStack.length - 1; k >= 0; k -= 1) {
		promise = $then(promise, disposeOne(disposableResourceStack[k]));
	}

	return $then(promise, function () {
		return outputCompletion; // step 6
	});
};
