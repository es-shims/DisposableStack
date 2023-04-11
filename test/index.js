'use strict';

var test = require('tape');

var symbolDispose = require('../Symbol.dispose');
var symbolAsyncDispose = require('../Symbol.asyncDispose');
var DisposableStack = require('../DisposableStack');

var shims = require('../');

var runTests = require('./tests');

test('shims', function (t) {
	t.deepEqual(shims, ['Symbol.dispose', 'Symbol.asyncDispose', 'DisposableStack'], 'has expected shims');

	t.end();
});

/* eslint new-cap: 0 */

test('index', function (t) {
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

	t.end();
});
