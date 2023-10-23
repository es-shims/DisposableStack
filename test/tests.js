'use strict';

var forEach = require('foreach');
var hasOwn = require('hasown');
var hasSymbols = require('has-symbols');
var hasToStringTag = require('has-tostringtag');
var inspect = require('object-inspect');
var isRegisteredSymbol = require('is-registered-symbol');
var isSymbol = require('is-symbol');
var supportsDescriptors = require('define-properties').supportsDescriptors;
var v = require('es-value-fixtures');
var semver = require('semver');

var brokenNodePolyfill = semver.satisfies(process.version, '^18.18 || >= 20.4');

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
				s2t.notOk(hasOwn(instance, 'disposed'), 'has no own `disposed` property');

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
				s2t.ok(hasOwn(instance, 'disposed'), 'has an own `disposed` property');

				instance.dispose();

				s2t.ok(hasOwn(instance, 'disposed'), 'still has an own `disposed` property');
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

	AsyncDisposableStack: function testAsyncDisposableStack(t, AsyncDisposableStack, symbolAsyncDispose) {
		t.equal(typeof AsyncDisposableStack, 'function', 'is a function');

		t.equal(typeof new AsyncDisposableStack(), 'object', 'returns an object');
		t.ok(new AsyncDisposableStack() instanceof AsyncDisposableStack, 'returns an instance of AsyncDisposableStack');

		t['throws'](
			function () { AsyncDisposableStack(); }, // eslint-disable-line new-cap
			TypeError,
			'throws a TypeError if not called with `new`'
		);

		var throwSentinel = { 'throws': true };
		var throwsSentinel = function throwsSentinel() {
			throw throwSentinel;
		};

		t.test('disposed', { skip: typeof Promise !== 'function' }, function (st) {
			var instance = new AsyncDisposableStack();

			st.equal(instance.disposed, false, 'is not disposed');

			st.test('has accessors', { skip: !supportsDescriptors }, function (s2t) {
				s2t.notOk(hasOwn(instance, 'disposed'), 'has no own `disposed` property');

				var desc = Object.getOwnPropertyDescriptor(AsyncDisposableStack.prototype, 'disposed');
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

				return Promise.resolve(instance.disposeAsync()).then(function () {
					s2t.equal(instance.disposed, desc.get.call(instance), 'instance Get still matches prototype getter Call');
					s2t.equal(instance.disposed, true, 'is now disposed');
				});
			});

			st.test('no accessors', { skip: supportsDescriptors }, function (s2t) {
				s2t.ok(hasOwn(instance, 'disposed'), 'has an own `disposed` property');

				return instance.disposeAsync().then(function () {
					s2t.ok(hasOwn(instance, 'disposed'), 'still has an own `disposed` property');
					s2t.equal(instance.disposed, true, 'is now disposed');
				});
			});

			st.end();
		});

		t.test('use', { skip: !symbolAsyncDispose }, function (st) {
			var instance = new AsyncDisposableStack();

			var count = 0;
			var disposable = {};
			disposable[symbolAsyncDispose] = function () {
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

			return instance.disposeAsync().then(function () {
				st.equal(count, 2, 'calls the disposable twice, as expected');

				st['throws'](
					function () { instance.use(disposable); },
					ReferenceError,
					'throws when already disposed: ' + inspect(instance)
				);

				var badDisposable = {};
				badDisposable[symbolAsyncDispose] = throwsSentinel;

				var instance2 = new AsyncDisposableStack();
				instance2.use(badDisposable);

				return instance2.disposeAsync();
			}).then(
				function () {
					st.fail('dispose with a throwing disposable failed to throw');
				},
				function (e) {
					st.equal(e, throwSentinel, 'throws `throwSentinel`');
				}
			);
		});

		t.test('defer', { skip: typeof Promise !== 'function' }, function (st) {
			var instance = new AsyncDisposableStack();

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

			return instance.disposeAsync().then(function () {
				st.equal(count, 2, 'calls the disposable twice, as expected');

				st['throws'](
					function () { instance.defer(function () {}); },
					ReferenceError,
					'throws when already disposed: ' + inspect(instance)
				);

				var instance2 = new AsyncDisposableStack();
				instance2.defer(throwsSentinel);

				return instance2.disposeAsync().then(
					function () {
						st.fail('dispose with a throwing disposable failed to throw');
					},
					function (e) {
						st.equal(e, throwSentinel, 'throws `throwSentinel`');
					}
				);
			});
		});

		t.test('adopt', { skip: typeof Promise !== 'function' }, function (st) {
			var instance = new AsyncDisposableStack();

			forEach(v.nonFunctions, function (nonFunction) {
				st['throws'](
					function () { instance.adopt(nonFunction); },
					TypeError,
					'throws on a nonfunction: ' + inspect(nonFunction)
				);
			});

			var args = [];
			var onDisposeAsync = function onDisposeAsync() {
				args.push({
					count: arguments.length,
					args: Array.prototype.slice.call(arguments)
				});
			};

			var sentinel = { sentinel: true };
			instance.adopt(undefined, onDisposeAsync);
			instance.adopt(null, onDisposeAsync);
			instance.adopt(sentinel, onDisposeAsync);

			st.deepEqual(args, [], 'does not call the disposable immediately');

			return instance.disposeAsync().then(function (x) {
				st.equal(x, undefined, 'returns undefined');

				st.deepEqual(args, [
					{ count: 1, args: [sentinel] },
					{ count: 1, args: [null] },
					{ count: 1, args: [undefined] }
				], 'disposes the adopted things in reverse order');

				st['throws'](
					function () { instance.adopt(onDisposeAsync); },
					ReferenceError,
					'throws when already disposed: ' + inspect(instance)
				);

				var instance2 = new AsyncDisposableStack();
				instance2.adopt(null, throwsSentinel);

				return instance2.disposeAsync().then(
					function () {
						st.fail('dispose with a throwing disposable failed to throw');
					},
					function (e) {
						st.equal(e, throwSentinel, 'throws `throwSentinel`');
					}
				);
			});
		});

		t.test('move', { skip: typeof Promise !== 'function' }, function (st) {
			var disposed = new AsyncDisposableStack();
			return disposed.disposeAsync().then(function () {
				st['throws'](
					function () {
						disposed.move();
					},
					ReferenceError,
					'throws on a disposed AsyncDisposableStack: ' + inspect(disposed)
				);

				var instance = new AsyncDisposableStack();

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

				return newStack.disposeAsync().then(function () {
					st.equal(count, 2, '`increment` has been called exactly twice');

					st.equal(newStack.disposed, true, 'new stack is now disposed');
				});
			});
		});

		t.test('Symbol.asyncDispose', { skip: !symbolAsyncDispose }, function (st) {
			st.equal(
				AsyncDisposableStack.prototype[symbolAsyncDispose],
				AsyncDisposableStack.prototype.disposeAsync,
				'is the same function as `disposeAsync`'
			);

			st.end();
		});

		t.test('disposeAsync', { skip: typeof Promise !== 'function' }, function (st) {
			var disposed = new AsyncDisposableStack();
			return disposed.disposeAsync().then(function () {
				st.ok(disposed.disposed, 'is disposed');
				return Promise.resolve(disposed.disposeAsync());
			}).then(function (result) {
				st.equal(result, undefined, 'disposing a disposed stack returns undefined');

				var instance = new AsyncDisposableStack();

				var count = 0;
				var increment = function increment() {
					count += 1;
				};
				instance.defer(increment);
				instance.defer(increment);

				st.equal(count, 0, '`increment` has not yet been called');
				st.equal(instance.disposed, false, 'stack is not disposed');

				return Promise.resolve(instance.disposeAsync()).then(function () {
					st.equal(count, 2, '`increment` has been called exactly twice');

					st.equal(instance.disposed, true, 'stack is now disposed');

					// test262: test/built-ins/AsyncDisposableStack/prototype/disposeAsync/Symbol.asyncDispose-method-not-async.js
					var resource = {
						disposed: false
					};
					resource[Symbol.asyncDispose] = function () {
						this.disposed = true;
					};

					var stack = new AsyncDisposableStack();
					stack.use(resource);
					return stack.disposeAsync().then(function () {
						st.equal(resource.disposed, true, 'Expected resource to have been disposed');
					});
				});
			});
		});

		t.test('toStringTag', { skip: !hasToStringTag() }, function (st) {
			var instance = new AsyncDisposableStack();

			st.equal(
				Object.prototype.toString.call(instance),
				'[object AsyncDisposableStack]',
				'has the correct [[Class]]'
			);

			st.end();
		});
	},
	'Symbol.dispose': function testSymbolDispose(t, symbolDispose) {
		t.test('Symbol support', { skip: !hasSymbols() }, function (st) {
			st.ok(isSymbol(symbolDispose), 'is a symbol');
			st.notOk(
				isRegisteredSymbol(symbolDispose),
				'is not a registered symbol',
				{ skip: brokenNodePolyfill ? 'node ships a Symbol.dispose polyfill that is registered' : false }
			);

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
			st.notOk(
				isRegisteredSymbol(symbolAsyncDispose),
				'is not a registered symbol',
				{ skip: brokenNodePolyfill ? 'node ships a Symbol.dispose polyfill that is registered' : false }
			);

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
