'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = GetIntrinsic('%SyntaxError%');
var $TypeError = GetIntrinsic('%TypeError%');

var GetMethod = require('es-abstract/2022/GetMethod');
var Type = require('es-abstract/2022/Type');

var symbolDispose = require('../../Symbol.dispose/polyfill')();

module.exports = function GetDisposeMethod(V, hint) {
	if (Type(V) !== 'Object') {
		throw new $TypeError('`V` must be an Object');
	}
	if (hint !== 'sync-dispose') {
		throw new $TypeError('`hint` must be `\'sync-dispose\'`');
	}
	if (!symbolDispose) {
		throw new $SyntaxError('`Symbol.dispose` is not supported');
	}
	var method = GetMethod(V, symbolDispose); // step 1

	return method; // step 2
};
