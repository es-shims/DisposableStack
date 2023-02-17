'use strict';

var test = require('tape');

var symbolDispose = require('../Symbol.dispose');
var DisposableStack = require('../DisposableStack');

var shims = require('../');

var runTests = require('./tests');

test('shims', function (t) {
	t.deepEqual(shims, ['DisposableStack', 'Symbol.dispose'], 'has expected shims');

	t.end();
});

/* eslint new-cap: 0 */

test('index', function (t) {
	test('DisposableStack', function (st) {
		runTests.DisposableStack(st, DisposableStack, symbolDispose);

		st.end();
	});

	test('Symbol.dispose', function (st) {
		runTests['Symbol.dispose'](st, symbolDispose);

		st.end();
	});

	t.end();
});
