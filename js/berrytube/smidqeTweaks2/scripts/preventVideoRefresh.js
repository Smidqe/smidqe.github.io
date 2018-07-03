function load() {
	const self = {
		meta: {
			name: 'preventVideoRefresh',
			group: 'scripts'
		},
		config: {
			group: 'patches',
			values: [{
				key: 'preventVideoRefresh',
				title: 'Prevent video refresh on YT error when using MalTweaks',
				depends: ['maltweaks'],
			}]
		},
		backup: null,
		enable: () => {
			if (!window.MT)
				return SmidqeTweaks.get('settings').set('preventVideoRefresh', false, true);

			self.backup = window.onYTError;
			window.onYTError = () => false;
		},
		disable: () => {
			if (!window.MT)
				return;

			window.onYTError = self.backup;
		},
	};

	return self;
}

SmidqeTweaks.add(load());
