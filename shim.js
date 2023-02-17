'use strict';

var shimDisposableStack = require('./DisposableStack/shim');
var shimSymbolDispose = require('./Symbol.dispose/shim');

module.exports = function shim() {
	shimDisposableStack();
	shimSymbolDispose();
};
