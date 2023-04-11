'use strict';

var shimSymbolDispose = require('./Symbol.dispose/shim');
var shimSymbolAsyncDispose = require('./Symbol.asyncDispose/shim');
var shimDisposableStack = require('./DisposableStack/shim');

module.exports = function shim() {
	shimSymbolDispose();
	shimSymbolAsyncDispose();
	shimDisposableStack();
};
