'use strict';

require('../auto');

var test = require('tape');
var hasSymbols = require('has-symbols')();

var shims = require('../');

var runTests = require('./tests');

var hasPropertyDescriptors = require('has-property-descriptors')();

test('shims', function (t) {
	t.deepEqual(shims, ['DisposableStack', 'Symbol.dispose'], 'has expected shims');

	t.end();
});

/* eslint new-cap: 0 */

test('index', function (t) {
	test('DisposableStack', function (st) {
		if (hasPropertyDescriptors) {
			st.deepEqual(
				Object.getOwnPropertyDescriptor(global, 'DisposableStack'),
				{
					configurable: true,
					enumerable: false,
					value: DisposableStack,
					writable: true
				}
			);
		}

		runTests.DisposableStack(st, DisposableStack, hasSymbols ? Symbol.dispose : null);

		st.end();
	});

	test('Symbol.dispose', { skip: !hasSymbols }, function (st) {
		if (hasPropertyDescriptors) {
			st.deepEqual(
				Object.getOwnPropertyDescriptor(Symbol, 'dispose'),
				{
					configurable: false,
					enumerable: false,
					value: Symbol.dispose,
					writable: false
				}
			);
		}

		runTests['Symbol.dispose'](st, Symbol.dispose);

		st.end();
	});

	t.end();
});
