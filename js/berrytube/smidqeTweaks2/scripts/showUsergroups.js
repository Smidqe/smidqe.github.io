const self = {
    show: () => {

    },
    enable: () => {
        $('#st-info-users').hover(() => {
            self.show();
        })
    },
    disable: () => {
        $('#st-info-users').off('hover', self.show);
    }
}

SmidqeTweaks.scripts['showUsergroups'] = self;
