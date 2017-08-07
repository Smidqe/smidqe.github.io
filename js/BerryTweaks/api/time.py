import json
from datetime import datetime
from pytz import timezone, utc, country_timezones, country_names
from pytz.exceptions import AmbiguousTimeError
from timezonefinder import TimezoneFinder

tz_finder = TimezoneFinder()

def application(environ, start_response):
    if environ['CONTENT_TYPE'] == 'text/plain':
        body = environ['wsgi.input'].read(int(environ['CONTENT_LENGTH']))
        coords = (
            map(float, line.split(' ', 1))
            for line in body.decode('ascii').split('\n')
        )
    else:
        form = environ['get_combined']()
        coords = zip(
            map(float, form['lat[]']),
            map(float, form['lng[]']),
        )

    now = datetime.utcnow().replace(microsecond=0)
    utc_now = now.replace(tzinfo=utc)

    out = []
    for lat, lng in coords:
        tz_name = tz_finder.timezone_at(lat=lat, lng=lng)
        if tz_name is None:
            out.append({
                'status': 'FAILED',
                'message': 'Unknown zone',
            })
            continue

        country_code = None
        country_name = None
        for code, zones in country_timezones.items():
            if tz_name in zones:
                country_code = code.upper()
                country_name = country_names[code]
                break

        tz = timezone(tz_name)
        try:
            tz_now = tz.normalize(utc_now.astimezone(tz))
            out.append({
                'status': 'OK',
                'zoneName': tz_name,
                'countryCode': country_code,
                'countryName': country_name,
                'abbreviation': tz.tzname(now),
                'gmtOffset': int(tz.utcoffset(now).total_seconds()),
                'timestamp': int(tz_now.timestamp()),
                'formatted': str(tz_now.replace(tzinfo=None)),
            })
        except AmbiguousTimeError:
            out.append({
                'status': 'FAILED',
                'message': 'ambiguous',
                'zoneName': tz_name,
                'countryCode': country_code,
                'countryName': country_name,
            })

    start_response('200 OK', [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
    ])
    yield json.dumps({'results': out}, sort_keys=True, check_circular=False)
