Package.describe({
	name: 'rocketchat:streamer',
	version: '2.0.0',
	summary: 'DB less realtime communication for meteor',
	git: 'https://github.com/RocketChat/meteor-streamer.git'
});

Package.onUse(function(api) {
	api.versionsFrom('3.0');
	api.use('ddp-common');
	api.use('ecmascript');
	api.use('check');
	api.use('tracker', 'client');

	api.mainModule('server/server.js', 'server');
	api.mainModule('client/client.js', 'client');

	api.export('Streamer');
});

Package.onTest(function(api) {
	api.use('rocketchat:streamer');
	api.use(['ecmascript', 'ddp-common', 'check', 'tracker']);
	api.use(['tinytest', 'test-helpers']);

	api.addFiles('tests/ev_tests.js');
	api.addFiles('tests/server_tests.js', 'server');
	api.addFiles('tests/integration_tests.js');
});
