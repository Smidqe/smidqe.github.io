function load() {
	const self = {
		meta: {
			name: 'settings',
			group: 'modules'
		},
		containers: {},
		storage: {},
		dependencies: {},
		get: (data) => {
			if (data.which === 'group')
				return self.containers.main.find('#st-settings-group-' + data.key);

			if (data.which === 'element')
				return self.containers.main.find('#st-setting-' + data.key);

			if (data.which === 'enabled')
				return self.storage.enabled[data.key]

			if (data.which === 'setting' || !(data instanceof Object))
				return self.storage[data.key || data];
		},
		set: (key, value, save) => { 
			self.storage[key] = value;

			if (save)
				self.save();

			self.refresh();
		},
		create: (data) => {
			if (!data.which)
				data.which = 'setting';

			if (data.which === 'group')
			{
				let title = data.key[0].toUpperCase() + data.key.slice(1);
				let label = $('<label>', {class: 'st-settings-group-label', text: title});
				let wrap = $('<div>', {id: 'st-settings-group-' + data.key, class: 'st-settings-group'});

				return wrap.append(label);
			}
	
			if (data.which === 'setting')
			{
				const input = $('<input>', {
					type: data.type || 'checkbox',
					checked: data.script ? self.storage.enabled.indexOf(data.key) !== -1 : self.storage[data.key],
					'data-key': data.key,
					'data-reload': data.reload || false,
					'data-script': data.script || false,
				})

				const element = $('<div>', {id: 'st-setting-' + data.key, class: 'st-setting-wrap'})
					.append($('<label>', {text: data.title}))
					.append(input);

				if (data.sub)
					element.addClass('st-setting-sub');

				if (data.default !== false)
					input.on('change', self.handle);

				if (data.callback)
					input.on('change', data.callback);
				
				return element;
			}
		},
		show: (data) => {
			if (data.which === 'element')
				self.get(data).css('display', 'block');

			if (data.which === 'group')
				self.get(data).css('display', 'block');
		},
		showWindow: () => {
			self.containers.main.find('#btn_submenu').on('click', self.showSubMenu);

			$("#settingsGui > ul").append($('<li>').append(self.containers.main));
			
			self.refresh();
		},
		hide: (data) => {
			if (data.which === 'element')
				self.get(data).css('display', 'none');

			if (data.which === 'group')
				self.get(data).css('display', 'none');
		},
		refresh: () => {
			$.each(SmidqeTweaks.names.groups, (index, val) => {
				let data = {which: 'group', key: val};
				let children = self.get(data).children().length;

				if (children <= 1)
					self.hide(data);
				else
					self.show(data)
			});

			$.each(self.dependencies, (key, val) => {
				let data = self.get({which: 'setting', key: key});

				if (data)
					$.each(val, index => self.show({which: 'element', key: val[index]}));
				else
					$.each(val, index => self.hide({which: 'element', key: val[index]}));
			})
		},
		load: () => {
			self.storage = JSON.parse(localStorage.SmidqeTweaks || '{}');
			
			if (!self.storage.enabled)
				self.storage.enabled = [];

			//update the names to SmidqeTweaks main file, since it handles 
			SmidqeTweaks.names.enabled = self.storage.enabled || [];

			if (self.storage.enabled.length > 0)
				SmidqeTweaks.update();
		},
		save: () => {
			localStorage.SmidqeTweaks = JSON.stringify(self.storage);
		},
		handle: function() {
			let checked = $(this).prop('checked');
			let key = $(this).data('key');

			self.set(key, checked, true);

			if (SmidqeTweaks.names.scripts.indexOf(key) !== -1)
			{
				let script = SmidqeTweaks.scripts[key]

				if (checked)
					script.enable();
				else
					script.disable();
			}
		},
		showSubMenu: () => {
			let window = $('body').dialogWindow({
				title: 'SmidqeTweaks scripts',
				uid: 'stscripts',
				center: true,
			}).append(self.containers.scripts);
		},
		append: (mod) => {
			if (!mod.config)
				return;

			$.each(mod.config.values, (index, value) => {
				let setting = self.create(value);

				self.get({which: 'group', key: value.group || mod.config.group}).append(setting);
				$.each(value.depends || [], (index, val) => {
					if (!self.dependencies[val])
						self.dependencies[val] = [];

					self.dependencies[val].push(value.key);
				});
			})

			self.save();
		},
		createScriptContainer: () => {
			const deps = $('<fieldset>', {})
				.append($('<legend>', {text: '3rd-party scripts/dependencies'}))
			
			const scripts = $('<fieldset>', {})
				.append($('<legend>', {text: 'Select scripts to enable'}));

			$.each(['maltweaks', 'berrytweaks'], (index, key) => {
				deps.append(self.create({
					key: key,
					title: SmidqeTweaks.descriptions[key],
				}))
			})

			const handler = function() {
				let data = {
					dir: 'scripts',
					name: $(this).data('key')
				}

				if ($(this).prop('checked'))
					SmidqeTweaks.load(data);
				else
					SmidqeTweaks.unload(data);

				if ($(this).prop('checked'))
					self.storage.enabled.push(data.name);
				else
					self.storage.enabled = self.storage.enabled.filter(val => val !== data.name);

				SmidqeTweaks.names.enabled = self.storage.enabled;
				self.save();
			}

			$.each(SmidqeTweaks.names.scripts, (index, key) => {
				const setting = self.create({
					default: false,
					callback: handler,
					key: key,
					script: key,
					title: SmidqeTweaks.descriptions[key],
				})

				scripts.append(setting);
			})

			self.containers.scripts.append(deps, scripts);
		},
		remove: (data) => {
			if (data.dir === 'modules')
				return;

			self.storage.enabled.filter(key => {key !== data.name});
			
			$.each(SmidqeTweaks.scripts[data.name].config.values, (index, val) => {
				self.containers.main.find('#st-setting-' + val.key).remove();
			})

			self.save();
			self.refresh();
		},
		start: (data) => {
			if (!data.key || !data.mod)
				return;

			if (self.get({which: 'setting', key: data.key}))
				data.mod.enable();
		},
		init: () => {
			self.load();

			SmidqeTweaks.patch([
				{container: {obj: window, name: 'window'}, name: 'showConfigMenu', after: true, callback: self.showWindow},
				{container: {obj: window.SmidqeTweaks, name: 'smidqetweaks'}, name: 'notify', after: true, callback: self.start},
				{container: {obj: window.SmidqeTweaks, name: 'smidqetweaks'}, name: 'start', after: false, callback: self.append},
				{container: {obj: window.SmidqeTweaks, name: 'smidqetweaks'}, name: 'unload', after: false, callback: self.remove}
			]);	
			
			self.containers = {
				scripts: $('<div>'),
				main: $('<fieldset>')
					.append($('<legend>', { text: 'SmidqeTweaks' }))
					.append($('<button>', {id: 'btn_submenu', text: 'Scripts'})),
			}

			$.each(SmidqeTweaks.names.groups, (index, key) => {
				self.containers.main.append(self.create({which: 'group', key: key}))
			})

			self.createScriptContainer();
	
			self.started = true;
		},
	}

	return self;
}

SmidqeTweaks.add(load());
