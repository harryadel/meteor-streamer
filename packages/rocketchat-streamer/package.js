Package.describe({
	name: 'harry97:streamer',
	version: '2.0.0',
	summary: 'DB less realtime communication for meteor',
	git: 'https://github.com/harryadel/meteor-streamer.git'
});

Package.onUse(function(api) {
	api.versionsFrom(['1.10', '2.3', '3.0']);
	api.use('ddp-common');
	api.use('ecmascript');
	api.use('check');
	api.use('tracker', 'client');

	api.mainModule('server/server.js', 'server');
	api.mainModule('client/client.js', 'client');

	api.export('Streamer');
});
