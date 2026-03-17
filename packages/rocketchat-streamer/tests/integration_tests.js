if (Meteor.isServer) {
	const integrationStreamer = new Meteor.Streamer('intg-test', { retransmitToSelf: true });
	integrationStreamer.allowRead('all');
	integrationStreamer.allowWrite('all');

	const deniedStreamer = new Meteor.Streamer('intg-denied');
	// defaults: read='none', write='none'

	const transformStreamer = new Meteor.Streamer('intg-transform', { retransmitToSelf: true });
	transformStreamer.allowRead('all');
	transformStreamer.allowWrite('all');
	transformStreamer.transform('sum', function (a, b) {
		return [a + b];
	});

	Meteor.methods({
		'intg-server-emit'(eventName, ...args) {
			integrationStreamer.emit(eventName, ...args);
		}
	});
}

if (Meteor.isClient) {
	Tinytest.addAsync('streamer - integration - client subscribes successfully', function (test, done) {
		const streamer = new Meteor.Streamer('intg-test');

		streamer.on('sub-test', function () {}).then(function () {
			streamer.removeAllListeners('sub-test');
			done();
		}).catch(function (err) {
			test.fail('Subscription failed: ' + err);
			done();
		});
	});

	Tinytest.addAsync('streamer - integration - client receives server-emitted event', function (test, done) {
		const streamer = new Meteor.Streamer('intg-test');

		streamer.on('server-msg', function (data) {
			test.equal(data, 'hello from server');
			streamer.removeAllListeners('server-msg');
			done();
		}).then(function () {
			Meteor.callAsync('intg-server-emit', 'server-msg', 'hello from server');
		});
	});

	Tinytest.addAsync('streamer - integration - client emit retransmits to self', function (test, done) {
		const streamer = new Meteor.Streamer('intg-test');

		streamer.on('echo', function (msg) {
			test.equal(msg, 'echo-data');
			streamer.removeAllListeners('echo');
			done();
		}).then(function () {
			streamer.emit('echo', 'echo-data');
		});
	});

	Tinytest.addAsync('streamer - integration - subscription denied for read none', function (test, done) {
		const streamer = new Meteor.Streamer('intg-denied');

		streamer.on('any-event', function () {
			test.fail('Should not receive event on denied stream');
			done();
		}).then(function () {
			test.fail('Subscription should have been denied');
			done();
		}).catch(function () {
			// Expected: subscription rejected because read='none'
			test.isTrue(true);
			done();
		});
	});

	Tinytest.addAsync('streamer - integration - transform applied on client write', function (test, done) {
		const streamer = new Meteor.Streamer('intg-transform');

		streamer.on('sum', function (result) {
			test.equal(result, 8);
			streamer.removeAllListeners('sum');
			done();
		}).then(function () {
			streamer.emit('sum', 3, 5);
		});
	});

	Tinytest.addAsync('streamer - integration - getLastMessageFromEvent returns cached message', function (test, done) {
		const streamer = new Meteor.Streamer('intg-test');

		streamer.on('cached-msg', function (data) {
			const last = streamer.getLastMessageFromEvent('cached-msg');
			test.isTrue(Array.isArray(last));
			test.equal(last[0], 'cache-test');
			streamer.removeAllListeners('cached-msg');
			done();
		}).then(function () {
			Meteor.callAsync('intg-server-emit', 'cached-msg', 'cache-test');
		});
	});
}
