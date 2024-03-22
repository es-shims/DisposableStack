'use strict';

var $Object = Object;

module.exports = function isDisposeCapabilityRecord(x) {
	return x
		&& typeof x === 'object'
		&& (
			typeof x['[[ResourceValue]]'] === 'undefined'
			|| ($Object(x['[[ResourceValue]]']) === x['[[ResourceValue]]'])
		)
		&& (x['[[Hint]]'] === 'SYNC-DISPOSE' || x['[[Hint]]'] === 'ASYNC-DISPOSE')
		&& (typeof x['[[DisposeMethod]]'] === 'function' || typeof x['[[DisposeMethod]]'] === 'undefined');
};
