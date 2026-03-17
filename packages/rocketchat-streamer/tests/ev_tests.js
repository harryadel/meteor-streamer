import { EV } from '../lib/ev';

Tinytest.add('streamer - EV - constructor initializes empty handlers', function (test) {
	const ev = new EV();
	test.isTrue(typeof ev.handlers === 'object');
	test.equal(Object.keys(ev.handlers).length, 0);
});

Tinytest.add('streamer - EV - on registers handler', function (test) {
	const ev = new EV();
	const fn = function () {};
	ev.on('test', fn);
	test.equal(ev.listenerCount('test'), 1);
});

Tinytest.add('streamer - EV - on registers multiple handlers', function (test) {
	const ev = new EV();
	ev.on('test', function () {});
	ev.on('test', function () {});
	ev.on('test', function () {});
	test.equal(ev.listenerCount('test'), 3);
});

Tinytest.add('streamer - EV - emit calls handlers with args', function (test) {
	const ev = new EV();
	let received = [];
	ev.on('test', function (a, b) {
		received = [a, b];
	});
	ev.emit('test', 'hello', 42);
	test.equal(received[0], 'hello');
	test.equal(received[1], 42);
});

Tinytest.add('streamer - EV - emit calls multiple handlers', function (test) {
	const ev = new EV();
	let count = 0;
	ev.on('test', function () { count++; });
	ev.on('test', function () { count++; });
	ev.emit('test');
	test.equal(count, 2);
});

Tinytest.add('streamer - EV - emit with no handlers does not throw', function (test) {
	const ev = new EV();
	ev.emit('nonexistent', 'arg1');
	test.isTrue(true);
});

Tinytest.add('streamer - EV - emit passes EV instance as this', function (test) {
	const ev = new EV();
	let capturedThis = null;
	ev.on('test', function () {
		capturedThis = this;
	});
	ev.emit('test');
	test.equal(capturedThis, ev);
});

Tinytest.add('streamer - EV - emitWithScope sets custom this', function (test) {
	const ev = new EV();
	const scope = { userId: 'user123' };
	let capturedThis = null;
	ev.on('test', function () {
		capturedThis = this;
	});
	ev.emitWithScope('test', scope, 'arg1');
	test.equal(capturedThis.userId, 'user123');
});

Tinytest.add('streamer - EV - emitWithScope passes args', function (test) {
	const ev = new EV();
	let received = null;
	ev.on('test', function (val) {
		received = val;
	});
	ev.emitWithScope('test', {}, 'data');
	test.equal(received, 'data');
});

Tinytest.add('streamer - EV - once fires handler only once', function (test) {
	const ev = new EV();
	let count = 0;
	ev.once('test', function () {
		count++;
	});
	ev.emit('test');
	ev.emit('test');
	test.equal(count, 1);
});

Tinytest.add('streamer - EV - once removes itself from handlers', function (test) {
	const ev = new EV();
	ev.once('test', function () {});
	test.equal(ev.listenerCount('test'), 1);
	ev.emit('test');
	test.equal(ev.listenerCount('test'), 0);
});

Tinytest.add('streamer - EV - removeListener removes specific handler', function (test) {
	const ev = new EV();
	const fn = function () {};
	ev.on('test', fn);
	test.equal(ev.listenerCount('test'), 1);
	ev.removeListener('test', fn);
	test.equal(ev.listenerCount('test'), 0);
});

Tinytest.add('streamer - EV - removeListener does not remove other handlers', function (test) {
	const ev = new EV();
	const fn1 = function () {};
	const fn2 = function () {};
	ev.on('test', fn1);
	ev.on('test', fn2);
	ev.removeListener('test', fn1);
	test.equal(ev.listenerCount('test'), 1);
});

Tinytest.add('streamer - EV - removeListener on non-existent event does not throw', function (test) {
	const ev = new EV();
	ev.removeListener('nonexistent', function () {});
	test.isTrue(true);
});

Tinytest.add('streamer - EV - removeAllListeners clears all for event', function (test) {
	const ev = new EV();
	ev.on('test', function () {});
	ev.on('test', function () {});
	ev.removeAllListeners('test');
	test.equal(ev.listenerCount('test'), 0);
});

Tinytest.add('streamer - EV - removeAllListeners does not affect other events', function (test) {
	const ev = new EV();
	ev.on('a', function () {});
	ev.on('b', function () {});
	ev.removeAllListeners('a');
	test.equal(ev.listenerCount('a'), 0);
	test.equal(ev.listenerCount('b'), 1);
});

Tinytest.add('streamer - EV - listenerCount returns correct count', function (test) {
	const ev = new EV();
	test.equal(ev.listenerCount('test'), 0);
	ev.on('test', function () {});
	test.equal(ev.listenerCount('test'), 1);
	ev.on('test', function () {});
	test.equal(ev.listenerCount('test'), 2);
});

Tinytest.add('streamer - EV - listenerCount for non-existent event returns 0', function (test) {
	const ev = new EV();
	test.equal(ev.listenerCount('nonexistent'), 0);
});
