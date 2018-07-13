function load() {
	const self = {
		meta: {
			name: 'berryControls',
			group: 'scripts',
			requires: ['settings', 'windows']
		},
		config: {
			group: 'berry',
			values: [{
				key: 'berryControls',
				title: 'Modularize playlist and polls when given berry'
			}]
		},
		show: ['polls', 'playlist'],
		locations: {},
		elements: {},
		modularize: (leader) => {
			self.show.forEach(name => {
				self.windows.show({name: name, show: leader, modular: leader});
			});
		},
		enable: () => {
			if (window.TYPE == 0)
				socket.on('setLeader', self.modularize);

			//create buttons if not a regular user
		},
		disable: () => {
			socket.removeListener('setLeader', self.modularize);
		},
		init: () => {
			self.windows = SmidqeTweaks.get('windows');
		}
	};

	return self;
}

SmidqeTweaks.add(load());
