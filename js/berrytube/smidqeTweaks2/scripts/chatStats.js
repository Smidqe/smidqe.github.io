/*
	Will track some stats related to chat (current session)
	Such as
		-> my messages (+ characters)
		-> my emote amounts
		-> overall messages + characters + emotes + rcv + whatever else
		-> 

		-> chatStats
			-> chatOnlyMe
			-> save

		-> trackMessages
		-> trackCharacters
		-> trackEmotes
		-> trackRCV
		-> trackDrink
		-> trackRequest
		
*/

function load() {
	const self = {
		meta: {
			name: 'chatStats',
			group: 'scripts',
			requires: ['chat']
		},
		config: {
			/*

			*/
		},
		track: [],
		values: ['', ''],
		create: () => {

			value.amount = 0;
		},
		remove: () => {

		},
		update: (data) => {
			if (!window.NAME)
				return;

			if ((data.msg.nick !== window.NAME) && self.settings.get('chatOnlyMe'))
				return;

			$.each(self.config, (index, value) => {
				if (!value.created && value.key)
					self.create(value.key);

				if (value.created)
				{
					switch (value.key) {
						case 'trackMessages': value.amount += 1; break;
						case 'trackCharacters':  value.amount += data.msg.msg.length; break;
						case 'trackEmotes': value.amount += (data.msg.msg.match(/berryemote/g) || []).length; break;
						case 'trackRCV': value.amount += (data.msg.emote === 'rcv') | 0; break;
						case 'trackDrink': value.amount += data.msg.emote === 'drink' | 0; break;
						case 'trackRequest': value.amount += data.msg.emote === 'request' | 0; break;
					}

					self.stats.update(value.key, value.amount);
				}
			});

		},
		disable: () => {
			self.chat.unpatch('addChatMsg', self.update);
		},
		enable: () => {
			self.chat.patch('addChatMsg', self.update);
		},
		init: () => {
			self.chat = SmidqeTweaks.get('chat');
		},
	};

	return self;
}
