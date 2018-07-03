/*
	Will track some stats related to chat (current session)
	Such as
		-> my messages (+ characters)
		-> my emote amounts
		-> overall messages + characters + emotes + rcv + whatever else
		-> 
*/

function load() {
	const self = {
		meta: {
			name: 'chatStats',
			group: 'scripts',
			requires: ['chat']
		},
		config: {
			
		},
		update: () => {
			$.each(self.config, () => {
				/*
				if (value.key)
					self.stats.update(value.pair, ???);

				*/
			})
		},
		disable: () => {

		},
		enable: () => {
			self.chat.patch('addChatMsg', (nick, text) => {
				if (window.NAME !== nick)
					return;

				self.update(data);
			});
		},
		init: () => {

		},
	}

	return self;
}
