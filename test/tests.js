'use strict';

var forEach = require('foreach');
var has = require('has');
var hasSymbols = require('has-symbols');
var hasToStringTag = require('has-tostringtag');
var inspect = require('object-inspect');
var isRegisteredSymbol = require('is-registered-symbol');
var isSymbol = require('is-symbol');
var supportsDescriptors = require('define-properties').supportsDescriptors;
var v = require('es-value-fixtures');

module.exports = {
	DisposableStack: function testDisposableStack(t, DisposableStack, symbolDispose) {
		t.equal(typeof DisposableStack, 'function', 'is a function');

		t.equal(typeof new DisposableStack(), 'object', 'returns an object');
		t.ok(new DisposableStack() instanceof DisposableStack, 'returns an instance of DisposableStack');

		t['throws'](
			function () { DisposableStack(); }, // eslint-disable-line new-cap
			TypeError,
			'throws a TypeError if not called with `new`'
		);

		var throwSentinel = { 'throws': true };
		var throwsSentinel = function throwsSentinel() {
			throw throwSentinel;
		};

		t.test('disposed', function (st) {
			var instance = new DisposableStack();

			st.equal(instance.disposed, false, 'is not disposed');

			st.test('has accessors', { skip: !supportsDescriptors }, function (s2t) {
				s2t.notOk(has(instance, 'disposed'), 'has no own `disposed` property');

				var desc = Object.getOwnPropertyDescriptor(DisposableStack.prototype, 'disposed');
				s2t.deepEqual(
					desc,
					{
						configurable: true,
						enumerable: true,
						get: desc.get,
						set: undefined
					},
					'has a prototype accessor'
				);

				s2t.equal(instance.disposed, desc.get.call(instance), 'instance Get matches prototype getter Call');

				instance.dispose();

				s2t.equal(instance.disposed, desc.get.call(instance), 'instance Get still matches prototype getter Call');
				s2t.equal(instance.disposed, true, 'is now disposed');

				s2t.end();
			});

			st.test('no accessors', { skip: supportsDescriptors }, function (s2t) {
				s2t.ok(has(instance, 'disposed'), 'has an own `disposed` property');

				instance.dispose();

				s2t.ok(has(instance, 'disposed'), 'still has an own `disposed` property');
				s2t.equal(instance.disposed, true, 'is now disposed');

				s2t.end();
			});

			st.end();
		});

		t.test('use', { skip: !symbolDispose }, function (st) {
			var instance = new DisposableStack();

			var count = 0;
			var disposable = {};
			disposable[symbolDispose] = function () {
				count += 1;
			};

			instance.use(disposable);
			instance.use(null);
			instance.use();
			instance.use(disposable);

			forEach(v.nonNullPrimitives, function (nonNullishObject) {
				st['throws'](
					function () { instance.use(nonNullishObject); },
					TypeError,
					'throws on a non-object: ' + inspect(nonNullishObject)
				);
			});

			st.equal(count, 0, 'does not call the disposable immediately');

			instance.dispose();

			st.equal(count, 2, 'calls the disposable twice, as expected');

			st['throws'](
				function () { instance.use(disposable); },
				ReferenceError,
				'throws when already disposed: ' + inspect(instance)
			);

			var badDisposable = {};
			badDisposable[symbolDispose] = throwsSentinel;

			var instance2 = new DisposableStack();
			instance2.use(badDisposable);

			try {
				instance2.dispose();
				st.fail('dispose with a throwing disposable failed to throw');
			} catch (e) {
				st.equal(e, throwSentinel, 'throws `throwSentinel`');
			}

			st.end();
		});

		t.test('defer', function (st) {
			var instance = new DisposableStack();

			forEach(v.nonFunctions, function (nonFunction) {
				st['throws'](
					function () { instance.defer(nonFunction); },
					TypeError,
					'throws on a nonfunction: ' + inspect(nonFunction)
				);
			});

			var count = 0;
			var increment = function increment() {
				count += 1;
			};
			instance.defer(increment);
			instance.defer(increment);

			st.equal(count, 0, 'does not call the disposable immediately');

			instance.dispose();

			st.equal(count, 2, 'calls the disposable twice, as expected');

			st['throws'](
				function () { instance.defer(function () {}); },
				ReferenceError,
				'throws when already disposed: ' + inspect(instance)
			);

			var instance2 = new DisposableStack();
			instance2.defer(throwsSentinel);

			try {
				instance2.dispose();
				st.fail('dispose with a throwing disposable failed to throw');
			} catch (e) {
				st.equal(e, throwSentinel, 'throws `throwSentinel`');
			}

			st.end();
		});

		t.test('adopt', function (st) {
			var instance = new DisposableStack();

			forEach(v.nonFunctions, function (nonFunction) {
				st['throws'](
					function () { instance.adopt(nonFunction); },
					TypeError,
					'throws on a nonfunction: ' + inspect(nonFunction)
				);
			});

			var args = [];
			var onDispose = function onDispose() {
				args.push({
					count: arguments.length,
					args: Array.prototype.slice.call(arguments)
				});
			};

			var sentinel = { sentinel: true };
			instance.adopt(undefined, onDispose);
			instance.adopt(null, onDispose);
			instance.adopt(sentinel, onDispose);

			st.deepEqual(args, [], 'does not call the disposable immediately');

			instance.dispose();

			st.deepEqual(args, [
				{ count: 1, args: [sentinel] },
				{ count: 1, args: [null] },
				{ count: 1, args: [undefined] }
			], 'disposes the adopted things in reverse order');

			st['throws'](
				function () { instance.adopt(onDispose); },
				ReferenceError,
				'throws when already disposed: ' + inspect(instance)
			);

			var instance2 = new DisposableStack();
			instance2.adopt(null, throwsSentinel);

			try {
				instance2.dispose();
				st.fail('dispose with a throwing disposable failed to throw');
			} catch (e) {
				st.equal(e, throwSentinel, 'throws `throwSentinel`');
			}

			st.end();
		});

		t.test('move', function (st) {
			var disposed = new DisposableStack();
			disposed.dispose();
			st['throws'](
				function () {
					disposed.move();
				},
				ReferenceError,
				'throws on a disposed DisposableStack: ' + inspect(disposed)
			);

			var instance = new DisposableStack();

			var count = 0;
			var increment = function increment() {
				count += 1;
			};
			instance.defer(increment);
			instance.defer(increment);

			st.equal(count, 0, '`increment` has not yet been called');
			st.equal(instance.disposed, false, 'old stack is not disposed');

			var newStack = instance.move();

			st.equal(count, 0, '`increment` has not yet been called');

			st.equal(instance.disposed, true, 'old stack is now disposed');
			st.equal(newStack.disposed, false, 'new stack is not disposed');

			newStack.dispose();

			st.equal(count, 2, '`increment` has been called exactly twice');

			st.equal(newStack.disposed, true, 'new stack is now disposed');

			st.end();
		});

		t.test('Symbol.dispose', { skip: !symbolDispose }, function (st) {
			st.equal(DisposableStack.prototype[symbolDispose], DisposableStack.prototype.dispose, 'is the same function as `dispose`');

			st.end();
		});

		t.test('dispose', function (st) {
			var disposed = new DisposableStack();
			disposed.dispose();
			st.ok(disposed.disposed, 'is disposed');
			st.equal(disposed.dispose(), undefined, 'disposing a disposed stack returns undefined');

			var instance = new DisposableStack();

			var count = 0;
			var increment = function increment() {
				count += 1;
			};
			instance.defer(increment);
			instance.defer(increment);

			st.equal(count, 0, '`increment` has not yet been called');
			st.equal(instance.disposed, false, 'stack is not disposed');

			instance.dispose();

			st.equal(count, 2, '`increment` has been called exactly twice');

			st.equal(instance.disposed, true, 'stack is now disposed');

			st.end();
		});

		t.test('toStringTag', { skip: !hasToStringTag() }, function (st) {
			var instance = new DisposableStack();

			st.equal(
				Object.prototype.toString.call(instance),
				'[object DisposableStack]',
				'has the correct [[Class]]'
			);

			st.end();
		});
	},
	'Symbol.dispose': function testSymbolDispose(t, symbolDispose) {
		t.test('Symbol support', { skip: !hasSymbols() }, function (st) {
			st.ok(isSymbol(symbolDispose), 'is a symbol');
			st.notOk(isRegisteredSymbol(symbolDispose), 'is not a registered symbol');

			st.end();
		});

		t.test('no Symbol support', { skip: hasSymbols() }, function (st) {
			st.notOk(isSymbol(symbolDispose), 'is not a symbol');
			st.notOk(isRegisteredSymbol(symbolDispose), 'is not a registered symbol');

			st.equal(symbolDispose, null, 'is `null`');

			st.end();
		});
	},
	'Symbol.asyncDispose': function testSymbolAsyncDispose(t, symbolAsyncDispose) {
		t.test('Symbol support', { skip: !hasSymbols() }, function (st) {
			st.ok(isSymbol(symbolAsyncDispose), 'is a symbol');
			st.notOk(isRegisteredSymbol(symbolAsyncDispose), 'is not a registered symbol');

			st.end();
		});

		t.test('no Symbol support', { skip: hasSymbols() }, function (st) {
			st.notOk(isSymbol(symbolAsyncDispose), 'is not a symbol');
			st.notOk(isRegisteredSymbol(symbolAsyncDispose), 'is not a registered symbol');

			st.equal(symbolAsyncDispose, null, 'is `null`');

			st.end();
		});
	}
};
