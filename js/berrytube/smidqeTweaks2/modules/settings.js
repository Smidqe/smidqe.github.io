/*
	-> group
		-> elems...
*/

function load() {
	const self = {
		meta: {
			name: 'settings',
			group: 'modules'
		},
		containers: {},
		storage: {
			values: {},
			elements: {},
			enabled: [],
		},
		started: false,
		save: () => {
			let data = {
				enabled: self.storage.enabled,
				values: self.storage.values
			};
	
			$.each(self.storage.values || [], (key, setting) => {
				data.values[key] = setting;
			});
	
			localStorage.SmidqeTweaks = JSON.stringify(data);
		},
		load: () => {
			let data = JSON.parse(localStorage.SmidqeTweaks || '{}');

			self.storage.enabled = data.enabled || [];
			self.storage.values = data.values || {};

			if (self.storage.enabled.length > 0)
			{
				SmidqeTweaks.names.enabled = self.storage.enabled;
				SmidqeTweaks.update();
			}
		},
		create: (data) => {
			const input = $('<input>', {
				type: data.type || 'checkbox',
				checked: self.storage.values[data.key] || false,
				'data-key': data.key,
				'data-toggle': data.toggle || false,
				'data-script': data.script || false,
			});

			if (input.data('toggle'))
				input.prop('checked', self.storage.enabled.indexOf(data.key) !== -1);

			const element = $('<div>', {id: 'st-setting-' + data.key, class: 'st-setting-wrap'})
				.append($('<label>', {text: data.title}))
				.append(input);

			if (data.sub)
				element.addClass('st-setting-sub');

			if (data.callback)
				input.on('change', data.callback);

			return element;
		},
		append: (config) => {
			if (!config)
				return;
	
			$.each(config.values, (index, setting) => {
				let group = setting.group || config.group;
				let object = {
					depends: setting.depends || [],
					element: self.create($.extend(setting, {callback: self.handle, script: SmidqeTweaks.names.scripts.indexOf(setting.key) !== -1})),
					script: SmidqeTweaks.names.scripts.indexOf(setting.key) !== -1,
				};

				self.storage.elements[setting.key] = object;
				self.containers.main.find('#st-settings-group-' + group).append(object.element);

				self.refresh(setting.key);
			});
		},
		handle: function() {
			let key = $(this).data('key');
			let checked = $(this).prop('checked');
			let toggle = $(this).data('toggle');
			let script = $(this).data('script');

			if (script)
			{
				if (!toggle)
				{
					let script = SmidqeTweaks.get(key);
					if (checked)
						script.enable();
					else
						script.disable();

					self.set(key, checked);
				}
				else
				{
					let data = {dir: 'scripts', name: key};

					if (checked) 
					{
						SmidqeTweaks.load(data);
						self.storage.enabled.push(key);
					} 
					else 
					{
						SmidqeTweaks.unload(data);
						self.storage.enabled = self.storage.enabled.filter(value => value === key);
					}
				}

				self.save();
			}
			else
				self.set(key, checked);

			self.refresh();
		},
		remove: (config) => {
			if (!config)
				return;

			$.each(config.values, (index, setting) => {
				self.storage.elements[setting.key].element.remove();
				self.storage.enabled = self.storage.enabled.filter(value => value !== setting.key);

				delete self.storage.elements[setting.key];

				self.refresh(setting.key);
			});
		},
		refresh: (key) => {
			$.each(self.storage.elements, (key, setting) => { 
				let show = true;
	
				$.each(setting.depends, (index, key) => {
					if (!show)
						return;
	
					if (!self.storage.values[key])
						show = false;
				});
	
				setting.element.css('display', show ? 'block' : 'none');
			});

			$.each(self.containers.main.find('.st-settings-group'), (index, group) => {
				$(group).css('display', $(group).children().length <= 1 ? 'none' : 'block');
			});
		},
		get: (key, which) => {
			if (!which)
				return self.storage.values[key];
	
			let element = self.storage.elements[key];
	
			switch(which) {
				case 'script': return element.script;
				case 'element': return element;
				case 'dependencies': return element.depends;
			}
		},
		set: (key, value, save=true) => {
			self.storage.values[key] = value;

			if (save)
				self.save();

			self.refresh();
		},
		patch: (key, callback) => {
			let data = {
				container: {obj: window, name: 'settings'},
				name: key,
				after: true,
				callback: callback
			};
	
			if (key === 'notify')
				data.container = {obj: window.SmidqeTweaks, name: 'settings'};
	
			SmidqeTweaks.patch(data);
		},
		showScriptMenu: () => {
			$('body').dialogWindow({
				title: 'SmidqeTweaks scripts',
				uid: 'stscripts',
				center: true,
			}).append(self.containers.scripts);

			self.containers.scripts.find('input').on('click', self.handle);
		},
		showMenu: (sub) => {
			$("#settingsGui > ul").append($('<li>').append(self.containers.main));
			
			self.containers.main.find('#btn_submenu').on('click', self.showScriptMenu);
			self.containers.main.find('input').on('change', self.handle);

			self.refresh();
		},
		berrytweaks: (key) => {
			if (!window.BerryTweaks)
				return;

			return BerryTweaks.loadSettings().enabled[key] || false;
		},
		init: () => {
			self.load();
	
			self.patch('showConfigMenu', self.showMenu);
			self.patch('notify', (data) => {
				if (data.dir === 'modules')
					return;
	
				if (data.id === 'moduleAdd') {
					self.append(data.mod.config);

					if (self.get(data.key))
						data.mod.enable();
				}

				if (data.id === 'moduleUnload')
					self.remove(data.data.config);
			});

			self.containers = { 
				main: $('<fieldset>')
					.append(
						$('<legend>', {text: 'SmidqeTweaks'}),
						$('<button>', {id: 'btn_submenu', text: 'Scripts'}),
						SmidqeTweaks.names.groups.map(name => {
							return $('<div>', {
								id: 'st-settings-group-' + name, class: 'st-settings-group'
							})
							.append($('<label>', {
								class: 'st-settings-group-label', text: name[0].toUpperCase() + name.slice(1)
							}));
						})
					),
				scripts: $('<div>')
					.append($('<fieldset>').append(
						$('<legend>', {text: '3rd party scripts'}),
						SmidqeTweaks.names.others.map((key) => {
							return self.create({
								key: key,
								title: SmidqeTweaks.descriptions[key],
							});
						})
					))
					.append($('<fieldset>').append(
						$('<legend>', {text: 'Toggle to enable/disable a script'}),
						SmidqeTweaks.names.scripts.map((key) => {

							return self.create({
								key: key,
								script: key,
								title: SmidqeTweaks.descriptions[key],
								toggle: true,
							});
						})
					)),
			};

			self.started = true;
		},
	};

	return self;
}

SmidqeTweaks.add(load());
