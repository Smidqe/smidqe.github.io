function load() {
	//prevents maltweaks from refreshing (if used)
	const self = {
		meta: {
			name: 'preventVideoRefresh',
			group: 'scripts'
		},
		config: {
			group: 'patches',
			values: [{
				key: 'preventVideoRefresh',
				title: 'Prevent video refresh on YT error',
				depends: ['maltweaks'],
			}]
		},
		backup: null,
		enable: () => {
			if (!window.MT)
				return SmidqeTweaks.get('settings').set('preventVideoRefresh', false, true);

			window.onYTError = () => {return false};
		},
		disable: () => {
			if (!window.MT)
				return;

			window.onYTError = self.backup;
		},
		init: () => {
			self.backup = window.onYTError;
		}
	}

	return self;
}
