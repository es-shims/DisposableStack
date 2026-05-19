'use strict';

var $Object = Object;

module.exports = function isDisposableResourceRecord(x) {
	return x
		&& typeof x === 'object'
		&& (
			typeof x['[[ResourceValue]]'] === 'undefined'
			|| ($Object(x['[[ResourceValue]]']) === x['[[ResourceValue]]'])
		)
		&& (x['[[Kind]]'] === '~SYNC-DISPOSE~' || x['[[Kind]]'] === '~ASYNC-DISPOSE~')
		&& (typeof x['[[DisposeMethod]]'] === 'function' || typeof x['[[DisposeMethod]]'] === 'undefined');
};
