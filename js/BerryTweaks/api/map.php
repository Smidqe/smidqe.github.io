<?php

define('DATA_URL', 'http://map.berrytube.tv/phpsqlajax_genxml.php');
define('CACHE_FNAME', 'cache/map.xml');

function cache_callback($xml){
    $data = simplexml_load_string($xml);

    $out = [];
    foreach ( $data->marker as $el ){
        $obj = [];
        foreach ( $el->attributes() as $key => $val ){
            if ( $key == 'name' )
                continue;

            $str = (string)$val;
            $obj[$key] = is_numeric($str) ? (float)$str : $str;
        }
        $out[strtolower($el['name'])] = $obj;
    }

    echo json_encode($out, array_key_exists('pretty', $_REQUEST) ? JSON_PRETTY_PRINT : 0);
}

require_once('cache.inc.php');
