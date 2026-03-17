import { DDPCommon } from 'meteor/ddp-common';

// --- Construction & StreamerCentral ---

Tinytest.add('streamer - server - constructor registers in StreamerCentral', function (test) {
	const s = new Meteor.Streamer('srv-register');
	test.equal(Meteor.StreamerCentral.instances['srv-register'], s);
});

Tinytest.add('streamer - server - constructor returns existing instance for same name', function (test) {
	const s1 = new Meteor.Streamer('srv-singleton');
	const s2 = new Meteor.Streamer('srv-singleton');
	test.equal(s1, s2);
});

Tinytest.add('streamer - server - constructor sets default options', function (test) {
	const s = new Meteor.Streamer('srv-defaults');
	test.isTrue(s.retransmit);
	test.isFalse(s.retransmitToSelf);
});

Tinytest.add('streamer - server - constructor accepts custom options', function (test) {
	const s = new Meteor.Streamer('srv-custom-opts', { retransmit: false, retransmitToSelf: true });
	test.isFalse(s.retransmit);
	test.isTrue(s.retransmitToSelf);
});

Tinytest.add('streamer - server - subscriptionName returns stream-name', function (test) {
	const s = new Meteor.Streamer('srv-subname');
	test.equal(s.subscriptionName, 'stream-srv-subname');
});

Tinytest.add('streamer - server - name setter validates string', function (test) {
	const s = new Meteor.Streamer('srv-name-validate');
	test.throws(function () {
		s.name = 123;
	});
});

Tinytest.add('streamer - server - retransmit setter validates boolean', function (test) {
	const s = new Meteor.Streamer('srv-retransmit-validate');
	test.throws(function () {
		s.retransmit = 'yes';
	});
});

// --- Default permissions ---

Tinytest.addAsync('streamer - server - default permissions deny read and write, allow emit', async function (test) {
	const s = new Meteor.Streamer('srv-default-perms');
	const scope = {};

	test.isFalse(await s.isReadAllowed(scope, 'event', []));
	test.isTrue(await s.isEmitAllowed(scope, 'event'));
	test.isFalse(await s.isWriteAllowed(scope, 'event', []));
});

// --- allowRead ---

