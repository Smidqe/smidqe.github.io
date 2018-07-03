function load() {
	const self = {
		meta: {
			name: 'polls',
			group: 'modules',
		},
		events: ['newPoll', 'updatePoll', 'clearPoll'],
		functions: [], //?
		container: null,
		started: false,
		options: (poll) => {
			let element = poll || self.current();

			return element
				.find('tr')
				.map((index, data) => {
					return {
						count: $(data).find('.btn').text(),
						text: $(data).find('.label').text(),
					};
				}).toArray();
		},
		polls: () => {
			return self.container.find('.poll');
		},
		first: (active=true) => {
			if (!active)
				return self.container.find('.poll:not(.active):first');
			else
				return self.current();
		},
		hidden: (poll) => {
			return (poll || self.current()).find('.obscure').length > 0;
		},
		current: () => {
			return self.container.find('.poll:first');
		},
		listen: (key, callback) => {
			if (self.events.indexOf(key) === -1)
				return;

			socket.on(key, callback);
		},
		unlisten: (key, callback) => {
			if (self.events.indexOf(key) === -1)
				return;

			socket.removeListener(key, callback);
		},
		active: (poll) => {
			return (poll || self.current()).hasClass('active');
		},
		patch: () => {

		},
		unpatch: () => {	

		},
		init: () => {
			self.container = $('#pollpane');
			self.started = true;

			$.each(self.events, (index, value) => {
				self.listen(value, data => console.log('Event: ' + value, data));
			});
		},
	};

	return self;
}

SmidqeTweaks.add(load());
