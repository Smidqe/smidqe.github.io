/*
	Hides the video and also possibly will expand the chat to fullscreen
*/
function load() {
    const self = {
        name: 'hideVideo',
        button: {
            title: 'Toggle video',
            category: 'Berrytube',
            group: 'General',
            type: 'button',
            callbacks: {},
        },

        hasMal: false,
        running: true,
        hide: () => {
            if (window.MT)
                window.MT.disablePlayer();

            SmidqeTweaks.settings.set('video', false, true);
        },
        show: () => {
            if (window.MT)
                window.MT.restoreLocalPlayer();

            SmidqeTweaks.settings.set('video', true, true);
        },
        toggle: () => {
            self.hasMal = SmidqeTweaks.settings.get('maltweaks');

            if (!self.hasMal)
                return;

            if (self.running)
                self.hide();
            else
                self.show();
        },
        init: () => {
            self.button.callbacks.click = self.toggle;
            self.hasMal = SmidqeTweaks.settings.get('maltweaks');

            SmidqeTweaks.modules.menu.addElement(self.button);

            if (SmidqeTweaks.settings.get('video') === false && self.hasMal)
                self.hide();
        }
    }

    return self;
}

SmidqeTweaks.addScript('hideVideo', load());