Tinytest.addAsync('streamer - server - allowRead all permits any scope', async function (test) {
	const s = new Meteor.Streamer('srv-read-all');
	s.allowRead('all');
	test.isTrue(await s.isReadAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowRead none denies any scope', async function (test) {
	const s = new Meteor.Streamer('srv-read-none');
	s.allowRead('none');
	test.isFalse(await s.isReadAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowRead logged permits scope with userId', async function (test) {
	const s = new Meteor.Streamer('srv-read-logged');
	s.allowRead('logged');
	test.isTrue(await s.isReadAllowed({ userId: 'user1' }, 'event', []));
	test.isFalse(await s.isReadAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowRead true/false boolean shortcuts', async function (test) {
	const s = new Meteor.Streamer('srv-read-bool');
	s.allowRead(true);
	test.isTrue(await s.isReadAllowed({}, 'event', []));
	s.allowRead(false);
	test.isFalse(await s.isReadAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowRead with custom function', async function (test) {
	const s = new Meteor.Streamer('srv-read-fn');
	s.allowRead(function (eventName) {
		return this.userId === 'admin' && eventName === 'secret';
	});

	test.isTrue(await s.isReadAllowed({ userId: 'admin' }, 'secret', []));
	test.isFalse(await s.isReadAllowed({ userId: 'user' }, 'secret', []));
	test.isFalse(await s.isReadAllowed({ userId: 'admin' }, 'other', []));
});

Tinytest.addAsync('streamer - server - allowRead per-event overrides global', async function (test) {
	const s = new Meteor.Streamer('srv-read-perevent');
	s.allowRead('none');
	s.allowRead('special', 'all');

	test.isTrue(await s.isReadAllowed({}, 'special', []));
	test.isFalse(await s.isReadAllowed({}, 'other', []));
});

// --- allowEmit ---

Tinytest.addAsync('streamer - server - allowEmit all permits any scope', async function (test) {
	const s = new Meteor.Streamer('srv-emit-all');
	s.allowEmit('all');
	test.isTrue(await s.isEmitAllowed({}, 'event'));
});

Tinytest.addAsync('streamer - server - allowEmit none denies any scope', async function (test) {
	const s = new Meteor.Streamer('srv-emit-none');
	s.allowEmit('none');
	test.isFalse(await s.isEmitAllowed({}, 'event'));
});

Tinytest.addAsync('streamer - server - allowEmit logged permits scope with userId', async function (test) {
	const s = new Meteor.Streamer('srv-emit-logged');
	s.allowEmit('logged');
	test.isTrue(await s.isEmitAllowed({ userId: 'user1' }, 'event'));
	test.isFalse(await s.isEmitAllowed({}, 'event'));
});

Tinytest.addAsync('streamer - server - allowEmit with custom function', async function (test) {
	const s = new Meteor.Streamer('srv-emit-fn');
	s.allowEmit(function () {
		return this.userId === 'vip';
	});

	test.isTrue(await s.isEmitAllowed({ userId: 'vip' }, 'event'));
	test.isFalse(await s.isEmitAllowed({ userId: 'normal' }, 'event'));
});

Tinytest.addAsync('streamer - server - allowEmit true/false boolean shortcuts', async function (test) {
	const s = new Meteor.Streamer('srv-emit-bool');
	s.allowEmit(true);
	test.isTrue(await s.isEmitAllowed({}, 'event'));
	s.allowEmit(false);
	test.isFalse(await s.isEmitAllowed({}, 'event'));
});

// --- allowWrite ---

Tinytest.addAsync('streamer - server - allowWrite all permits any scope', async function (test) {
	const s = new Meteor.Streamer('srv-write-all');
	s.allowWrite('all');
	test.isTrue(await s.isWriteAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowWrite none denies any scope', async function (test) {
	const s = new Meteor.Streamer('srv-write-none');
	s.allowWrite('none');
	test.isFalse(await s.isWriteAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowWrite logged permits scope with userId', async function (test) {
	const s = new Meteor.Streamer('srv-write-logged');
	s.allowWrite('logged');
	test.isTrue(await s.isWriteAllowed({ userId: 'user1' }, 'event', []));
	test.isFalse(await s.isWriteAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowWrite with custom function', async function (test) {
	const s = new Meteor.Streamer('srv-write-fn');
	s.allowWrite(function (eventName, arg1) {
		return this.userId === 'admin' && arg1 === 'allowed';
	});

	test.isTrue(await s.isWriteAllowed({ userId: 'admin' }, 'event', ['allowed']));
	test.isFalse(await s.isWriteAllowed({ userId: 'admin' }, 'event', ['denied']));
	test.isFalse(await s.isWriteAllowed({ userId: 'user' }, 'event', ['allowed']));
});

Tinytest.addAsync('streamer - server - allowWrite true/false boolean shortcuts', async function (test) {
	const s = new Meteor.Streamer('srv-write-bool');
	s.allowWrite(true);
	test.isTrue(await s.isWriteAllowed({}, 'event', []));
	s.allowWrite(false);
	test.isFalse(await s.isWriteAllowed({}, 'event', []));
});

Tinytest.addAsync('streamer - server - allowWrite per-event overrides global', async function (test) {
	const s = new Meteor.Streamer('srv-write-perevent');
	s.allowWrite('none');
	s.allowWrite('special', 'all');

	test.isTrue(await s.isWriteAllowed({}, 'special', []));
	test.isFalse(await s.isWriteAllowed({}, 'other', []));
});

// --- Transformers ---

Tinytest.add('streamer - server - transform registers event-specific transformer', function (test) {
	const s = new Meteor.Streamer('srv-transform-event');
	s.transformers = {};
	const fn = function () {};
	s.transform('myEvent', fn);
	test.equal(s.transformers['myEvent'].length, 1);
	test.equal(s.transformers['myEvent'][0], fn);
});

Tinytest.add('streamer - server - transform with no event name registers global', function (test) {
	const s = new Meteor.Streamer('srv-transform-global');
	s.transformers = {};
	const fn = function () {};
	s.transform(fn);
	test.equal(s.transformers['__all__'].length, 1);
	test.equal(s.transformers['__all__'][0], fn);
});

Tinytest.add('streamer - server - applyTransformers applies global transformer', function (test) {
	const s = new Meteor.Streamer('srv-apply-global');
	s.transformers = {};
	s.transform(function (eventName, args) {
		return [args[0] * 2];
	});

	const scope = { tranformed: false };
	const result = s.applyTransformers(scope, 'any', [5]);
	test.equal(result[0], 10);
	test.isTrue(scope.tranformed);
});

Tinytest.add('streamer - server - applyTransformers applies event-specific transformer', function (test) {
	const s = new Meteor.Streamer('srv-apply-specific');
	s.transformers = {};
	s.transform('double', function (val) {
		return [val * 2];
	});

	const scope = { tranformed: false };
	const result = s.applyTransformers(scope, 'double', [7]);
	test.equal(result[0], 14);
	test.isTrue(scope.tranformed);
});

Tinytest.add('streamer - server - applyTransformers global runs before event-specific', function (test) {
	const s = new Meteor.Streamer('srv-transform-order');
	s.transformers = {};
	const order = [];

	s.transform(function (eventName, args) {
		order.push('global');
		return args;
	});

	s.transform('myEvent', function (...args) {
		order.push('specific');
		return args;
	});

	s.applyTransformers({ tranformed: false }, 'myEvent', ['data']);
	test.equal(order[0], 'global');
	test.equal(order[1], 'specific');
});

Tinytest.add('streamer - server - applyTransformers chains transformers', function (test) {
	const s = new Meteor.Streamer('srv-transform-chain');
	s.transformers = {};

	s.transform('math', function (val) {
		return [val + 10];
	});

	s.transform('math', function (val) {
		return [val * 2];
	});

	const result = s.applyTransformers({ tranformed: false }, 'math', [5]);
	// First: 5 + 10 = 15, then: 15 * 2 = 30
	test.equal(result[0], 30);
});

Tinytest.add('streamer - server - applyTransformers wraps non-array return', function (test) {
	const s = new Meteor.Streamer('srv-transform-wrap');
	s.transformers = {};
	s.transform('wrap', function (val) {
		return val * 3;
	});

	const result = s.applyTransformers({ tranformed: false }, 'wrap', [4]);
	test.isTrue(Array.isArray(result));
	test.equal(result[0], 12);
});

Tinytest.add('streamer - server - applyTransformers passes methodScope as this', function (test) {
	const s = new Meteor.Streamer('srv-transform-scope');
	s.transformers = {};
	s.transform('scoped', function (val) {
		return [this.userId + '-' + val];
	});

	const scope = { userId: 'admin', tranformed: false };
	const result = s.applyTransformers(scope, 'scoped', ['data']);
	test.equal(result[0], 'admin-data');
});

// --- Subscription Management ---

Tinytest.add('streamer - server - addSubscription adds to arrays', function (test) {
	const s = new Meteor.Streamer('srv-add-sub');
	s.subscriptions = [];
	s.subscriptionsByEventName = {};
	const mockSub = { subscription: {}, eventName: 'chat' };

	test.equal(s.subscriptions.length, 0);
	s.addSubscription(mockSub, 'chat');
	test.equal(s.subscriptions.length, 1);
	test.equal(s.subscriptionsByEventName['chat'].length, 1);
});

Tinytest.add('streamer - server - addSubscription creates event array if missing', function (test) {
	const s = new Meteor.Streamer('srv-add-sub-create');
	s.subscriptions = [];
	s.subscriptionsByEventName = {};
	test.equal(s.subscriptionsByEventName['new-event'], undefined);

	const mockSub = { subscription: {} };
	s.addSubscription(mockSub, 'new-event');
	test.isTrue(Array.isArray(s.subscriptionsByEventName['new-event']));
	test.equal(s.subscriptionsByEventName['new-event'].length, 1);
});

Tinytest.add('streamer - server - removeSubscription removes from arrays', function (test) {
	const s = new Meteor.Streamer('srv-remove-sub');
	const mockSub = { subscription: {} };
	s.addSubscription(mockSub, 'chat');
	test.equal(s.subscriptions.length, 1);

	s.removeSubscription(mockSub, 'chat');
	test.equal(s.subscriptions.length, 0);
	test.equal(s.subscriptionsByEventName['chat'].length, 0);
});

Tinytest.add('streamer - server - removeSubscription handles non-existent gracefully', function (test) {
	const s = new Meteor.Streamer('srv-remove-noexist');
	const mockSub = { subscription: {} };
	// Should not throw
	s.removeSubscription(mockSub, 'nonexistent');
	test.isTrue(true);
});

// --- Server Emit ---

Tinytest.addAsync('streamer - server - _emit sends DDP message to subscriptions', async function (test) {
	const s = new Meteor.Streamer('srv-emit-ddp');
	s.allowEmit('all');

	let sentMsg = null;
	const mockSub = {
		subscription: {
			_session: {
				socket: {
					send: function (msg) { sentMsg = msg; }
				}
			},
			connection: { id: 'conn1' }
		}
	};

	s.addSubscription(mockSub, 'chat');
	await s._emit('chat', ['hello'], undefined, false);

	test.isTrue(sentMsg !== null);
	const parsed = DDPCommon.parseDDP(sentMsg);
	test.equal(parsed.msg, 'changed');
	test.equal(parsed.collection, 'stream-srv-emit-ddp');
	test.equal(parsed.fields.eventName, 'chat');
	test.equal(parsed.fields.args[0], 'hello');
});

Tinytest.addAsync('streamer - server - _emit skips origin when retransmitToSelf is false', async function (test) {
	const s = new Meteor.Streamer('srv-emit-skip-origin');
	s.allowEmit('all');

	const originConn = { id: 'origin' };
	let received = false;
	const mockSub = {
		subscription: {
			_session: {
				socket: { send: function () { received = true; } }
			},
			connection: originConn
		}
	};

	s.addSubscription(mockSub, 'event');
	await s._emit('event', ['data'], originConn, false);
	test.isFalse(received);
});

Tinytest.addAsync('streamer - server - _emit sends to origin when retransmitToSelf is true', async function (test) {
	const s = new Meteor.Streamer('srv-emit-to-self', { retransmitToSelf: true });
	s.allowEmit('all');

	const originConn = { id: 'origin' };
	let received = false;
	const mockSub = {
		subscription: {
			_session: {
				socket: { send: function () { received = true; } }
			},
			connection: originConn
		}
	};

	s.addSubscription(mockSub, 'event');
	await s._emit('event', ['data'], originConn, false);
	test.isTrue(received);
});

Tinytest.addAsync('streamer - server - _emit checks emit permission per subscription', async function (test) {
	const s = new Meteor.Streamer('srv-emit-perm-check');
	s.allowEmit(function () {
		return this.userId === 'allowed';
	});

	let allowedReceived = false;
	let deniedReceived = false;

	const allowedSub = {
		subscription: {
			userId: 'allowed',
			_session: {
				socket: { send: function () { allowedReceived = true; } }
			},
			connection: { id: 'c1' }
		}
	};

	const deniedSub = {
		subscription: {
			userId: 'denied',
			_session: {
				socket: { send: function () { deniedReceived = true; } }
			},
			connection: { id: 'c2' }
		}
	};

	s.addSubscription(allowedSub, 'event');
	s.addSubscription(deniedSub, 'event');
	await s._emit('event', ['data'], undefined, false);

	test.isTrue(allowedReceived);
	test.isFalse(deniedReceived);
});

Tinytest.addAsync('streamer - server - _emit does nothing when no subscriptions', async function (test) {
	const s = new Meteor.Streamer('srv-emit-nosubs');
	// Should not throw
	await s._emit('nonexistent-event', ['data'], undefined, false);
	test.isTrue(true);
});

Tinytest.addAsync('streamer - server - emit broadcasts via StreamerCentral', async function (test) {
	const s = new Meteor.Streamer('srv-emit-broadcast');

	let broadcastReceived = false;
	Meteor.StreamerCentral.on('broadcast', function (name) {
		if (name === 'srv-emit-broadcast') {
			broadcastReceived = true;
		}
	});

	await s.emit('event', 'data');
	test.isTrue(broadcastReceived);

	Meteor.StreamerCentral.removeAllListeners('broadcast');
});

Tinytest.addAsync('streamer - server - emitWithoutBroadcast does not broadcast', async function (test) {
	const s = new Meteor.Streamer('srv-emit-no-broadcast');

	let broadcastReceived = false;
	Meteor.StreamerCentral.on('broadcast', function (name) {
		if (name === 'srv-emit-no-broadcast') {
			broadcastReceived = true;
		}
	});

	await s.emitWithoutBroadcast('event', 'data');
	test.isFalse(broadcastReceived);

	Meteor.StreamerCentral.removeAllListeners('broadcast');
});

Tinytest.add('streamer - server - __emit calls parent EV emit', function (test) {
	const s = new Meteor.Streamer('srv-dunder-emit');
	let received = null;
	s.on('test', function (val) { received = val; });
	s.__emit('test', 'hello');
	test.equal(received, 'hello');
});
