function load() {
	const self = {
		meta: {
			name: 'pollControls',
			group: 'scripts',
			requires: ['windows', 'utilities']
		},
		settings: {
			group: 'poll',
			values: [{
				title: 'Make poll controls modular',
				key: 'pollControls',
				depends: ['layout']
			},{
				title: 'Force open on berry',
				key: 'pollControlsBerry',
				depends: ['layout', 'pollControls'],
				sub: true,
			},{
				title: 'Force open on login',
				key: 'pollControlsLogin',
				depends: ['layout', 'pollControls'],
				sub: true,
			}]
		},
		created: false,
		maltweaks: false,
		interval: null,
		modularize: () => {
			self.windows.create({
				id: 'pollControls',
				wrap: true,
				selector: '#pollControl',
				title: 'Poll Controls',
				classes: [],
			})

			self.windows.modularize('pollControls', true);
		},
		open: () => {
			let allow = false;

			if (self.admin && SmidqeTweaks.settings.get('pollControlsLogin'))
				allow = true;

			if (window.LEADER && SmidqeTweaks.settings.get('pollControlsBerry'))
				allow = true;

			if (!allow || !self.enabled)
				return;

			//wait for maltweaks if enabled
			self.interval = setInterval(() => {
				let ready = false;

				if (self.maltweaks && self.utilities.linearCheck(window.MT, window.MT.loaded))
					ready = true;
				
				if (!self.maltweaks)
					ready = true;

				if (ready && !self.windows.exists('pollControls'))
					self.modularize();

				if (ready)
				{
					self.windows.show('pollControls', true);
					self.windows.modularize('polls', true);
					self.windows.show('polls', true);
				}
				
				if (ready)
					clearInterval(self.interval);
			}, 500);
		},
		enable: () => {
			self.enabled = true;

			if (!self.admin)
				socket.on('handleACL', self.open);
			else
				self.open();
		},
		disable: () => {
			self.enabled = false;
			
			if (!self.admin)
				socket.removeListener('handleACL', self.open);
		},
		init: () => {
			self.windows = SmidqeTweaks.get('windows', 'modules');
			self.utilities = SmidqeTweaks.get('utilities', 'modules');
			
			self.admin = window.TYPE >= 1;
			self.maltweaks = SmidqeTweaks.settings.get('maltweaks');
		}
	}

	return self;
}

SmidqeTweaks.add(load());
