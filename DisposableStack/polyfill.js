'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof DisposableStack === 'function' ? DisposableStack : implementation;
};
