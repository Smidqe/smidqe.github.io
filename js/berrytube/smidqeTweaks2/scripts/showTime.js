function load() {
    const self = {
        meta: {
            group: 'script',
            name: 'showTime'
        },
        settings: {
			group: 'time',
			values: [{
				title: 'Show time in toolbar',
				key: 'showTime',
			},{
				title: 'Show time in 12h format',
				key: '12hour'
			},{
				title: 'Show seconds',
				key: 'showSeconds',
			}]
		},
		element: {
			id: 'time',
			tooltip: 'Current time',
		},
		enabled: false,
		enable: () => {
			self.enabled = true;
		},
		disable: () => {
			self.enabled = false;
		},
        init: () => {
			SmidqeTweaks.modules.toolbar.add(self.element);

			//$('#st-toolbar-element-time').css('float', 'right');

			setInterval(() => {
				if (!self.enabled)
					return;

				let time = SmidqeTweaks.modules.time.get();
				let half = SmidqeTweaks.settings.get('12hour');

				if (half)
					time = SmidqeTweaks.modules.time.convert('12h', time);
				
				let text = '';
				let skip = ['format', 'suffix'];
				
				$.each(time, (key, val) => {
					if (skip.indexOf(key) !== -1)
						return;
					
					if (key === 's' && !SmidqeTweaks.settings.get('showSeconds'))
						return;

					if (key !== 'h')
						text += ':';

					text += val;
				})

				if (half)
					text += " " + time.suffix;

				SmidqeTweaks.modules.toolbar.update('time', text);
			}, 1000)
        },
    }
    return self;
}
SmidqeTweaks.add(load());
