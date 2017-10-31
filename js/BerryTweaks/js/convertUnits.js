BerryTweaks.modules['convertUnits'] = (function(){
'use strict';

function each(obj, callback){
    Object.keys(obj).forEach(key => {
        callback(key, obj[key]);
    });
}

const self = {
    libs: [
        'https://dl.atte.fi/lib/quantities.min.js'
    ],
    symbols: {
        'EUR': /[€]/,
        'GBP': /[£]/,
        'USD': /[\u0024]/
    },
    units: {
        'length': {
            'metric': {
                regex: /(?:kilo|centi|mili)?met(er|re)s?|[kcm]?m/,
                units: ['m', 'cm', 'mm']
            },
            'imperial': {
                regex: /miles?|mi|yards?|yd|foot|feet|ft|inch|inches|in/,
                units: ['mile', 'yard', 'foot', 'inch']
            }
        },
        'area': {
            'metric': {
                regex: /hectares?|sq[kc]?m|[ck]?m\^2/,
                units: ['km^2', 'm^2', 'cm^2']
            },
            'imperial': {
                regex: /squaremiles?|sqmi|mi^2|square(?:feet|foot)|sqft|ft^2|squareinch(?:es)?|sqin|in^2|acres?/,
                units: ['mile^2', 'foot^2', 'inch^2']
            }
        },
        'mass': {
            'metric': {
                regex: /tonnes?|kilos?|(?:kilo)?grams?|k?g/,
                units: ['tonne', 'kg', 'g']
            },
            'imperial': {
                regex: /tons?|stones?|pounds?|lbs?|ounces?|oz/,
                units: ['ton', 'stone', 'pound', 'ounce']
            }
        },
        'volume': {
            'metric': {
                regex: /(?:desi)?lit(?:er|re)s?/,
                units: ['l', 'dl']
            },
            'imperial': {
                regex: /gallons?|gal|fluidounces?|floz|cups?|cp|quarts?|qt/,
                units: ['gallon', 'floz']
            }
        },
        'temperature': {
            'Celsius': {
                regex: /°?C|celsius|centigrades?/,
                units: ['tempC']
            },
            'Fahrenheit': {
                regex: /°?F|fahrenheits?/,
                units: ['tempF']
            }
        },
        'currency': {/* filled by loadRates() */}
    },
    preferred: null,
    rates: null,
    preProcess() {
        const num = /((?:\d+[., ])*\d+)/.source;
        each(self.units, (kind, options) => {
            each(options, (name, params) => {
                if ( !params.re ){
                    const source = [];
                    if ( params.prefix === true )
                        source.push(`\\b(?:${params.regex.source})\\s*${num}`);
                    if ( params.suffix !== false )
                        source.push(`${num}\\s*(?:${params.regex.source})\\b`);
                    params.re = new RegExp(source.join('|'), 'gi');
                }
            });
        });
    },
    loadRates() {
        $.getJSON('https://api.fixer.io/latest', data => {
            data.rates[data.base] = 1;
            self.rates = data.rates;
            self.units['currency'] = {};
            Object.keys(self.rates).forEach(unit => {
                self.units['currency'][unit] = {
                    regex: new RegExp(self.symbols[unit] ? `${self.symbols[unit].source}|${unit}` : unit),
                    units: [unit],
                    prefix: true
                };
            });
            self.cleanPreferred();
            self.preProcess();
        });
    },
    convertAll(str) {
        if ( !str || str[0] === '<' )
            return str;

        each(self.preferred, (kind, preferred) => {
            if ( !preferred )
                return;

            each(self.units[kind], (name, params) => {
                if ( name === preferred || !params.re )
                    return;

                if ( kind === 'currency' ){
                    str = str.replace(params.re, (match, number1, number2) => {
                        const number = number1 === undefined ? number2 : number1;
                        const converted = number / self.rates[name] * self.rates[self.preferred[kind]];
                        return `${match} (${converted.toFixed(2)} ${self.preferred[kind]})`;
                    });
                }
                else {
                    str = str.replace(params.re, match => {
                        const qty = Qty.parse(match);
                        if ( !qty )
                            return match;

                        let best = null;
                        for ( const target of self.units[kind][self.preferred[kind]].units ){
                            const candidate = qty.to(target);
                            if ( candidate.scalar > 1.0 ){
                                best = candidate;
                                break;
                            }
                            else if ( best === null )
                                best = candidate;
                        }
                        return best !== null ? `${match} (${best.toPrec(0.01).format()})` : match;
                    });
                }
            });
        });
        return str;
    },
    cleanPreferred() {
        Object.keys(self.preferred).forEach(kind => {
            if ( kind !== 'currency' && (!self.units.hasOwnProperty(kind) || !self.units[kind].hasOwnProperty(self.preferred[kind])) )
                delete self.preferred[kind];
        });
    },
    enable() {
        self.preferred = BerryTweaks.getSetting('preferredUnits', {});
        self.cleanPreferred();
        self.preProcess();
        self.loadRates();
    },
    showUnitsDialog() {
        const win = $('body').dialogWindow({
            title: 'Preferred Units',
            uid: 'preferredunits',
            center: true
        });
        $('<table>').append(
            Object.keys(self.units).sort().map(kind => {
                return $('<tr>').append(
                    $('<td>', {
                        text: kind
                    })
                ).append(
                    $('<td>').append(
                        $('<select>', {
                            on: {
                                change: BerryTweaks.raven.wrap(function change() {
                                    self.preferred[kind] = $(this).val();
                                    self.cleanPreferred();
                                    BerryTweaks.setSetting('preferredUnits', self.preferred);
                                })
                            }
                        }).append(
                            $('<option>', {
                                value: '',
                                text: '<ignore>',
                                selected: !self.preferred[kind]
                            })
                        ).append(
                            Object.keys(self.units[kind]).sort().map(unit => $('<option>', {
                                value: unit,
                                text: unit,
                                selected: self.preferred[kind] === unit
                            }))
                        )
                    )
                );
            }).filter(row => row.find('select').children('option').length > 2)
        ).appendTo(win);
        BerryTweaks.fixWindowHeight(win);
    },
    addSettings(container) {
        $('<a>', {
            href: 'javascript:void(0)',
            click: self.showUnitsDialog,
            text: 'Set preferred units'
        }).appendTo(container);
    },
    bind: {
        patchBefore: {
            addChatMsg(data) {
                if (self.preferred) {
                    data.msg.msg = self.convertAll(data.msg.msg);
                }
            }
        }
    }
};

return self;

})();
