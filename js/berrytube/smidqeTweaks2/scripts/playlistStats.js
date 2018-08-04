/*
	What to track?
		- Amount of videos
		- 

*/

function load() {
	const self = {
		meta: {
			name: 'playlistStats',
			group: 'scripts',
			requires: ['settings', 'stats']
		},
		config: {

		},
		values: {
			'f': {},
			's': {},
		},
		update: () => {
			$.each(self.values, () => {

			});
		},
		enable: () => {

		},
		disable: () => {

		},
		init: () => {

		}
	};

	return self;
}

SmidqeTweaks.add(load());
