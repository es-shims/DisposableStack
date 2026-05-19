'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Promise = GetIntrinsic('%Promise%', true);

var callBound = require('call-bound');
var $then = callBound('Promise.prototype.then', true);

var CompletionRecord = require('es-abstract/2025/CompletionRecord');
var Dispose = require('./Dispose');
var PromiseResolve = require('es-abstract/2025/PromiseResolve');
var ThrowCompletion = require('es-abstract/2025/ThrowCompletion');

var SuppressedError = require('suppressed-error/polyfill')();

module.exports = function DisposeResources(disposeCapability, completion) {
	// assertRecord('DisposeCapability Record', disposeCapability, 'disposeCapability'); ??
	if (!(completion instanceof CompletionRecord)) {
		throw new $TypeError('`completion` must be a Completion Record');
	}

	var stack = disposeCapability['[[DisposableResourceStack]]'];

	if (!stack) {
		throw new $TypeError('Assertion failed: `disposeCapability.[[DisposableResourceStack]]` must not be ~EMPTY~'); // step 1
	}

	// for DisposableStack or AsyncDisposableStack, all are sync, or all are async.
	// Only an environment record, via `using` and `await using`, can mix sync and async.
	var actualKind;
	for (var j = stack.length - 1; j >= 0; j -= 1) {
		// assertRecord('DisposableResource Record', resource); ??
		if (!actualKind) {
			actualKind = stack[j]['[[Kind]]'];
		} else if (actualKind !== stack[j]['[[Kind]]']) {
			throw new $SyntaxError('mixed-kind stacks are not supported');
		}
	}

	var promise = actualKind === '~ASYNC-DISPOSE~' && PromiseResolve($Promise, completion);

	var rejecter = function (e) {
		if (completion.type() === 'throw') { // step 2.b.i
			var suppressed = completion.value(); // step 2.b.i.2
			var error = new SuppressedError(e, suppressed); // steps 2.b.i.1, 2.b.i.3 - 2.b.i.5
			// eslint-disable-next-line no-param-reassign
			completion = ThrowCompletion(error); // step 2.b.i.6
		} else { // step 2.b.ii
			// eslint-disable-next-line no-param-reassign
			completion = ThrowCompletion(e); // step 2.b.ii.1
		}
	};

	var getPromise = actualKind === '~ASYNC-DISPOSE~' && function getPromise(resource) {
		var runDispose = function () {
			try {
				var result = Dispose( // step 2.a
					resource['[[ResourceValue]]'],
					resource['[[Kind]]'],
					resource['[[DisposeMethod]]']
				);
				if (!result) {
					throw new $SyntaxError('Assertion failed: non-`~ASYNC-DISPOSE~` resource returned a promise from Dispose');
				}
				return $then(result, void undefined, rejecter);
			} catch (e) {
				rejecter(e);
			}
			return void undefined;
		};
		return $then(
			promise,
			runDispose,
			function (e) {
				rejecter(e);
				return runDispose();
			}
		);
	};

	for (var i = stack.length - 1; i >= 0; i -= 1) { // step 2
		if (actualKind === '~ASYNC-DISPOSE~') {
			promise = getPromise(stack[i]);
		} else {
			var resource = stack[i];
			try {
				var result = Dispose( // step 2.a
					resource['[[ResourceValue]]'],
					resource['[[Kind]]'],
					resource['[[DisposeMethod]]']
				);
				if (result) {
					throw new $SyntaxError('Assertion failed: `~SYNC-DISPOSE~` resource returned something from Dispose');
				}
			} catch (e) {
				rejecter(e);
			}
		}
	}

	// eslint-disable-next-line no-param-reassign
	disposeCapability['[[DisposableResourceStack]]'] = null; // step 3

	if (actualKind === '~ASYNC-DISPOSE~') { // step 4
		return $then(promise, function () {
			return completion;
		});
	}
	return completion;
};
