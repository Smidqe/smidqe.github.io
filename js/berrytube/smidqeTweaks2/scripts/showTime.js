function load() {
    const self = {
        meta: {
			group: 'scripts',
			name: 'showTime',
			requires: ['time', 'toolbar', 'settings'],
		},
        config: {
			group: 'time',
			values: [{
				title: 'Show time in toolbar',
				key: 'showTime',
			},{
				title: '12H format',
				key: '12hour',
				depends: ['showTime'],
				sub: true,
			},{
				title: 'Seconds',
				key: 'showSeconds',
				depends: ['showTime'],
				sub: true,
			}]
		},
		element: {
			id: 'time',
			tooltip: 'Current time',
		},
		update: () => {
			let time = self.time.get();
			let half = self.settings.get('12hour');

			if (half)
				time = self.time.convert('12h', time);
			
			let text = '';
			let skip = ['format', 'suffix'];
			
			$.each(time, (key, val) => {
				if (skip.indexOf(key) !== -1)
					return;
				
				if (key === 's' && !self.settings.get('showSeconds'))
					return;

				if (key !== 'h')
					text += ':';

				text += val;
			})

			if (half)
				text += " " + time.suffix;

			self.toolbar.update('time', text);
		},
		enable: () => {
			self.toolbar.add(self.element);
			self.updater = setInterval(self.update, 1000);
		},
		disable: () => {
			clearInterval(self.updater);
			self.toolbar.remove('time');
		},
		init: () => {
			self.toolbar = SmidqeTweaks.get('toolbar');
			self.time = SmidqeTweaks.get('time');
			self.settings = SmidqeTweaks.get('settings');
		}
    }
    return self;
}
SmidqeTweaks.add(load());
