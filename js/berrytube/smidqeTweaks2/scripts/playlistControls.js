function load() {
	const self = {
		meta: {
			name: 'playlistControls',
			group: 'scripts',
			requires: ['windows'],
		},
		settings: {
			group: 'playlist',
			values: [{
				title: 'Make playlist modular',
				key: 'playlistControls',
				depends: ['layout']
			},{
				title: 'Force open on berry',
				key: 'playlistControlsBerry',
				depends: ['layout', 'playlistControls'],
				sub: true,
			},{
				title: 'Force open on login',
				key: 'playlistControlsLogin',
				depends: ['layout', 'playlistControls'],
				sub: true,
			}]
		},
		windows: null,
		open: () => {
			let allow = false;

			if (self.admin && SmidqeTweaks.settings.get('playlistControlsLogin'))
				allow = true;

			if (window.LEADER && SmidqeTweaks.settings.get('playlistControlsBerry'))
				allow = true;

			if (!allow)
			{
				$('#playlistAddControls').hide();
				return;
			}

			if (!self.windows.isModular('playlist'))
				self.windows.modularize('playlist', true);

			self.windows.show('playlist', true);
		},
		enable: () => {
			if (!self.admin)
				socket.on('handleACL', self.open);
			else
				self.open();
		},
		disable: () => {
			socket.removeListener('handleACL', self.open)

			if (self.windows.isModular('playlist'))
				self.windows.unmodularize('playlist');
		},
		init: () => {
			self.windows = SmidqeTweaks.get('windows', 'modules');
			self.admin = window.TYPE >= 1;
			
		},
	}

	return self;
}

SmidqeTweaks.add(load())
