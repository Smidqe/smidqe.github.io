function load() {
    const self = {
        started: false,
        name: 'toolbar',
        buttons: {},
        add: (data) => {
            var element = $("<div>", {
                class: "st-toolbar-element",
                id: "st-toolbar-element-" + data.id,
                text: data.text,
            });

            if (data.toggle)
                element.on('click', function() {
                    $(this).toggleClass('active');
                })

            if (data.tooltip)
                element.attr('title', data.tooltip);

            if (SmidqeTweaks.settings.get(data.setting) || data.active)
                element.addClass('active');

            self.bar.append(element);

            $.each(data.callbacks, (key, value) => {
                self.addCallback(data.id, key, value);
            })
        },
        remove: (key) => {
            $('#st-toolbar-element-' + key).remove();
        },
        addCallback: (id, key, callback) => {
            $("#st-toolbar-element-" + id).on(key, callback);
        },
        show: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                $("#st-toolbar-element-" + sub).removeClass('hidden');
            })
        },
        updateText: (key, value) => {
            $('#st-toolbar-element-' + key).text(value);
        },
        hide: (key) => {
            $.each(self.buttons, (sub, value) => {
                if (key && key !== sub)
                    return;

                if (!self.buttons[sub].alwaysVisible)
                    $("#st-toolbar-element-" + sub).addClass('hidden');
            })
        },
        init: () => {
            self.bar = $("<div>", { id: "st-toolbar-wrap" });
            self.bar.insertBefore("#chatControls > .settings");

            self.started = true;
        },
    }

    return self;
}

SmidqeTweaks.addModule('toolbar', load());
