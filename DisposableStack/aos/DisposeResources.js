'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = GetIntrinsic('%TypeError%');

var CompletionRecord = require('es-abstract/2022/CompletionRecord');
var ThrowCompletion = require('es-abstract/2022/ThrowCompletion');

var Dispose = require('./Dispose');

var SuppressedError = require('suppressed-error/polyfill')();

module.exports = function DisposeResources(disposeCapability, completion) {
	// assertRecord('DisposeCapability Record', disposeCapability, 'disposeCapability'); ??
	if (!(completion instanceof CompletionRecord)) {
		throw new $TypeError('`completion` must be a Completion Record');
	}

	var stack = disposeCapability['[[DisposableResourceStack]]'];
	for (var i = stack.length - 1; i >= 0; i -= 1) { // step 1
		var resource = stack[i];
		// assertRecord('DisposableResource Record', resource); ??
		try {
			Dispose( // step 1.a
				resource['[[ResourceValue]]'],
				resource['[[Hint]]'],
				resource['[[DisposeMethod]]']
			);
		} catch (e) {
			if (completion.type() === 'throw') { // step 1.b.i
				var suppressed = completion.value(); // step 1.b.i.2
				var error = new SuppressedError(e, suppressed); // steps 1.b.i.1, 1.b.i.3 - 1.b.i.5
				// eslint-disable-next-line no-param-reassign
				completion = ThrowCompletion(error); // step 1.b.i.6
			} else { // step 1.b.ii
				// eslint-disable-next-line no-param-reassign
				completion = ThrowCompletion(e); // step 1.b.ii.1
			}
		}
	}

	return completion; // step 2
};
