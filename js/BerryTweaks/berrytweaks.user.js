// ==UserScript==
// @name         BerryTweaks - Smidqes fork
// @namespace    https://smidqe.github.io/
// @version      0.5
// @description  A collection of BerryTube tweaks
// @author       Atte
// @match        http://berrytube.tv/*
// @match        http://www.berrytube.tv/*
// @match        http://tunnel.berrypun.ch/*
// @match        http://tunnel.q-z.xyz/*
// @match        http://btc.berrytube.tv:8000/*
// @match        https://bt-proxy.atte.fi/*
// @updateURL    https://smidqe.github.io/js/BerryTweaks/js/init.js
// @downloadURL  https://smidqe.github.io/js/BerryTweaks/js/init.js
// @grant        none
// ==/UserScript==

(function(){
'use strict';

const script = document.createElement('script');
script.setAttribute('src', 'https://smidqe.github.io/js/BerryTweaks/js/init.js?_=' + (new Date()).getTime());
document.head.appendChild(script);

})();
