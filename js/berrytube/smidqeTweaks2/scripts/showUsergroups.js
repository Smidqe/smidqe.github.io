function load() {
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
    return self;
}
SmidqeTweaks.scripts['showUsergroups'] = load();
