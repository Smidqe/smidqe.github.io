$(function(){
'use strict';

$.ajax({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/raven.js/3.19.1/raven.min.js',
    dataType: 'script',
    cache: true,
    success: function() {
        const interval = setInterval(() => {
            if (!window.Raven) {
                return;
            }

            clearInterval(interval);
            window.BerryTweaks = {
                raven: Raven.noConflict()
            };

            BerryTweaks.raven.config('https://d709b359cd66469a8fdbd1b1e5d4d8c4@sentry.io/236977', {
                environment: 'atte.fi/berrytweaks/js/'.indexOf('/min/') === -1 ? 'development' : 'production',
                whitelistUrls: [/atte\.fi/],
                includePaths: [/https?:\/\/atte\.fi/],
                instrument: false,
                autoBreadcrumbs: {
                    xhr: true,
                    console: false,
                    dom: true,
                    location: false
                }
            }).install();

            if (window.NAME) {
                BerryTweaks.raven.setUserContext({
                    id: window.NAME
                });
            }

            $.ajax({
                url: 'https://atte.fi/berrytweaks/js/main.js',
                dataType: 'script',
                cache: true
            });
        }, 100);
    }
});

});
