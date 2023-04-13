'use strict';

var test = require('tape');

var symbolDispose = require('../Symbol.dispose/implementation');
var symbolAsyncDispose = require('../Symbol.asyncDispose/implementation');
var DisposableStack = require('../DisposableStack/implementation');
var AsyncDisposableStack = require('../AsyncDisposableStack/implementation');

var runTests = require('./tests');

/* eslint new-cap: 0 */

test('implementation', function (t) {
	test('Symbol.dispose', function (st) {
		runTests['Symbol.dispose'](st, symbolDispose);

		st.end();
	});

	test('Symbol.asyncDispose', function (st) {
		runTests['Symbol.asyncDispose'](st, symbolAsyncDispose);

		st.end();
	});

	test('DisposableStack', function (st) {
		runTests.DisposableStack(st, DisposableStack, symbolDispose);

		st.end();
	});

	test('AsyncDisposableStack', function (st) {
		runTests.AsyncDisposableStack(st, AsyncDisposableStack, symbolAsyncDispose);

		st.end();
	});

	t.end();
});
