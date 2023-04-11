'use strict';

require('../auto');

var test = require('tape');
var hasSymbols = require('has-symbols')();

var runTests = require('./tests');

var hasPropertyDescriptors = require('has-property-descriptors')();

/* eslint new-cap: 0 */

test('shimmed', function (t) {
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

	test('Symbol.asyncDispose', { skip: !hasSymbols }, function (st) {
		if (hasPropertyDescriptors) {
			st.deepEqual(
				Object.getOwnPropertyDescriptor(Symbol, 'asyncDispose'),
				{
					configurable: false,
					enumerable: false,
					value: Symbol.asyncDispose,
					writable: false
				}
			);
		}

		runTests['Symbol.asyncDispose'](st, Symbol.asyncDispose);

		st.end();
	});

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

	t.end();
});
