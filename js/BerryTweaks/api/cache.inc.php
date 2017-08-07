<?php

if ( !defined('NO_AUTO') && (!defined('DATA_URL') || !defined('CACHE_FNAME')) )
    die('params missing');

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

function download($url){
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 3);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_USERAGENT, 'BerryTweaks Server');
    return curl_exec($ch);
}

function do_cache($data_url, $cache_fname){
    if ( defined('SERVE_CACHED') && SERVE_CACHED && is_readable($cache_fname) )
        $data = null;
    else
        $data = download($data_url);

    if ( $data ){
        if ( function_exists('cache_validate') && !cache_validate($data) ){
            if ( function_exists('cache_calback') ){
                cache_calback(null);
                return;
            }
            else{
                http_response_code(500);
                die('invalid data');
            }
        }

        file_put_contents($cache_fname, $data);
    }
    else{
        $data = file_get_contents($cache_fname);
        header('X-BerryTweaks-Cached: ' . filemtime($cache_fname));
    }

    if ( function_exists('cache_callback') )
        cache_callback($data);
    else
        echo $data;
}

if ( !defined('NO_AUTO') || !NO_AUTO )
    do_cache(DATA_URL, CACHE_FNAME);
