/*
	Hides/shows the original emotes/settings button
*/
function load() {
    const self = {
        name: 'originals',
        group: 'menu',
        script: true,
        settings: [{
            title: "Show smaller menu",
            type: "checkbox",
            key: "minimizeMenu",
            callback: null,
        }],
		enable: () => {

			self.enabled = true;
		},

		disable: () => {
			self.enabled = false;
		},

		toggle: () => {

		},

        init: () => {
			self.backup = SmidqeTweaks.modules.menu.show;

			SmidqeTweaks.patch(SmidqeTweaks.modules.menu, 'show', () => {
				if (self.enabled)
				{
					self.show();
					return;
				}
			}, true);
        },
    }

    return self;
}

SmidqeTweaks.add(load());
