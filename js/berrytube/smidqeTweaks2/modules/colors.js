/*
	TODO:

*/
function load() {
	const self = {
		meta: {
			group: 'modules',
			name: 'colors',
		},
		attached: [],
		started: false,
		copy: (src, dest, values) => {
			let res = values.map(attr => $(src).css(attr));
			
			$.each(res, (index, val) => {
				if ((values[index] === 'background-color') && (val === 'rgba(0, 0, 0, 0)'))
					return;

				$(dest).css(values[index], val);
			});
		},
		attach: (key, src, dest, values) => {
			self.attached.push({
				key: key,
				src: src,
				dest: dest,
				values: values,
			});

			self.update(key);
		},
		unattach: (key) => {
			self.attached = self.attached.filter(value => value.key !== key);
		},
		update: (key) => {
			if (key instanceof Array)
				return key.forEach(value => self.update(value));

			let elements = self.attached;

			if (key)
				elements = [self.attached.find((value) => value.key === key)];

			$.each(elements, (index, value) => {
				let source = $(value.src);
				let time = 0;

				//get the wait for transitions to happen if it exists (bloody maltweaks)
				time = source.css('transition-delay')
					.split(',')
					.reduce((sum, value) => 
						sum + parseInt(value.replace(/\D/g, '')
					), 0);
				
				setTimeout(() => {
					self.copy(value.src, value.dest, value.values);
				}, time * 1000 + 500);
			});
		},
		init: () => {
			SmidqeTweaks.patch({
				container: {obj: window, name: 'colors'},
				name: 'setColorTheme',
				callback: self.update,
				after: true
			});

			self.started = true;
		},
	};

	return self;
}

SmidqeTweaks.add(load());
