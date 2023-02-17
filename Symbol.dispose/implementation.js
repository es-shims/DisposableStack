'use strict';

var hasSymbols = require('has-symbols/shams')();

module.exports = hasSymbols ? Symbol.dispose || Symbol('Symbol.dispose') : null;
