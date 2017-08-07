import glob
import json

base_aliases = {
    'Ajaxtitan': {'Ajaxtitan496'},
    'ayrl': {'aryl'},
    'Bassau': {'bassphone', 'BassPhone'},
    'bionictigershk': {'bionictigershrk'},
    'Chrono': {'Chrona'},
    'Chryleza': {'Velvetremedy'},
    'Cuddles_theBear': {'irCuddles_tBear'},
    'DigitalVagrant': {'Digi', 'digiphone'},
    'Drywin': {'Drywinn'},
    'GentlemanGin': {'elbows', 'butts', 'EezMaiMynd', 'Spike', 'clouds', 'Water', 'geigerrulesbig', 'DolphinButt', 'ThornInYouSide', 'AssholeGin', 'Cat', 'VodkaIsGross'},
    'heart04winds': {'hart04winds'},
    'Kimmychan': {'Kimkam'},
    'Lavender': {'LavPhone'},
    'lovershy': {'loversh'},
    'maadneet': {'maadn'},
    'maharito': {'mahaquesarito', 'Mahayro'},
    'Matthies7': {'Matthies'},
    'Malsententia': {'Malpone', 'malpone', 'Molestentia'},
    'meat_popsiclez': {'Meat_', 'meat_'},
    'PonisEnvy': {'PonircEnvy'},
    'Cocoa': {'SomeStupidGuy', 'NotSSG'},
    'shadowthug': {'shadowphone'},
    'ShippingIsMagic': {'a_Nickname', 'FlutterNickname'},
    'Smidqe': {'SmidqePi'},
    'WeedWuff': {'SpecialCoalWuff'},
    'Yakoshi': {'Yagoshi'},
}

# right side in lowercase!
prefixes = {
    'Blueshift': 'blue',
    'ChocoScoots': 'choco',
    'discordzilla': 'disczilla',
    'IAmInASnuggie': 'snuggie',
    'Kris321': 'kris3',
    'KKGourmet': 'kkgour',
    'SalientBlue': 'salient',
    'shado_jaguar': 'shado_',
    'ShippingIsMagic': 'shippingis',
    'SomeStupidGuy': 'somestupid',
    'stevepoppers': 'steve',
    'Toastdeib': 'toast',
    'Trellmor': 'trell',
    'WeedWuff': 'weed',
}

forcebases = {
    'LavenderFox',
    'SnowBolt',
    'StevenAD',
    'Q0',
    'SalientBlue',
}

nonbases = {
    'DEAD',
    'Discord',
    'Loversh',
    'Luna',
    'matt',
    'meat',
    'pony',
    'Blue',
    'fire',
} | set(prefixes.values())
for als in base_aliases.values():
    nonbases.union(als)

# constants
LOG_GLOB = '/var/bt_logs/irc.berrytube.#berrytube.*.weechatlog'
EMPTY_SET = set()

# cache
last_file = None
nicks = {}

def load_nicks():
    global last_file, nicks

    fnames = sorted(glob.iglob(LOG_GLOB))
    cached = last_file is not None
    for fname in fnames:
        if cached:
            if fname != last_file:
                continue
            cached = False
        last_file = fname

        with open(fname, encoding='utf-8') as fh:
            for line in fh:
                try:
                    nick = line[20:line.index('\t', 22)]
                except ValueError:
                    pass
                else:
                    first = nick[0]
                    if first == '@' or first == '%' or first == '+':
                        nick = nick[1:]
                    if len(nick) >= 4 or nick in forcebases:
                        nicks[nick] = (nick.lower(), len(nick))
    return nicks

def add_prefixes_and_suffixes(aliases, nicks):
    for nick, (lnick, nick_len) in nicks.items():
        als = set(
            alias
            for alias, (lalias, alias_len) in nicks.items()
            if alias_len >= nick_len and (
                lalias.startswith(lnick) or
                lalias.endswith(lnick) or
                (nick in prefixes and lalias.startswith(prefixes[nick]))
            ) and alias != nick and alias not in forcebases
        )
        if als:
            aliases[nick] = aliases.get(nick, EMPTY_SET) | als

def flatten_recursive_aliases(aliases):
    for base, als in aliases.copy().items():
        if base in nonbases:
            continue

        news = set()
        for al in als:
            if al in aliases and al not in forcebases:
                news.update(aliases.pop(al))
        news.discard(base)
        als.update(news)

def resolve_aliases(aliases, nick):
    nick = nick.lower()

    out = set([nick])
    for base, als in aliases.items():
        if nick == base.lower() or nick in map(str.lower, als):
            out = als
            out.add(base)
            break
    return out

def application(environ, start_response):
    nicks = load_nicks()

    aliases = base_aliases.copy()
    add_prefixes_and_suffixes(aliases, nicks)
    flatten_recursive_aliases(aliases)

    # Remove any remaining non-bases
    for key in nonbases:
        try:
            del aliases[key]
        except KeyError:
            pass

    # Output results
    resolve = environ['query'].get('resolve', [None])[0]

    if resolve:
        output = {
            'query': resolve,
            'aliases': resolve_aliases(aliases, resolve),
        }
    else:
        output = aliases

    start_response('200 OK', [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
    ])
    yield json.dumps(
        output,
        default=list,
        sort_keys=True,
        check_circular=False,
        separators=None if 'pretty' in environ['query'] else (',', ':'),
        indent=4 if 'pretty' in environ['query'] else None
    )
