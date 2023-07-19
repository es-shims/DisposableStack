'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');
var $Promise = GetIntrinsic('%Promise%', true);

var callBound = require('call-bind/callBound');
var $then = callBound('Promise.prototype.then', true);

var CompletionRecord = require('es-abstract/2022/CompletionRecord');
var Dispose = require('./Dispose');
var NormalCompletion = require('es-abstract/2022/NormalCompletion');
var PromiseResolve = require('es-abstract/2022/PromiseResolve');
var ThrowCompletion = require('es-abstract/2022/ThrowCompletion');

var SuppressedError = require('suppressed-error/polyfill')();

module.exports = function DisposeResources(disposeCapability, completion) {
	// assertRecord('DisposeCapability Record', disposeCapability, 'disposeCapability'); ??
	if (!(completion instanceof CompletionRecord)) {
		throw new $TypeError('`completion` must be a Completion Record');
	}

	var stack = disposeCapability['[[DisposableResourceStack]]'];

	if (!stack) {
		throw new $TypeError('Assertion failed: `disposeCapability.[[DisposableResourceStack]]` must not be ~empty~'); // step 1
	}

	// for DisposableStack or AsyncDisposableStack, all are sync, or all are async.
	// Only an environment record, via `using` and `await using`, can mix sync and async.
	var actualHint;
	for (var j = stack.length - 1; j >= 0; j -= 1) {
		// assertRecord('DisposableResource Record', resource); ??
		if (!actualHint) {
			actualHint = stack[j]['[[Hint]]'];
		} else if (actualHint !== stack[j]['[[Hint]]']) {
			throw new $SyntaxError('mixed hint stacks are not supported');
		}
	}

	var promise = actualHint === 'async-dispose' && PromiseResolve($Promise, completion);

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

	var getPromise = actualHint === 'async-dispose' && function getPromise(resource) {
		return $then(
			promise,
			function () {
				var result = Dispose( // step 2.a
					resource['[[ResourceValue]]'],
					resource['[[Hint]]'],
					resource['[[DisposeMethod]]']
				);
				if (!result) {
					throw new $SyntaxError('Assertion failed: non-`async-dispose` resource returned a promise from Dispose');
				}
				return $then(result, NormalCompletion);
			},
			rejecter
		);
	};

	for (var i = stack.length - 1; i >= 0; i -= 1) { // step 2
		if (actualHint === 'async-dispose') {
			promise = getPromise(stack[i]);
		} else {
			var resource = stack[i];
			try {
				var result = Dispose( // step 2.a
					resource['[[ResourceValue]]'],
					resource['[[Hint]]'],
					resource['[[DisposeMethod]]']
				);
				if (result) {
					throw new $SyntaxError('Assertion failed: `sync-dispose` resource returned something from Dispose');
				}
			} catch (e) {
				rejecter(e);
			}
		}
	}

	// eslint-disable-next-line no-param-reassign
	disposeCapability['[[DisposableResourceStack]]'] = null; // step 3

	return actualHint === 'async-dispose' ? promise : completion; // step 4
};
