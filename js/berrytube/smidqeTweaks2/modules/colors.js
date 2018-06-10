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
			})
		},
		attach: (src, dest, values) => {
			self.attached.push({
				src: src,
				dest: dest,
				values: values,
			})

			self.update();
		},
		update: () => {
			$.each(self.attached, (index, value) => {
				let source = $(value.src);
				let dest = $(value.dest);
				let time = 0;

				//get the wait for transitions to happen if it exists
				time = source.css('transition-delay')
					.split(',')
					.reduce((sum, value) => 
						sum + parseInt(value.replace(/\D/g, '')
					), 0);
				
				setTimeout(() => {
					self.copy(value.src, value.dest, value.values);
				}, time * 1000 + 500)
			})
		},
		init: () => {
			SmidqeTweaks.patch({
				container: {obj: window, name: 'colors'},
				name: 'setColorTheme',
				callback: self.update,
				after: true
			})

			self.started = true;
		},
	}

	return self;
}

SmidqeTweaks.add(load());
