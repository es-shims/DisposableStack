'use strict';

var hasSymbols = require('has-symbols/shams');

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return (hasSymbols() && Symbol.dispose) || implementation;
};
