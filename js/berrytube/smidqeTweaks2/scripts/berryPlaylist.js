function load() {
	const self = {
		meta: {
			name: 'berryPlaylist',
			group: 'scripts',
			requires: ['windows'],
		},
		settings: {
			group: 'playlist',
			values: [{
				title: 'Open playlist to a separate window when given berry',
				key: 'berryPlaylist',
				depends: ['layout'],
			}]
		},
		windows: null,
		enabled: false,
		enable: () => {
			self.enabled = true;
			socket.on('handleACL', self.modularize);
		},
		disable: () => {
			self.enabled = false;
			socket.removeListener('handleACL', self.modularize)
		},
		modularize: () => {
			if (!self.enabled)
				return;

			if (!self.windows.exists('playlist'))
				return;
			
			self.windows.modularize('playlist', window.LEADER);
			self.windows.show('playlist', window.LEADER);

			if (!window.LEADER)
				$('#playlistAddControls').hide();
		},
		init: () => {
			self.windows = SmidqeTweaks.get('windows', 'modules');
		},
	}

	return self;
}

SmidqeTweaks.add(load())
