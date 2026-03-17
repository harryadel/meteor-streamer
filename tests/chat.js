const streamer = new Meteor.Streamer('chat');

if(Meteor.isClient) {
	const messages = new Mongo.Collection(null);

	window.sendMessage = async function(text) {
		const user = await Meteor.userAsync();
		await streamer.emit('message', {
			type: 'user',
			user: user ? user.username : 'anonymous',
			text: text
		});
		await messages.insertAsync({
			type: 'self',
			text: text
		});
	};

	streamer.on('message', async function(message) {
		await messages.insertAsync(message);
	});

	Template.body.events({
		'keydown input'(e) {
			if (e.which === 13) {
				window.sendMessage(e.target.value);
				e.target.value = '';
			}
		}
	});

	Template.body.helpers({
		messages() {
			return messages.find();
		}
	});
}

if (Meteor.isServer) {
	streamer.allowRead('all');
	streamer.allowWrite('all');
}
