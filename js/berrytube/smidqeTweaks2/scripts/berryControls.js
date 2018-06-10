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
				title: 'Modularize controls when given berry'
			}]
		},
		windowses: [{
			id: 'pollControls',
			selector: '#pollControl',
		}, {
			id: 'playlistControls',
			selector: '#playlistAddControls',
		}],
		locations: {},
		elements: {},
		enabled: false,
		show: (data) => {
			$.each(self.windowses, (index, value) => {
				self.windows.show({modular: true, name: value.id, show: data});
			})
		},
		create: () => {
			$.each(self.windowses, (index, val) => {
				self.windows.create(val).append(self.elements[val.id]);
			})
		},
		enable: () => {
			self.enabled = true;

			if (window.TYPE == 0)
			{
				self.create();
				socket.on('setLeader', self.show);
			}
		},
		disable: () => {
			self.enabled = false;

			//remove the event listener from socket.io
			socket.removeListener('setLeader', self.show);
			
			$.each(self.windowses, (index, val) => {
				self.locations[val.id].append(self.elements[val.id]);
				self.windows.remove(val.id);
			})

			//hide the windows
			self.show(false);
		},
		init: () => {
			self.windows = SmidqeTweaks.get('windows');
		
			$.each(self.windowses, (index, val) => {
				let element = $(val.selector);

				self.elements[val.id] = element;
				self.locations[val.id] = element.parent();
			})
		}
	}

	return self;
}

SmidqeTweaks.add(load());
