'use strict';

var hasOwn = require('hasown');
var isArray = require('es-abstract/helpers/IsArray');
var every = require('es-abstract/helpers/every');

var isDisposableResourceRecord = require('./disposable-resource-record');

module.exports = function isDisposeCapabilityRecord(x) {
	return x
		&& typeof x === 'object'
		&& hasOwn(x, '[[DisposableResourceStack]]')
		&& isArray(x['[[DisposableResourceStack]]'])
		&& (
			x['[[DisposableResourceStack]]'] === 0
			|| every(x['[[DisposableResourceStack]]'], isDisposableResourceRecord)
		);
};
