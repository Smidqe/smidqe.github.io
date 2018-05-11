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
				title: 'Show time in 12h format',
				key: '12hour',
				depends: ['showTime'],
				sub: true,
			},{
				title: 'Show seconds',
				key: 'showSeconds',
				depends: ['showTime'],
				sub: true,
			}]
		},
		element: {
			id: 'time',
			tooltip: 'Current time',
		},
		enabled: false,
		update: () => {
			if (!self.enabled)
				return;

			let time = self.time.get();
			let half = self.settings.get({which: 'setting', key:'12hour'});

			if (half)
				time = self.time.convert('12h', time);
			
			let text = '';
			let skip = ['format', 'suffix'];
			
			$.each(time, (key, val) => {
				if (skip.indexOf(key) !== -1)
					return;
				
				if (key === 's' && !self.settings.get({which: 'setting', key: 'showSeconds'}))
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
			self.enabled = true;
		},
		disable: () => {
			self.toolbar.remove('time');

			clearInterval(self.updater);
			self.enabled = false;
		},
		init: () => {
			self.toolbar = SmidqeTweaks.get('modules', 'toolbar');
			self.time = SmidqeTweaks.get('modules', 'time');
			self.settings = SmidqeTweaks.get('modules', 'settings');
		}
    }
    return self;
}
SmidqeTweaks.add(load());
