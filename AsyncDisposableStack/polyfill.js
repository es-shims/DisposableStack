'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof AsyncDisposableStack === 'function' ? AsyncDisposableStack : implementation;
};
