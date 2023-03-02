'use strict';

var test = require('tape');

var symbolDispose = require('../Symbol.dispose/implementation');
var DisposableStack = require('../DisposableStack/implementation');

var runTests = require('./tests');

/* eslint new-cap: 0 */

test('implementation', function (t) {
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
