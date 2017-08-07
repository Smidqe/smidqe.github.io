// ==UserScript==
// @name         BerryTweaks
// @namespace    https://atte.fi/berrytweaks/
// @version      0.5
// @description  A collection of BerryTube tweaks
// @author       Atte
// @match        http://berrytube.tv/*
// @match        http://www.berrytube.tv/*
// @match        http://tunnel.berrypun.ch/*
// @match        http://tunnel.q-z.xyz/*
// @match        http://btc.berrytube.tv:8000/*
// @match        https://bt-proxy.atte.fi/*
// @updateURL    https://atte.fi/berrytweaks/berrytweaks.user.js
// @downloadURL  https://atte.fi/berrytweaks/berrytweaks.user.js
// @grant        none
// ==/UserScript==

(function(){
'use strict';

const script = document.createElement('script');
script.setAttribute('src', 'https://atte.fi/berrytweaks/min/js/init.js?_=' + (new Date()).getTime());
document.head.appendChild(script);

})();
